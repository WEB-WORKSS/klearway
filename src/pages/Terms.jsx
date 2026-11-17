import { useMeta } from '../hooks/useMeta.js';
import { LegalPage } from './Legal.jsx';
import { company } from '../data/company.js';

const mail = <a href={`mailto:${company.email}`} className="underline">{company.email}</a>;

const sections = [
  {
    id: 'scope',
    title: 'These terms',
    body: <p>These terms apply to the Klearway website and to the Klearway MVP workspace (the “Service”). By using the Service you agree to them on behalf of yourself and the firm you represent. A separate written pilot agreement with your firm takes precedence over these terms where the two differ.</p>,
  },
  {
    id: 'service',
    title: 'What the Service is',
    body: (
      <>
        <p>Klearway is an early-stage product (MVP) that stores shipping documents, extracts fields from them, compares those fields across documents, records shipment milestones and drafts status messages.</p>
        <p>Klearway does <strong>not</strong> file customs declarations, classify goods, calculate duties or taxes, communicate with customs, port or shipping-line systems, or give customs, legal or financial advice. Check results describe whether values on your documents agree; they are not a determination that a shipment complies with any law or will be released.</p>
      </>
    ),
  },
  {
    id: 'access',
    title: 'Access and accounts',
    body: <p>Workspace access is given to pilot firms by access key. Keep your key confidential, share it only with authorised staff, and tell us promptly at {mail} if you think it has been exposed. We may suspend access to protect the Service or other users.</p>,
  },
  {
    id: 'duties',
    title: 'Your responsibilities',
    body: (
      <ul>
        <li>Upload only documents and data you are entitled to share, and tell the people concerned where the law requires it.</li>
        <li>Review and confirm every extracted value against the source document before relying on it.</li>
        <li>Remain responsible for all submissions to customs and other authorities, and for messages you send to importers.</li>
        <li>Keep your own copies of original documents. The Service is not a records archive.</li>
      </ul>
    ),
  },
  {
    id: 'acceptable',
    title: 'Acceptable use',
    body: (
      <ul>
        <li>Do not upload malware, unlawful content or documents you have altered to mislead.</li>
        <li>Do not try to access other firms’ data, test or bypass security, or overload the Service.</li>
        <li>Do not use the Service to send unsolicited messages.</li>
        <li>Do not copy, resell or reverse engineer the Service.</li>
      </ul>
    ),
  },
  {
    id: 'data',
    title: 'Your data',
    body: <p>Your firm keeps all rights in the documents and data it uploads. You allow Klearway to store and process that data only to provide and support the Service for you, as described in our Privacy Policy. We do not use your documents to train AI models.</p>,
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    body: <p>Klearway owns the Service, its software, design and brand. Sample documents and data shown on the website are fictional and provided for demonstration only. If you send us feedback, we may use it to improve the Service without obligation to you.</p>,
  },
  {
    id: 'availability',
    title: 'Availability and changes',
    body: <p>As an MVP, the Service may change, be interrupted or have features removed. We will try to give pilot firms notice of significant changes. Features described as in development or on the roadmap are not commitments to deliver them by a particular date.</p>,
  },
  {
    id: 'disclaimer',
    title: 'Disclaimers',
    body: <p>The Service is provided “as is” and “as available”. Field extraction and checks can be incomplete or wrong, especially for scanned, photographed or unusual documents. To the extent the law allows, we disclaim all warranties, including that the Service is error free or fit for a particular purpose.</p>,
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: <p>To the extent the law allows, Klearway is not liable for indirect or consequential losses, including delays, demurrage, storage charges, penalties, lost profits or lost data, arising from use of the Service. Our total liability for any claim is limited to the amount your firm paid us for the Service in the three months before the claim, or ₦100,000 if nothing was paid. Nothing in these terms limits liability that cannot be limited by law.</p>,
  },
  {
    id: 'ending',
    title: 'Ending use',
    body: <p>You may stop using the Service at any time. We may end access with notice, or immediately for serious breach of these terms. On request at the end of a pilot we will delete or return your firm’s workspace data, as agreed in writing.</p>,
  },
  {
    id: 'law',
    title: 'Governing law and contact',
    body: <p>These terms are governed by the laws of the Federal Republic of Nigeria. We will try to resolve any dispute informally first. Questions about these terms: {mail}.</p>,
  },
];

export default function Terms() {
  useMeta('/terms');
  return <LegalPage title="Terms of Service" updated="17 November 2026" intro="Please read these terms before using the Klearway website or the Klearway MVP workspace." sections={sections} />;
}
