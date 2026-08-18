import { Navigate, useNavigate } from 'react-router-dom';
import { CustomerDashboardHome } from '../pieces/dashboard/CustomerDashboardHome';
import { BusinessDashboardHome } from '../pieces/dashboard/BusinessDashboardHome';
import { useAuth } from '../../libs/auth-context';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import { useSecurity } from '../../hooks/useSecurity';
import { useTransactions } from '../../hooks/useTransactions';
import { useWallet } from '../../hooks/useWallet';
import { useInvitations } from '../../hooks/useInvitations';
import { accountTypeOf } from '../../libs/utils/account';
import type { SafeDealSummary } from '../../libs/store/types';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const security = useSecurity();
  const { data: business, isLoading: businessLoading } = useMyBusiness();
  const { data: deals, isLoading: dealsLoading, isError: dealsError } = useTransactions();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: invitations } = useInvitations();
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';
  const openDeal = (deal: SafeDealSummary) => navigate(`/app/deals/${deal.id}`);

  if (accountTypeOf(user) === 'admin') return <Navigate to="/app/admin/overview" replace />;

  if (accountTypeOf(user) === 'customer') {
    return <CustomerDashboardHome
      firstName={firstName}
      identityVerified={security.kycStatus === 'verified'}
      wallet={wallet}
      walletLoading={walletLoading}
      deals={deals}
      dealsLoading={dealsLoading}
      dealsError={dealsError}
      invitations={invitations}
      onOpenDeal={openDeal}
    />;
  }

  return <BusinessDashboardHome
    firstName={firstName}
    businessName={business?.name ?? 'Your business'}
    verified={security.kycStatus === 'verified'}
    businessLoading={businessLoading}
    wallet={wallet}
    walletLoading={walletLoading}
    deals={deals}
    dealsLoading={dealsLoading}
    dealsError={dealsError}
    onOpenDeal={openDeal}
  />;
}
