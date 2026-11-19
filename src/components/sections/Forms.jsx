import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Field, Select } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import { company } from '../../data/company.js';
import { LinkedinIcon } from '../brand/LinkedinIcon.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NG_PHONE = /^(\+?234|0)[789][01]\d{8}$/;
const SIZES = ['1-2', '3-10', '11-30', '31-100', '100+'];
const USE_CASES = ['Document checks before submission', 'Shipment status tracking', 'Importer status updates', 'All of the above', 'Other'];
const VOLUMES = ['Under 10', '10-50', '51-200', '200+'];
const TRACKING = ['Paper files', 'WhatsApp and email only', 'Spreadsheets', 'Other software'];
const MODES = ['Sea', 'Air', 'Road'];
const TOPICS = ['Pilot programme', 'Pricing', 'Security and data handling', 'Partnership', 'Other'];
const PLAN_LABEL = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' };

function utm() {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].filter((k) => p.get(k)).map((k) => [k, p.get(k)]));
}

function useLeadForm(kind, initial, validate) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', message: '', result: null });
  const formRef = useRef(null);
  const set = (k) => (e) => setV((prev) => ({ ...prev, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setState({ status: 'idle', message: '', result: null });
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    setState({ status: 'loading', message: '', result: null });
    try {
      const result = await api('/api/leads', { method: 'POST', body: { ...v, kind, utm: utm(), page: typeof window !== 'undefined' ? window.location.pathname : '' } });
      setState({ status: 'success', message: '', result });
    } catch (err) {
      setErrors(err.details || {});
      setState({ status: 'error', message: err.message, result: null });
    }
  }
  return { v, setV, set, errors, state, submit, formRef, reset: () => { setV(initial); setState({ status: 'idle', message: '', result: null }); } };
}

function common(v) {
  const e = {};
  if (v.fullName.trim().length < 2) e.fullName = 'Enter your full name.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid business email address.';
  if (v.company.trim().length < 2) e.company = 'Enter your company name.';
  if (v.whatsapp && !NG_PHONE.test(v.whatsapp.replace(/[\s()-]/g, ''))) e.whatsapp = 'Enter a Nigerian mobile number, for example 0803 123 4567 or +234 803 123 4567.';
  return e;
}

function Success({ result, onReset, kind }) {
  return (
    <div className="rounded-2xl border border-tide/30 bg-tide-100/60 p-8" role="status" aria-live="polite">
      <CheckCircle2 className="h-8 w-8 text-tide" aria-hidden="true" />
      <h3 className="mt-4 text-xl font-semibold">{kind === 'pilot' ? 'Your pilot request has been received.' : 'Your message has been received.'}</h3>
      <p className="mt-2 text-ink-700">
        Thank you. We will reply from {company.email}.
        {result?.confirmationSent ? ' A confirmation has been sent to your email address.' : ''}
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>Send another</Button>
    </div>
  );
}

function Honeypot({ value, onChange }) {
  return (
    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
      <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={value} onChange={onChange} /></label>
    </div>
  );
}

export function PilotForm() {
  const [params] = useSearchParams();
  const f = useLeadForm(
    'pilot',
    { fullName: '', role: '', email: '', whatsapp: '', company: '', location: '', companySize: '', shipmentsPerMonth: '', modes: [], trackingToday: '', useCase: '', message: '', plan: '', website: '' },
    (v) => {
      const e = common(v);
      if (!v.companySize) e.companySize = 'Choose your company size.';
      if (!v.useCase) e.useCase = 'Choose a primary use case.';
      return e;
    },
  );
  const plan = params.get('plan');
  const { setV } = f;
  useEffect(() => {
    if (plan && PLAN_LABEL[plan]) setV((p) => ({ ...p, plan: PLAN_LABEL[plan] }));
  }, [plan, setV]);

  const toggleMode = (m) => f.setV((p) => ({ ...p, modes: p.modes.includes(m) ? p.modes.filter((x) => x !== m) : [...p.modes, m] }));

  return (
    <section id="pilot" className="bg-ink py-20 text-paper sm:py-28" aria-labelledby="pilot-title">
      <div className="page grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div data-reveal>
          <p className="eyebrow-dark">Pilot programme</p>
          <h2 id="pilot-title" className="h2 mt-3">Run your next shipments through Klearway.</h2>
          <p className="mt-5 text-lg leading-relaxed text-paper/70">We are inviting a small number of forwarding and clearing firms to pilot the MVP on real shipments and shape what we build next. Tell us about your firm.</p>
          <ul className="mt-8 space-y-3 text-sm text-paper/75">
            <li className="flex gap-3"><span className="font-mono text-signal">01</span>We review your request and reply by email.</li>
            <li className="flex gap-3"><span className="font-mono text-signal">02</span>A short call to understand your documents and volumes.</li>
            <li className="flex gap-3"><span className="font-mono text-signal">03</span>We agree pilot terms and data handling in writing, then set up your workspace.</li>
          </ul>
          <a href={`mailto:${company.email}?subject=${encodeURIComponent('Klearway pilot')}`} className="mt-8 inline-flex items-center gap-2 text-sm text-signal underline-offset-2 hover:underline" data-cta="pilot-email"><Mail className="h-4 w-4" aria-hidden="true" />Prefer email? {company.email}</a>
        </div>

        <div className="rounded-2xl bg-paper p-6 text-ink sm:p-8">
          {f.state.status === 'success' ? (
            <Success result={f.state.result} onReset={f.reset} kind="pilot" />
          ) : (
            <form ref={f.formRef} onSubmit={f.submit} noValidate className="relative grid gap-4 sm:grid-cols-2" aria-describedby="pilot-required">
              <p id="pilot-required" className="text-xs text-ink-400 sm:col-span-2">Fields marked <span className="text-flag">*</span> are required.</p>
              {f.v.plan && <p className="rounded-lg bg-signal-100 px-3 py-2 text-sm sm:col-span-2">Plan of interest: <strong className="font-medium">{f.v.plan}</strong> <button type="button" className="ml-2 text-xs underline" onClick={() => f.setV((p) => ({ ...p, plan: '' }))}>Clear</button></p>}
              <Field label="Full name" required error={f.errors.fullName}>{(p) => <input {...p} className="input" autoComplete="name" value={f.v.fullName} onChange={f.set('fullName')} />}</Field>
              <Field label="Role" error={f.errors.role}>{(p) => <input {...p} className="input" autoComplete="organization-title" value={f.v.role} onChange={f.set('role')} placeholder="e.g. Managing director" />}</Field>
              <Field label="Business email" required error={f.errors.email}>{(p) => <input {...p} type="email" className="input" autoComplete="email" value={f.v.email} onChange={f.set('email')} />}</Field>
              <Field label="WhatsApp number" error={f.errors.whatsapp}>{(p) => <input {...p} type="tel" inputMode="tel" className="input" autoComplete="tel" value={f.v.whatsapp} onChange={f.set('whatsapp')} placeholder="0803 123 4567" />}</Field>
              <Field label="Company" required error={f.errors.company}>{(p) => <input {...p} className="input" autoComplete="organization" value={f.v.company} onChange={f.set('company')} />}</Field>
              <Field label="City or port" error={f.errors.location}>{(p) => <input {...p} className="input" value={f.v.location} onChange={f.set('location')} placeholder="e.g. Lagos, Apapa" />}</Field>
              <Field label="Company size" required error={f.errors.companySize}>{(p) => <Select {...p} value={f.v.companySize} onChange={f.set('companySize')} options={SIZES.map((s) => ({ value: s, label: `${s} staff` }))} />}</Field>
              <Field label="Shipments per month" error={f.errors.shipmentsPerMonth}>{(p) => <Select {...p} value={f.v.shipmentsPerMonth} onChange={f.set('shipmentsPerMonth')} options={VOLUMES} />}</Field>
              <Field label="Primary use case" required error={f.errors.useCase}>{(p) => <Select {...p} value={f.v.useCase} onChange={f.set('useCase')} options={USE_CASES} />}</Field>
              <Field label="How you track documents today" error={f.errors.trackingToday}>{(p) => <Select {...p} value={f.v.trackingToday} onChange={f.set('trackingToday')} options={TRACKING} />}</Field>
              <fieldset className="sm:col-span-2">
                <legend className="label">Transport modes <span className="font-normal text-ink-400">(optional)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {MODES.map((m) => (
                    <label key={m} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition ${f.v.modes.includes(m) ? 'border-tide bg-tide-100 text-tide-600' : 'border-paper-300 bg-white'}`}>
                      <input type="checkbox" className="accent-[#1E6B5A]" checked={f.v.modes.includes(m)} onChange={() => toggleMode(m)} />{m}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label="Message" className="sm:col-span-2" error={f.errors.message}>{(p) => <textarea {...p} rows={4} className="input" value={f.v.message} onChange={f.set('message')} placeholder="Anything we should know about your shipments or documents" />}</Field>
              <Honeypot value={f.v.website} onChange={f.set('website')} />
              {f.state.status === 'error' && <p className="rounded-lg border border-flag/30 bg-flag-100 px-4 py-3 text-sm text-flag sm:col-span-2" role="alert">{f.state.message} You can also email {company.email}.</p>}
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-ink-400">We use these details only to respond to your request. See our <a href="/privacy" className="underline">Privacy Policy</a>.</p>
                <Button type="submit" loading={f.state.status === 'loading'} icon={Send} data-cta="form">Request pilot access</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const f = useLeadForm('contact', { fullName: '', email: '', company: '', topic: '', message: '', whatsapp: '', website: '' }, (v) => {
    const e = common(v);
    if (!v.topic) e.topic = 'Choose a topic.';
    if (v.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).';
    return e;
  });
  return (
    <section id="contact" className="py-20 sm:py-28" aria-labelledby="contact-title">
      <div className="page grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div data-reveal>
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title" className="h2 mt-3">Talk to the team.</h2>
          <p className="lede mt-4">Questions about the product, pilot, data handling or partnerships.</p>
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-400">Email</dt>
              <dd className="mt-1"><a href={`mailto:${company.email}`} className="inline-flex items-center gap-2 font-medium text-tide underline-offset-2 hover:underline" data-cta="contact-email"><Mail className="h-4 w-4" aria-hidden="true" />{company.email}</a></dd>
            </div>
            <div>
              <dt className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-400">LinkedIn</dt>
              <dd className="mt-1"><a href={company.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-tide underline-offset-2 hover:underline"><LinkedinIcon />linkedin.com/company/klear-way</a></dd>
            </div>
          </dl>
        </div>
        <div className="sheet p-6 sm:p-8">
          {f.state.status === 'success' ? (
            <Success result={f.state.result} onReset={f.reset} kind="contact" />
          ) : (
            <form ref={f.formRef} onSubmit={f.submit} noValidate className="relative grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={f.errors.fullName}>{(p) => <input {...p} className="input" autoComplete="name" value={f.v.fullName} onChange={f.set('fullName')} />}</Field>
              <Field label="Business email" required error={f.errors.email}>{(p) => <input {...p} type="email" className="input" autoComplete="email" value={f.v.email} onChange={f.set('email')} />}</Field>
              <Field label="Company" required error={f.errors.company}>{(p) => <input {...p} className="input" autoComplete="organization" value={f.v.company} onChange={f.set('company')} />}</Field>
              <Field label="Topic" required error={f.errors.topic}>{(p) => <Select {...p} value={f.v.topic} onChange={f.set('topic')} options={TOPICS} />}</Field>
              <Field label="Message" required className="sm:col-span-2" error={f.errors.message}>{(p) => <textarea {...p} rows={5} className="input" value={f.v.message} onChange={f.set('message')} />}</Field>
              <Honeypot value={f.v.website} onChange={f.set('website')} />
              {f.state.status === 'error' && <p className="rounded-lg border border-flag/30 bg-flag-100 px-4 py-3 text-sm text-flag sm:col-span-2" role="alert">{f.state.message} You can also email {company.email}.</p>}
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" variant="dark" loading={f.state.status === 'loading'} icon={Send}>Send message</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
