import { useState, useEffect } from 'react';
import { Bell, LogOut, ChevronDown, Menu, X, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { sileo } from 'sileo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { db } from '@/backend/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface HeaderProps {
  mobileMenuOpen: boolean;
  onMenuClick: () => void;
  onDesktopToggle?: () => void;
}

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; path: string }[] = [];
  let current = '';
  for (const part of parts) {
    current += `/${part}`;
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    crumbs.push({ label, path: current });
  }
  return crumbs;
}

export function Header({ mobileMenuOpen, onMenuClick, onDesktopToggle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(15));
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Quick check for "recent" unread feel: if the latest notification is within the last 24h
  const hasRecent = notifications.length > 0 && 
    (new Date().getTime() - new Date(notifications[0].createdAt).getTime()) < 24 * 60 * 60 * 1000;

  const handleLogout = () => {
    logout();
    sileo.info({ title: 'Signed out', description: 'See you next time!' });
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    const path = user?.role === 'admin' ? '/admin/profile' : '/user/profile';
    navigate(path);
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-100 shadow-sm flex items-center px-4 sm:px-6 gap-3 flex-shrink-0">

      {/* ── Mobile hamburger ─────────────────── */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ── Desktop collapse toggle ───────────── */}
      <button
        onClick={onDesktopToggle}
        className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-4.5 h-4.5" />
      </button>

      {/* ── Breadcrumbs ──────────────────────── */}
      <nav className="flex items-center gap-1 text-sm flex-1 min-w-0 overflow-hidden">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1 flex-shrink-0">
            {i > 0 && <span className="text-slate-300 text-xs">/</span>}
            <span
              className={
                i === breadcrumbs.length - 1
                  ? 'text-slate-900 font-semibold text-sm truncate max-w-[120px] sm:max-w-none'
                  : 'text-slate-400 text-sm hidden sm:block'
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* ── Right actions ────────────────────── */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              {hasRecent && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">System Notifications</p>
              <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">{notifications.length} updates</Badge>
            </div>
            
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium">No recent notifications</p>
              </div>
            ) : (
              <div className="max-h-[340px] overflow-y-auto py-1">
                {notifications.map(notif => (
                  <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <p className="text-xs font-semibold text-slate-800 mb-0.5">{notif.title}</p>
                    <p className="text-xs text-slate-500 leading-snug">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-60"></span>
                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-2 sm:pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)' }}
              >
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-400 leading-tight truncate max-w-[120px]">{user?.position}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {user?.role === 'admin' ? '⚙ Admin' : '👤 User'}
              </Badge>
            </div>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleProfile}>
              <User className="w-4 h-4" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-red-600 cursor-pointer hover:text-red-700"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
