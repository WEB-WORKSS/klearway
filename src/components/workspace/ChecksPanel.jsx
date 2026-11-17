import { useState } from 'react';
import { Play, History } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Button } from '../ui/Button.jsx';
import { StatusStamp } from '../ui/Badges.jsx';
import { fmtDateTime } from './context.js';

export default function ChecksPanel({ shipment, reload, goToDocuments }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [runId, setRunId] = useState(shipment.checkRuns[0]?.id || null);
  const run = shipment.checkRuns.find((r) => r.id === runId) || shipment.checkRuns[0];
  const docName = (id) => shipment.documents.find((d) => d.id === id)?.originalName || 'deleted document';

  async function runChecks() {
    setBusy(true);
    setError('');
    try {
      const r = await api(`/api/workspace/shipments/${shipment.id}/checks`, { method: 'POST' });
      await reload();
      setRunId(r.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Cross-document checks</h2>
            <p className="text-sm text-ink-600">Compares consignee, package count, gross weight, quantity, invoice reference and container numbers across the bill of lading, invoice and packing list.</p>
          </div>
          <Button variant="primary" onClick={runChecks} loading={busy} icon={Play} disabled={!shipment.documents.length}>Run checks</Button>
        </div>
        {!shipment.documents.length && <p className="mt-4 text-sm text-ink-600">Add documents first. <button type="button" className="underline" onClick={goToDocuments}>Go to documents</button></p>}
        {error && <p className="mt-4 text-sm text-flag" role="alert">{error}</p>}

        {run ? (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink-600">Run {fmtDateTime(run.ranAt)}:</span>
              {['mismatch', 'missing', 'warning', 'pass'].map((k) => run.summary[k] > 0 && <StatusStamp key={k} status={k}>{run.summary[k]} {k === 'pass' ? 'passed' : k}</StatusStamp>)}
            </div>
            <ul className="mt-4 space-y-2">
              {run.results.map((r) => (
                <li key={r.id} className={`rounded-xl border bg-paper-50 p-4 ${r.status === 'mismatch' ? 'border-flag/35' : 'border-paper-300'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{r.title}</p>
                    <StatusStamp status={r.status} />
                  </div>
                  <p className="mt-1.5 font-mono text-[0.8rem] leading-relaxed text-ink-700">{r.detail}</p>
                  {r.documents.length > 0 && <p className="mt-2 text-xs text-ink-400">Compared: {r.documents.map(docName).join(', ')}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-400">Checks compare the values on your documents. They do not decide duty, classification or whether goods will be released.</p>
          </div>
        ) : (
          shipment.documents.length > 0 && <p className="mt-6 rounded-xl border border-dashed border-paper-300 p-6 text-sm text-ink-600">No checks have been run on this shipment yet.</p>
        )}
      </div>

      {shipment.checkRuns.length > 0 && (
        <aside>
          <h3 className="flex items-center gap-1.5 text-sm font-medium"><History className="h-4 w-4" aria-hidden="true" /> Check history</h3>
          <ul className="mt-2 space-y-1">
            {shipment.checkRuns.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setRunId(r.id)} aria-current={run?.id === r.id ? 'true' : undefined} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${run?.id === r.id ? 'bg-paper-50 shadow-sheet' : 'hover:bg-paper-200/60'}`}>
                  <span>{fmtDateTime(r.ranAt)}</span>
                  <span className="font-mono text-xs">
                    <span className="text-flag">{r.summary.mismatch}✕</span> <span className="text-signal-700">{r.summary.missing}○</span> <span className="text-tide">{r.summary.pass}✓</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
