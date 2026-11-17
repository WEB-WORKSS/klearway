import { Check } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    for: 'Small clearing desks handling a modest number of import files each month.',
    items: ['Document checks for bills of lading, invoices and packing lists', 'Shipment milestones and blockers', 'Importer updates by WhatsApp and email', 'A small team of users'],
  },
  {
    id: 'growth',
    name: 'Growth',
    for: 'Forwarding and clearing firms with a busy operations team.',
    items: ['Everything in Starter', 'Higher monthly shipment volume', 'More users across operations and documentation', 'Priority help during onboarding'],
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    for: 'Larger firms with several branches or specific data-handling needs.',
    items: ['Everything in Growth', 'Volume agreed with your firm', 'Data-handling terms agreed in writing', 'Named contact at Klearway'],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-y border-paper-300 bg-paper-200/50 py-20 sm:py-28" aria-labelledby="pricing-title">
      <div className="page">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">Pricing</p>
          <h2 id="pricing-title" className="h2 mt-3">Priced in Naira, by shipments and users.</h2>
          <p className="lede mt-4">Prices are being set with our first pilot firms. Choose the plan closest to your firm and we will share pilot terms.</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article key={p.id} className={`flex flex-col rounded-2xl border p-7 ${p.featured ? 'border-ink bg-ink text-paper' : 'border-paper-300 bg-paper-50'}`} data-reveal>
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${p.featured ? 'text-paper/70' : 'text-ink-600'}`}>{p.for}</p>
              <p className={`mt-6 font-mono text-sm ${p.featured ? 'text-signal' : 'text-tide'}`}>Pricing on request</p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {p.items.map((i) => (
                  <li key={i} className="flex gap-2.5"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.featured ? 'text-signal' : 'text-tide'}`} aria-hidden="true" />{i}</li>
                ))}
              </ul>
              <Button to={`/?plan=${p.id}#pilot`} variant={p.featured ? 'primary' : 'dark'} className="mt-7 w-full" data-cta={`pricing-${p.id}`}>Request pricing</Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
