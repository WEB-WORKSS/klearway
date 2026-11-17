import { ArrowRight, PlayCircle, XCircle, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { SampleLabel } from '../ui/Badges.jsx';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-paper-300" aria-labelledby="hero-title">
      <div className="grid-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />
      <div className="page relative flex flex-col items-center gap-14 pb-16 pt-10 text-center sm:pt-16 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper-50 px-3 py-1 text-xs text-ink-600">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
            MVP in development · Pilot requests open for Nigerian forwarders and clearing agents
          </p>
          <h1 id="hero-title" className="mt-5 text-[2.4rem] font-semibold leading-[1.04] sm:text-[3.4rem] lg:text-[4.2rem]">
            Catch the document mismatch <span className="text-tide">before it holds up the shipment.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
            Klearway reads bills of lading, invoices and packing lists, flags figures that disagree, and keeps each shipment’s status ready for your importer.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/#pilot" size="lg" icon={ArrowRight} data-cta="hero">Request pilot access</Button>
            <Button to="/#product" size="lg" variant="outline" icon={PlayCircle}>See the document check</Button>
          </div>
          <p className="mt-5 text-sm text-ink-400">A person confirms every extracted field. Klearway never files declarations or makes customs decisions.</p>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[38rem] text-left" aria-label="Example of a Klearway document check with sample data" role="img">
      {/* back sheet: packing list */}
      <div className="absolute -right-2 top-6 hidden w-[78%] rotate-[3deg] rounded-xl border border-paper-300 bg-paper-50 p-5 shadow-sheet sm:block" aria-hidden="true">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-400">Packing list</p>
        <div className="mt-3 space-y-2">
          {['Invoice ref', 'Consignee', 'Total packages', 'Gross weight'].map((l, i) => (
            <div key={l} className="flex justify-between border-b border-dashed border-paper-300 pb-1.5 font-mono text-[0.72rem]">
              <span className="text-ink-400">{l}</span>
              <span className={i === 2 ? 'rounded bg-flag-100 px-1 text-flag' : 'text-ink-600'}>{['NHC-INV-2026-0412', 'Adebayo Home Fittings', '1,180 ctns', '24,180 kg'][i]}</span>
            </div>
          ))}
        </div>
      </div>
      {/* front sheet: bill of lading */}
      <div className="relative w-[92%] -rotate-[1.2deg] rounded-xl border border-paper-300 bg-white p-5 shadow-lift sm:p-6" aria-hidden="true">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-ink-600"><FileText className="h-3.5 w-3.5" /> Bill of lading</span>
          <SampleLabel />
        </div>
        <div className="relative mt-4 overflow-hidden rounded-lg border border-paper-200 bg-paper-50 p-3">
          <div className="scan-line absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-signal/0 via-signal/25 to-signal/0" />
          <dl className="space-y-2 font-mono text-[0.74rem]">
            {[
              ['B/L No', 'HLX-NGB-26117'],
              ['Consignee', 'Adebayo Home Fittings Ltd'],
              ['Container Nos', 'KLWU4821900, KLWU4822070'],
              ['No. of packages', '1,200 cartons'],
              ['Gross weight', '24,180.00 KGS'],
            ].map(([k, v], i) => (
              <div key={k} className={`flex flex-wrap justify-between gap-x-3 rounded px-1.5 py-1 ${i === 3 ? 'bg-flag-100 ring-1 ring-flag/30' : ''}`}>
                <dt className="text-ink-400">{k}</dt>
                <dd className={i === 3 ? 'font-medium text-flag' : 'text-ink'}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {/* result card */}
      <div className="relative -mt-10 ml-auto w-[82%] rounded-xl border border-ink/10 bg-ink p-4 text-paper shadow-lift sm:-mt-14" aria-hidden="true">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-paper/50">Check results · 3 documents</p>
        <ul className="mt-3 space-y-2 text-[0.82rem]">
          <li className="flex items-start gap-2"><XCircle className="pulse-flag mt-0.5 h-4 w-4 shrink-0 rounded-full text-[#F08A72]" /><span><span className="font-medium">Package count does not match.</span> <span className="text-paper/60">B/L 1,200 · Packing list 1,180</span></span></li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7CC6AE]" /><span>Consignee matches across documents</span></li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7CC6AE]" /><span>Container check digits are valid</span></li>
        </ul>
      </div>
    </div>
  );
}
