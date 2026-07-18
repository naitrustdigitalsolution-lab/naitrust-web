/**
 * DashboardPage
 * First authenticated screen (`/app`): greeting, deal/reputation stat tiles,
 * quick actions, deals needing the user's attention, and the full deal list.
 * Owns the transactions and reputation queries; child components are purely
 * presentational.
 */

import { useNavigate } from 'react-router-dom';
import { Plus, Inbox, BadgeCheck, ScanFace } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { SecurityReminders } from '../pieces/dashboard/SecurityReminders';
import { SecureAccountModal } from '../pieces/security/SecureAccountModal';
import { BusinessVerificationModal } from '../pieces/business/BusinessVerificationModal';
import { StatTiles } from '../pieces/dashboard/StatTiles';
import { ActivityChart } from '../pieces/dashboard/ActivityChart';
import { DealBreakdown } from '../pieces/dashboard/DealBreakdown';
import { PendingActions } from '../pieces/dashboard/PendingActions';
import { TransactionList } from '../pieces/dashboard/TransactionList';
import { useTransactions } from '../../hooks/useTransactions';
import { useReputation } from '../../hooks/useReputation';
import { useSecurity } from '../../hooks/useSecurity';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import { useAuth } from '../../libs/auth-context';
import { accountTypeLabel, accountTypeOf } from '../../libs/utils/account';
import { summarizeDeals, dealsNeedingAction } from '../../libs/utils/safe-deal-presentation';
import type { SafeDealSummary } from '../../libs/store/types';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const security = useSecurity();
  const { data: business } = useMyBusiness();
  const { data: deals, isLoading, isError } = useTransactions();
  const { data: reputation, isLoading: isReputationLoading } = useReputation();

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';
  const accountType = accountTypeOf(user);
  const counts = deals ? summarizeDeals(deals) : undefined;
  const actionItems = deals ? dealsNeedingAction(deals) : [];
  const currency = deals?.[0]?.currency ?? 'NGN';

  const handleCreateDeal = () => {
    navigate('/app/deals/new');
  };

  const handleOpenDeal = (deal: SafeDealSummary) => {
    navigate(`/app/deals/${deal.id}`);
  };

  const handleViewInvitations = () => {
    navigate('/app/invitations');
  };

  return (
    <DashboardLayout title="Dashboard">
      <BusinessVerificationModal />
      <SecureAccountModal />
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {firstName}
              </h1>
              <Badge variant="outline">{accountTypeLabel(accountType)}</Badge>
              {security.kycStatus === 'verified' && (
                <Badge variant="success" className="gap-1">
                  <BadgeCheck size={12} />
                  Verified
                </Badge>
              )}
              {security.livenessFresh && (
                <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400">
                  <ScanFace size={12} />
                  Liveness ok
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {accountType === 'business'
                ? business?.name
                  ? `Managing property transactions for ${business.name}.`
                  : 'Manage your property transactions, payment records, and supporting evidence in one place.'
                : 'Here is where your property transactions, payments, and supporting evidence stand today.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleViewInvitations} variant="outline" className="rounded-full">
              <Inbox size={16} className="mr-1" />
              Invitations
            </Button>
            <Button onClick={handleCreateDeal} className="rounded-full">
              <Plus size={16} className="mr-1" />
              New property transaction
            </Button>
          </div>
        </div>

        <SecurityReminders />

        <StatTiles
          counts={counts}
          reputation={reputation}
          isLoading={isLoading || isReputationLoading}
          currency={currency}
        />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <ActivityChart deals={deals} isLoading={isLoading} currency={currency} />
          <DealBreakdown deals={deals} isLoading={isLoading} currency={currency} />
        </div>

        <PendingActions deals={actionItems} onSelect={handleOpenDeal} />

        <div>
          <h2 className="text-lg font-bold text-foreground">Your property transactions</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Protected transactions with terms, funding status, and evidence in one place.
          </p>
        </div>

        <TransactionList
          deals={deals}
          isLoading={isLoading}
          isError={isError}
          onCreate={handleCreateDeal}
          onSelect={handleOpenDeal}
        />
      </div>
    </DashboardLayout>
  );
}
