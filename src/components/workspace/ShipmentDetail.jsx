import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Loader2, FileText, ListChecks, Milestone, MessageSquareText, Ban } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Button } from '../ui/Button.jsx';
import { SampleLabel, StatusStamp } from '../ui/Badges.jsx';
import { Dialog } from '../ui/Dialog.jsx';
import { MODE_LABEL } from './context.js';
import NewShipmentDialog from './NewShipmentDialog.jsx';
import DocumentsPanel from './DocumentsPanel.jsx';
import ChecksPanel from './ChecksPanel.jsx';
import StatusPanel from './StatusPanel.jsx';
import UpdatesPanel from './UpdatesPanel.jsx';

const TABS = [
  { key: 'documents', label: 'Documents', Icon: FileText },
  { key: 'checks', label: 'Checks', Icon: ListChecks },
  { key: 'status', label: 'Status', Icon: Milestone },
  { key: 'updates', label: 'Importer updates', Icon: MessageSquareText },
];

export default function ShipmentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('documents');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(async () => {
    try {
      setS(await api(`/api/workspace/shipments/${id}`));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [id]);
  useEffect(() => {
    reload();
  }, [reload]);

  async function remove() {
    setDeleting(true);
    try {
      await api(`/api/workspace/shipments/${id}`, { method: 'DELETE' });
      nav('/workspace');
    } catch (e) {
      setError(e.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (error && !s) {
    return (
      <div className="py-16 text-center" role="alert">
        <p className="text-flag">{error}</p>
        <Button to="/workspace" variant="outline" className="mt-4" icon={ArrowLeft}>Back to shipments</Button>
      </div>
    );
  }
  if (!s) return <p className="flex items-center gap-2 py-10 text-sm text-ink-600" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Loading shipment…</p>;

  const latest = s.checkRuns[0];
  const tabIndex = TABS.findIndex((t) => t.key === tab);
  const onTabKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = TABS[(tabIndex + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.key);
    document.getElementById(`tab-${next.key}`)?.focus();
  };

  return (
    <div>
      <Link to="/workspace" className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink"><ArrowLeft className="h-4 w-4" /> All shipments</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-2xl font-medium">{s.ref}</h1>
            {s.isSample && <SampleLabel>Sample data</SampleLabel>}
            {latest && (latest.summary.mismatch ? <StatusStamp status="mismatch">{latest.summary.mismatch} mismatch</StatusStamp> : <StatusStamp status="pass">Latest check clear</StatusStamp>)}
          </div>
          <p className="mt-1 text-sm text-ink-600">
            {[MODE_LABEL[s.mode], s.goods, [s.origin, s.destination].filter(Boolean).join(' → '), s.importerName && `for ${s.importerName}`].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} icon={Pencil}>Edit</Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} icon={Trash2} aria-label="Delete shipment">Delete</Button>
        </div>
      </div>

      <Blocker shipment={s} onSaved={setS} />

      <div role="tablist" aria-label="Shipment sections" className="mt-6 flex gap-1 overflow-x-auto border-b border-paper-300" onKeyDown={onTabKey}>
        {TABS.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => setTab(t.key)}
            className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm transition ${tab === t.key ? 'border-ink font-medium text-ink' : 'border-transparent text-ink-600 hover:text-ink'}`}
          >
            <t.Icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
            {t.key === 'documents' && <span className="rounded bg-paper-200 px-1.5 font-mono text-xs">{s.documents.length}</span>}
          </button>
        ))}
      </div>
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-6">
        {tab === 'documents' && <DocumentsPanel shipment={s} reload={reload} goToChecks={() => setTab('checks')} />}
        {tab === 'checks' && <ChecksPanel shipment={s} reload={reload} goToDocuments={() => setTab('documents')} />}
        {tab === 'status' && <StatusPanel shipment={s} onSaved={setS} />}
        {tab === 'updates' && <UpdatesPanel shipment={s} reload={reload} />}
      </div>

      <NewShipmentDialog open={editing} onClose={() => setEditing(false)} onCreated={setS} initial={s} title="Edit shipment" submitLabel="Save changes" path={`/api/workspace/shipments/${s.id}`} method="PATCH" />
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this shipment?">
        <p className="text-sm text-ink-700">This permanently deletes {s.ref}, its {s.documents.length} stored document{s.documents.length === 1 ? '' : 's'}, check history and update log. It cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={remove} loading={deleting}>Delete permanently</Button>
        </div>
      </Dialog>
    </div>
  );
}

function Blocker({ shipment, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(shipment.blocker?.text || '');
  const [owner, setOwner] = useState(shipment.blocker?.owner || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(clear = false) {
    setBusy(true);
    setError('');
    try {
      const s = await api(`/api/workspace/shipments/${shipment.id}`, { method: 'PATCH', body: { blocker: clear ? null : { text, owner } } });
      onSaved(s);
      setEditing(false);
      if (clear) {
        setText('');
        setOwner('');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return shipment.blocker ? (
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-flag/25 bg-flag-100/60 px-4 py-3 text-sm">
        <Ban className="h-4 w-4 text-flag" aria-hidden="true" />
        <span><strong className="font-medium">Blocked:</strong> {shipment.blocker.text}{shipment.blocker.owner && <span className="text-ink-600"> · Waiting on {shipment.blocker.owner}</span>}</span>
        <span className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Change</Button>
          <Button size="sm" variant="dark" onClick={() => save(true)} loading={busy}>Mark resolved</Button>
        </span>
      </div>
    ) : (
      <button type="button" onClick={() => setEditing(true)} className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-600 underline-offset-2 hover:text-ink hover:underline">
        <Ban className="h-4 w-4" aria-hidden="true" /> Record what is blocking this shipment
      </button>
    );
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) save(); }} className="mt-4 grid gap-2 rounded-lg border border-paper-300 bg-paper-50 p-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
      <label className="text-sm">
        <span className="label">What is blocking it</span>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Waiting for corrected packing list" maxLength={240} required />
      </label>
      <label className="text-sm">
        <span className="label">Waiting on</span>
        <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. Supplier, importer, terminal" maxLength={80} />
      </label>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        <Button type="submit" variant="dark" loading={busy}>Save</Button>
      </div>
      {error && <p className="text-sm text-flag sm:col-span-3" role="alert">{error}</p>}
    </form>
  );
}
