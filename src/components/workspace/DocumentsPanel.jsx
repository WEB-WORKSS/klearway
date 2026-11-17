import { useEffect, useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, ArrowRight, CircleCheck, CircleDashed } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Field.jsx';
import { fmtBytes, useWorkspace } from './context.js';
import DocumentReview from './DocumentReview.jsx';

const TYPE_OPTIONS = [
  { value: 'bill_of_lading', label: 'Bill of lading' },
  { value: 'commercial_invoice', label: 'Commercial invoice' },
  { value: 'packing_list', label: 'Packing list' },
  { value: 'other', label: 'Other document' },
];

export default function DocumentsPanel({ shipment, reload, goToChecks }) {
  const { session } = useWorkspace();
  const [selected, setSelected] = useState(shipment.documents[0]?.id || null);
  const [type, setType] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    if (!shipment.documents.find((d) => d.id === selected)) setSelected(shipment.documents[0]?.id || null);
  }, [shipment.documents, selected]);

  async function upload(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setError('Files must be 10 MB or smaller.');
    setBusy(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    if (type) fd.append('type', type);
    try {
      const doc = await api(`/api/workspace/shipments/${shipment.id}/documents`, { method: 'POST', form: fd });
      await reload();
      setSelected(doc.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  async function remove(doc) {
    if (!window.confirm(`Delete ${doc.originalName}? The stored file and its fields are removed.`)) return;
    try {
      await api(`/api/workspace/shipments/${shipment.id}/documents/${doc.id}`, { method: 'DELETE' });
      await reload();
    } catch (e) {
      setError(e.message);
    }
  }

  const doc = shipment.documents.find((d) => d.id === selected);
  const unconfirmed = shipment.documents.reduce((n, d) => n + Object.values(d.extraction.fields).filter((f) => !f.confirmed).length, 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
      <aside className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]); }}
          className={`rounded-xl border-2 border-dashed p-4 transition ${drag ? 'border-tide bg-tide-100/50' : 'border-paper-300 bg-paper-50'}`}
        >
          <UploadCloud className="h-6 w-6 text-tide" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium">Add a document</p>
          <p className="mt-0.5 text-xs text-ink-600">PDF, text, JPG, PNG or WebP, up to 10 MB. Drop a file here or choose one.</p>
          <label className="mt-3 block text-xs">
            <span className="mb-1 block text-ink-600">Document type</span>
            <Select value={type} onChange={(e) => setType(e.target.value)} options={TYPE_OPTIONS} placeholder="Detect automatically" />
          </label>
          <input ref={input} type="file" className="sr-only" id="doc-upload" accept=".pdf,.txt,.csv,image/jpeg,image/png,image/webp,application/pdf,text/plain" onChange={(e) => upload(e.target.files?.[0])} />
          <Button as="label" htmlFor="doc-upload" variant="dark" size="sm" className="mt-3 w-full cursor-pointer" loading={busy} tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current?.click())}>
            {busy ? 'Reading document…' : 'Choose file'}
          </Button>
          {error && <p className="mt-2 text-sm text-flag" role="alert">{error}</p>}
          <p className="mt-3 text-[0.7rem] leading-snug text-ink-400">{session?.ai?.enabled ? 'Fields are extracted with Amazon Bedrock and must be confirmed.' : 'Digital PDFs and text files are read automatically. Scans and photos are stored for you to enter the fields; AI extraction is not configured yet.'}</p>
        </div>

        {shipment.documents.length > 0 && (
          <ul className="space-y-1.5" aria-label="Documents in this shipment">
            {shipment.documents.map((d) => {
              const fields = Object.values(d.extraction.fields);
              const pending = fields.filter((f) => !f.confirmed).length;
              const Icon = d.mime.startsWith('image/') ? ImageIcon : FileText;
              return (
                <li key={d.id} className="flex items-stretch gap-1">
                  <button type="button" onClick={() => setSelected(d.id)} aria-current={selected === d.id ? 'true' : undefined} className={`flex flex-1 items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition ${selected === d.id ? 'border-ink/30 bg-paper-50 shadow-sheet' : 'border-transparent hover:bg-paper-200/60'}`}>
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-600" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{TYPE_OPTIONS.find((t) => t.value === d.type)?.label}</span>
                      <span className="block truncate text-xs text-ink-600">{d.originalName} · {fmtBytes(d.size)}</span>
                      <span className={`mt-1 inline-flex items-center gap-1 text-xs ${pending ? 'text-signal-700' : 'text-tide'}`}>
                        {pending ? <CircleDashed className="h-3 w-3" /> : <CircleCheck className="h-3 w-3" />}
                        {fields.length === 0 ? 'No fields yet' : pending ? `${pending} to confirm` : 'All fields confirmed'}
                      </span>
                    </span>
                  </button>
                  <button type="button" onClick={() => remove(d)} className="rounded-lg px-2 text-ink-400 hover:bg-flag-100 hover:text-flag" aria-label={`Delete ${d.originalName}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {shipment.documents.length > 0 && (
          <Button variant={unconfirmed ? 'outline' : 'primary'} className="w-full" onClick={goToChecks} icon={ArrowRight}>
            {unconfirmed ? `Go to checks (${unconfirmed} unconfirmed)` : 'Go to checks'}
          </Button>
        )}
      </aside>

      <section aria-label="Document review">
        {doc ? (
          <DocumentReview key={doc.id} shipmentId={shipment.id} doc={doc} reload={reload} typeOptions={TYPE_OPTIONS} />
        ) : (
          <div className="flex h-full min-h-[18rem] items-center justify-center rounded-xl border border-paper-300 bg-paper-50 p-8 text-center text-sm text-ink-600">
            Upload the bill of lading, commercial invoice and packing list for this shipment. Each one opens here beside its extracted fields.
          </div>
        )}
      </section>
    </div>
  );
}
