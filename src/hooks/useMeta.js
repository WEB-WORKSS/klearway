import { useEffect } from 'react';
import { seo, company } from '../data/company.js';

/** Keeps title, description and canonical in sync on client-side navigation. Prerender writes the same tags. */
export function useMeta(path) {
  useEffect(() => {
    const m = seo[path] || seo['/404'];
    document.title = m.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', m.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${company.url}${path === '/' ? '/' : path}`);
  }, [path]);
}
