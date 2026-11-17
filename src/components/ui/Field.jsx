import { useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export function Field({ label, error, hint, required, children, className = '' }) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errId, hint && hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
        {required ? <span className="text-flag" aria-hidden="true"> *</span> : <span className="font-normal text-ink-400"> (optional)</span>}
      </label>
      {children({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy, required })}
      {hint && !error && <p id={hintId} className="mt-1.5 text-xs text-ink-400">{hint}</p>}
      {error && (
        <p id={errId} className="mt-1.5 flex items-start gap-1.5 text-sm text-flag" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({ options, placeholder = 'Choose…', ...props }) {
  return (
    <div className="relative">
      <select className="input appearance-none pr-10" {...props}>
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const value = typeof o === 'string' ? o : o.value;
          const label = typeof o === 'string' ? o : o.label;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
    </div>
  );
}
