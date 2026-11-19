// Single business record. Website copy, SEO, LinkedIn kit and AWS Activate answers all derive from this.
export const company = {
  name: 'Klearway',
  domain: 'klearway.site',
  url: 'https://www.klearway.site',
  email: 'ogunlakin@klearway.site',
  founded: 2026,
  type: 'Privately held',
  stage: 'MVP in development',
  linkedin: 'https://www.linkedin.com/company/klear-way/',
  tagline: 'Shipment document checks and status updates for freight forwarders and clearing agents.',
  positioning:
    'Klearway helps freight forwarding and clearing firms catch disagreements between a shipment’s bill of lading, invoice and packing list before they hold up clearance, and keeps every shipment’s status ready to share with the importer.',
  team: [
    {
      name: 'Muhammed Ogunlakin',
      title: 'Founder & CEO',
      linkedin: 'https://www.linkedin.com/in/ogunlakin-mohammed/',
      bio: 'Muhammed founded Klearway to give forwarding and clearing firms one dependable record for each shipment. He leads product, customer research and the pilot programme.',
    },
  ],
};

export const seo = {
  '/': {
    title: 'Klearway | Shipment document checks for freight forwarders',
    description:
      'Klearway reads bills of lading, invoices and packing lists, flags figures that disagree, and keeps each shipment’s status ready for your importer. MVP in development; pilot requests open.',
  },
  '/privacy': { title: 'Privacy Policy | Klearway', description: 'How Klearway collects, uses and protects personal data from its website, pilot requests and MVP workspace.' },
  '/terms': { title: 'Terms of Service | Klearway', description: 'Terms that govern use of the Klearway website and the Klearway MVP workspace.' },
  '/workspace': { title: 'Workspace | Klearway', description: 'Klearway MVP workspace for pilot firms.', noindex: true },
  '/app': { title: 'Application kit | Klearway', description: 'Klearway company record, brand assets, LinkedIn profile and AWS Activate answers.', noindex: true },
  '/404': { title: 'Page not found | Klearway', description: 'The page you were looking for does not exist.', noindex: true },
};
