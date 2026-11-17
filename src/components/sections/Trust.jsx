import { useState } from 'react';
import { UserCheck, Quote, AlertTriangle, Scale, Check, ChevronDown } from 'lucide-react';

const CONTROL = [
  { Icon: Quote, title: 'Every value next to its source', text: 'Each extracted field shows the document line it was read from, beside the stored document.' },
  { Icon: UserCheck, title: 'A person confirms every field', text: 'Nothing counts as confirmed until someone on your team ticks it. Edited values are marked as entered by staff.' },
  { Icon: AlertTriangle, title: 'Flags instead of guesses', text: 'When a field cannot be found, Klearway leaves it empty and asks for it. It does not fill gaps with likely values.' },
  { Icon: Scale, title: 'No customs or legal rulings', text: 'Klearway compares your documents. It does not file declarations, classify goods, calculate duty or advise on regulations.' },
];

const SECURITY = [
  'Each pilot firm’s shipments and documents are kept in a separate workspace, protected by an access key.',
  'Uploaded files are stored with random names, served only through the authenticated API, and never made public.',
  'Pilot workspaces are only offered over HTTPS (encryption in transit).',
  'Only document types needed for the check are accepted, up to 10 MB each.',
  'You can delete a document or a whole shipment, including its stored files, at any time.',
  'Hosting location, encryption at rest and retention are confirmed in writing with each pilot firm before real documents are uploaded.',
];

export default function Trust() {
  const [open, setOpen] = useState(false);
  return (
    <section id="security" className="bg-ink py-20 text-paper sm:py-28" aria-labelledby="control-title">
      <div className="page grid gap-14 lg:grid-cols-2">
        <div data-reveal>
          <p className="eyebrow-dark">You stay in control</p>
          <h2 id="control-title" className="h2 mt-3">The software checks. Your team decides.</h2>
          <ul className="mt-8 space-y-5">
            {CONTROL.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper/10"><Icon className="h-[18px] w-[18px] text-signal" aria-hidden="true" /></span>
                <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-paper/65">{text}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal>
          <p className="eyebrow-dark">Security and data handling</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">How pilot documents are handled</h2>
          <ul className="mt-6 space-y-3">
            {SECURITY.map((s) => (
              <li key={s} className="flex gap-3 rounded-lg border border-paper/10 bg-paper/[0.03] px-4 py-3 text-sm leading-relaxed text-paper/80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7CC6AE]" aria-hidden="true" />{s}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-paper/50">Klearway does not hold SOC 2, ISO 27001 or similar certifications.</p>
          <div className="mt-6 rounded-xl border border-paper/15">
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="tech-detail" className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium">
              For technical teams
              <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <div id="tech-detail" hidden={!open} className="border-t border-paper/10 px-4 py-4 text-sm leading-relaxed text-paper/70">
              <p>The MVP is a React front end and a Node.js API. Records are stored as JSON on the server and files on its disk; workspace requests require an access key header compared in constant time. Text is read from digital PDFs with pdf.js; no document leaves the server for extraction.</p>
              <p className="mt-3">The proposed production architecture uses Amazon S3, AWS KMS, Amazon Textract, Amazon Bedrock with Guardrails, AWS Lambda, Amazon API Gateway, Amazon DynamoDB and Amazon Cognito. <a href="#aws" className="text-signal underline-offset-2 hover:underline">See how we use AWS</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
