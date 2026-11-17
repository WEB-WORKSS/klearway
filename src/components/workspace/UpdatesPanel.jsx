import { useEffect, useState } from 'react';
import { MessageCircle, Mail, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Button } from '../ui/Button.jsx';
import { fmtDateTime } from './context.js';

const CHANNEL = { whatsapp: 'WhatsApp', email: 'Email', copy: 'Copied' };

export default function UpdatesPanel({ shipment, reload }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState({ type: '', text: '' });

  async function draft() {
    setLoading(true);
    try {
      const d = await api(`/api/workspace/shipments/${shipment.id}/update-draft`);
      setMessage(d.message);
    } catch (e) {
      setNote({ type: 'err', text: e.message });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    draft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment.id]);

  async function record(channel) {
    setBusy(channel);
    setNote({ type: '', text: '' });
    // Open the window synchronously so pop-up blockers allow it; navigate after the log is saved.
    const win = channel === 'whatsapp' ? window.open('', '_blank') : null;
    if (win) win.opener = null;
    try {
      await api(`/api/workspace/shipments/${shipment.id}/updates`, { method: 'POST', body: { message, channel } });
      if (channel === 'whatsapp') {
        const phone = shipment.importerPhone.replace(/\D/g, '');
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        if (win) win.location.href = url;
        else window.location.href = url;
      } else if (channel === 'email') {
        window.location.href = `mailto:${shipment.importerEmail}?subject=${encodeURIComponent(`Update on shipment ${shipment.ref}`)}&body=${encodeURIComponent(message)}`;
      } else {
        await navigator.clipboard.writeText(message);
      }
      setNote({ type: 'ok', text: channel === 'copy' ? 'Copied to clipboard and logged.' : `Opened ${CHANNEL[channel]} with the message. Send it from there; Klearway logs it as prepared.` });
      await reload();
    } catch (e) {
      win?.close();
      setNote({ type: 'err', text: e.message || 'Could not prepare the update.' });
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div>
        <h2 className="text-lg font-semibold">Importer status update</h2>
        <p className="text-sm text-ink-600">Drafted from the milestones your team confirmed. Edit it, then send it from your own WhatsApp or email.</p>
        <div className="mt-4 rounded-xl border border-paper-300 bg-[#E7F0EA] p-4">
          <label htmlFor="update-msg" className="sr-only">Message to importer</label>
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-ink-600"><Loader2 className="h-4 w-4 animate-spin" /> Drafting…</p>
          ) : (
            <textarea id="update-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={9} className="w-full resize-y rounded-lg border border-transparent bg-white p-3 font-sans text-[0.95rem] leading-relaxed shadow-sm focus:border-tide focus:outline-none" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="primary" icon={MessageCircle} onClick={() => record('whatsapp')} loading={busy === 'whatsapp'} disabled={!shipment.importerPhone || !message} title={shipment.importerPhone ? '' : 'Add the importer’s WhatsApp number to the shipment first'}>Open in WhatsApp</Button>
          <Button variant="outline" icon={Mail} onClick={() => record('email')} loading={busy === 'email'} disabled={!shipment.importerEmail || !message}>Email</Button>
          <Button variant="outline" icon={Copy} onClick={() => record('copy')} loading={busy === 'copy'} disabled={!message}>Copy</Button>
          <Button variant="outline" icon={RefreshCw} onClick={draft}>Redraft</Button>
        </div>
        {(!shipment.importerPhone || !shipment.importerEmail) && <p className="mt-2 text-xs text-ink-400">Add the importer’s {!shipment.importerPhone ? 'WhatsApp number' : ''}{!shipment.importerPhone && !shipment.importerEmail ? ' and ' : ''}{!shipment.importerEmail ? 'email' : ''} with Edit to enable {!shipment.importerPhone && !shipment.importerEmail ? 'those buttons' : 'that button'}.</p>}
        {note.text && <p className={`mt-3 text-sm ${note.type === 'err' ? 'text-flag' : 'text-tide'}`} role="status">{note.text}</p>}
        <p className="mt-4 text-xs text-ink-400">Automatic sending through the WhatsApp Business Platform is not connected yet. Nothing is sent without a person pressing send.</p>
      </div>
      <aside>
        <h3 className="text-sm font-medium">Update log</h3>
        {shipment.updates.length === 0 ? (
          <p className="mt-2 text-sm text-ink-600">No updates prepared yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {shipment.updates.map((u) => (
              <li key={u.id} className="rounded-lg border border-paper-300 bg-paper-50 p-3 text-sm">
                <p className="flex justify-between text-xs text-ink-600"><span>{CHANNEL[u.channel]} · {u.stage}</span><span>{fmtDateTime(u.preparedAt)}</span></p>
                <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-ink-700">{u.message}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
