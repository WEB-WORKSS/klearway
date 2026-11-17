import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/fonts.js';
import './styles/index.css';

const root = document.getElementById('root');
const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Prerendered marketing pages are hydrated. The workspace (/app) and the dev server render from scratch.
const isWorkspace = /^\/workspace(\/|$)/.test(window.location.pathname);
if (root.firstElementChild && !isWorkspace) hydrateRoot(root, tree);
else createRoot(root).render(tree);
