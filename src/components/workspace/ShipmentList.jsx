import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, FileStack, AlertOctagon, ShieldAlert, PauseCircle, Download, Loader2, Anchor, Plane, Truck } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Button } from '../ui/Button.jsx';
import { SampleLabel, StatusStamp } from '../ui/Badges.jsx';
import { fmtDateTime, MODE_LABEL } from './context.js';
import NewShipmentDialog from './NewShipmentDialog.jsx';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'attention', label: 'Needs attention' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'unchecked', label: 'Not checked' },
];
const ModeIcon = { sea: Anchor, air: Plane, road: Truck };

export default function ShipmentList() {
  const nav = useNavigate();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [dialog, setDialog] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    setError('');
    try {
      const { shipments } = await api('/api/workspace/shipments');
      setItems(shipments);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function loadSample() {
    setSeeding(true);
    setError('');
    try {
      const s = await api('/api/workspace/sample', { method: 'POST' });
      nav(`/workspace/shipments/${s.id}`);
    } catch (e) {
      setError(e.message);
      setSeeding(false);
    }
  }

  const needsAttention = (s) => s.blocker || (s.latestCheck && (s.latestCheck.summary.mismatch || s.latestCheck.summary.missing)) || s.unconfirmedFields > 0;
  const shown = useMemo(() => {
    if (!items) return [];
    const term = q.trim().toLowerCase();
    return items.filter((s) => {
      if (filter === 'attention' && !needsAttention(s)) return false;
      if (filter === 'blocked' && !s.blocker) return false;
      if (filter === 'unchecked' && s.latestCheck) return false;
      if (!term) return true;
      return [s.ref, s.importerName, s.goods, s.origin, s.destination, s.stage].join(' ').toLowerCase().includes(term);
    });
  }, [items, q, filter]);

  const totals = useMemo(() => {
    const list = items || [];
    return {
      open: list.filter((s) => s.stage !== 'Delivered to importer').length,
      mismatches: list.reduce((n, s) => n + (s.latestCheck?.summary.mismatch || 0), 0),
      unconfirmed: list.reduce((n, s) => n + s.unconfirmedFields, 0),
      blocked: list.filter((s) => s.blocker).length,
    };
  }, [items]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Shipments</h1>
          <p className="mt-1 text-sm text-ink-600">Each shipment holds its documents, check results, status milestones and importer updates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadSample} loading={seeding} icon={FileStack}>Load sample shipment</Button>
          <Button variant="dark" onClick={() => setDialog(true)} icon={Plus}>New shipment</Button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={FileStack} label="Open shipments" value={totals.open} />
        <Metric icon={AlertOctagon} label="Mismatches in latest checks" value={totals.mismatches} tone={totals.mismatches ? 'flag' : ''} />
        <Metric icon={ShieldAlert} label="Fields waiting for confirmation" value={totals.unconfirmed} tone={totals.unconfirmed ? 'signal' : ''} />
        <Metric icon={PauseCircle} label="Blocked shipments" value={totals.blocked} tone={totals.blocked ? 'flag' : ''} />
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search shipments</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by reference, importer, goods or route" className="input pl-9" />
        </label>
        <div role="group" aria-label="Filter shipments" className="flex flex-wrap gap-1 rounded-lg bg-paper-200 p-1">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-sm transition ${filter === f.key ? 'bg-paper-50 font-medium text-ink shadow-sm' : 'text-ink-600 hover:text-ink'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg border border-flag/30 bg-flag-100 px-4 py-3 text-sm text-flag" role="alert">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-xl border border-paper-300 bg-paper-50">
        {items === null && !error ? (
          <p className="flex items-center gap-2 p-6 text-sm text-ink-600" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Loading shipments…</p>
        ) : items?.length === 0 ? (
          <EmptyState onNew={() => setDialog(true)} onSample={loadSample} seeding={seeding} />
        ) : shown.length === 0 ? (
          <p className="p-6 text-sm text-ink-600">No shipments match this search or filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-paper-300 bg-paper-200/60 font-mono text-[0.7rem] uppercase tracking-wider text-ink-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Shipment</th>
                  <th scope="col" className="px-4 py-3 font-medium">Importer</th>
                  <th scope="col" className="px-4 py-3 font-medium">Stage</th>
                  <th scope="col" className="px-4 py-3 font-medium">Latest check</th>
                  <th scope="col" className="px-4 py-3 font-medium">Blocking</th>
                  <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-300">
                {shown.map((s) => {
                  const Icon = ModeIcon[s.mode] || FileStack;
                  return (
                    <tr key={s.id} className="group hover:bg-paper-200/50">
                      <td className="px-4 py-3">
                        <Link to={`/workspace/shipments/${s.id}`} className="font-mono font-medium text-ink underline-offset-2 group-hover:underline">{s.ref}</Link>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-600">
                          <Icon className="h-3.5 w-3.5" aria-label={MODE_LABEL[s.mode]} />
                          {[s.origin, s.destination].filter(Boolean).join(' → ') || MODE_LABEL[s.mode]}
                          {s.isSample && <SampleLabel className="ml-1">Sample</SampleLabel>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{s.importerName || '—'}</td>
                      <td className="px-4 py-3">{s.stage}</td>
                      <td className="px-4 py-3">
                        {s.latestCheck ? (
                          <div className="flex flex-wrap gap-1">
                            {s.latestCheck.summary.mismatch > 0 && <StatusStamp status="mismatch">{s.latestCheck.summary.mismatch} mismatch</StatusStamp>}
                            {s.latestCheck.summary.missing > 0 && <StatusStamp status="missing">{s.latestCheck.summary.missing} missing</StatusStamp>}
                            {!s.latestCheck.summary.mismatch && !s.latestCheck.summary.missing && <StatusStamp status="pass">Clear</StatusStamp>}
                          </div>
                        ) : (
                          <span className="text-ink-400">{s.documentCount ? 'Not run yet' : 'No documents'}</span>
                        )}
                      </td>
                      <td className="max-w-[14rem] px-4 py-3 text-ink-700">{s.blocker ? <span><span className="text-flag">●</span> {s.blocker.text}{s.blocker.owner && <span className="text-ink-400"> · {s.blocker.owner}</span>}</span> : <span className="text-ink-400">—</span>}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-600">{fmtDateTime(s.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <NewShipmentDialog open={dialog} onClose={() => setDialog(false)} onCreated={(s) => nav(`/workspace/shipments/${s.id}`)} />
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  const color = tone === 'flag' ? 'text-flag' : tone === 'signal' ? 'text-signal-700' : 'text-ink';
  return (
    <div className="rounded-xl border border-paper-300 bg-paper-50 p-4">
      <dt className="flex items-center gap-1.5 text-xs text-ink-600"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</dt>
      <dd className={`mt-2 font-mono text-2xl font-medium ${color}`}>{value}</dd>
    </div>
  );
}

function EmptyState({ onNew, onSample, seeding }) {
  return (
    <div className="grid gap-6 p-8 md:grid-cols-[1.2fr_1fr] md:items-center">
      <div>
        <h2 className="text-lg font-semibold">Start with one shipment</h2>
        <ol className="mt-3 space-y-2 text-sm text-ink-700">
          <li><span className="font-mono text-tide">1.</span> Create a shipment with its reference and importer.</li>
          <li><span className="font-mono text-tide">2.</span> Upload the bill of lading, commercial invoice and packing list (PDF, text or photo).</li>
          <li><span className="font-mono text-tide">3.</span> Confirm the extracted fields against each document, then run the checks.</li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="dark" onClick={onNew} icon={Plus}>New shipment</Button>
          <Button variant="outline" onClick={onSample} loading={seeding} icon={FileStack}>Load sample shipment</Button>
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-paper-300 p-5 text-sm">
        <p className="font-medium">Try it with fictional documents</p>
        <p className="mt-1 text-ink-600">These sample PDFs contain a deliberate package-count mismatch.</p>
        <ul className="mt-3 space-y-1.5">
          {[['sample-bill-of-lading.pdf', 'Bill of lading'], ['sample-commercial-invoice.pdf', 'Commercial invoice'], ['sample-packing-list.pdf', 'Packing list']].map(([f, l]) => (
            <li key={f}><a href={`/samples/${f}`} download className="inline-flex items-center gap-1.5 text-tide underline-offset-2 hover:underline"><Download className="h-3.5 w-3.5" aria-hidden="true" />{l} (sample)</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
