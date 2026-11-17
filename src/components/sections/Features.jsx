import { ScanText, GitCompareArrows, ShieldCheck, Milestone, MessageSquareText, History, Check, Ban } from 'lucide-react';
import { SampleLabel, StatusStamp } from '../ui/Badges.jsx';

function FeatureRow({ id, eyebrow, Icon, title, text, benefit, flow, visual, flip }) {
  return (
    <article id={id} className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16" data-reveal>
      <div className={flip ? 'lg:order-2' : ''}>
        <p className="eyebrow flex items-center gap-2"><Icon className="h-4 w-4" aria-hidden="true" />{eyebrow}</p>
        <h3 className="mt-3 text-2xl font-semibold sm:text-[1.8rem]">{title}</h3>
        <p className="mt-3 leading-relaxed text-ink-600">{text}</p>
        <p className="mt-4 rounded-lg border-l-2 border-tide bg-tide-100/50 px-4 py-2.5 text-sm text-ink-700"><strong className="font-medium">For your firm:</strong> {benefit}</p>
        <p className="mt-3 font-mono text-xs text-ink-400">{flow}</p>
      </div>
      <div className={flip ? 'lg:order-1' : ''}>{visual}</div>
    </article>
  );
}

const card = 'rounded-xl border border-paper-300 bg-paper-50 p-5 shadow-sheet';

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28" aria-labelledby="features-title">
      <div className="page">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">Features</p>
          <h2 id="features-title" className="h2 mt-3">One record per shipment, from first document to final update.</h2>
        </div>
        <div className="mt-6 divide-y divide-paper-300">
          <FeatureRow
            id="feature-extract"
            eyebrow="Field extraction"
            Icon={ScanText}
            title="Every value shows where it came from"
            text="Klearway reads the text of digital PDFs and text files and pulls out the fields that matter for each document type: B/L number, parties, ports, containers, packages, weights, invoice number, quantity and value. Each value is shown with the exact line it was read from."
            benefit="Your staff stop re-typing figures from one document into another, and can check any value in seconds."
            flow="Documents → Fields → Checks"
            visual={
              <div className={card}>
                <div className="flex justify-between"><p className="text-sm font-medium">Commercial invoice</p><SampleLabel /></div>
                <dl className="mt-3 divide-y divide-paper-300 font-mono text-sm">
                  {[['Invoice number', 'NHC-INV-2026-0412'], ['Buyer / consignee', 'Adebayo Home Fittings Limited'], ['Total quantity', '1728'], ['HS code', '6907.21']].map(([k, v]) => (
                    <div key={k} className="flex flex-wrap justify-between gap-2 py-2"><dt className="font-sans text-ink-600">{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              </div>
            }
          />
          <FeatureRow
            id="feature-checks"
            eyebrow="Cross-document checks"
            Icon={GitCompareArrows}
            title="Disagreements surface before submission"
            text="Klearway compares the bill of lading, invoice and packing list against each other: consignee names (allowing for “Ltd” versus “Limited”), package counts, gross weight within a 0.5% tolerance, total quantity, the invoice reference on the packing list, and container numbers on both documents."
            benefit="Problems are caught at your desk, while there is still time to request a corrected document."
            flow="Checks → Corrections → Re-run"
            flip
            visual={
              <div className={`${card} space-y-2`}>
                {[['mismatch', 'Package count does not match', 'B/L 1,200 · Packing list 1,180'], ['pass', 'Gross weight matches', '24,180 kg on both (within 0.5%)'], ['missing', 'Packing list not received', 'Shipment LOS-2611-022']].map(([s, t, d]) => (
                  <div key={t} className="flex items-start justify-between gap-3 rounded-lg border border-paper-300 bg-white p-3">
                    <div><p className="text-sm font-medium">{t}</p><p className="font-mono text-xs text-ink-600">{d}</p></div>
                    <StatusStamp status={s} />
                  </div>
                ))}
                <p className="pt-1 text-right"><SampleLabel /></p>
              </div>
            }
          />
          <FeatureRow
            id="feature-containers"
            eyebrow="Container validation"
            Icon={ShieldCheck}
            title="Mistyped container numbers are caught"
            text="Every container number is validated with the ISO 6346 check digit, the standard used on shipping containers. A single wrong digit, a common typing or scanning slip, is flagged with the digit it should be."
            benefit="Fewer shipments held because a container number on one document does not match the box."
            flow="Fields → Validation → Checks"
            visual={
              <div className={`${card} font-mono`}>
                <div className="flex items-center justify-between text-sm"><span>KLWU 482190 <span className="rounded bg-tide-100 px-1 text-tide-600">0</span></span><StatusStamp status="pass">Valid</StatusStamp></div>
                <div className="mt-3 flex items-center justify-between text-sm"><span>KLWU 482207 <span className="rounded bg-flag-100 px-1 text-flag">3</span></span><StatusStamp status="mismatch">Should be 0</StatusStamp></div>
                <p className="mt-4 font-sans text-xs text-ink-400">Sample container numbers</p>
              </div>
            }
          />
          <FeatureRow
            id="feature-timeline"
            eyebrow="Shipment status"
            Icon={Milestone}
            title="See what is holding up each job"
            text="Each shipment has milestones your team confirms, from documents received to delivered, plus a clear note of what is blocking it and who it is waiting on. Search and filter every open shipment by stage, check result or blocker."
            benefit="The whole team can see which files need action today, without asking around."
            flow="Checks → Milestones → Updates"
            flip
            visual={
              <div className={card}>
                <div className="flex justify-between text-sm"><span className="font-medium">Open shipments</span><SampleLabel /></div>
                <ul className="mt-3 divide-y divide-paper-300 text-sm">
                  {[['LOS-2611-014', 'Clearance in progress', null], ['LOS-2611-019', 'Documents checked', 'Corrected packing list · Supplier'], ['LOS-2611-022', 'Documents received', 'Original B/L · Shipping line']].map(([r, st, b]) => (
                    <li key={r} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span className="font-mono">{r}</span>
                      <span className="text-ink-600">{st}</span>
                      <span className="w-full text-xs">{b ? <span className="inline-flex items-center gap-1 text-flag"><Ban className="h-3 w-3" aria-hidden="true" />{b}</span> : <span className="inline-flex items-center gap-1 text-tide"><Check className="h-3 w-3" aria-hidden="true" />Nothing blocking</span>}</span>
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
          <FeatureRow
            id="feature-updates"
            eyebrow="Importer updates"
            Icon={MessageSquareText}
            title="Status updates your importer can read in one glance"
            text="Klearway drafts a short update from the milestones your team has confirmed, including your note and the next step. Edit it if you like, then open it in WhatsApp or email and press send. Importers install nothing."
            benefit="Fewer “where is my container?” calls, and updates that never claim more than your team has confirmed."
            flow="Milestones → Draft → Your WhatsApp or email"
            visual={
              <div className="rounded-xl bg-[#E7F0EA] p-5">
                <div className="ml-auto max-w-xs rounded-xl rounded-tr-sm bg-[#D3F1D8] p-3.5 text-sm leading-relaxed shadow-sm">
                  <p>Update on shipment LOS-2611-014:</p>
                  <p>• Arrived at port or terminal on 10 Nov 2026.</p>
                  <p>• Next step: clearance in progress.</p>
                </div>
                <p className="mt-3 text-right"><SampleLabel /></p>
              </div>
            }
          />
          <FeatureRow
            id="feature-history"
            eyebrow="Shipment history"
            Icon={History}
            title="A record you can go back to"
            text="Documents, confirmed fields, every check run, milestone dates and each prepared update are saved on the shipment and reload exactly as you left them."
            benefit="When an importer or supplier disputes a figure, you can show what each document said and when it was checked."
            flow="Everything → Shipment record"
            flip
            visual={
              <div className={`${card} font-mono text-xs`}>
                {[['17 Nov 09:14', 'Check run · 2 mismatches'], ['17 Nov 11:02', 'Packing list corrected by staff'], ['17 Nov 11:03', 'Check run · clear'], ['17 Nov 11:10', 'Update prepared · WhatsApp']].map(([t, e]) => (
                  <div key={t} className="flex gap-4 border-b border-dashed border-paper-300 py-2 last:border-0"><span className="text-ink-400">{t}</span><span className="text-ink-700">{e}</span></div>
                ))}
                <p className="mt-3 text-right font-sans"><SampleLabel /></p>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
