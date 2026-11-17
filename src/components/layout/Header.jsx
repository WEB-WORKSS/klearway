import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mail } from 'lucide-react';
import { Logo } from '../brand/Logo.jsx';
import { Button } from '../ui/Button.jsx';
import { company } from '../../data/company.js';

export const NAV = [
  { label: 'Product', to: '/#product' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Who it’s for', to: '/#who' },
  { label: 'Technology', to: '/#aws' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'Team', to: '/#team' },
  { label: 'Contact', to: '/#contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname, loc.hash]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${scrolled || open ? 'border-paper-300 bg-paper/95 backdrop-blur' : 'border-transparent bg-paper'}`}>
      <div className="page flex h-16 items-center gap-6">
        <Link to="/" aria-label="Klearway home"><Logo /></Link>
        <nav aria-label="Main" className="hidden flex-1 xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="whitespace-nowrap rounded-md px-2.5 py-2 text-[0.92rem] text-ink-600 transition hover:text-ink">{n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a href={`mailto:${company.email}`} className="hidden rounded-md p-2 text-ink-600 hover:text-ink md:inline-flex" aria-label={`Email ${company.email}`}><Mail className="h-5 w-5" /></a>
          <Button to="/#pilot" size="sm" className="hidden sm:inline-flex">Request pilot access</Button>
          <button type="button" className="rounded-md p-2 text-ink xl:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <nav id="mobile-nav" aria-label="Mobile" className={`${open ? "block" : "hidden"} border-t border-paper-300 bg-paper xl:hidden`}>
        <ul className="page flex flex-col py-3">
          {NAV.map((n) => (
            <li key={n.to}><Link to={n.to} className="block rounded-md px-2 py-3 text-base text-ink-700 hover:bg-paper-200">{n.label}</Link></li>
          ))}
          <li className="mt-2 flex flex-col gap-2 pb-2">
            <Button to="/#pilot" className="w-full">Request pilot access</Button>
            <Button href={`mailto:${company.email}`} variant="outline" className="w-full" icon={Mail}>{company.email}</Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
