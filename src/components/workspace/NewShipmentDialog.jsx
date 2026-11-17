import { useState } from 'react';
import { api } from '../../lib/api.js';
import { Dialog } from '../ui/Dialog.jsx';
import { Field, Select } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';

const EMPTY = { ref: '', mode: 'sea', importerName: '', importerPhone: '', importerEmail: '', origin: '', destination: '', goods: '' };

export default function NewShipmentDialog({ open, onClose, onCreated, initial, title = 'New shipment', submitLabel = 'Create shipment', path = '/api/workspace/shipments', method = 'POST' }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} wide>
      <ShipmentForm key={String(open)} initial={initial} onDone={(s) => { onClose(); onCreated(s); }} onCancel={onClose} submitLabel={submitLabel} path={path} method={method} />
    </Dialog>
  );
}

function ShipmentForm({ initial, onDone, onCancel, submitLabel, path, method }) {
  const [v, setV] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (v.ref.trim().length < 2) errs.ref = 'Enter a shipment reference.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setError('');
    try {
      onDone(await api(path, { method, body: v }));
    } catch (err) {
      setErrors(err.details || {});
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Shipment reference" required error={errors.ref} hint="Your file number, for example LOS-2611-014.">
        {(p) => <input {...p} className="input font-mono" value={v.ref} onChange={set('ref')} maxLength={60} autoFocus />}
      </Field>
      <Field label="Transport mode" required error={errors.mode}>
        {(p) => <Select {...p} value={v.mode} onChange={set('mode')} options={[{ value: 'sea', label: 'Sea' }, { value: 'air', label: 'Air' }, { value: 'road', label: 'Road' }]} />}
      </Field>
      <Field label="Importer name" error={errors.importerName}>
        {(p) => <input {...p} className="input" value={v.importerName} onChange={set('importerName')} />}
      </Field>
      <Field label="Goods" error={errors.goods}>
        {(p) => <input {...p} className="input" value={v.goods} onChange={set('goods')} placeholder="e.g. Ceramic floor tiles" />}
      </Field>
      <Field label="Importer WhatsApp number" error={errors.importerPhone} hint="Used to open a pre-filled WhatsApp message.">
        {(p) => <input {...p} type="tel" inputMode="tel" className="input" value={v.importerPhone} onChange={set('importerPhone')} placeholder="0803 123 4567" />}
      </Field>
      <Field label="Importer email" error={errors.importerEmail}>
        {(p) => <input {...p} type="email" className="input" value={v.importerEmail} onChange={set('importerEmail')} />}
      </Field>
      <Field label="Origin" error={errors.origin}>
        {(p) => <input {...p} className="input" value={v.origin} onChange={set('origin')} placeholder="e.g. Ningbo, CN" />}
      </Field>
      <Field label="Destination" error={errors.destination}>
        {(p) => <input {...p} className="input" value={v.destination} onChange={set('destination')} placeholder="e.g. Lagos, NG" />}
      </Field>
      {error && <p className="text-sm text-flag sm:col-span-2" role="alert">{error}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="dark" loading={busy}>{submitLabel}</Button>
      </div>
    </form>
  );
}
