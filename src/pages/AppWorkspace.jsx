import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, ServerCrash, Settings2, ArrowLeft, Cpu } from 'lucide-react';
import { api, accessKey, ApiError } from '../lib/api.js';
import { useMeta } from '../hooks/useMeta.js';
import { Logo } from '../components/brand/Logo.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Dialog } from '../components/ui/Dialog.jsx';
import { WorkspaceLoading } from '../components/workspace/WorkspaceLoading.jsx';
import ShipmentList from '../components/workspace/ShipmentList.jsx';
import ShipmentDetail from '../components/workspace/ShipmentDetail.jsx';
import { WorkspaceContext } from '../components/workspace/context.js';

export default function AppWorkspace() {
  useMeta('/workspace');
  const [phase, setPhase] = useState('checking'); // checking | unreachable | key | ready
  const [health, setHealth] = useState(null);
  const [session, setSession] = useState(null);
  const [settings, setSettings] = useState({ firmName: '' });
  const [error, setError] = useState('');

  const connect = useCallback(async () => {
    setPhase('checking');
    setError('');
    try {
      const h = await api('/api/health');
      setHealth(h);
      if (h.accessKeyRequired && !accessKey.get()) return setPhase('key');
      const [s, st] = await Promise.all([api('/api/workspace/session'), api('/api/workspace/settings')]);
      setSession(s);
      setSettings(st);
      setPhase('ready');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        accessKey.clear();
        setError('That access key was not accepted.');
        return setPhase('key');
      }
      setError(e.message);
      setPhase('unreachable');
    }
  }, []);

  useEffect(() => {
    connect();
  }, [connect]);

  if (phase === 'checking') return <WorkspaceLoading label="Connecting to the Klearway API…" />;
  if (phase === 'unreachable') return <Unreachable message={error} onRetry={connect} />;
  if (phase === 'key') return <KeyGate error={error} onSubmit={(k) => { accessKey.set(k); connect(); }} />;

  return (
    <WorkspaceContext.Provider value={{ session, settings, setSettings, health }}>
      <Shell onSignOut={health?.accessKeyRequired ? () => { accessKey.clear(); setPhase('key'); } : null}>
        <Routes>
          <Route index element={<ShipmentList />} />
          <Route path="shipments/:id" element={<ShipmentDetail />} />
          <Route path="*" element={<WorkspaceNotFound />} />
        </Routes>
      </Shell>
    </WorkspaceContext.Provider>
  );
}

function Shell({ children, onSignOut }) {
  const [open, setOpen] = useState(false);
  return (
    <WorkspaceContext.Consumer>
      {({ settings, session }) => (
        <div className="min-h-screen bg-paper">
          <header className="sticky top-0 z-30 border-b border-paper-300 bg-paper-50/95 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-3 px-4 sm:px-6">
              <Link to="/workspace" aria-label="Klearway workspace home"><Logo /></Link>
              <span className="stamp hidden border-ink/15 bg-paper-200 text-ink-600 sm:inline-flex">MVP workspace</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-600 md:inline-flex" title={session?.ai?.reason || ''}>
                  <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
                  {session?.ai?.enabled ? 'AI extraction on' : 'Text extraction · AI not configured'}
                </span>
                <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-ink-700 hover:bg-paper-200">
                  <Settings2 className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-[10rem] truncate">{settings.firmName || 'Firm settings'}</span>
                </button>
                {onSignOut && (
                  <button type="button" onClick={onSignOut} className="rounded-md p-2 text-ink-600 hover:bg-paper-200" aria-label="Sign out of workspace">
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
                <Link to="/" className="hidden rounded-md px-2.5 py-1.5 text-sm text-ink-600 hover:bg-paper-200 sm:inline-flex">Website</Link>
              </div>
            </div>
          </header>
          <main id="main" className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
          <SettingsDialog open={open} onClose={() => setOpen(false)} />
        </div>
      )}
    </WorkspaceContext.Consumer>
  );
}

function SettingsDialog({ open, onClose }) {
  return (
    <WorkspaceContext.Consumer>
      {({ settings, setSettings }) => <SettingsForm key={String(open)} open={open} onClose={onClose} settings={settings} setSettings={setSettings} />}
    </WorkspaceContext.Consumer>
  );
}

function SettingsForm({ open, onClose, settings, setSettings }) {
  const [firmName, setFirmName] = useState(settings.firmName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setSettings(await api('/api/workspace/settings', { method: 'PUT', body: { firmName } }));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onClose={onClose} title="Firm settings">
      <form onSubmit={save} className="space-y-4">
        <Field label="Firm name" hint="Used to sign importer status updates." required={false}>
          {(p) => <input {...p} className="input" value={firmName} onChange={(e) => setFirmName(e.target.value)} maxLength={120} />}
        </Field>
        {error && <p className="text-sm text-flag" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="dark" loading={busy}>Save</Button>
        </div>
      </form>
    </Dialog>
  );
}

function KeyGate({ onSubmit, error }) {
  const [key, setKey] = useState('');
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form onSubmit={(e) => { e.preventDefault(); if (key.trim()) onSubmit(key.trim()); }} className="sheet w-full max-w-sm p-7">
        <Logo />
        <h1 className="mt-6 text-xl font-semibold">Pilot workspace</h1>
        <p className="mt-1.5 text-sm text-ink-600">Enter the access key the Klearway team gave your firm.</p>
        <div className="mt-5">
          <Field label="Access key" required error={error}>
            {(p) => <input {...p} type="password" autoComplete="current-password" className="input" value={key} onChange={(e) => setKey(e.target.value)} />}
          </Field>
        </div>
        <Button type="submit" variant="dark" className="mt-5 w-full" icon={KeyRound}>Open workspace</Button>
        <p className="mt-5 text-xs text-ink-400">No key yet? <Link to="/#pilot" className="underline">Request pilot access</Link>.</p>
      </form>
    </div>
  );
}

function Unreachable({ message, onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="sheet w-full max-w-md p-7 text-center" role="alert">
        <ServerCrash className="mx-auto h-8 w-8 text-flag" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold">The workspace server is not reachable</h1>
        <p className="mt-2 text-sm text-ink-600">{message}</p>
        <p className="mt-2 text-sm text-ink-600">The Klearway MVP workspace is open to pilot firms only. If you expected access, contact the team.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={onRetry} variant="dark">Try again</Button>
          <Button to="/#pilot" variant="outline">Request pilot access</Button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceNotFound() {
  const nav = useNavigate();
  return (
    <div className="py-20 text-center">
      <h1 className="text-xl font-semibold">That workspace page does not exist.</h1>
      <Button onClick={() => nav('/workspace')} variant="outline" className="mt-5" icon={ArrowLeft}>Back to shipments</Button>
    </div>
  );
}
