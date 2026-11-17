// Generic milestones. Wording stays procedure-neutral until a practising clearing agent
// confirms the local steps (see docs/implementation-status.md).
export const MILESTONES = [
  { key: 'docs_received', label: 'Documents received' },
  { key: 'docs_checked', label: 'Documents checked' },
  { key: 'arrived', label: 'Arrived at port or terminal' },
  { key: 'clearance', label: 'Clearance in progress' },
  { key: 'released', label: 'Released' },
  { key: 'delivered', label: 'Delivered to importer' },
];

export function initialMilestones() {
  return MILESTONES.map((m) => ({ ...m, status: 'pending', date: null, note: '', confirmedAt: null }));
}

export function currentStage(shipment) {
  const done = shipment.milestones.filter((m) => m.status === 'done');
  return done.length ? done[done.length - 1] : null;
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(`${d}T00:00:00Z`);
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Builds an importer status message from milestones the firm has confirmed. */
export function draftUpdate(shipment, firmName) {
  const latest = currentStage(shipment);
  const next = shipment.milestones.find((m) => m.status !== 'done');
  const greeting = shipment.importerName ? `Hello ${shipment.importerName},` : 'Hello,';
  const lines = [greeting, '', `Update on shipment ${shipment.ref}${shipment.goods ? ` (${shipment.goods})` : ''}:`];
  if (latest) {
    lines.push(`• ${latest.label}${latest.date ? ` on ${fmtDate(latest.date)}` : ''}.`);
    if (latest.note) lines.push(`• ${latest.note}`);
  } else {
    lines.push('• We have opened your file and are collecting the shipping documents.');
  }
  if (next) lines.push(`• Next step: ${next.label.toLowerCase()}.`);
  else lines.push('• This shipment is complete.');
  lines.push('', `${firmName || 'Your clearing agent'}`);
  return lines.join('\n');
}
