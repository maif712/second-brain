// src/app/App.tsx  (final)
import { Link, Route, Routes } from 'react-router';
import LandingPage from '@/features/landing/LandingPage';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import OverviewPage from '@/features/dashboard/pages/OverviewPage';
import LibraryPage from '@/features/dashboard/pages/LibraryPage';
import NodeDetailPage from '@/features/dashboard/pages/NodeDetailPage';
import ReviewPage from '@/features/dashboard/pages/ReviewPage';
import GraphPage from '@/features/dashboard/pages/GraphPage';

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-void px-6 text-center">
      <div>
        <p className="text-gradient font-display text-7xl font-bold">404</p>
        <p className="mt-3 text-slate-400">This idea hasn't been linked yet.</p>
        <Link to="/" className="mt-6 inline-block text-violet-300 hover:text-violet-200">← Back home</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="nodes/:id" element={<NodeDetailPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="graph" element={<GraphPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}