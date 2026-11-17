export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts 0803 123 4567, 08031234567, +234 803 123 4567, 2348031234567. Returns +234XXXXXXXXXX or null. */
export function normaliseNigerianPhone(raw) {
  const d = String(raw || '').replace(/[^\d+]/g, '');
  let m;
  if ((m = d.match(/^\+?234([789][01]\d{8})$/))) return `+234${m[1]}`;
  if ((m = d.match(/^0([789][01]\d{8})$/))) return `+234${m[1]}`;
  return null;
}

export const COMPANY_SIZES = ['1-2', '3-10', '11-30', '31-100', '100+'];
export const USE_CASES = ['Document checks before submission', 'Shipment status tracking', 'Importer status updates', 'All of the above', 'Other'];
export const SHIPMENT_VOLUMES = ['Under 10', '10-50', '51-200', '200+'];
export const TRACKING_TODAY = ['Paper files', 'WhatsApp and email only', 'Spreadsheets', 'Other software'];
export const MODES = ['Sea', 'Air', 'Road'];
export const CONTACT_TOPICS = ['Pilot programme', 'Pricing', 'Security and data handling', 'Partnership', 'Other'];

const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

export function validateLead(body) {
  const errors = {};
  const kind = body.kind === 'contact' ? 'contact' : 'pilot';
  const lead = {
    kind,
    fullName: clean(body.fullName, 120),
    email: clean(body.email, 160).toLowerCase(),
    company: clean(body.company, 160),
    role: clean(body.role, 120),
    message: clean(body.message, 2000),
  };
  if (lead.fullName.length < 2) errors.fullName = 'Enter your full name.';
  if (!EMAIL_RE.test(lead.email)) errors.email = 'Enter a valid business email address.';
  if (lead.company.length < 2) errors.company = 'Enter your company name.';

  if (kind === 'pilot') {
    lead.companySize = clean(body.companySize, 20);
    lead.useCase = clean(body.useCase, 80);
    lead.location = clean(body.location, 120);
    lead.shipmentsPerMonth = clean(body.shipmentsPerMonth, 20);
    lead.trackingToday = clean(body.trackingToday, 60);
    lead.modes = (Array.isArray(body.modes) ? body.modes : []).filter((m) => MODES.includes(m));
    lead.plan = clean(body.plan, 40);
    if (!COMPANY_SIZES.includes(lead.companySize)) errors.companySize = 'Choose your company size.';
    if (!USE_CASES.includes(lead.useCase)) errors.useCase = 'Choose a primary use case.';
    if (lead.shipmentsPerMonth && !SHIPMENT_VOLUMES.includes(lead.shipmentsPerMonth)) errors.shipmentsPerMonth = 'Choose a range.';
    if (lead.trackingToday && !TRACKING_TODAY.includes(lead.trackingToday)) errors.trackingToday = 'Choose an option.';
  } else {
    lead.topic = clean(body.topic, 60);
    if (!CONTACT_TOPICS.includes(lead.topic)) errors.topic = 'Choose a topic.';
    if (lead.message.length < 10) errors.message = 'Tell us a little more (at least 10 characters).';
  }

  if (body.whatsapp) {
    const p = normaliseNigerianPhone(body.whatsapp);
    if (!p) errors.whatsapp = 'Enter a Nigerian mobile number, for example 0803 123 4567 or +234 803 123 4567.';
    else lead.whatsapp = p;
  }
  return { lead, errors };
}
