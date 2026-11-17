import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { DOC_TYPES, fieldDefs } from '../lib/fields.js';
import { readText, extractFields, guessType } from '../lib/extract.js';
import { runChecks } from '../lib/checks.js';
import { initialMilestones, MILESTONES, currentStage, draftUpdate } from '../lib/milestones.js';
import { aiStatus, aiExtract } from '../lib/ai.js';
import { normaliseNigerianPhone, EMAIL_RE } from '../lib/validate.js';
import { ROOT } from '../lib/config.js';

const ALLOWED = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const MODES = ['sea', 'air', 'road'];
const MAX_TEXT = 60000;

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function workspaceRouter({ store, cfg }) {
  const r = express.Router();
  fs.mkdirSync(cfg.uploadDir, { recursive: true });

  // ---- access control (pilot access key) ----
  r.use((req, _res, next) => {
    if (!cfg.accessKey) return next();
    const given = Buffer.from(String(req.get('x-workspace-key') || ''));
    const want = Buffer.from(cfg.accessKey);
    if (given.length === want.length && timingSafeEqual(given, want)) return next();
    next(new HttpError(401, 'A valid workspace access key is required.'));
  });

  const upload = multer({
    storage: multer.diskStorage({
      destination: cfg.uploadDir,
      filename: (_req, file, cb) => cb(null, `${randomUUID()}${ALLOWED[file.mimetype] || ''}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED[file.mimetype]) cb(null, true);
      else cb(new HttpError(415, 'Upload a PDF, text file, or a JPG, PNG or WebP image.'));
    },
  });

  const find = (id) => {
    const s = store.read().shipments.find((x) => x.id === id);
    if (!s) throw new HttpError(404, 'Shipment not found.');
    return s;
  };
  const findDoc = (s, docId) => {
    const d = s.documents.find((x) => x.id === docId);
    if (!d) throw new HttpError(404, 'Document not found.');
    return d;
  };
  const touch = (s) => (s.updatedAt = new Date().toISOString());

  const publicDoc = (d) => {
    const { text, storedName, ...rest } = d;
    return { ...rest, textChars: text ? text.length : 0, fieldDefs: fieldDefs(d.type).map(({ labels, ...f }) => f) };
  };
  const publicShipment = (s) => ({ ...s, documents: s.documents.map(publicDoc), checkRuns: s.checkRuns.slice(0, 10) });
  const summary = (s) => {
    const latest = s.checkRuns[0];
    return {
      id: s.id, ref: s.ref, importerName: s.importerName, mode: s.mode, origin: s.origin, destination: s.destination, goods: s.goods,
      isSample: s.isSample, createdAt: s.createdAt, updatedAt: s.updatedAt, blocker: s.blocker,
      stage: currentStage(s)?.label || 'Not started',
      documentCount: s.documents.length,
      unconfirmedFields: s.documents.reduce((n, d) => n + Object.values(d.extraction.fields).filter((f) => !f.confirmed).length, 0),
      latestCheck: latest ? { ranAt: latest.ranAt, summary: latest.summary } : null,
    };
  };

  function shipmentInput(body, partial = false) {
    const errors = {};
    const out = {};
    const str = (k, max = 160) => {
      if (body[k] !== undefined) out[k] = String(body[k] ?? '').trim().slice(0, max);
    };
    ['ref', 'importerName', 'origin', 'destination', 'goods'].forEach((k) => str(k));
    if (body.mode !== undefined) out.mode = String(body.mode);
    if (body.importerPhone !== undefined) {
      const raw = String(body.importerPhone || '').trim();
      if (!raw) out.importerPhone = '';
      else {
        const p = normaliseNigerianPhone(raw);
        if (!p) errors.importerPhone = 'Enter a Nigerian mobile number, for example 0803 123 4567.';
        else out.importerPhone = p;
      }
    }
    if (body.importerEmail !== undefined) {
      out.importerEmail = String(body.importerEmail || '').trim().toLowerCase();
      if (out.importerEmail && !EMAIL_RE.test(out.importerEmail)) errors.importerEmail = 'Enter a valid email address.';
    }
    if (!partial || out.ref !== undefined) if (!out.ref || out.ref.length < 2) errors.ref = 'Enter a shipment reference.';
    if (!partial || out.mode !== undefined) if (!MODES.includes(out.mode)) errors.mode = 'Choose sea, air or road.';
    if (body.blocker !== undefined) {
      if (body.blocker === null || !String(body.blocker.text || '').trim()) out.blocker = null;
      else out.blocker = { text: String(body.blocker.text).trim().slice(0, 240), owner: String(body.blocker.owner || '').trim().slice(0, 80), since: new Date().toISOString() };
    }
    if (Object.keys(errors).length) throw new HttpError(422, 'Please correct the highlighted fields.', errors);
    return out;
  }

  async function ingest(s, file, requestedType) {
    const { method, text, pages } = await readText(file.path, file.mimetype, file.originalname);
    const cleanText = text.replace(/\u0000/g, '').slice(0, MAX_TEXT);
    const type = DOC_TYPES[requestedType] ? requestedType : guessType(cleanText, file.originalname);
    const doc = {
      id: randomUUID(),
      type,
      typeGuessed: !DOC_TYPES[requestedType],
      originalName: path.basename(file.originalname).slice(0, 160),
      storedName: file.filename,
      mime: file.mimetype,
      size: file.size,
      pages,
      uploadedAt: new Date().toISOString(),
      text: cleanText,
      extraction: await extractionFor(type, method, cleanText),
    };
    s.documents.push(doc);
    touch(s);
    return doc;
  }

  async function extractionFor(type, method, text) {
    const base = { method, ranAt: new Date().toISOString() };
    if (!text.trim()) {
      return { ...base, status: 'no_text', message: method === 'none' ? 'Images are stored but not read yet: enter the fields from the document.' : 'This PDF has no text layer (it is probably a scan). Enter the fields from the document.', fields: {} };
    }
    const ai = aiStatus(cfg);
    if (ai.enabled) {
      try {
        return { ...base, method: 'bedrock', status: 'extracted', fields: await aiExtract(cfg, type, text) };
      } catch (e) {
        return { ...base, status: 'extracted', message: `AI extraction failed (${e.message}); label-based extraction used instead.`, fields: extractFields(type, text) };
      }
    }
    const fields = extractFields(type, text);
    return { ...base, status: 'extracted', message: Object.keys(fields).length ? '' : 'No known labels were found in the text. Enter the fields from the document.', fields };
  }

  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  r.get('/session', (_req, res) => res.json({ ok: true, ai: aiStatus(cfg), milestones: MILESTONES, docTypes: DOC_TYPES }));

  r.get('/settings', (_req, res) => res.json(store.read().settings));
  r.put('/settings', wrap(async (req, res) => {
    const firmName = String(req.body.firmName || '').trim().slice(0, 120);
    await store.mutate((st) => (st.settings.firmName = firmName));
    res.json(store.read().settings);
  }));

  r.get('/shipments', (_req, res) => {
    const list = [...store.read().shipments].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(summary);
    res.json({ shipments: list });
  });

  r.post('/shipments', wrap(async (req, res) => {
    const input = shipmentInput(req.body);
    const now = new Date().toISOString();
    const s = { id: randomUUID(), importerName: '', importerPhone: '', importerEmail: '', origin: '', destination: '', goods: '', ...input, blocker: null, isSample: false, createdAt: now, updatedAt: now, milestones: initialMilestones(), documents: [], checkRuns: [], updates: [] };
    await store.mutate((st) => st.shipments.push(s));
    res.status(201).json(publicShipment(s));
  }));

  r.get('/shipments/:id', (req, res) => res.json(publicShipment(find(req.params.id))));

  r.patch('/shipments/:id', wrap(async (req, res) => {
    const s = find(req.params.id);
    const input = shipmentInput(req.body, true);
    await store.mutate(() => {
      Object.assign(s, input);
      touch(s);
    });
    res.json(publicShipment(s));
  }));

  r.delete('/shipments/:id', wrap(async (req, res) => {
    const s = find(req.params.id);
    await store.mutate((st) => (st.shipments = st.shipments.filter((x) => x.id !== s.id)));
    await Promise.all(s.documents.map((d) => fsp.rm(path.join(cfg.uploadDir, d.storedName), { force: true })));
    res.status(204).end();
  }));

  r.post('/shipments/:id/documents', upload.single('file'), wrap(async (req, res) => {
    const s = find(req.params.id);
    if (!req.file) throw new HttpError(400, 'Choose a file to upload.');
    let doc;
    try {
      doc = await ingest(s, req.file, req.body.type);
    } catch (e) {
      await fsp.rm(req.file.path, { force: true });
      throw new HttpError(422, `The file could not be read: ${e.message}`);
    }
    await store.mutate(() => {});
    res.status(201).json(publicDoc(doc));
  }));

  r.get('/shipments/:id/documents/:docId/file', (req, res, next) => {
    const s = find(req.params.id);
    const d = findDoc(s, req.params.docId);
    res.setHeader('Content-Type', d.mime);
    res.setHeader('Content-Disposition', `inline; filename="${d.originalName.replace(/"/g, '')}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(path.join(cfg.uploadDir, d.storedName), (err) => err && next(new HttpError(404, 'Stored file is missing.')));
  });

  r.patch('/shipments/:id/documents/:docId', wrap(async (req, res) => {
    const s = find(req.params.id);
    const d = findDoc(s, req.params.docId);
    const { type, fields } = req.body || {};
    if (type !== undefined && type !== d.type) {
      if (!DOC_TYPES[type]) throw new HttpError(422, 'Unknown document type.');
      d.type = type;
      d.typeGuessed = false;
      d.extraction = await extractionFor(type, d.extraction.method === 'bedrock' ? 'pdf-text' : d.extraction.method, d.text || '');
    }
    if (fields && typeof fields === 'object') {
      const allowed = new Set(fieldDefs(d.type).map((f) => f.key));
      for (const [key, f] of Object.entries(fields)) {
        if (!allowed.has(key)) continue;
        const prev = d.extraction.fields[key];
        const value = f?.value === undefined ? prev?.value ?? '' : String(f.value).trim().slice(0, 400);
        if (!value) {
          delete d.extraction.fields[key];
          continue;
        }
        const edited = !prev || prev.value !== value;
        d.extraction.fields[key] = {
          value,
          source: edited ? 'manual' : prev.source,
          snippet: edited ? '' : prev.snippet,
          confirmed: f?.confirmed === undefined ? (edited ? true : prev.confirmed) : Boolean(f.confirmed),
          confirmedAt: new Date().toISOString(),
        };
      }
    }
    touch(s);
    await store.mutate(() => {});
    res.json(publicDoc(d));
  }));

  r.delete('/shipments/:id/documents/:docId', wrap(async (req, res) => {
    const s = find(req.params.id);
    const d = findDoc(s, req.params.docId);
    await store.mutate(() => {
      s.documents = s.documents.filter((x) => x.id !== d.id);
      touch(s);
    });
    await fsp.rm(path.join(cfg.uploadDir, d.storedName), { force: true });
    res.status(204).end();
  }));

  r.post('/shipments/:id/checks', wrap(async (req, res) => {
    const s = find(req.params.id);
    const run = runChecks(s);
    await store.mutate(() => {
      s.checkRuns.unshift(run);
      s.checkRuns = s.checkRuns.slice(0, 20);
      const m = s.milestones.find((x) => x.key === 'docs_received');
      if (s.documents.length && m && m.status !== 'done') Object.assign(m, { status: 'done', date: new Date().toISOString().slice(0, 10), confirmedAt: new Date().toISOString(), note: m.note || '' });
      touch(s);
    });
    res.status(201).json(run);
  }));

  r.patch('/shipments/:id/milestones/:key', wrap(async (req, res) => {
    const s = find(req.params.id);
    const m = s.milestones.find((x) => x.key === req.params.key);
    if (!m) throw new HttpError(404, 'Milestone not found.');
    const status = req.body.status === 'done' ? 'done' : 'pending';
    const date = req.body.date ? String(req.body.date).slice(0, 10) : null;
    if (status === 'done' && (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))) throw new HttpError(422, 'Choose the date this milestone happened.', { date: 'Required' });
    await store.mutate(() => {
      Object.assign(m, { status, date: status === 'done' ? date : null, note: String(req.body.note || '').trim().slice(0, 240), confirmedAt: status === 'done' ? new Date().toISOString() : null });
      touch(s);
    });
    res.json(publicShipment(s));
  }));

  r.get('/shipments/:id/update-draft', (req, res) => {
    const s = find(req.params.id);
    res.json({ message: draftUpdate(s, store.read().settings.firmName) });
  });

  r.post('/shipments/:id/updates', wrap(async (req, res) => {
    const s = find(req.params.id);
    const message = String(req.body.message || '').trim().slice(0, 1500);
    const channel = ['whatsapp', 'email', 'copy'].includes(req.body.channel) ? req.body.channel : 'copy';
    if (message.length < 10) throw new HttpError(422, 'The message is empty.');
    const entry = { id: randomUUID(), channel, message, stage: currentStage(s)?.label || 'Not started', preparedAt: new Date().toISOString(), status: 'prepared' };
    await store.mutate(() => {
      s.updates.unshift(entry);
      touch(s);
    });
    res.status(201).json(entry);
  }));

  // Creates a clearly labelled sample shipment from the bundled fictional documents,
  // processed through exactly the same upload, extraction and storage path as real uploads.
  r.post('/sample', wrap(async (_req, res) => {
    const dir = path.join(ROOT, 'public', 'samples');
    const files = [
      ['sample-bill-of-lading.pdf', 'bill_of_lading'],
      ['sample-commercial-invoice.pdf', 'commercial_invoice'],
      ['sample-packing-list.pdf', 'packing_list'],
    ];
    for (const [f] of files) if (!fs.existsSync(path.join(dir, f))) throw new HttpError(500, 'Sample documents are missing. Run npm run samples.');
    const now = new Date().toISOString();
    const s = { id: randomUUID(), ref: `SAMPLE-${now.slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`, importerName: 'Adebayo Home Fittings (fictional)', importerPhone: '', importerEmail: '', mode: 'sea', origin: 'Ningbo, CN', destination: 'Lagos, NG', goods: 'Ceramic floor tiles', blocker: null, isSample: true, createdAt: now, updatedAt: now, milestones: initialMilestones(), documents: [], checkRuns: [], updates: [] };
    for (const [f, type] of files) {
      const storedName = `${randomUUID()}.pdf`;
      await fsp.copyFile(path.join(dir, f), path.join(cfg.uploadDir, storedName));
      const stat = await fsp.stat(path.join(cfg.uploadDir, storedName));
      await ingest(s, { path: path.join(cfg.uploadDir, storedName), filename: storedName, originalname: f, mimetype: 'application/pdf', size: stat.size }, type);
    }
    await store.mutate((st) => st.shipments.push(s));
    res.status(201).json(publicShipment(s));
  }));

  // eslint-disable-next-line no-unused-vars
  r.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
      return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Files must be 10 MB or smaller.' : err.message });
    }
    const status = err.status || 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: status === 500 ? 'Something went wrong on the server.' : err.message, details: err.details });
  });

  return r;
}
