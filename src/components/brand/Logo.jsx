// Klearway mark: a document corner folded into a "K" whose lower stroke ends in a check.
export function LogoMark({ className = 'h-8 w-8', tone = 'dark' }) {
  const bg = tone === 'dark' ? '#0F1D1C' : '#F5F1E8';
  const fg = tone === 'dark' ? '#F5F1E8' : '#0F1D1C';
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <path d="M6 4h20l8 8v22a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill={bg} />
      <path d="M26 4v6a2 2 0 0 0 2 2h6z" fill="#E9A23B" />
      <path d="M13 11v18" stroke={fg} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M24.5 12.5 15.5 20.5" stroke={fg} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M17.5 21.5l4 4.2 7-8.2" stroke="#E9A23B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ tone = 'dark', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark tone={tone} />
      <span className={`text-[1.2rem] font-semibold tracking-[-0.03em] ${tone === 'dark' ? 'text-ink' : 'text-paper'}`}>Klearway</span>
    </span>
  );
}
