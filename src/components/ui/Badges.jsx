import { CheckCircle2, AlertTriangle, CircleDashed, XCircle } from 'lucide-react';

export function SampleLabel({ children = 'Sample data', className = '' }) {
  return <span className={`stamp border-signal-600/40 bg-signal-100 text-[#7a4d0f] ${className}`}>{children}</span>;
}

export const STATUS = {
  pass: { label: 'Matches', cls: 'border-tide/30 bg-tide-100 text-tide-600', Icon: CheckCircle2 },
  mismatch: { label: 'Mismatch', cls: 'border-flag/30 bg-flag-100 text-flag', Icon: XCircle },
  missing: { label: 'Missing', cls: 'border-signal-600/40 bg-signal-100 text-[#7a4d0f]', Icon: CircleDashed },
  warning: { label: 'Check', cls: 'border-ink/15 bg-paper-200 text-ink-600', Icon: AlertTriangle },
};

export function StatusStamp({ status, children }) {
  const s = STATUS[status] || STATUS.warning;
  return (
    <span className={`stamp ${s.cls}`}>
      <s.Icon className="h-3 w-3" aria-hidden="true" />
      {children || s.label}
    </span>
  );
}
