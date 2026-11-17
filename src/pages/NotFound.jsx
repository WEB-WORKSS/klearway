import { ArrowLeft } from 'lucide-react';
import { useMeta } from '../hooks/useMeta.js';
import { Button } from '../components/ui/Button.jsx';

export default function NotFound() {
  useMeta('/404');
  return (
    <section className="page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">404 · Not found</p>
      <h1 className="mt-3 text-4xl font-semibold">This page isn’t in the file.</h1>
      <p className="lede mt-4 max-w-lg">The link may be out of date, or the address was typed incorrectly.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button to="/" variant="dark" icon={ArrowLeft}>Back to home</Button>
        <Button to="/#contact" variant="outline">Contact us</Button>
      </div>
    </section>
  );
}
