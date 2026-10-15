import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Code-splitting por rota: o admin (e o 404) não pesam no carregamento da vitrine.
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Admin = lazy(() => import('./pages/admin/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteFallback() {
  return <div className="fixed inset-0 bg-ink" aria-busy="true" />;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modelos" element={<Catalog />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
