import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import HomePage from '@/pages/shared/HomePage';
import ViceGovernorPage from '@/pages/shared/ViceGovernorPage';
import SangguniangPanlalawiganPage from '@/pages/shared/SangguniangPanlalawiganPage';
import ProvincialAdministratorPage from '@/pages/shared/ProvincialAdministratorPage';
import ProvincialTreasurerPage from '@/pages/shared/ProvincialTreasurerPage';
import ProvincialBudgetPage from '@/pages/shared/ProvincialBudgetPage';
import ProvincialAssessorPage from '@/pages/shared/ProvincialAssessorPage';
import ProvincialHealthPage from '@/pages/shared/ProvincialHealthPage';
import ProvincialEngineeringPage from '@/pages/shared/ProvincialEngineeringPage';
import ProvincialAgriculturePage from '@/pages/shared/ProvincialAgriculturePage';
import ProvincialLegalPage from '@/pages/shared/ProvincialLegalPage';
import ProvincialITPage from '@/pages/shared/ProvincialITPage';
import ProvincialGeneralServicesPage from '@/pages/shared/ProvincialGeneralServicesPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserDashboard from '@/pages/user/UserDashboard';

// Admin - Budget
import AdminObligationsPage from '@/pages/admin/budget/ObligationsPage';
import AdminBalancesPage from '@/pages/admin/budget/BalancesPage';
import AdminStatementPage from '@/pages/admin/budget/StatementPage';
import AdminPPAPage from '@/pages/admin/budget/PPAPage';
import BudgetTrashPage from '@/pages/admin/budget/BudgetTrashPage';
import BudgetReleasePage from '@/pages/admin/budget/BudgetReleasePage';
import UploadCenterPage from '@/pages/admin/upload/UploadCenterPage';
import RequestManagementPage from '@/pages/admin/requests/RequestManagementPage';
import UserManagementPage from '@/pages/admin/users/UserManagementPage';
import ProfilePage from '@/pages/shared/ProfilePage';
import SettingsPage from '@/pages/shared/SettingsPage';

// User - Budget
import UserObligationsPage from '@/pages/user/budget/ObligationsPage';
import UserBalancesPage from '@/pages/user/budget/BalancesPage';
import UserStatementPage from '@/pages/user/budget/StatementPage';
import UserPPAPage from '@/pages/user/budget/PPAPage';


// POPS Division
import POPSDashboard from '@/pages/pops/POPSDashboard';
import POPSOfficeTrackerPage from '@/pages/pops/POPSOfficeTrackerPage';

// ── Auth Guard ───────────────────────────────────────────────────
function RequireAuth({ role }: { role?: 'admin' | 'user' | 'pops' }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    const dest = user?.role === 'admin' ? '/admin/dashboard'
               : user?.role === 'pops'  ? '/pops/dashboard'
               : '/user/dashboard';
    return <Navigate to={dest} replace />;
  }
  return <Outlet />;
}

// ── Router ───────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <RootRedirect />,
  },

  // Public
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Admin routes
  {
    element: <RequireAuth role="admin" />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/admin/dashboard', element: <HomePage /> },
          { path: '/admin/services/vice-governor', element: <ViceGovernorPage /> },
          { path: '/admin/services/sangguniang-panlalawigan', element: <SangguniangPanlalawiganPage /> },
          { path: '/admin/services/provincial-administrator', element: <ProvincialAdministratorPage /> },
          { path: '/admin/services/provincial-treasurer', element: <ProvincialTreasurerPage /> },
          { path: '/admin/services/provincial-budget', element: <ProvincialBudgetPage /> },
          { path: '/admin/services/provincial-assessor', element: <ProvincialAssessorPage /> },
          { path: '/admin/services/provincial-health', element: <ProvincialHealthPage /> },
          { path: '/admin/services/provincial-engineering', element: <ProvincialEngineeringPage /> },
          { path: '/admin/services/provincial-agriculture', element: <ProvincialAgriculturePage /> },
          { path: '/admin/services/provincial-legal', element: <ProvincialLegalPage /> },
          { path: '/admin/services/provincial-it', element: <ProvincialITPage /> },
          { path: '/admin/services/general-services', element: <ProvincialGeneralServicesPage /> },
          { path: '/admin/budget/dashboard', element: <AdminDashboard /> },
          { path: '/admin/budget/obligations', element: <AdminObligationsPage /> },
          { path: '/admin/budget/balances', element: <AdminBalancesPage /> },
          { path: '/admin/budget/statement', element: <AdminStatementPage /> },
          { path: '/admin/budget/ppa', element: <AdminPPAPage /> },
          { path: '/admin/budget/trash', element: <BudgetTrashPage /> },
          { path: '/admin/budget/releases', element: <BudgetReleasePage /> },
          { path: '/admin/upload', element: <UploadCenterPage /> },
          { path: '/admin/requests', element: <RequestManagementPage /> },
          { path: '/admin/requests/all', element: <RequestManagementPage /> },
          { path: '/admin/requests/dtr', element: <RequestManagementPage /> },
          { path: '/admin/requests/atr', element: <RequestManagementPage /> },
          { path: '/admin/requests/leave', element: <RequestManagementPage /> },
          { path: '/admin/requests/obr', element: <RequestManagementPage /> },
          { path: '/admin/requests/pr', element: <RequestManagementPage /> },
          { path: '/admin/users', element: <UserManagementPage /> },
          { path: '/admin/profile', element: <ProfilePage /> },
          { path: '/admin/settings', element: <SettingsPage /> },
          { path: '/admin/*', element: <Navigate to="/admin/dashboard" replace /> },
        ],
      },
    ],
  },

  // User routes
  {
    element: <RequireAuth role="user" />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/user/dashboard', element: <HomePage /> },
          { path: '/user/services/vice-governor', element: <ViceGovernorPage /> },
          { path: '/user/services/sangguniang-panlalawigan', element: <SangguniangPanlalawiganPage /> },
          { path: '/user/services/provincial-administrator', element: <ProvincialAdministratorPage /> },
          { path: '/user/services/provincial-treasurer', element: <ProvincialTreasurerPage /> },
          { path: '/user/services/provincial-budget', element: <ProvincialBudgetPage /> },
          { path: '/user/services/provincial-assessor', element: <ProvincialAssessorPage /> },
          { path: '/user/services/provincial-health', element: <ProvincialHealthPage /> },
          { path: '/user/services/provincial-engineering', element: <ProvincialEngineeringPage /> },
          { path: '/user/services/provincial-agriculture', element: <ProvincialAgriculturePage /> },
          { path: '/user/services/provincial-legal', element: <ProvincialLegalPage /> },
          { path: '/user/services/provincial-it', element: <ProvincialITPage /> },
          { path: '/user/services/general-services', element: <ProvincialGeneralServicesPage /> },
          { path: '/user/budget/dashboard', element: <UserDashboard /> },
          { path: '/user/budget/obligations', element: <UserObligationsPage /> },
          { path: '/user/budget/balances', element: <UserBalancesPage /> },
          { path: '/user/budget/statement', element: <UserStatementPage /> },
          { path: '/user/budget/ppa', element: <UserPPAPage /> },
          { path: '/user/budget/trash', element: <BudgetTrashPage /> },
          { path: '/user/budget/releases', element: <BudgetReleasePage /> },
          { path: '/user/profile', element: <ProfilePage /> },
          { path: '/user/settings', element: <SettingsPage /> },
          { path: '/user/*', element: <Navigate to="/user/dashboard" replace /> },
        ],
      },
    ],
  },

  // POPS Division routes
  {
    element: <RequireAuth role="pops" />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/pops/dashboard',                element: <POPSDashboard /> },
          { path: '/pops/office/:officeKey',        element: <POPSOfficeTrackerPage /> },
          { path: '/pops/profile',                  element: <ProfilePage /> },
          { path: '/pops/settings',                 element: <SettingsPage /> },
          { path: '/pops/*',                        element: <Navigate to="/pops/dashboard" replace /> },
        ],
      },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/login" replace /> },
]);

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const dest = user?.role === 'admin' ? '/admin/dashboard'
             : user?.role === 'pops'  ? '/pops/dashboard'
             : '/user/dashboard';
  return <Navigate to={dest} replace />;
}
