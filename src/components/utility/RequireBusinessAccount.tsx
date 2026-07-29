import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../libs/auth-context';
import { accountTypeOf } from '../../libs/utils/account';

export function RequireBusinessAccount({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (accountTypeOf(user) === 'customer') {
    return <Navigate to="/app" replace />;
  }
  return children;
}
