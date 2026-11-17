import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';
import { WorkspaceLoading } from './components/workspace/WorkspaceLoading.jsx';

export { seo, company } from './data/company.js';

export function render(url) {
  // The workspace is client-rendered (it needs live API data); prerender only its loading screen.
  if (url === '/workspace' || url.startsWith('/workspace/')) return renderToString(<WorkspaceLoading />);
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
