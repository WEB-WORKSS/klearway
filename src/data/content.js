// Sources for every industry claim on the page (PRD FR-3). Only these claims may be used until more are verified.
export const SOURCES = [
  { id: 'aston', text: 'Aston University study of eight logistics managers in Lagos, Nigeria. Figures are reports from interviewees, not averages.' },
  { id: 'guardian', text: 'Study of Nigerian goods transporters (Babarinde), as reported by The Guardian (Nigeria).' },
  { id: 'hyperscience', text: 'Survey of 300 transport and logistics enterprises, reported in an article sponsored by Hyperscience. Vendor-reported and not specific to Nigeria.' },
];

export const FAQ = [
  { q: 'Is Klearway available today?', a: 'Klearway is an MVP in development. The core document check, shipment record and importer-update drafting work end to end in our pilot workspace. We are opening it to a small number of pilot firms; request access below.' },
  { q: 'Does it work with WhatsApp and email?', a: 'Importer updates are drafted in Klearway and opened in your own WhatsApp or email with one click, so you stay the sender. Receiving documents directly from WhatsApp or by forwarding email is in development. Today you upload documents in the workspace.' },
  { q: 'Which documents does it read?', a: 'Bills of lading, commercial invoices and packing lists. Digital PDFs and text files are read automatically. Scans and phone photos are stored with the shipment, and your team enters the key fields. Reading scans automatically is part of the AWS architecture we are building.' },
  { q: 'What happens if it misreads something?', a: 'Every value is shown with the line it was read from, and nothing counts as confirmed until a person ticks it. You can correct any field, and checks can be re-run at any time. Each run is kept in the shipment history.' },
  { q: 'Who can see my documents?', a: 'Only people your firm gives access to. Each pilot workspace is separated and protected by an access key; individual user accounts with roles are part of the planned production release. Klearway staff access pilot data only to support you.' },
  { q: 'Where is data stored?', a: 'During the pilot, data is stored on infrastructure operated by Klearway. We will confirm the hosting location in writing with each pilot firm before any real documents are uploaded.' },
  { q: 'Does Klearway file customs declarations?', a: 'No. Klearway does not file declarations, classify goods, calculate duty or give customs or legal advice. It checks that your documents agree with each other and keeps your shipment record in order.' },
  { q: 'Does my importer need to install anything?', a: 'No. Importers receive updates in the WhatsApp or email they already use.' },
  { q: 'What does it cost?', a: 'Pricing is being set with pilot firms and will depend on shipment volume and the number of users. Tell us about your firm in the form and we will share pilot terms.' },
  { q: 'How long is the pilot?', a: 'We agree the length and scope of each pilot with the firm, based on the shipments you want to run through Klearway.' },
];
