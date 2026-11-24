import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import NotFound from './pages/NotFound.jsx';
import { WorkspaceLoading } from './components/workspace/WorkspaceLoading.jsx';

// The workspace is code-split so marketing pages stay light.
const AppWorkspace = lazy(() => import('./pages/AppWorkspace.jsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="workspace/*"
          element={
            <Suspense fallback={<WorkspaceLoading />}>
              <AppWorkspace />
            </Suspense>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}
