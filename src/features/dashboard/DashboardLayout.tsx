import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { useDashboardShortcuts } from './hooks/useDashboardShortcuts';

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);


  useDashboardShortcuts();
  return (
    <div className="min-h-screen bg-void text-slate-200">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-65 lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-65">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile slide-over */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-70">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}