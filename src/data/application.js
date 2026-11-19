// Everything needed to fill in LinkedIn and AWS Activate, derived from the same business record as the site.
export const businessDetails = [
  ['Company name and website', 'Klearway, https://www.klearway.site'],
  ['One-sentence description', 'Klearway checks bills of lading, invoices and packing lists against each other, flags mismatches before they hold up clearance, and keeps importers updated on shipment status.'],
  ['Customers and niche', 'Businesses: freight forwarders and customs clearing agents in Nigeria (logistics).'],
  ['Product stage', 'Building: MVP works end to end locally, not yet deployed or used by pilot firms.'],
  ['Planned launch date', 'March 1, 2027 (assumed: pilot launch target)'],
  ['How customers use it', 'Web browser'],
  ['AI/ML', 'Planned: field extraction runs on rules today; Amazon Bedrock and Textract are planned.'],
  ['Funding', 'None (assumed)'],
  ['Valuation', 'None'],
  ['Tech stack and planned AWS', 'React, Vite, Tailwind, Node.js/Express. Planned: Amazon S3, Textract, Bedrock, Lambda, API Gateway, DynamoDB, Cognito, SES, Amplify.'],
  ['Share of infra spend on AWS', '75 - 99% (assumed)'],
  ['Annual marketing spend', 'Under $250,000'],
  ['Team size and country', 'Founder-led, Nigeria (team size assumed: confirm)'],
  ['Goals for next 6-12 months', 'Deploy the MVP on AWS, add scan/photo extraction with Textract and Bedrock, run pilots with Lagos forwarding and clearing firms.'],
];

export const whatBuilding =
  'Klearway is a web platform that helps freight forwarders and clearing agents in Nigeria catch mismatches across bills of lading, invoices and packing lists. Built with React and Node.js; planned on AWS S3, Lambda, Textract, Bedrock.';

export const awsAnswers = [
  { q: 'Q1', name: 'Top 3 ways AWS can help you', answer: ['Launching products faster', 'Building scalable architecture', 'Reducing burn rate'], reason: 'Pre-launch MVP: the rules favour these three technical and cost items.' },
  {
    q: 'Q2',
    name: 'AWS services to learn more about (20)',
    answer: ['Amazon S3', 'Amazon Textract', 'Amazon Bedrock', 'AWS Lambda', 'Amazon API Gateway', 'Amazon DynamoDB', 'Amazon Cognito', 'Amazon Simple Email Service', 'AWS Amplify', 'Amazon EC2', 'Amazon Lightsail', 'Amazon VPC', 'Amazon Cloudwatch', 'AWS Identity & Access', 'AWS Route 53', 'AWS Certificate Manager', 'Amazon SQS', 'AWS CloudFormation', 'AWS Budgets', 'AWS Cost Explorer'],
    reason: 'Matches the planned document pipeline (S3, Textract, Bedrock, Lambda, DynamoDB), hosting, security and cost control.',
  },
  { q: 'Q3', name: 'AWS tech topics to follow', answer: ['AI & machine learning', 'Serverless', 'Security', 'AWS cost management'], reason: 'Planned AI extraction, serverless architecture, confidential documents, early-stage budget.' },
  { q: 'Q4', name: 'Type of customers (industry / category)', answer: ['Freight', 'Supply Chain / Logistics Tech', 'Logistics', 'Shipping', 'Business Applications', 'SaaS'], reason: 'Most specific: freight and logistics tech; broad: logistics; delivery model: SaaS. No AI category, since AI is not live yet.' },
  { q: 'Q5', name: 'Primary target customers', answer: ['Businesses'], reason: 'Forwarding and clearing firms pay for and use the product.' },
  { q: 'Q6', name: 'Current product stage', answer: ['Ideating/building initial product'], reason: 'MVP works locally but is not deployed or used by pilot firms yet.' },
  { q: 'Q7', name: 'How customers interact with the product', answer: ['Web browser'], reason: 'Web-only app; no mobile app or public API.' },
  { q: 'Q8', name: 'Does your product use AI/ML?', answer: ["No, we don't use AI/ML technology, but we plan to do so in the future."], reason: 'Literally true today: extraction is rule-based; the Bedrock integration is written but not live.' },
  { q: 'Q9', name: 'What are you building? (30-250 characters)', answer: [whatBuilding], reason: 'Plain description; says "planned on AWS" because nothing is deployed yet.', count: true },
  { q: 'Q10', name: 'Planned product launch date', answer: ['March 1, 2027'], reason: 'Assumed: realistic pilot launch about 3-4 months out.', assumed: true },
  { q: 'Q11', name: 'Most recent funding round', answer: ['No Funding (leave month/year blank)'], reason: 'Assumed: no funding was supplied.', assumed: true },
  { q: 'Q12', name: 'Latest valuation', answer: ['No Valuation'], reason: 'No funding, so no priced round.' },
  { q: 'Q13', name: 'Percentage of spend on AWS', answer: ['75 - 99%'], reason: 'Assumed: the planned stack is almost all AWS (email and domain may sit elsewhere).', assumed: true },
  { q: 'Q14', name: 'Annual marketing spend', answer: ['< $250,000'], reason: 'Pre-seed, self-funded startup.' },
];

export const assumed = [
  'Q10 launch date March 1, 2027: replace with your real target date.',
  'Q11 No Funding: confirm no money has been raised (including friends and family or grants).',
  'Q13 75 - 99% on AWS: confirm you will host mainly on AWS.',
  'Team size and country (Nigeria): confirm, and keep it the same on LinkedIn.',
  'Founder name spelling: "Muhammed" here vs "mohammed" in the LinkedIn URL.',
  'Business email ogunlakin@klearway.site: confirm the mailbox exists and you can receive the AWS verification email.',
];

export const linkedin = {
  fields: [
    ['Name', 'Klearway'],
    ['Website', 'https://www.klearway.site'],
    ['Industry', 'Software Development'],
    ['Company size', '2-10 employees (confirm)'],
    ['Company type', 'Privately held'],
    ['Founded', '2026'],
    ['Headquarters', 'Leave blank until confirmed'],
    ['Public URL', 'linkedin.com/company/klear-way'],
  ],
  tagline: 'Shipment document checks and status updates for freight forwarders and clearing agents.',
  overview: `Klearway helps freight forwarding and clearing firms catch disagreements between a shipment's documents before they hold up clearance, and keeps every shipment's status ready to share with the importer.

For a forwarding or clearing firm, one shipment means a bill of lading, a commercial invoice and a packing list from different parties, all of which must agree. Today those figures are re-typed by hand, status lives in WhatsApp threads and staff memory, and importers call to ask where their container is.

With Klearway, a firm uploads a shipment's documents. Klearway reads the key fields, shows each value next to the line it came from, and a person confirms it. It then compares the documents with each other: consignee, package count, gross weight, quantity, invoice reference and container numbers, including ISO 6346 check-digit validation. Mismatches and missing items are listed before submission. Each shipment keeps its milestones, what is blocking it and who it is waiting on, and Klearway drafts a short status update from confirmed milestones that staff send from their own WhatsApp or email.

Klearway does not file customs declarations or give customs or legal advice. Your team stays in control of every value and every message.

Klearway was founded in 2026 and is building its MVP with forwarding and clearing firms in Nigeria, starting in Lagos. Pilot requests are open at klearway.site.`,
  specialties: ['Shipping document checks', 'Bill of lading review', 'Commercial invoice checks', 'Packing list reconciliation', 'Freight forwarding software', 'Customs clearing agent software', 'Document data extraction', 'Human-in-the-loop AI', 'Shipment status tracking', 'Shipment milestones', 'Importer status updates', 'WhatsApp updates for logistics', 'Container number validation', 'ISO 6346', 'Logistics SaaS', 'B2B SaaS', 'Trade documentation', 'Nigeria logistics', 'Amazon Web Services architecture', 'Document workflow automation'],
};

export const assets = [
  { label: 'LinkedIn logo (400 × 400)', file: '/kit/linkedin-logo-400.png', use: 'LinkedIn page logo' },
  { label: 'LinkedIn banner (1584 × 396)', file: '/kit/linkedin-banner-1584x396.png', use: 'LinkedIn cover image', wide: true },
  { label: 'Logo, horizontal (dark on light)', file: '/kit/logo-horizontal.png', use: 'Documents, light backgrounds' },
  { label: 'Logo, horizontal (light on dark)', file: '/kit/logo-horizontal-light.png', use: 'Dark backgrounds' },
  { label: 'Logo mark (512 px)', file: '/logo-512.png', use: 'App icon, profile pictures' },
  { label: 'Social share image (1200 × 630)', file: '/kit/og-image.png', use: 'Link previews', wide: true },
];
