import { Plus } from 'lucide-react';
import { FAQ } from '../../data/content.js';

export default function Faq() {
  return (
    <section id="faq" className="border-t border-paper-300 bg-paper-50 py-20 sm:py-28" aria-labelledby="faq-title">
      <div className="page grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div data-reveal>
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="h2 mt-3">Questions forwarders ask us.</h2>
        </div>
        <div className="divide-y divide-paper-300 border-y border-paper-300">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="h-5 w-5 shrink-0 text-ink-400 transition group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="pb-5 pr-8 leading-relaxed text-ink-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
