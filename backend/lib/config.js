import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..', '..');

// Minimal .env loader so the server runs without extra dependencies.
export function loadEnv(file = path.join(ROOT, '.env')) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    const q = v[0];
    if ((q === '"' || q === "'") && v.endsWith(q)) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

export function getConfig() {
  const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, 'backend', 'data');
  return {
    port: Number(process.env.PORT || 8787),
    publicOrigin: process.env.PUBLIC_ORIGIN || 'https://www.klearway.site',
    dataDir,
    uploadDir: path.join(dataDir, 'uploads'),
    accessKey: process.env.WORKSPACE_ACCESS_KEY || '',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      to: process.env.LEAD_NOTIFY_TO || '',
      from: process.env.LEAD_FROM || '',
    },
    ai: {
      provider: process.env.AI_PROVIDER || '',
      region: process.env.AWS_REGION || '',
      modelId: process.env.BEDROCK_MODEL_ID || '',
    },
    distDir: path.join(ROOT, 'dist'),
  };
}
