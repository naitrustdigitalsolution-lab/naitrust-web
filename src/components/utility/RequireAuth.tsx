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
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for the persisted auth store to hydrate before deciding,
  // to avoid a flash-redirect for already-logged-in users.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
