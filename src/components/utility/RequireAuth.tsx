import { accountSuspended } from '../../features/legal/access';
import { useLegalRefresh } from '../../features/legal/hooks';
/**
 * RequireAuth
 * Route guard for the authenticated `/app` area.
 * Renders child routes via <Outlet /> when authenticated; otherwise redirects
 * to /login, preserving the attempted location in router state so the login
 * flow can send the user back after success.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../libs/auth-context';
import Spinner from '../ui/spinner';

export function RequireAuth() {
  useLegalRefresh();
  const { user, logout, isAuthenticated, isLoading, isHydrated } = useAuth();
  const location = useLocation();

  // Wait for the persisted auth store to hydrate before deciding,
  // to avoid a flash-redirect for already-logged-in users.
  if (!isHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (accountSuspended(user?.id)) return <div className="mx-auto max-w-lg space-y-4 p-8"><h1 className="text-xl font-semibold">Account suspended</h1><p>Contact Naitrust support for help. Your existing deal and payment records are preserved.</p><button className="underline" onClick={() => void logout()}>Sign out</button></div>;
  return <Outlet />;
}
