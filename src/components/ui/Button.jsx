import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const styles = {
  primary: 'bg-signal text-ink hover:bg-[#f0b252] active:bg-signal-600 shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)]',
  dark: 'bg-ink text-paper hover:bg-ink-700',
  outline: 'border border-ink/20 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[0.03]',
  ghostLight: 'border border-paper/25 text-paper hover:bg-paper/10',
  subtle: 'bg-paper-200 text-ink hover:bg-paper-300',
  danger: 'bg-flag text-white hover:bg-[#a03823]',
};
const sizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-12 px-6 text-base',
};

export function Button({ as, to, href, variant = 'primary', size = 'md', loading = false, className = '', children, icon: Icon, ...rest }) {
  const cls = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>;
  const Comp = as || 'button';
  return (
    <Comp className={cls} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>
      {content}
    </Comp>
  );
}
