import { FileWarning, EyeOff, Hourglass, PhoneCall, ScanText, GitCompareArrows, Milestone, MessageSquareText } from 'lucide-react';
import { SOURCES } from '../../data/content.js';

const HIGHLIGHTS = [
  { Icon: ScanText, title: 'Reads the documents', text: 'Pulls key fields from digital bills of lading, invoices and packing lists, with the source line shown beside each value.' },
  { Icon: GitCompareArrows, title: 'Compares them', text: 'Checks consignee, packages, weight, quantity, invoice reference and container numbers across documents.' },
  { Icon: Milestone, title: 'Tracks the file', text: 'One record per shipment: milestones your team confirms, what is blocking it and who it is waiting on.' },
  { Icon: MessageSquareText, title: 'Drafts the update', text: 'Turns confirmed milestones into a clear status message your importer can read on WhatsApp or email.' },
];

const PAINS = [
  {
    Icon: FileWarning,
    title: 'The same figures, typed again and again',
    text: 'Package counts, weights and consignee names are re-keyed from one document to the next. A slip on one copy is easy to miss until someone else spots it.',
    stat: <>In a survey of 300 transport and logistics enterprises, 51% reported high data-entry error rates and 32% relied heavily on paper.<Cite n={3} /></>,
  },
  {
    Icon: EyeOff,
    title: 'No single view of each file',
    text: 'Status lives in WhatsApp threads, email and staff memory, so it is hard to see which shipment is stuck and what it is waiting for.',
    stat: <>47% of the same survey’s respondents struggled to track document status.<Cite n={3} /> A study of Nigerian goods transporters found many firms lack systems to track goods in transit.<Cite n={2} /></>,
  },
  {
    Icon: Hourglass,
    title: 'Clearance takes long and varies',
    text: 'When documents disagree, a shipment can wait while corrections travel back to the supplier, and storage costs keep running.',
    stat: <>In a study of eight logistics managers in Lagos, participants reported trucks queuing 3 to 4 days at congested ports and some consignments taking up to 62 days to clear.<Cite n={1} /></>,
  },
  {
    Icon: PhoneCall,
    title: '“Where is my container?”',
    text: 'Importers call for updates because they cannot see progress. Each call takes a staff member away from the work that moves the shipment.',
    stat: <>The same Lagos study reports that about 40% of participants had never heard of logistics technology tools.<Cite n={1} /></>,
  },
];

function Cite({ n }) {
  return (
    <sup className="ml-0.5">
      <a href={`#source-${n}`} className="font-mono text-[0.7em] text-signal underline-offset-2 hover:underline" aria-label={`Source ${n}`}>[{n}]</a>
    </sup>
  );
}

export function Highlights() {
  return (
    <section aria-label="What Klearway does" className="border-b border-paper-300 bg-paper-50">
      <ul className="page grid divide-y divide-paper-300 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {HIGHLIGHTS.map(({ Icon, title, text }) => (
          <li key={title} className="py-7 sm:px-5 lg:first:pl-0 lg:last:pr-0" data-reveal>
            <Icon className="h-5 w-5 text-tide" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Problem() {
  return (
    <section id="problem" className="bg-ink py-20 text-paper sm:py-28" aria-labelledby="problem-title">
      <div className="page">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow-dark">The problem</p>
          <h2 id="problem-title" className="h2 mt-3">Shipment information is trapped in paper, phone calls and people’s heads.</h2>
          <p className="mt-5 text-lg leading-relaxed text-paper/70">For a forwarding or clearing firm, one shipment means several documents from different parties that must agree, and an importer who wants to know where things stand.</p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-paper/10 md:grid-cols-2">
          {PAINS.map(({ Icon, title, text, stat }) => (
            <article key={title} className="bg-ink p-7 sm:p-9" data-reveal>
              <Icon className="h-6 w-6 text-signal" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-paper/70">{text}</p>
              <p className="mt-5 border-l-2 border-signal/60 pl-4 text-sm leading-relaxed text-paper/60">{stat}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 max-w-3xl" id="sources">
          <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-paper/45">Sources</h3>
          <ol className="mt-3 space-y-2 text-sm text-paper/60">
            {SOURCES.map((s, i) => (
              <li key={s.id} id={`source-${i + 1}`} className="flex gap-3 scroll-mt-24">
                <span className="font-mono text-signal">[{i + 1}]</span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
