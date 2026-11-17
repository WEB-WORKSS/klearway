import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/** Native <dialog> with showModal(): focus is trapped and Escape closes it. */
export function Dialog({ open, onClose, title, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`w-[calc(100%-2rem)] ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-2xl border border-paper-300 bg-paper-50 p-0 text-ink shadow-lift backdrop:bg-ink/50`}
      aria-labelledby="dialog-title"
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 id="dialog-title" className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-400 hover:bg-paper-200 hover:text-ink" aria-label="Close dialog">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
