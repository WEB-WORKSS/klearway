import { randomUUID } from 'node:crypto';
import { DOC_TYPES, REQUIRED_TYPES, fieldDefs } from './fields.js';
import { findContainers, parseNumber } from './extract.js';

/** ISO 6346 check digit for a container number such as MSCU1234565. */
export function containerCheckDigit(code) {
  const s = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^[A-Z]{4}\d{6,7}$/.test(s)) return null;
  const values = {};
  let v = 10;
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    if (v % 11 === 0) v++;
    values[ch] = v++;
  }
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const ch = s[i];
    const n = i < 4 ? values[ch] : Number(ch);
    sum += n * 2 ** i;
  }
  return (sum % 11) % 10;
}

export function isValidContainer(code) {
  const s = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^[A-Z]{4}\d{7}$/.test(s)) return false;
  return containerCheckDigit(s) === Number(s[10]);
}

const SUFFIXES = /\b(limited|ltd|plc|llc|inc|co|company|nig|nigeria|enterprises?|ent|intl|international)\b/g;
export function normaliseName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,&()'"\-/]/g, ' ')
    .replace(SUFFIXES, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function val(doc, key) {
  const f = doc?.extraction?.fields?.[key];
  return f && String(f.value).trim() !== '' ? f.value : null;
}

/**
 * Cross-check the documents of one shipment. Deterministic rules only: every result says
 * which documents and values it compared, so staff can verify it against the source.
 */
export function runChecks(shipment) {
  const docs = shipment.documents || [];
  const byType = (t) => docs.filter((d) => d.type === t);
  const first = (t) => byType(t)[0];
  const results = [];
  const add = (r) => results.push({ id: randomUUID(), ...r });
  const name = (d) => `${DOC_TYPES[d.type].short} (${d.originalName})`;

  // 1. Required documents
  for (const t of REQUIRED_TYPES) {
    if (!byType(t).length) {
      add({ rule: 'required_document', status: 'missing', title: `${DOC_TYPES[t].label} not received`, detail: `No ${DOC_TYPES[t].label.toLowerCase()} has been added to this shipment.`, documents: [] });
    }
  }

  // 2. Missing required fields per document
  for (const d of docs) {
    const missing = fieldDefs(d.type).filter((f) => !f.optional && !val(d, f.key)).map((f) => f.label);
    if (missing.length) {
      add({ rule: 'missing_fields', status: 'missing', title: `${missing.length} field${missing.length > 1 ? 's' : ''} missing on ${DOC_TYPES[d.type].short}`, detail: `${missing.join(', ')}. Add them from the source document or request a corrected copy.`, documents: [d.id] });
    }
    const pending = Object.values(d.extraction?.fields || {}).filter((f) => !f.confirmed).length;
    if (pending) {
      add({ rule: 'unconfirmed_fields', status: 'warning', title: `${pending} field${pending > 1 ? 's' : ''} not yet confirmed on ${DOC_TYPES[d.type].short}`, detail: 'Results that use unconfirmed fields may change once a person checks them against the source.', documents: [d.id] });
    }
  }

  const bl = first('bill_of_lading');
  const inv = first('commercial_invoice');
  const pl = first('packing_list');

  function compareText(title, pairs) {
    const present = pairs.filter(([d, k]) => d && val(d, k));
    if (present.length < 2) return;
    const norm = present.map(([d, k]) => ({ d, raw: val(d, k), n: normaliseName(val(d, k)) }));
    const same = norm.every((x) => x.n === norm[0].n);
    add({
      rule: 'party_match',
      status: same ? 'pass' : 'mismatch',
      title: same ? `${title} matches across documents` : `${title} differs between documents`,
      detail: norm.map((x) => `${name(x.d)}: "${x.raw}"`).join(' · '),
      documents: norm.map((x) => x.d.id),
    });
  }

  function compareNumber(title, pairs, { tolerance = 0, unit = '' } = {}) {
    const present = pairs.filter(([d, k]) => d && val(d, k) !== null);
    if (present.length < 2) return;
    const nums = present.map(([d, k]) => ({ d, n: parseNumber(val(d, k)) }));
    const base = nums[0].n;
    const same = nums.every((x) => x.n !== null && Math.abs(x.n - base) <= Math.abs(base) * tolerance);
    const diff = same ? '' : ` Difference: ${fmt(Math.max(...nums.map((x) => x.n)) - Math.min(...nums.map((x) => x.n)))}${unit}.`;
    add({
      rule: 'quantity_match',
      status: same ? 'pass' : 'mismatch',
      title: same ? `${title} matches` : `${title} does not match`,
      detail: nums.map((x) => `${name(x.d)}: ${fmt(x.n)}${unit}`).join(' · ') + (diff ? `.${diff}` : '') + (tolerance && same ? ` (within ${tolerance * 100}% tolerance)` : ''),
      documents: nums.map((x) => x.d.id),
    });
  }

  compareText('Consignee', [[bl, 'consignee'], [inv, 'buyer'], [pl, 'consignee']]);
  compareNumber('Package count', [[bl, 'package_count'], [pl, 'package_count']]);
  compareNumber('Gross weight', [[bl, 'gross_weight_kg'], [pl, 'gross_weight_kg']], { tolerance: 0.005, unit: ' kg' });
  compareNumber('Total quantity', [[inv, 'quantity'], [pl, 'quantity']]);

  // Invoice reference on the packing list
  if (inv && pl && val(inv, 'invoice_number') && val(pl, 'invoice_reference')) {
    const a = String(val(inv, 'invoice_number')).toUpperCase().replace(/\s/g, '');
    const b = String(val(pl, 'invoice_reference')).toUpperCase().replace(/\s/g, '');
    add({
      rule: 'reference_match',
      status: a === b ? 'pass' : 'mismatch',
      title: a === b ? 'Packing list refers to this invoice' : 'Packing list refers to a different invoice',
      detail: `Invoice number: ${val(inv, 'invoice_number')} · Packing list reference: ${val(pl, 'invoice_reference')}`,
      documents: [inv.id, pl.id],
    });
  }

  // Containers: same set on B/L and packing list, valid ISO 6346 check digits
  const sets = [bl, pl].filter((d) => d && val(d, 'container_numbers')).map((d) => ({ d, list: findContainers(val(d, 'container_numbers')) }));
  if (sets.length === 2) {
    const [a, b] = sets;
    const onlyA = a.list.filter((c) => !b.list.includes(c));
    const onlyB = b.list.filter((c) => !a.list.includes(c));
    const ok = !onlyA.length && !onlyB.length;
    add({
      rule: 'container_match',
      status: ok ? 'pass' : 'mismatch',
      title: ok ? 'Container numbers match' : 'Container numbers differ',
      detail: ok ? `${a.list.join(', ')} on both documents.` : [onlyA.length && `Only on ${name(a.d)}: ${onlyA.join(', ')}`, onlyB.length && `Only on ${name(b.d)}: ${onlyB.join(', ')}`].filter(Boolean).join(' · '),
      documents: [a.d.id, b.d.id],
    });
  }
  const allContainers = new Map();
  for (const s of sets) for (const c of s.list) allContainers.set(c, s.d);
  for (const [c, d] of allContainers) {
    if (!isValidContainer(c)) {
      add({ rule: 'container_check_digit', status: 'mismatch', title: `Container ${c} fails the ISO 6346 check digit`, detail: `The last digit should be ${containerCheckDigit(c)}. The number may have been typed or scanned wrongly. Confirm it with the shipping line documents.`, documents: [d.id] });
    }
  }
  if (allContainers.size && [...allContainers.keys()].every(isValidContainer)) {
    add({ rule: 'container_check_digit', status: 'pass', title: 'Container check digits are valid', detail: [...allContainers.keys()].join(', '), documents: [...new Set([...allContainers.values()].map((d) => d.id))] });
  }

  // HS code format (format only: Klearway does not classify goods)
  if (inv && val(inv, 'hs_code')) {
    const digits = String(val(inv, 'hs_code')).replace(/[.\s]/g, '');
    const ok = /^\d{6,10}$/.test(digits);
    add({ rule: 'hs_format', status: ok ? 'pass' : 'warning', title: ok ? 'HS code is in a valid format' : 'HS code format looks wrong', detail: `${val(inv, 'hs_code')}. Format check only; classification stays with your licensed agent.`, documents: [inv.id] });
  }

  const order = { mismatch: 0, missing: 1, warning: 2, pass: 3 };
  results.sort((a, b) => order[a.status] - order[b.status]);
  const summary = { mismatch: 0, missing: 0, warning: 0, pass: 0 };
  for (const r of results) summary[r.status]++;
  return { id: randomUUID(), ranAt: new Date().toISOString(), summary, results };
}

function fmt(n) {
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
}
