import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadEnv, getConfig } from './lib/config.js';
import { createStore } from './lib/store.js';
import { workspaceRouter } from './routes/workspace.js';
import { leadsRouter } from './routes/leads.js';
import { aiStatus } from './lib/ai.js';
import { smtpConfigured } from './lib/notify.js';

export function createApp(cfg = getConfig()) {
  const store = createStore(cfg.dataDir);
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '200kb' }));
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  app.get('/api/health', (_req, res) =>
    res.json({ ok: true, service: 'klearway-api', accessKeyRequired: Boolean(cfg.accessKey), ai: aiStatus(cfg), leadEmail: smtpConfigured(cfg) }),
  );
  app.use('/api/workspace', workspaceRouter({ store, cfg }));
  app.use('/api/leads', leadsRouter({ store, cfg }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
  // eslint-disable-next-line no-unused-vars
  app.use('/api', (err, _req, res, _next) => {
    const status = err.type === 'entity.parse.failed' ? 400 : err.status || 500;
    res.status(status).json({ error: status === 400 ? 'Invalid request body.' : 'Something went wrong on the server.' });
  });

  // ---- static site (prerendered pages + SPA fallback for /app/*) ----
  const dist = cfg.distDir;
  if (fs.existsSync(dist)) {
    app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(dist, { index: false, redirect: false, maxAge: '1h' }));
    app.get('*', (req, res) => {
      const clean = req.path.replace(/\/+$/, '') || '/';
      if (clean === '/workspace' || clean.startsWith('/workspace/')) return res.sendFile(path.join(dist, 'workspace', 'index.html'));
      const file = clean === '/' ? path.join(dist, 'index.html') : path.join(dist, clean, 'index.html');
      if (file.startsWith(dist) && fs.existsSync(file)) return res.sendFile(file);
      res.status(404).sendFile(path.join(dist, '404.html'));
    });
  }
  return { app, store };
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isMain) {
  loadEnv();
  const cfg = getConfig();
  const { app } = createApp(cfg);
  app.listen(cfg.port, () => {
    console.log(`Klearway API listening on http://localhost:${cfg.port}`);
    console.log(`Data directory: ${cfg.dataDir}`);
    if (!cfg.accessKey) console.log('WORKSPACE_ACCESS_KEY is not set: the workspace API is open. Use only on your own machine.');
    console.log(aiStatus(cfg).enabled ? 'AI extraction: Amazon Bedrock' : 'AI extraction: not configured (label-based text extraction)');
    console.log(smtpConfigured(cfg) ? 'Lead email: SMTP configured' : 'Lead email: not configured (leads are stored only)');
  });
}
