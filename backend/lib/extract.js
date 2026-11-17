import fs from 'node:fs/promises';
import { fieldDefs } from './fields.js';

let pdfjsPromise;
const loadPdfjs = () => (pdfjsPromise ||= import('pdfjs-dist/legacy/build/pdf.mjs'));

/** Reads the text layer of a PDF, one line per text row. */
async function pdfText(buf) {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false, useSystemFonts: false, disableFontFace: true, verbosity: 0 });
  const pdf = await task.promise;
  try {
    const pages = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let line = '';
      const lines = [];
      for (const item of content.items) {
        line += item.str;
        if (item.hasEOL) {
          lines.push(line);
          line = '';
        }
      }
      if (line) lines.push(line);
      pages.push(lines.join('\n'));
    }
    return { text: pages.join('\n'), pages: pdf.numPages };
  } finally {
    await task.destroy();
  }
}

export const CONTAINER_RE = /\b([A-Z]{3}[UJZ])\s?-?(\d{6})\s?-?(\d)\b/g;

/** Read the text layer of an upload. Images and scanned PDFs return empty text. */
export async function readText(filePath, mime, originalName = '') {
  const lower = originalName.toLowerCase();
  if (mime === 'application/pdf' || lower.endsWith('.pdf')) {
    const out = await pdfText(await fs.readFile(filePath));
    return { method: 'pdf-text', text: out.text || '', pages: out.pages || 0 };
  }
  if (mime?.startsWith('text/') || lower.endsWith('.txt') || lower.endsWith('.csv')) {
    return { method: 'text', text: await fs.readFile(filePath, 'utf8'), pages: 1 };
  }
  return { method: 'none', text: '', pages: 0 };
}

export function parseNumber(raw) {
  if (raw === undefined || raw === null) return null;
  const m = String(raw).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/** Converts "12,450.5 KGS" / "12.45 MT" / "27,446 LBS" to kilograms. */
export function parseWeightKg(raw) {
  const n = parseNumber(raw);
  if (n === null) return null;
  const s = String(raw).toLowerCase();
  if (/\b(mt|tonnes?|tons?)\b/.test(s)) return round(n * 1000);
  if (/\b(lbs?|pounds?)\b/.test(s)) return round(n * 0.45359237);
  return round(n);
}

const round = (n) => Math.round(n * 100) / 100;

export function findContainers(text) {
  const out = new Set();
  for (const m of String(text).toUpperCase().matchAll(CONTAINER_RE)) out.add(`${m[1]}${m[2]}${m[3]}`);
  return [...out];
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\/#]/g, '\\$&');
}

/**
 * Label-based extraction. For each field, look for a line that starts with one of its labels,
 * take the rest of the line (or the next line if the label stands alone).
 * Returns fields with the matching line as a snippet so a person can check the source.
 */
export function extractFields(type, text) {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const fields = {};
  for (const def of fieldDefs(type)) {
    let hit = null;
    outer: for (const label of def.labels) {
      const re = new RegExp(`^${escapeRe(label)}\\b\\s*[:\\-.]?\\s*(.*)$`, 'i');
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(re);
        if (!m) continue;
        let value = m[1].trim();
        let snippet = lines[i];
        if (!value && lines[i + 1]) {
          value = lines[i + 1];
          snippet = `${lines[i]} ${lines[i + 1]}`;
        }
        if (value) {
          hit = { value, snippet };
          break outer;
        }
      }
    }
    if (def.type === 'containers') {
      const scope = hit ? hit.value : text;
      const list = findContainers(scope);
      const all = list.length ? list : findContainers(text);
      if (all.length) fields[def.key] = field(all.join(', '), hit?.snippet || `Found in document text: ${all.join(', ')}`);
      continue;
    }
    if (!hit) continue;
    let value = hit.value;
    if (def.type === 'number') {
      const n = parseNumber(value);
      if (n === null) continue;
      value = String(n);
    } else if (def.type === 'weight') {
      const n = parseWeightKg(value);
      if (n === null) continue;
      value = String(n);
    }
    fields[def.key] = field(value, hit.snippet);
  }
  return fields;
}

function field(value, snippet) {
  return { value, source: 'extracted', confirmed: false, snippet: snippet.slice(0, 240) };
}

/** Guess the document type from its text, so uploads can be auto-classified. Person can change it. */
export function guessType(text, name = '') {
  const s = `${name}\n${String(text).slice(0, 1500)}`.toLowerCase();
  if (/bill of lading|\bb\/l\b|waybill/.test(s)) return 'bill_of_lading';
  if (/packing list|packing-list|packinglist/.test(s)) return 'packing_list';
  if (/commercial invoice|proforma|\binvoice\b/.test(s)) return 'commercial_invoice';
  return 'other';
}
