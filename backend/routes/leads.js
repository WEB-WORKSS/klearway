import express from 'express';
import { randomUUID } from 'node:crypto';
import { validateLead } from '../lib/validate.js';
import { notifyLead } from '../lib/notify.js';

// In-memory rate limit: 5 submissions per IP per 10 minutes. Use AWS WAF rate rules in production.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

export function leadsRouter({ store, cfg }) {
  const r = express.Router();
  const hits = new Map();

  r.post('/', async (req, res) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= LIMIT) return res.status(429).json({ error: 'Too many submissions from this connection. Please try again in a few minutes, or email us directly.' });
    recent.push(now);
    hits.set(ip, recent);

    // Honeypot: real visitors never see or fill the "website" field.
    if (req.body?.website) return res.status(400).json({ error: 'Submission rejected.' });

    const { lead, errors } = validateLead(req.body || {});
    if (Object.keys(errors).length) return res.status(422).json({ error: 'Please correct the highlighted fields.', details: errors });

    const record = {
      id: randomUUID(),
      ...lead,
      submittedAt: new Date().toISOString(),
      utm: Object.fromEntries(Object.entries(req.body.utm || {}).filter(([k]) => /^utm_(source|medium|campaign|term|content)$/.test(k)).map(([k, v]) => [k, String(v).slice(0, 120)])),
      page: String(req.body.page || '').slice(0, 200),
    };
    try {
      await store.mutate((st) => st.leads.push(record));
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'We could not save your request. Please email us directly.' });
    }
    let notice = { notified: false, confirmationSent: false };
    try {
      notice = await notifyLead(cfg, record);
    } catch (e) {
      console.error('Lead notification failed:', e.message);
    }
    res.status(201).json({ ok: true, id: record.id, stored: true, ...notice });
  });

  return r;
}
