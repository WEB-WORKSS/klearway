import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { LinkedinIcon } from '../brand/LinkedinIcon.jsx';
import { Logo } from '../brand/Logo.jsx';
import { company } from '../../data/company.js';

const COLS = [
  { title: 'Product', links: [['Document checks', '/#product'], ['Features', '/#features'], ['How it works', '/#how-it-works'], ['MVP status', '/#status'], ['Pricing', '/#pricing']] },
  { title: 'Solutions', links: [['Clearing agents', '/#who'], ['Freight forwarders', '/#who'], ['Security and control', '/#security'], ['FAQ', '/#faq']] },
  { title: 'Company', links: [['Technology', '/#aws'], ['Team', '/#team'], ['Contact', '/#contact']] },
  { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-paper/80">
      <div className="page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/65">{company.tagline}</p>
          <div className="mt-5 flex gap-2">
            <a href={company.linkedin} target="_blank" rel="noreferrer" className="rounded-md border border-paper/15 p-2 hover:bg-paper/10" aria-label="Klearway on LinkedIn"><LinkedinIcon /></a>
            <a href={`mailto:${company.email}`} className="rounded-md border border-paper/15 p-2 hover:bg-paper/10" aria-label={`Email ${company.email}`}><Mail className="h-4 w-4" /></a>
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-paper/45">{c.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map(([l, to]) => (
                <li key={l}><Link to={to} className="hover:text-paper">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-paper/10">
        <div className="page flex flex-col gap-2 py-5 text-xs text-paper/50 sm:flex-row sm:justify-between">
          <p>© 2026 Klearway. All rights reserved.</p>
          <p>Klearway is in development. It does not file customs declarations or give customs or legal advice.</p>
        </div>
      </div>
    </footer>
  );
}
