// End-to-end API tests: real HTTP requests against the Express app with a temporary data dir.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../backend/server.js';
import { getConfig, ROOT } from '../backend/lib/config.js';
import { isValidContainer, containerCheckDigit } from '../backend/lib/checks.js';
import { normaliseNigerianPhone } from '../backend/lib/validate.js';

let server;
let base;
let dataDir;
const KEY = 'test-key-123';

function start() {
  const cfg = { ...getConfig(), dataDir, uploadDir: path.join(dataDir, 'uploads'), accessKey: KEY, smtp: { host: '' }, ai: { provider: '' }, distDir: path.join(dataDir, 'no-dist') };
  const { app } = createApp(cfg);
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
}
const stop = () => new Promise((r) => server.close(r));

const api = (p, opts = {}) => fetch(`${base}${p}`, { ...opts, headers: { 'x-workspace-key': KEY, ...(opts.body && !(opts.body instanceof FormData) ? { 'content-type': 'application/json' } : {}), ...opts.headers } });

before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'klearway-test-'));
  await start();
});
after(async () => {
  await stop();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

test('ISO 6346 check digit (known example CSQU3054383)', () => {
  assert.equal(containerCheckDigit('CSQU305438'), 3);
  assert.ok(isValidContainer('CSQU3054383'));
  assert.ok(!isValidContainer('CSQU3054384'));
});

test('Nigerian phone normalisation', () => {
  assert.equal(normaliseNigerianPhone('0803 123 4567'), '+2348031234567');
  assert.equal(normaliseNigerianPhone('+234 803 123 4567'), '+2348031234567');
  assert.equal(normaliseNigerianPhone('12345'), null);
});

test('workspace rejects requests without the access key', async () => {
  const res = await fetch(`${base}/api/workspace/shipments`);
  assert.equal(res.status, 401);
});

test('full document check flow persists and survives a restart', async () => {
  // create shipment (with a validation failure first)
  let res = await api('/api/workspace/shipments', { method: 'POST', body: JSON.stringify({ ref: '' }) });
  assert.equal(res.status, 422);
  res = await api('/api/workspace/shipments', { method: 'POST', body: JSON.stringify({ ref: 'TEST-001', mode: 'sea', importerName: 'Test Importer', importerPhone: '08031234567' }) });
  assert.equal(res.status, 201);
  const shipment = await res.json();
  assert.equal(shipment.importerPhone, '+2348031234567');

  // upload the three sample PDFs
  const ids = {};
  for (const [file, type] of [['sample-bill-of-lading.pdf', 'bill_of_lading'], ['sample-commercial-invoice.pdf', 'commercial_invoice'], ['sample-packing-list.pdf', 'packing_list']]) {
    const fd = new FormData();
    fd.append('file', new Blob([fs.readFileSync(path.join(ROOT, 'public', 'samples', file))], { type: 'application/pdf' }), file);
    res = await api(`/api/workspace/shipments/${shipment.id}/documents`, { method: 'POST', body: fd });
    assert.equal(res.status, 201, await res.clone().text());
    const doc = await res.json();
    assert.equal(doc.type, type, `auto-classified ${file}`);
    assert.equal(doc.extraction.status, 'extracted');
    ids[type] = doc;
  }
  assert.equal(ids.bill_of_lading.extraction.fields.package_count.value, '1200');
  assert.equal(ids.packing_list.extraction.fields.package_count.value, '1180');
  assert.equal(ids.commercial_invoice.extraction.fields.invoice_number.value, 'NHC-INV-2026-0412');
  assert.equal(ids.bill_of_lading.extraction.fields.gross_weight_kg.value, '24180');

  // reject an unsupported file type
  const bad = new FormData();
  bad.append('file', new Blob(['MZ'], { type: 'application/x-msdownload' }), 'x.exe');
  res = await api(`/api/workspace/shipments/${shipment.id}/documents`, { method: 'POST', body: bad });
  assert.equal(res.status, 415);

  // run checks
  res = await api(`/api/workspace/shipments/${shipment.id}/checks`, { method: 'POST' });
  assert.equal(res.status, 201);
  let run = await res.json();
  const titles = run.results.map((r) => `${r.status}:${r.title}`);
  assert.ok(titles.includes('mismatch:Package count does not match'), titles.join('\n'));
  assert.ok(titles.includes('mismatch:Total quantity does not match'));
  assert.ok(titles.includes('pass:Consignee matches across documents'));
  assert.ok(titles.includes('pass:Container check digits are valid'));
  assert.ok(titles.includes('pass:Packing list refers to this invoice'));
  assert.ok(run.summary.warning >= 3, 'unconfirmed fields flagged');

  // person corrects the packing list and confirms
  const pl = ids.packing_list;
  res = await api(`/api/workspace/shipments/${shipment.id}/documents/${pl.id}`, { method: 'PATCH', body: JSON.stringify({ fields: { package_count: { value: '1200', confirmed: true }, quantity: { value: '1728', confirmed: true } } }) });
  assert.equal(res.status, 200);
  const edited = await res.json();
  assert.equal(edited.extraction.fields.package_count.source, 'manual');
  res = await api(`/api/workspace/shipments/${shipment.id}/checks`, { method: 'POST' });
  run = await res.json();
  assert.equal(run.summary.mismatch, 0, JSON.stringify(run.results.filter((r) => r.status === 'mismatch')));

  // milestone + importer update
  res = await api(`/api/workspace/shipments/${shipment.id}/milestones/arrived`, { method: 'PATCH', body: JSON.stringify({ status: 'done' }) });
  assert.equal(res.status, 422, 'date required');
  res = await api(`/api/workspace/shipments/${shipment.id}/milestones/arrived`, { method: 'PATCH', body: JSON.stringify({ status: 'done', date: '2026-11-10', note: 'Vessel berthed.' }) });
  assert.equal(res.status, 200);
  res = await api(`/api/workspace/shipments/${shipment.id}/update-draft`);
  const { message } = await res.json();
  assert.match(message, /Arrived at port or terminal on 10 Nov 2026/);
  res = await api(`/api/workspace/shipments/${shipment.id}/updates`, { method: 'POST', body: JSON.stringify({ message, channel: 'whatsapp' }) });
  assert.equal(res.status, 201);

  // stored file can be retrieved
  res = await api(`/api/workspace/shipments/${shipment.id}/documents/${pl.id}/file`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');

  // restart the server: everything is read back from disk
  await stop();
  await start();
  res = await api(`/api/workspace/shipments/${shipment.id}`);
  const reloaded = await res.json();
  assert.equal(reloaded.documents.length, 3);
  assert.equal(reloaded.checkRuns.length, 2);
  assert.equal(reloaded.updates.length, 1);
  assert.equal(reloaded.milestones.find((m) => m.key === 'arrived').status, 'done');
  res = await api('/api/workspace/shipments');
  const list = await res.json();
  assert.equal(list.shipments[0].stage, 'Arrived at port or terminal');
});

test('sample shipment endpoint runs the same pipeline and is labelled', async () => {
  const res = await api('/api/workspace/sample', { method: 'POST' });
  assert.equal(res.status, 201);
  const s = await res.json();
  assert.equal(s.isSample, true);
  assert.equal(s.documents.length, 3);
});

test('lead form validates, rejects honeypot, stores valid leads', async () => {
  let res = await fetch(`${base}/api/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'pilot', fullName: 'A', email: 'nope' }) });
  assert.equal(res.status, 422);
  const err = await res.json();
  assert.ok(err.details.email && err.details.companySize);
  res = await fetch(`${base}/api/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ website: 'spam' }) });
  assert.equal(res.status, 400);
  res = await fetch(`${base}/api/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'pilot', fullName: 'Test Person', email: 'test@example.com', company: 'Test Clearing Ltd', companySize: '3-10', useCase: 'All of the above', whatsapp: '0803 123 4567', modes: ['Sea'] }) });
  assert.equal(res.status, 201);
  const ok = await res.json();
  assert.equal(ok.stored, true);
  assert.equal(ok.notified, false, 'no SMTP configured, so no email is claimed');
  const db = JSON.parse(fs.readFileSync(path.join(dataDir, 'db.json'), 'utf8'));
  assert.equal(db.leads.length, 1);
  assert.equal(db.leads[0].whatsapp, '+2348031234567');
});
