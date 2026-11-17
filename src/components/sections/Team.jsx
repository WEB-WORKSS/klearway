import { company } from '../../data/company.js';
import { LinkedinIcon } from '../brand/LinkedinIcon.jsx';

const initials = (n) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join('');

export default function Team() {
  return (
    <section id="team" className="py-20 sm:py-28" aria-labelledby="team-title">
      <div className="page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div data-reveal>
          <p className="eyebrow">Team</p>
          <h2 id="team-title" className="h2 mt-3">The Team Behind Klearway</h2>
          <p className="lede mt-4">Klearway is a privately held company founded in 2026, building with forwarding and clearing firms in Nigeria.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {company.team.map((m) => (
            <li key={m.name} className="rounded-2xl border border-paper-300 bg-paper-50 p-6" data-reveal>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-ink font-mono text-lg text-signal" aria-hidden="true">{initials(m.name)}</span>
                <div>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm text-ink-600">{m.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-700">{m.bio}</p>
              <a href={m.linkedin} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-tide underline-offset-2 hover:underline">
                <LinkedinIcon /> {m.name} on LinkedIn
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
