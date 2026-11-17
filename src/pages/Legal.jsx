import { Link } from 'react-router-dom';

export function LegalPage({ title, updated, intro, sections }) {
  return (
    <article className="page max-w-3xl py-16 sm:py-24">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm text-ink-400">Last updated {updated}</p>
      <p className="lede mt-6">{intro}</p>
      <nav aria-label="On this page" className="mt-8 rounded-xl border border-paper-300 bg-paper-50 p-5">
        <ol className="grid gap-1.5 text-sm sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}><a href={`#${s.id}`} className="text-ink-700 underline-offset-2 hover:underline"><span className="font-mono text-ink-400">{String(i + 1).padStart(2, '0')}</span> {s.title}</a></li>
          ))}
        </ol>
      </nav>
      <div className="mt-10 space-y-10">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold"><span className="font-mono text-base text-ink-400">{String(i + 1).padStart(2, '0')}</span> {s.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-ink-700 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{s.body}</div>
          </section>
        ))}
      </div>
      <p className="mt-14 border-t border-paper-300 pt-6 text-sm text-ink-600">
        See also: <Link to={title.startsWith('Privacy') ? '/terms' : '/privacy'} className="underline">{title.startsWith('Privacy') ? 'Terms of Service' : 'Privacy Policy'}</Link>
      </p>
    </article>
  );
}
