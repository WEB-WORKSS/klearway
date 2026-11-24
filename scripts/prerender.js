// Static prerender: renders each route to HTML so marketing content is crawlable and readable before JS loads.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from '../backend/lib/config.js';

const dist = path.join(ROOT, 'dist');
const ssrEntry = path.join(ROOT, 'dist-ssr', 'entry-server.js');
const { render, seo, company } = await import(pathToFileURL(ssrEntry).href);
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const routes = [
  { url: '/', out: 'index.html' },
  { url: '/privacy', out: 'privacy/index.html' },
  { url: '/terms', out: 'terms/index.html' },
  { url: '/workspace', out: 'workspace/index.html' },
  { url: '/404', out: '404.html' },
];

for (const r of routes) {
  const meta = seo[r.url];
  const canonical = `${company.url}${r.url === '/' ? '/' : r.url}`;
  const image = `${company.url}/og-image.png`;
  const head = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    meta.noindex ? '<meta name="robots" content="noindex" />' : '<meta name="robots" content="index, follow" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Klearway" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="en_NG" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ');
  const html = template.replace('<!--app-head-->', head).replace('<!--app-html-->', render(r.url));
  const file = path.join(dist, r.out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log(`prerendered ${r.url} -> dist/${r.out}`);
}
fs.rmSync(path.join(ROOT, 'dist-ssr'), { recursive: true, force: true });
