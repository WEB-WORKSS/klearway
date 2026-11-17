import { useState } from 'react';
import { Check, Circle } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Button } from '../ui/Button.jsx';
import { fmtDate, fmtDateTime } from './context.js';

export default function StatusPanel({ shipment, onSaved }) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold">Shipment milestones</h2>
      <p className="text-sm text-ink-600">Mark each milestone when your team has confirmed it. Importer updates are drafted only from confirmed milestones.</p>
      <ol className="mt-5">
        {shipment.milestones.map((m, i) => (
          <MilestoneRow key={m.key} m={m} last={i === shipment.milestones.length - 1} shipmentId={shipment.id} onSaved={onSaved} />
        ))}
      </ol>
    </div>
  );
}

function MilestoneRow({ m, last, shipmentId, onSaved }) {
  const today = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(m.date || today);
  const [note, setNote] = useState(m.note || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const done = m.status === 'done';

  async function save(status) {
    setBusy(true);
    setError('');
    try {
      onSaved(await api(`/api/workspace/shipments/${shipmentId}/milestones/${m.key}`, { method: 'PATCH', body: { status, date, note } }));
      setOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="relative flex gap-4 pb-6">
      {!last && <span className={`absolute left-[0.9rem] top-8 h-[calc(100%-1.5rem)] w-px ${done ? 'bg-tide' : 'bg-paper-300'}`} aria-hidden="true" />}
      <span className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${done ? 'border-tide bg-tide text-white' : 'border-paper-300 bg-paper-50 text-ink-400'}`}>
        {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-2.5 w-2.5" aria-hidden="true" />}
      </span>
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium">{m.label}</p>
            <p className="text-sm text-ink-600">{done ? `${fmtDate(m.date)}${m.note ? ` · ${m.note}` : ''}` : 'Not confirmed'}</p>
            {done && m.confirmedAt && <p className="text-xs text-ink-400">Confirmed {fmtDateTime(m.confirmedAt)}</p>}
          </div>
          {!open && <Button size="sm" variant={done ? 'outline' : 'subtle'} onClick={() => setOpen(true)}>{done ? 'Edit' : 'Confirm'}</Button>}
        </div>
        {open && (
          <form onSubmit={(e) => { e.preventDefault(); save('done'); }} className="mt-3 grid gap-2 rounded-lg border border-paper-300 bg-paper-50 p-3 sm:grid-cols-[10rem_1fr]">
            <label className="text-sm"><span className="label">Date</span><input type="date" className="input py-2" value={date} max={today} onChange={(e) => setDate(e.target.value)} required /></label>
            <label className="text-sm"><span className="label">Note for the importer (optional)</span><input className="input py-2" value={note} maxLength={240} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Vessel berthed; discharge expected tomorrow" /></label>
            {error && <p className="text-sm text-flag sm:col-span-2" role="alert">{error}</p>}
            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
              {done && <Button type="button" size="sm" variant="outline" onClick={() => save('pending')} loading={busy}>Mark not done</Button>}
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" variant="dark" loading={busy}>Confirm milestone</Button>
            </div>
          </form>
        )}
      </div>
    </li>
  );
}
