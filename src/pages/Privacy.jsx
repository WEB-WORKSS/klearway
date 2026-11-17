import { useMeta } from '../hooks/useMeta.js';
import { LegalPage } from './Legal.jsx';
import { company } from '../data/company.js';

const mail = <a href={`mailto:${company.email}`} className="underline">{company.email}</a>;

const sections = [
  {
    id: 'who',
    title: 'Who we are',
    body: <p>Klearway (“we”, “us”) provides shipment document checks and status updates for freight forwarders and clearing agents, and operates the website at www.klearway.site. For any question about this policy or your personal data, contact {mail}.</p>,
  },
  {
    id: 'collect',
    title: 'What we collect',
    body: (
      <>
        <p><strong>Pilot requests and contact messages.</strong> When you submit a form we collect what you enter: name, role, business email, WhatsApp number, company, city or port, company size, shipment volume, transport modes, how you track documents today, your use case, plan of interest and message. We also record the time of submission, the page it came from and any campaign (UTM) parameters in the link you followed.</p>
        <p><strong>Pilot workspace.</strong> Firms taking part in the pilot upload shipping documents and enter shipment details, which may include names and contact details of importers, suppliers and other parties. We also store check results, milestones and the log of status updates prepared.</p>
        <p><strong>Technical data.</strong> Our server processes your IP address to deliver the site and to limit repeated form submissions. It is held in memory for up to ten minutes and is not stored with your submission.</p>
        <p>The website does not use advertising or analytics cookies. The pilot workspace keeps your access key in your browser’s session storage until you close the tab or sign out.</p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use it',
    body: (
      <ul>
        <li>To reply to your request, assess whether the pilot fits your firm, and arrange it.</li>
        <li>To provide the workspace: store documents, extract and compare fields, keep shipment records and draft status updates.</li>
        <li>To keep the service secure, prevent spam and abuse, and fix problems.</li>
        <li>To improve Klearway using feedback you give us. We do not use pilot documents to train AI models.</li>
      </ul>
    ),
  },
  {
    id: 'basis',
    title: 'Legal basis',
    body: <p>We process form submissions with your consent and in our legitimate interest in responding to business enquiries. Workspace data is processed to perform our agreement with your firm; for that data your firm decides what is uploaded and acts as the data controller, and Klearway processes it on the firm’s instructions. We aim to meet the requirements of the Nigeria Data Protection Act 2023.</p>,
  },
  {
    id: 'share',
    title: 'Who we share it with',
    body: (
      <>
        <p>We do not sell personal data. We share it only with service providers that help us run Klearway, under appropriate terms:</p>
        <ul>
          <li>Hosting providers that run our servers and store data.</li>
          <li>An email provider, when we send or receive email about your request.</li>
          <li>Cloud AI and document-reading services, only once they are enabled for your workspace and agreed with your firm.</li>
        </ul>
        <p>When a workspace user opens a status update in WhatsApp or email, the message is handed to that app on the user’s own device and is governed by that provider’s terms. We may also disclose data where the law requires it.</p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'Where data is stored',
    body: <p>Some of our service providers may process data outside Nigeria. Before a firm uploads real documents to the pilot workspace, we confirm in writing where its data will be hosted and the safeguards that apply.</p>,
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: <p>We keep form submissions for as long as needed to respond and follow up, and no longer than 24 months after our last contact unless you become a customer. Workspace data is kept for the duration of the pilot or agreement and deleted or returned at its end, as agreed with the firm. Workspace users can delete documents and shipments, including stored files, at any time.</p>,
  },
  {
    id: 'security',
    title: 'Security',
    body: <p>We restrict workspace access with access keys, store uploaded files under random names outside any public folder, accept only the file types needed, and serve hosted pilots over HTTPS. No system is completely secure; if we become aware of a breach affecting your data, we will notify you and the relevant authority as the law requires.</p>,
  },
  {
    id: 'rights',
    title: 'Your rights',
    body: <p>You can ask to access, correct or delete your personal data, to receive a copy of it, to object to or restrict its processing, or to withdraw consent at any time. Email {mail}. If you are not satisfied with our response you may complain to the Nigeria Data Protection Commission.</p>,
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: <p>We will update this page when our practices change, for example when new services are enabled, and change the date above. Significant changes affecting pilot firms will be communicated to them directly.</p>,
  },
];

export default function Privacy() {
  useMeta('/privacy');
  return <LegalPage title="Privacy Policy" updated="17 November 2026" intro="This policy explains what personal data Klearway collects through its website, pilot requests and MVP workspace, how it is used, and the choices you have." sections={sections} />;
}
