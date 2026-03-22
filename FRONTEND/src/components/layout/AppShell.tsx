import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    /*
     * ROOT: h-screen + overflow-hidden so only <main> scrolls.
     * This keeps the sidebar always visible on desktop.
     */
    <div className="h-full w-full bg-slate-50 flex overflow-hidden">

      {/* ─── Mobile backdrop ───────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ─── Desktop sidebar (in flex flow — stays in place always) ─── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* ─── Mobile sidebar (fixed overlay drawer) ──────────────────── */}
      <div
        className={`
          fixed top-0 left-0 h-full z-40 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: 260 }}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileOpen(false)}
          mobile={true}
        />
      </div>

      {/* ─── Right column: header + scrollable main ───────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header: sticky inside this column — no longer fixed globally */}
        <Header
          mobileMenuOpen={mobileOpen}
          onMenuClick={() => setMobileOpen(o => !o)}
          onDesktopToggle={() => setCollapsed(c => !c)}
        />

        {/* Only main scrolls */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>

      </div>
    </div>
  );
}
