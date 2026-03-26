import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  FileSpreadsheet,
  ScrollText,
  Scale,
  TrendingUp,
  LayoutList,
  ClipboardList,
  Inbox,
  Clock,
  Car,
  CalendarOff,
  PenLine,
  ShoppingBag,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  ChevronDown,
  X,
  Shield,
  History,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  children?: NavItem[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const adminNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Budget Management',
    items: [
      {
        label: 'Budget',
        path: '/admin/budget',
        icon: BarChart3,
        children: [
          { label: 'Appropriation', path: '/admin/budget/appropriation', icon: FileSpreadsheet },
          { label: 'Statement', path: '/admin/budget/statement', icon: ScrollText },
          { label: 'PPA Summary', path: '/admin/budget/ppa', icon: LayoutList },
          { label: 'Obligations', path: '/admin/budget/obligations', icon: ScrollText },
          { label: 'Balances',      path: '/admin/budget/balances',  icon: Scale },
          { label: 'Utilization',   path: '/admin/budget/utilization', icon: TrendingUp },
          { label: 'Budget Releases', path: '/admin/budget/releases', icon: Wallet },
          { label: 'History',       path: '/admin/budget/trash',     icon: History },
        ],
      },
    ],
  },
  {
    title: 'e-Requests',
    items: [
      {
        label: 'Requests',
        path: '/admin/requests',
        icon: ClipboardList,
        children: [
          { label: 'All Requests', path: '/admin/requests/all', icon: Inbox },
          { label: 'DTR', path: '/admin/requests/dtr', icon: Clock },
          { label: 'ATR', path: '/admin/requests/atr', icon: Car },
          { label: 'Leave Application', path: '/admin/requests/leave', icon: CalendarOff },
          { label: 'OBR Signature', path: '/admin/requests/obr', icon: PenLine },
          { label: 'Purchase Request', path: '/admin/requests/pr', icon: ShoppingBag },
        ],
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'User Management', path: '/admin/users', icon: Users },
    ],
  },
];

const userNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Budget Overview',
    items: [
      {
        label: 'Budget',
        path: '/user/budget',
        icon: BarChart3,
        children: [
          { label: 'Appropriation', path: '/user/budget/appropriation', icon: FileSpreadsheet },
          { label: 'Statement', path: '/user/budget/statement', icon: ScrollText },
          { label: 'PPA Summary', path: '/user/budget/ppa', icon: LayoutList },
          { label: 'Obligations', path: '/user/budget/obligations', icon: ScrollText },
          { label: 'Balances',      path: '/user/budget/balances',   icon: Scale },
          { label: 'Utilization',   path: '/user/budget/utilization', icon: TrendingUp },
          { label: 'Budget Releases', path: '/user/budget/releases',  icon: Wallet },
          { label: 'History',       path: '/user/budget/trash',      icon: History },
        ],
      },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', path: '/user/settings', icon: Settings },
    ],
  },
];

// ── POPS Division Nav ─────────────────────────────────────────
const popsNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', path: '/pops/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Divisions / Offices',
    items: [
      {
        label: 'Offices',
        path: '/pops/office',
        icon: Building2,
        children: [
          { label: 'MBDA', path: '/pops/office/mbda', icon: Shield },
          { label: 'BJMP', path: '/pops/office/bjmp', icon: Shield },
          { label: 'PDEA', path: '/pops/office/pdea', icon: Shield },
          { label: 'PNP', path: '/pops/office/pnp', icon: Shield },
          { label: 'SOCO', path: '/pops/office/soco', icon: Shield },
          { label: 'PPDO', path: '/pops/office/ppdo', icon: Shield },
          { label: 'VGO', path: '/pops/office/vgo', icon: Shield },
          { label: 'PDRRMO', path: '/pops/office/pdrrmo', icon: Shield },
          { label: 'NBI', path: '/pops/office/nbi', icon: Shield },
        ],
      },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', path: '/pops/settings', icon: Settings },
    ],
  },
];

function NavItemRow({ item, collapsed, depth = 0 }: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const location = useLocation();
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  const hasChildren = item.children && item.children.length > 0;
  const [open, setOpen] = useState(isActive);

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
            isActive
              ? 'bg-white/10 text-white'
              : 'text-blue-100/80 hover:bg-white/8 hover:text-white'
          )}
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', open && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-4 mt-0.5 border-l border-white/10 pl-3 space-y-0.5"
            >
              {item.children!.map(child => (
                <NavItemRow key={child.path} item={child} collapsed={false} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={({ isActive: linkActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
          linkActive
            ? 'bg-white/15 text-white shadow-sm'
            : 'text-blue-100/80 hover:bg-white/8 hover:text-white',
          collapsed && 'justify-center px-2'
        )
      }
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
          {item.label}
        </div>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, mobile = false }: SidebarProps) {
  const { user } = useAuthStore();
  const navSections = user?.role === 'admin' ? adminNav : user?.role === 'pops' ? popsNav : userNav;

  // On mobile: always show full sidebar (not collapsed)
  const isCollapsed = mobile ? false : collapsed;

  return (
    <motion.aside
      animate={{ width: mobile ? 260 : collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="h-full flex flex-col overflow-hidden flex-shrink-0"
      style={{ background: 'linear-gradient(180deg, #0F2557 0%, #1E3A8A 60%, #1D4ED8 100%)' }}
    >
      {/* Logo row */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0',
        isCollapsed && 'justify-center px-2'
      )}>
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden flex-1 min-w-0"
            >
              <p className="text-white font-bold text-sm leading-tight">OPG Central</p>
              <p className="text-blue-200/70 text-[10px] font-medium leading-tight">Central Management System</p>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Mobile close button */}
        {mobile && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-hide">
        {navSections.map((section, si) => (
          <div key={si} className="space-y-0.5">
            {section.title && !isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-blue-300/60 uppercase tracking-widest mb-1">
                {section.title}
              </p>
            )}
            {section.items.map(item => (
              <NavItemRow key={item.path} item={item} collapsed={isCollapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* Desktop collapse toggle — hidden on mobile */}
      {!mobile && (
        <div className="flex-shrink-0 p-3 border-t border-white/10">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/8 transition-all text-sm"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </motion.aside>
  );
}
