// Renders brand assets (logo, icons, Open Graph image, LinkedIn logo and banner) to SVG and PNG.
// Text is converted to vector paths with the brand fonts, so output does not depend on installed fonts.
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { ROOT } from '../backend/lib/config.js';

const fontDir = (pkg) => path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files');
const load = (pkg, file) => opentype.parse(fs.readFileSync(path.join(fontDir(pkg), file)).buffer);
const F = {
  sans400: load('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'),
  sans500: load('ibm-plex-sans', 'ibm-plex-sans-latin-500-normal.woff'),
  sans600: load('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'),
  mono400: load('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'),
  mono500: load('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff'),
};
const C = { ink: '#0F1D1C', ink7: '#203837', ink4: '#6B817E', paper: '#F5F1E8', paper50: '#FBF9F4', paper3: '#DDD4C0', signal: '#E9A23B', tide: '#1E6B5A', tideL: '#7CC6AE', flag: '#B8402A', flagL: '#F08A72' };

// opentype.js loads glyph metrics lazily: touch the path before reading advanceWidth.
const adv = (font, ch, size) => { const g = font.charToGlyph(ch); g.getPath(0, 0, size); return (g.advanceWidth / font.unitsPerEm) * size; };

/** text -> <path>. Supports letterSpacing (em) and returns width for layout. */
function text(str, { font, size, x, y, fill, ls = 0, anchor = 'start' }) {
  const w = width(str, font, size, ls);
  let cx = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  let d = '';
  for (const ch of str) {
    const g = font.charToGlyph(ch);
    // Round the origin: opentype.js toPathData can emit NaN for some long floating-point values.
    d += g.getPath(Math.round(cx * 100) / 100, y, size).toPathData(2);
    cx += adv(font, ch, size) + ls * size;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}
function width(str, font, size, ls = 0) {
  let w = 0;
  for (const ch of str) w += adv(font, ch, size) + ls * size;
  return w - ls * size;
}

const mark = (x, y, s, bg = C.ink, fg = C.paper) => `
  <g transform="translate(${x} ${y}) scale(${s / 40})">
    <path d="M6 4h20l8 8v22a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="${bg}"/>
    <path d="M26 4v6a2 2 0 0 0 2 2h6z" fill="${C.signal}"/>
    <path d="M13 11v18" stroke="${fg}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M24.5 12.5 15.5 20.5" stroke="${fg}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M17.5 21.5l4 4.2 7-8.2" stroke="${C.signal}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>`;

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const dots = (w, h, color, op) => `<defs><pattern id="d" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${color}" opacity="${op}"/></pattern></defs><rect width="${w}" height="${h}" fill="url(#d)"/>`;

function resultCard(x, y, w, dark = true) {
  const bg = dark ? C.paper50 : C.ink;
  const fg = dark ? C.ink : C.paper;
  const sub = dark ? C.ink4 : '#9AABA8';
  const rows = [
    ['x', 'Package count does not match', 'B/L 1,200  ·  Packing list 1,180'],
    ['ok', 'Consignee matches across documents', ''],
    ['ok', 'Container check digits are valid', ''],
  ];
  let out = `<rect x="${x}" y="${y}" width="${w}" height="214" rx="16" fill="${bg}"/>`;
  out += text('CHECK RESULTS · 3 DOCUMENTS', { font: F.mono500, size: 12, x: x + 24, y: y + 38, fill: sub, ls: 0.12 });
  out += text('SAMPLE DATA', { font: F.mono500, size: 11, x: x + w - 24, y: y + 38, fill: C.signal, ls: 0.12, anchor: 'end' });
  let ry = y + 74;
  for (const [s, t, d] of rows) {
    const c = s === 'x' ? (dark ? C.flag : C.flagL) : dark ? C.tide : C.tideL;
    out += `<circle cx="${x + 34}" cy="${ry - 6}" r="9" fill="none" stroke="${c}" stroke-width="2.2"/>`;
    out += s === 'x' ? `<path d="M${x + 30} ${ry - 10}l8 8M${x + 38} ${ry - 10}l-8 8" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>` : `<path d="M${x + 29.5} ${ry - 6}l3 3 6-6.5" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    out += text(t, { font: s === 'x' ? F.sans600 : F.sans400, size: 17, x: x + 54, y: ry, fill: fg });
    if (d) {
      out += text(d, { font: F.mono400, size: 13.5, x: x + 54, y: ry + 22, fill: sub });
      ry += 26;
    }
    ry += 44;
  }
  return out;
}

const out = path.join(ROOT, 'public');
const brandDir = path.join(ROOT, 'docs', 'brand');
fs.mkdirSync(brandDir, { recursive: true });

const assets = {};

// Logo mark (square) and horizontal lockups
assets['logo-mark.svg'] = svg(512, 512, `<rect width="512" height="512" fill="${C.paper}"/>${mark(56, 46, 410)}`);
const wordW = width('Klearway', F.sans600, 72, -0.03);
assets['logo-horizontal.svg'] = svg(Math.ceil(110 + wordW + 24), 120, `${mark(16, 16, 88)}${text('Klearway', { font: F.sans600, size: 72, x: 120, y: 85, fill: C.ink, ls: -0.03 })}`);
assets['logo-horizontal-light.svg'] = svg(Math.ceil(110 + wordW + 24), 120, `<rect width="100%" height="100%" fill="${C.ink}"/>${mark(16, 16, 88, C.paper, C.ink)}${text('Klearway', { font: F.sans600, size: 72, x: 120, y: 85, fill: C.paper, ls: -0.03 })}`);

// LinkedIn logo 400x400
assets['linkedin-logo-400.svg'] = svg(400, 400, `<rect width="400" height="400" fill="${C.ink}"/>${mark(70, 62, 260, C.paper, C.ink)}`);

// Open Graph 1200x630
assets['og-image.svg'] = svg(1200, 630, `
  <rect width="1200" height="630" fill="${C.paper}"/>${dots(1200, 630, C.ink, 0.12)}
  ${mark(72, 64, 56)}${text('Klearway', { font: F.sans600, size: 34, x: 140, y: 103, fill: C.ink, ls: -0.03 })}
  ${text('Catch the document mismatch', { font: F.sans600, size: 58, x: 72, y: 250, fill: C.ink, ls: -0.025 })}
  ${text('before it holds up the shipment.', { font: F.sans600, size: 58, x: 72, y: 322, fill: C.tide, ls: -0.025 })}
  ${text('Document checks and status updates for freight forwarders', { font: F.sans400, size: 24, x: 72, y: 392, fill: C.ink7 })}
  ${text('and clearing agents in Nigeria.', { font: F.sans400, size: 24, x: 72, y: 426, fill: C.ink7 })}
  ${text('KLEARWAY.SITE  ·  MVP IN DEVELOPMENT', { font: F.mono500, size: 15, x: 72, y: 560, fill: C.ink4, ls: 0.14 })}
  ${resultCard(760, 380, 380, false)}
`);

// LinkedIn banner 1584x396. Left ~400px kept clear for the page logo overlay; key text sits in the centre band.
assets['linkedin-banner-1584x396.svg'] = svg(1584, 396, `
  <rect width="1584" height="396" fill="${C.ink}"/>${dots(1584, 396, C.paper, 0.07)}
  <rect x="0" y="0" width="1584" height="396" fill="url(#fade)"/>
  <defs><linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${C.ink}" stop-opacity="0.9"/><stop offset="0.6" stop-color="${C.ink}" stop-opacity="0.2"/><stop offset="1" stop-color="${C.ink}" stop-opacity="0"/></linearGradient></defs>
  ${mark(440, 78, 44, C.paper, C.ink)}${text('Klearway', { font: F.sans600, size: 30, x: 496, y: 110, fill: C.paper, ls: -0.03 })}
  ${text('Catch the document mismatch', { font: F.sans600, size: 46, x: 440, y: 192, fill: C.paper, ls: -0.025 })}
  ${text('before it holds up the shipment.', { font: F.sans600, size: 46, x: 440, y: 248, fill: C.signal, ls: -0.025 })}
  ${text('DOCUMENT CHECKS  ·  SHIPMENT STATUS  ·  IMPORTER UPDATES', { font: F.mono500, size: 14, x: 440, y: 306, fill: '#9AABA8', ls: 0.14 })}
  ${resultCard(1128, 92, 400, true)}
`);

// Apple touch icon 180 and favicon PNG
assets['apple-touch-icon.svg'] = svg(180, 180, `<rect width="180" height="180" fill="${C.paper}"/>${mark(22, 18, 140)}`);

const pngTargets = {
  'logo-mark.svg': [['public', 'logo-512.png', 512]],
  'og-image.svg': [['public', 'og-image.png'], ['docs', 'og-image.png']],
  'apple-touch-icon.svg': [['public', 'apple-touch-icon.png', 180]],
  'linkedin-logo-400.svg': [['docs', 'linkedin-logo-400.png']],
  'linkedin-banner-1584x396.svg': [['docs', 'linkedin-banner-1584x396.png']],
  'logo-horizontal.svg': [['docs', 'logo-horizontal.png']],
  'logo-horizontal-light.svg': [['docs', 'logo-horizontal-light.png']],
};

for (const [name, content] of Object.entries(assets)) {
  fs.writeFileSync(path.join(brandDir, name), content);
  for (const [where, file, size] of pngTargets[name] || []) {
    const dest = where === 'public' ? path.join(out, file) : path.join(brandDir, file);
    let img = sharp(Buffer.from(content), { density: 144 });
    img = size ? img.resize(size, size) : img.resize({ width: Number(content.match(/width="(\d+)"/)[1]) });
    await img.png({ compressionLevel: 9 }).toFile(dest);
    console.log(`wrote ${path.relative(ROOT, dest)}`);
  }
}
console.log(`SVG sources in ${path.relative(ROOT, brandDir)}`);
