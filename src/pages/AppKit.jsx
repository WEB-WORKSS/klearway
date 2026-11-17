import { useState } from 'react';
import { Copy, Check, Download, AlertTriangle } from 'lucide-react';
import { useMeta } from '../hooks/useMeta.js';
import { company } from '../data/company.js';
import { businessDetails, awsAnswers, assumed, linkedin, assets } from '../data/application.js';

function CopyBtn({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          window.prompt('Copy this text:', text);
        }
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-paper-300 bg-white px-2 py-1 text-xs text-ink-700 hover:border-ink/30"
      aria-label={`${label}: ${text.slice(0, 40)}`}
    >
      {done ? <Check className="h-3.5 w-3.5 text-tide" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      {done ? 'Copied' : label}
    </button>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex flex-col gap-1 border-b border-paper-300 py-3 sm:flex-row sm:items-start sm:gap-4">
      <dt className="text-sm text-ink-600 sm:w-56 sm:shrink-0">{k}</dt>
      <dd className="flex flex-1 items-start justify-between gap-3 text-sm font-medium">
        <span>{v}</span>
        <CopyBtn text={v} />
      </dd>
    </div>
  );
}

function Section({ id, n, title, children, note }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-2xl border border-paper-300 bg-paper-50 p-5 sm:p-8">
      <p className="font-mono text-xs text-tide">{n}</p>
      <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
      {note && <p className="mt-1 text-sm text-ink-600">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const NAV = [
  ['record', 'Company record'],
  ['assets', 'Logo & banner'],
  ['linkedin', 'LinkedIn profile'],
  ['aws', 'AWS Activate form'],
  ['check', 'Before you submit'],
];

export default function AppKit() {
  useMeta('/app');
  return (
    <div className="page grid gap-8 py-10 lg:grid-cols-[13rem_1fr] lg:py-14">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="eyebrow">Application kit</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">Klearway, ready to submit</h1>
        <p className="mt-2 text-sm text-ink-600">Everything for the LinkedIn page and the AWS Activate form in one place. Copy each answer as you go.</p>
        <nav aria-label="Kit sections" className="mt-5">
          <ol className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {NAV.map(([id, l], i) => (
              <li key={id}><a href={`#${id}`} className="block rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-paper-200"><span className="font-mono text-ink-400">0{i + 1}</span> {l}</a></li>
            ))}
          </ol>
        </nav>
      </aside>

      <div className="space-y-8">
        <Section id="record" n="01" title="Company record" note="The single source for every form. Keep these identical everywhere.">
          <dl>
            <Row k="Company name" v={company.name} />
            <Row k="Website" v={company.url} />
            <Row k="Business email" v={company.email} />
            <Row k="Founder" v="Muhammed Ogunlakin, Founder & CEO" />
            <Row k="Founder LinkedIn" v={company.team[0].linkedin} />
            <Row k="Company LinkedIn" v={company.linkedin} />
            <Row k="Founded" v="2026" />
            {businessDetails.map(([k, v]) => <Row key={k} k={k} v={v} />)}
          </dl>
        </Section>

        <Section id="assets" n="02" title="Logo and banner" note="Download and upload these directly.">
          <div className="grid gap-4 sm:grid-cols-2">
            {assets.map((a) => (
              <figure key={a.file} className={`overflow-hidden rounded-xl border border-paper-300 bg-white ${a.wide ? 'sm:col-span-2' : ''}`}>
                <div className="flex items-center justify-center bg-[repeating-conic-gradient(#ECE6D8_0_25%,#FBF9F4_0_50%)] bg-[length:16px_16px] p-4">
                  <img src={a.file} alt={a.label} className="max-h-56 w-auto max-w-full" loading="lazy" />
                </div>
                <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span><span className="font-medium">{a.label}</span><span className="block text-xs text-ink-600">{a.use}</span></span>
                  <a href={a.file} download className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink-700"><Download className="h-3.5 w-3.5" aria-hidden="true" />PNG</a>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-600">Vector (SVG) versions: replace .png with .svg in any download link.</p>
        </Section>

        <Section id="linkedin" n="03" title="LinkedIn company profile">
          <dl>{linkedin.fields.map(([k, v]) => <Row key={k} k={k} v={v} />)}</dl>
          <div className="mt-6">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Tagline <span className="font-mono text-xs font-normal text-ink-400">{linkedin.tagline.length}/120</span></h3><CopyBtn text={linkedin.tagline} /></div>
            <p className="mt-2 rounded-lg bg-white p-3 text-sm">{linkedin.tagline}</p>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Overview <span className="font-mono text-xs font-normal text-ink-400">{linkedin.overview.length}/2,000</span></h3><CopyBtn text={linkedin.overview} /></div>
            <p className="mt-2 whitespace-pre-line rounded-lg bg-white p-4 text-sm leading-relaxed">{linkedin.overview}</p>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Specialties <span className="font-mono text-xs font-normal text-ink-400">{linkedin.specialties.length}/20</span></h3><CopyBtn text={linkedin.specialties.join(', ')} label="Copy all" /></div>
            <ul className="mt-2 flex flex-wrap gap-2">{linkedin.specialties.map((s) => <li key={s} className="rounded-md border border-paper-300 bg-white px-2.5 py-1 text-sm">{s}</li>)}</ul>
          </div>
        </Section>

        <Section id="aws" n="04" title="AWS Activate form answers" note="In form order. Every answer uses the exact option text from the form.">
          <ol className="space-y-3">
            {awsAnswers.map((a) => (
              <li key={a.q} className={`rounded-xl border bg-white p-4 ${a.assumed ? 'border-signal/60' : 'border-paper-300'}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold"><span className="font-mono text-tide">{a.q}.</span> {a.name}</h3>
                  <div className="flex items-center gap-2">
                    {a.assumed && <span className="stamp border-signal-600/40 bg-signal-100 text-[#7a4d0f]">Assumed</span>}
                    <CopyBtn text={a.answer.join(a.answer.length > 1 ? '\n' : '')} label={a.answer.length > 1 ? 'Copy all' : 'Copy'} />
                  </div>
                </div>
                {a.answer.length > 1 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">{a.answer.map((x) => <li key={x} className="rounded-md bg-tide-100 px-2.5 py-1 text-sm font-medium text-tide-600">{x}</li>)}</ul>
                ) : (
                  <p className="mt-3 rounded-lg bg-paper-200/60 px-3 py-2 text-sm font-medium">{a.answer[0]}</p>
                )}
                {a.count && <p className="mt-1.5 font-mono text-xs text-ink-600">{a.answer[0].length} characters (limit 30-250)</p>}
                <p className="mt-2 text-xs text-ink-600">{a.reason}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="check" n="05" title="Double-check before submitting">
          <ul className="space-y-2">
            {assumed.map((x) => (
              <li key={x} className="flex gap-2.5 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-700" aria-hidden="true" />{x}</li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-ink-600">Keep the stage as "Ideating/building initial product" until a deployed MVP is in use by a pilot firm. Do not describe AWS services as live until they are deployed.</p>
        </Section>
      </div>
    </div>
  );
}
