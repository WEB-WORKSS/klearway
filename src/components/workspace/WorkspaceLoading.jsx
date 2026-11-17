import { Loader2 } from 'lucide-react';
import { LogoMark } from '../brand/Logo.jsx';

export function WorkspaceLoading({ label = 'Loading workspace…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper text-ink-600" role="status">
      <LogoMark className="h-10 w-10" />
      <span className="inline-flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {label}
      </span>
    </div>
  );
}
