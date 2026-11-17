import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, Loader2, Quote, Save } from 'lucide-react';
import { api, fetchFileBlobUrl } from '../../lib/api.js';
import { Button } from '../ui/Button.jsx';
import { Select } from '../ui/Field.jsx';
import { fmtDateTime } from './context.js';

const SOURCE = { extracted: 'Read from text', ai: 'AI suggestion', manual: 'Entered by staff' };

export default function DocumentReview({ shipmentId, doc, reload, typeOptions }) {
  const [preview, setPreview] = useState({ url: '', error: '' });
  const initial = useMemo(() => {
    const o = {};
    for (const f of doc.fieldDefs) {
      const cur = doc.extraction.fields[f.key];
      o[f.key] = { value: cur?.value ?? '', confirmed: Boolean(cur?.confirmed) };
    }
    return o;
  }, [doc]);
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => setValues(initial), [initial]);

  useEffect(() => {
    let url = '';
    let cancelled = false;
    fetchFileBlobUrl(shipmentId, doc.id)
      .then((u) => {
        url = u;
        if (!cancelled) setPreview({ url: u, error: '' });
      })
      .catch((e) => !cancelled && setPreview({ url: '', error: e.message }));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [shipmentId, doc.id]);

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  async function save(confirmAll = false) {
    setBusy(true);
    setMsg({ type: '', text: '' });
    const fields = {};
    for (const [k, v] of Object.entries(values)) {
      if (!v.value && !initial[k].value) continue;
      fields[k] = { value: v.value, confirmed: confirmAll ? Boolean(v.value) : v.confirmed };
    }
    try {
      await api(`/api/workspace/shipments/${shipmentId}/documents/${doc.id}`, { method: 'PATCH', body: { fields } });
      await reload();
      setMsg({ type: 'ok', text: confirmAll ? 'All filled fields confirmed and saved.' : 'Saved.' });
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function changeType(type) {
    setBusy(true);
    try {
      await api(`/api/workspace/shipments/${shipmentId}/documents/${doc.id}`, { method: 'PATCH', body: { type } });
      await reload();
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
      setBusy(false);
    }
  }

  const ex = doc.extraction;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-paper-300 bg-white">
        <div className="flex items-center justify-between border-b border-paper-300 bg-paper-50 px-3 py-2 text-xs text-ink-600">
          <span className="truncate font-mono">{doc.originalName}</span>
          {preview.url && <a href={preview.url} target="_blank" rel="noreferrer" className="shrink-0 underline">Open</a>}
        </div>
        <div className="h-[28rem] lg:h-[36rem]">
          {preview.error ? (
            <p className="p-6 text-sm text-flag" role="alert">{preview.error}</p>
          ) : !preview.url ? (
            <p className="flex items-center gap-2 p-6 text-sm text-ink-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading document…</p>
          ) : doc.mime.startsWith('image/') ? (
            <img src={preview.url} alt={`Uploaded ${doc.originalName}`} className="h-full w-full object-contain" />
          ) : doc.mime === 'application/pdf' ? (
            <iframe src={`${preview.url}#navpanes=0&view=FitH`} title={`Preview of ${doc.originalName}`} className="h-full w-full" />
          ) : (
            <TextPreview url={preview.url} />
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save(false); }} className="rounded-xl border border-paper-300 bg-paper-50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-300 px-4 py-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink-600">Type</span>
            <span className="w-48"><Select value={doc.type} onChange={(e) => changeType(e.target.value)} options={typeOptions} placeholder="Choose type" disabled={busy} /></span>
          </label>
          <span className="text-xs text-ink-400">{doc.typeGuessed ? 'Type detected automatically · ' : ''}Read {fmtDateTime(ex.ranAt)}</span>
        </div>
        {ex.message && <p className="mx-4 mt-3 rounded-lg bg-signal-100 px-3 py-2 text-sm text-[#7a4d0f]">{ex.message}</p>}
        {doc.fieldDefs.length === 0 ? (
          <p className="p-4 text-sm text-ink-600">Other documents are stored with the shipment but are not cross-checked. Change the type if this is a bill of lading, invoice or packing list.</p>
        ) : (
          <fieldset className="divide-y divide-paper-300">
            <legend className="sr-only">Extracted fields</legend>
            {doc.fieldDefs.map((f) => {
              const cur = ex.fields[f.key];
              const v = values[f.key] || { value: '', confirmed: false };
              const id = `${doc.id}-${f.key}`;
              return (
                <div key={f.key} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={id} className="text-sm font-medium text-ink-700">{f.label}{!f.optional && <span className="text-flag" aria-hidden="true"> *</span>}</label>
                    {cur && <span className="font-mono text-[0.66rem] uppercase tracking-wider text-ink-400">{SOURCE[cur.source] || cur.source}</span>}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input id={id} className="input py-2 font-mono text-sm" value={v.value} onChange={(e) => setValues({ ...values, [f.key]: { value: e.target.value, confirmed: false } })} placeholder={f.optional ? 'Not required' : 'Not found: enter from document'} />
                    <label className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 py-2 text-xs ${v.confirmed ? 'border-tide/40 bg-tide-100 text-tide-600' : 'border-paper-300 text-ink-600'} ${!v.value ? 'opacity-50' : ''}`}>
                      <input type="checkbox" className="accent-[#1E6B5A]" checked={v.confirmed} disabled={!v.value} onChange={(e) => setValues({ ...values, [f.key]: { ...v, confirmed: e.target.checked } })} />
                      Confirmed
                    </label>
                  </div>
                  {cur?.snippet && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-ink-600"><Quote className="mt-0.5 h-3 w-3 shrink-0 text-ink-400" aria-hidden="true" /><span className="font-mono">{cur.snippet}</span></p>
                  )}
                </div>
              );
            })}
          </fieldset>
        )}
        {doc.fieldDefs.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-paper-300 px-4 py-3">
            {msg.text && <p className={`mr-auto text-sm ${msg.type === 'err' ? 'text-flag' : 'text-tide'}`} role="status">{msg.text}</p>}
            <Button type="button" variant="outline" size="sm" onClick={() => save(true)} loading={busy} icon={CheckCheck}>Confirm all filled</Button>
            <Button type="submit" variant="dark" size="sm" disabled={!dirty} loading={busy} icon={Save}>Save</Button>
          </div>
        )}
      </form>
    </div>
  );
}

function TextPreview({ url }) {
  const [text, setText] = useState('');
  useEffect(() => {
    fetch(url).then((r) => r.text()).then(setText).catch(() => setText('Could not display this file.'));
  }, [url]);
  return <pre className="h-full overflow-auto whitespace-pre-wrap p-4 font-mono text-xs text-ink-700">{text}</pre>;
}
