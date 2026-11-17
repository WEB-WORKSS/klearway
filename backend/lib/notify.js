/**
 * Lead notifications by SMTP. Only active when SMTP_HOST, LEAD_NOTIFY_TO and LEAD_FROM are set.
 * Without them, leads are still stored and the API reports notified:false. It never claims an email was sent.
 */
export function smtpConfigured(cfg) {
  return Boolean(cfg.smtp.host && cfg.smtp.to && cfg.smtp.from);
}

export async function notifyLead(cfg, lead) {
  if (!smtpConfigured(cfg)) return { notified: false, confirmationSent: false };
  const nodemailer = (await import('nodemailer')).default;
  const transport = nodemailer.createTransport({
    host: cfg.smtp.host,
    port: cfg.smtp.port,
    secure: cfg.smtp.port === 465,
    auth: cfg.smtp.user ? { user: cfg.smtp.user, pass: cfg.smtp.pass } : undefined,
  });
  const lines = Object.entries(lead).filter(([k]) => !['id', 'ip'].includes(k)).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
  await transport.sendMail({ from: cfg.smtp.from, to: cfg.smtp.to, replyTo: lead.email, subject: `Klearway ${lead.kind === 'pilot' ? 'pilot request' : 'enquiry'}: ${lead.company}`, text: lines.join('\n') });
  let confirmationSent = false;
  try {
    await transport.sendMail({
      from: cfg.smtp.from,
      to: lead.email,
      subject: 'We received your message - Klearway',
      text: `Hello ${lead.fullName},\n\nThank you for contacting Klearway. We have received your ${lead.kind === 'pilot' ? 'pilot request' : 'message'} and will reply from this address.\n\nKlearway\nhttps://www.klearway.site`,
    });
    confirmationSent = true;
  } catch {
    confirmationSent = false;
  }
  return { notified: true, confirmationSent };
}
