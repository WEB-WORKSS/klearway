import { useState } from 'react';
import { Upload, ScanText, GitCompareArrows, UserCheck, Send, ArrowLeft, ArrowRight, FileText, CheckCircle2, XCircle, CircleDashed, Quote, CheckCheck } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { SampleLabel } from '../ui/Badges.jsx';

const STEPS = [
  { title: 'Send in the documents', Icon: Upload, text: 'Upload the bill of lading, commercial invoice and packing list for a shipment. Klearway detects each document type.' },
  { title: 'Fields are extracted', Icon: ScanText, text: 'Key fields are read from each document and shown next to the exact line they came from.' },
  { title: 'Mismatches are flagged', Icon: GitCompareArrows, text: 'Klearway compares the documents with each other and lists what agrees, what differs and what is missing.' },
  { title: 'Your team confirms', Icon: UserCheck, text: 'A person checks each value against the source, corrects it if needed, and re-runs the check.' },
  { title: 'The importer is updated', Icon: Send, text: 'Confirmed milestones become a short status message, sent from your own WhatsApp or email.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28" aria-labelledby="how-title">
      <div className="page">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="h2 mt-3">Fits the way your desk already handles a shipment.</h2>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-5">
          {STEPS.map(({ title, Icon, text }, i) => (
            <li key={title} className="relative rounded-xl border border-paper-300 bg-paper-50 p-5" data-reveal>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-paper"><Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden="true" /></span>
                <span className="font-mono text-sm text-ink-400">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold leading-snug">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function DemoTour() {
  const [step, setStep] = useState(0);
  const go = (n) => setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(step + 1); document.getElementById(`demo-tab-${Math.min(step + 1, 4)}`)?.focus(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(step - 1); document.getElementById(`demo-tab-${Math.max(step - 1, 0)}`)?.focus(); }
  };

  return (
    <section id="product" className="border-y border-paper-300 bg-paper-200/50 py-20 sm:py-28" aria-labelledby="demo-title">
      <div className="page">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">The document check</p>
            <h2 id="demo-title" className="h2 mt-3">Walk through one shipment.</h2>
            <p className="lede mt-4">A guided example with fictional documents. The same flow runs in the Klearway MVP workspace with your own files.</p>
          </div>
          <SampleLabel>Example · Sample data</SampleLabel>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[17rem_1fr]">
          <div role="tablist" aria-label="Demo steps" aria-orientation="vertical" className="flex gap-2 overflow-x-auto lg:flex-col" onKeyDown={onKey}>
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                id={`demo-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={step === i}
                aria-controls="demo-panel"
                tabIndex={step === i ? 0 : -1}
                onClick={() => go(i)}
                className={`flex shrink-0 items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm transition lg:shrink ${step === i ? 'border-ink bg-ink text-paper' : 'border-paper-300 bg-paper-50 text-ink-700 hover:border-ink/30'}`}
              >
                <span className={`font-mono text-xs ${step === i ? 'text-signal' : 'text-ink-400'}`}>0{i + 1}</span>
                <span className="font-medium">{s.title}</span>
              </button>
            ))}
          </div>

          <div id="demo-panel" role="tabpanel" aria-labelledby={`demo-tab-${step}`} className="sheet overflow-hidden" aria-live="polite">
            <div className="flex items-center gap-2 border-b border-paper-300 bg-paper-50 px-4 py-2.5 text-xs text-ink-600">
              <span className="flex gap-1" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-paper-300" /><i className="h-2.5 w-2.5 rounded-full bg-paper-300" /><i className="h-2.5 w-2.5 rounded-full bg-paper-300" /></span>
              <span className="font-mono">SAMPLE-261117 · Ceramic floor tiles · Ningbo → Lagos</span>
            </div>
            <div className="min-h-[24rem] p-5 sm:p-7">
              <p className="text-sm text-ink-600">{STEPS[step].text}</p>
              <div className="mt-5">{[<StepUpload key="0" />, <StepExtract key="1" />, <StepCompare key="2" />, <StepConfirm key="3" />, <StepUpdate key="4" />][step]}</div>
            </div>
            <div className="flex items-center justify-between border-t border-paper-300 bg-paper-50 px-4 py-3">
              <Button size="sm" variant="outline" onClick={() => go(step - 1)} disabled={step === 0} icon={ArrowLeft}>Back</Button>
              <span className="font-mono text-xs text-ink-400">{step + 1} / {STEPS.length}</span>
              {step < STEPS.length - 1 ? (
                <Button size="sm" variant="dark" onClick={() => go(step + 1)}>Next <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
              ) : (
                <Button size="sm" to="/#pilot" data-cta="demo">Request pilot access</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const DOCS = [
  ['Bill of lading', 'sample-bill-of-lading.pdf', '2 KB'],
  ['Commercial invoice', 'sample-commercial-invoice.pdf', '2 KB'],
  ['Packing list', 'sample-packing-list.pdf', '2 KB'],
];

function StepUpload() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {DOCS.map(([t, f, s]) => (
        <li key={f} className="rounded-lg border border-paper-300 bg-white p-4">
          <FileText className="h-5 w-5 text-tide" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">{t}</p>
          <p className="truncate font-mono text-xs text-ink-400">{f} · {s}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-tide"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Type detected</p>
        </li>
      ))}
    </ul>
  );
}

function StepExtract() {
  const rows = [
    ['Consignee', 'Adebayo Home Fittings Ltd', 'Consignee: Adebayo Home Fittings Ltd'],
    ['Number of packages', '1200', 'No. of Packages: 1,200 cartons'],
    ['Gross weight (kg)', '24180', 'Gross Weight: 24,180.00 KGS'],
    ['Container numbers', 'KLWU4821900, KLWU4822070', 'Container Nos: KLWU4821900, KLWU4822070'],
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="ledger rounded-lg border border-paper-300 bg-white p-4 font-mono text-[0.74rem] leading-7 text-ink-700" aria-label="Source document text">
        <p className="text-flag">SAMPLE DATA</p>
        <p className="font-medium">BILL OF LADING</p>
        <p>B/L No: HLX-NGB-26117</p>
        <p>Shipper: Ningbo Harbourline Ceramics Co. Ltd</p>
        <p className="bg-signal-100">Consignee: Adebayo Home Fittings Ltd</p>
        <p>Port of Loading: Ningbo, China</p>
        <p className="bg-signal-100">Container Nos: KLWU4821900, KLWU4822070</p>
        <p className="bg-signal-100">No. of Packages: 1,200 cartons</p>
        <p className="bg-signal-100">Gross Weight: 24,180.00 KGS</p>
      </div>
      <dl className="divide-y divide-paper-300 rounded-lg border border-paper-300 bg-white">
        {rows.map(([k, v, src]) => (
          <div key={k} className="px-4 py-2.5">
            <dt className="flex justify-between text-xs text-ink-600"><span>{k}</span><span className="font-mono uppercase tracking-wider text-ink-400">Read from text</span></dt>
            <dd className="mt-1 font-mono text-sm">{v}</dd>
            <dd className="mt-0.5 flex items-start gap-1 text-[0.7rem] text-ink-400"><Quote className="mt-0.5 h-3 w-3" aria-hidden="true" />{src}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Result({ status, title, detail }) {
  const map = {
    mismatch: [XCircle, 'text-flag', 'border-flag/35'],
    pass: [CheckCircle2, 'text-tide', 'border-paper-300'],
    warning: [CircleDashed, 'text-signal-700', 'border-paper-300'],
  };
  const [Icon, color, border] = map[status];
  return (
    <li className={`flex items-start gap-3 rounded-lg border bg-white p-3.5 ${border}`}>
      <Icon className={`mt-0.5 h-4.5 h-[18px] w-[18px] shrink-0 ${color}`} aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 font-mono text-xs text-ink-600">{detail}</p>
      </div>
    </li>
  );
}

function StepCompare() {
  return (
    <ul className="space-y-2">
      <Result status="mismatch" title="Package count does not match" detail="B/L: 1,200 · Packing list: 1,180. Difference: 20." />
      <Result status="mismatch" title="Total quantity does not match" detail="Invoice: 1,728 m2 · Packing list: 1,699.2 m2. Difference: 28.8." />
      <Result status="pass" title="Consignee matches across documents" detail={'"Adebayo Home Fittings Ltd" · "Adebayo Home Fittings Limited" · "Adebayo Home Fittings Ltd."'} />
      <Result status="pass" title="Container check digits are valid" detail="KLWU4821900, KLWU4822070 (ISO 6346)" />
      <Result status="warning" title="Fields not yet confirmed on 3 documents" detail="Results may change once a person checks them against the source." />
    </ul>
  );
}

function StepConfirm() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
      <div className="rounded-lg border border-paper-300 bg-white p-4">
        <p className="text-xs text-ink-600">Packing list · Number of packages</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="flex-1 rounded-md border border-tide/50 px-3 py-2 font-mono text-sm">1200</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-tide/40 bg-tide-100 px-2 py-2 text-xs text-tide-600"><CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Confirmed</span>
        </div>
        <p className="mt-2 text-xs text-ink-600">Corrected by staff after the supplier sent a revised packing list. Source: <span className="font-mono">Entered by staff</span>.</p>
      </div>
      <ul className="space-y-2">
        <Result status="pass" title="Package count matches" detail="B/L: 1,200 · Packing list: 1,200" />
        <Result status="pass" title="Total quantity matches" detail="Invoice: 1,728 · Packing list: 1,728" />
        <Result status="pass" title="Packing list refers to this invoice" detail="NHC-INV-2026-0412" />
      </ul>
    </div>
  );
}

function StepUpdate() {
  return (
    <div className="grid items-start gap-4 md:grid-cols-[1fr_16rem]">
      <div className="rounded-2xl bg-[#E7F0EA] p-4">
        <div className="ml-auto max-w-sm rounded-xl rounded-tr-sm bg-[#D3F1D8] p-3.5 text-sm leading-relaxed shadow-sm">
          <p>Hello Adebayo Home Fittings,</p>
          <p className="mt-2">Update on shipment SAMPLE-261117 (Ceramic floor tiles):</p>
          <p>• Documents checked on 17 Nov 2026.</p>
          <p>• Corrected packing list received from supplier.</p>
          <p>• Next step: arrived at port or terminal.</p>
          <p className="mt-2">Harbour Desk Clearing (sample firm)</p>
          <p className="mt-1 text-right text-[0.65rem] text-ink-400">10:42</p>
        </div>
      </div>
      <ul className="space-y-2 text-sm text-ink-700">
        <li className="rounded-lg border border-paper-300 bg-white p-3">Drafted only from milestones your team confirmed.</li>
        <li className="rounded-lg border border-paper-300 bg-white p-3">Opens in your WhatsApp or email; you press send.</li>
        <li className="rounded-lg border border-paper-300 bg-white p-3">Every update is logged on the shipment.</li>
      </ul>
    </div>
  );
}
