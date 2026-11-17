import { Anchor, Truck, Building2, ClipboardList, CheckCircle2, Wrench, Compass, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

const SEGMENTS = [
  {
    Icon: Anchor,
    who: 'Clearing agents at the ports',
    problem: 'Many import files a week, each with documents from a supplier, a shipping line and an importer that must agree before clearance.',
    use: 'Upload each file’s documents on arrival, run the check, and request corrections while the vessel is still at sea.',
    benefit: 'Fewer files held at the port for a document that disagrees.',
  },
  {
    Icon: Building2,
    who: 'Small and mid-size freight forwarders',
    problem: 'A team of 3 to 30 people sharing shipment status through WhatsApp groups and spreadsheets.',
    use: 'Keep one record per shipment with milestones, blockers and owners that everyone in the office can search.',
    benefit: 'Anyone can answer “where is it?” without phoning a colleague.',
  },
  {
    Icon: ClipboardList,
    who: 'Operations and documentation managers',
    problem: 'Responsible for catching errors, but checking figures across three documents by eye takes time on every file.',
    use: 'Review extracted fields beside the source, confirm them, and let Klearway do the comparison.',
    benefit: 'Less re-typing and a written record of what was checked.',
  },
  {
    Icon: Truck,
    who: 'Forwarders handling road and air legs',
    problem: 'Shorter timelines and more handovers, with importers expecting regular updates.',
    use: 'Confirm milestones as they happen and send a short update from the shipment in one click.',
    benefit: 'Importers stay informed without extra calls.',
  },
];

export function WhoFor() {
  return (
    <section id="who" className="border-y border-paper-300 bg-paper-50 py-20 sm:py-28" aria-labelledby="who-title">
      <div className="page">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">Who it’s for</p>
          <h2 id="who-title" className="h2 mt-3">Built for the firms that move the paperwork.</h2>
          <p className="lede mt-4">Klearway is for forwarding and clearing firms in Nigeria, starting in Lagos. Importers receive updates from you; they do not need an account.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {SEGMENTS.map((s) => (
            <article key={s.who} className="rounded-2xl border border-paper-300 bg-paper p-6 sm:p-7" data-reveal>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink/10 bg-paper-50"><s.Icon className="h-5 w-5 text-tide" aria-hidden="true" /></span>
                <h3 className="text-lg font-semibold">{s.who}</h3>
              </div>
              <dl className="mt-5 space-y-3 text-sm leading-relaxed">
                <div><dt className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-400">The problem</dt><dd className="mt-0.5 text-ink-700">{s.problem}</dd></div>
                <div><dt className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-400">How they use Klearway</dt><dd className="mt-0.5 text-ink-700">{s.use}</dd></div>
                <div><dt className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-400">The benefit</dt><dd className="mt-0.5 font-medium text-ink">{s.benefit}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATUS = [
  {
    Icon: CheckCircle2,
    title: 'Working in the MVP today',
    tone: 'text-tide',
    items: [
      'Create shipments and upload documents (PDF, text, JPG, PNG, WebP)',
      'Automatic document-type detection and field extraction from digital PDFs and text files',
      'Field review beside the stored document, with corrections and confirmation',
      'Cross-document checks and ISO 6346 container validation, with saved history',
      'Milestones, blockers, search and filters across shipments',
      'Importer updates drafted from confirmed milestones and opened in WhatsApp or email',
    ],
  },
  {
    Icon: Wrench,
    title: 'Being built now',
    tone: 'text-signal-700',
    items: ['Reading scans and phone photos automatically', 'AI-assisted extraction for unfamiliar document layouts', 'User accounts with roles for each firm', 'Hosted pilot environment on AWS'],
  },
  {
    Icon: Compass,
    title: 'On the roadmap',
    tone: 'text-ink-600',
    items: ['Receiving documents by WhatsApp and forwarded email', 'Automatic importer updates through the WhatsApp Business Platform', 'Deadline and storage-cost reminders'],
  },
];

export function MvpStatus() {
  return (
    <section id="status" className="py-20 sm:py-28" aria-labelledby="status-title">
      <div className="page">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div data-reveal>
            <p className="eyebrow">MVP status</p>
            <h2 id="status-title" className="h2 mt-3">What exists today, and what comes next.</h2>
            <p className="lede mt-4">Klearway is an MVP in development, founded in 2026. The core document check runs end to end in our pilot workspace. We are now looking for a small number of forwarding and clearing firms to pilot it on real shipments.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/#pilot" icon={ArrowRight} data-cta="status">Request pilot access</Button>
              <Button to="/workspace" variant="outline">Pilot workspace sign-in</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STATUS.map((col) => (
              <div key={col.title} className="rounded-2xl border border-paper-300 bg-paper-50 p-5" data-reveal>
                <h3 className={`flex items-center gap-2 font-semibold ${col.tone}`}><col.Icon className="h-4 w-4" aria-hidden="true" />{col.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm leading-snug text-ink-700">
                  {col.items.map((i) => (
                    <li key={i} className="flex gap-2"><span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-ink-400" aria-hidden="true" />{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
