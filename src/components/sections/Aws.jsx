import { Inbox, Lock, Cog, Sparkles, LayoutDashboard } from 'lucide-react';

const PIPELINE = [
  { Icon: Inbox, stage: 'Data collection', services: ['Amazon API Gateway', 'AWS Lambda'], role: 'Receives document uploads and workspace requests, and validates file type and size.' },
  { Icon: Lock, stage: 'Secure storage', services: ['Amazon S3', 'AWS KMS'], role: 'Stores each firm’s documents under its own prefix, encrypted with managed keys.' },
  { Icon: Cog, stage: 'Processing', services: ['Amazon Textract', 'AWS Lambda'], role: 'Reads text, key-value pairs and tables from scans and phone photos.' },
  { Icon: Sparkles, stage: 'AI intelligence', services: ['Amazon Bedrock', 'Bedrock Guardrails'], role: 'Maps unfamiliar layouts to Klearway’s fields and returns the source text for each value.' },
  { Icon: LayoutDashboard, stage: 'Application', services: ['Amazon DynamoDB', 'Amazon Cognito', 'AWS Amplify Hosting'], role: 'Holds shipment records and check history, signs users in with roles, and serves the app.' },
];

const SERVICES = [
  ['Amazon S3', 'Provides encrypted object storage for uploaded bills of lading, invoices, packing lists and document photos, separated by firm.'],
  ['AWS KMS', 'Manages the encryption keys used for stored documents and records.'],
  ['Amazon Textract', 'Extracts text, key-value pairs and tables from scanned and photographed shipping documents.'],
  ['Amazon Bedrock', 'Runs the foundation model that maps extracted text to Klearway’s document fields and explains where each value was found.'],
  ['Amazon Bedrock Guardrails', 'Restricts model output to document fields and blocks responses that read as customs or legal advice.'],
  ['AWS Lambda', 'Runs upload handling, extraction, the cross-document check rules and update drafting without managing servers.'],
  ['Amazon API Gateway', 'Exposes the workspace and lead APIs with request validation and throttling.'],
  ['Amazon DynamoDB', 'Stores shipments, confirmed fields, check runs, milestones and the importer update log.'],
  ['Amazon Cognito', 'Handles sign-in for each firm’s staff and enforces who can view or edit shipments.'],
  ['Amazon SES', 'Sends pilot-request notifications and, later, importer status emails.'],
  ['AWS Amplify Hosting', 'Hosts the prerendered marketing site and the workspace front end on a global CDN.'],
];

export default function Aws() {
  return (
    <section id="aws" className="py-20 sm:py-28" aria-labelledby="aws-title">
      <div className="page">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow">Technology</p>
          <h2 id="aws-title" className="h2 mt-3">How We Use Amazon Web Services</h2>
          <p className="lede mt-4">
            Today’s MVP checks digital documents on a single Node.js service. Klearway’s proposed AWS architecture takes each stage of that workflow onto managed services: Amazon Textract to read scans and photos, Amazon Bedrock to map unfamiliar layouts to the same fields a person confirms, and serverless storage and processing that keep each firm’s documents separate.
          </p>
        </div>

        <ol className="mt-12 grid gap-3 lg:grid-cols-5" aria-label="Proposed AWS pipeline">
          {PIPELINE.map((p, i) => (
            <li key={p.stage} className="relative" data-reveal>
              <div className="h-full rounded-xl border border-paper-300 bg-paper-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-signal"><p.Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                  <span className="font-mono text-xs text-ink-400">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{p.stage}</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {p.services.map((s) => <li key={s} className="rounded border border-tide/25 bg-tide-100/60 px-1.5 py-0.5 font-mono text-[0.68rem] text-tide-600">{s}</li>)}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{p.role}</p>
              </div>
              {i < PIPELINE.length - 1 && <span className="absolute -right-2.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-paper-300 bg-paper font-mono text-[0.7rem] text-ink-400 lg:flex" aria-hidden="true">→</span>}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-x-10 gap-y-3 md:grid-cols-2" data-reveal>
          <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-400 md:col-span-2">Services in the proposed architecture</h3>
          {SERVICES.map(([name, purpose]) => (
            <p key={name} className="border-b border-paper-300 pb-3 text-sm leading-relaxed text-ink-700">
              <strong className="font-semibold text-ink">{name}:</strong> {purpose}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
