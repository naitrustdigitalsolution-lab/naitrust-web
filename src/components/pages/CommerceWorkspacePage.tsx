import { useLocation, useParams } from 'react-router-dom';
import { CartWorkspace } from '../../features/commerce/components/CartWorkspace';
import { OrderRoom } from '../../features/commerce/components/OrderRoom';
import { OrdersWorkspace } from '../../features/commerce/components/OrdersWorkspace';
import { QuotesWorkspace } from '../../features/commerce/components/QuotesWorkspace';
import { marketplaceApi } from '../../libs/marketplace/marketplace.api';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';

export function CommerceWorkspacePage() {
  const { pathname } = useLocation();
  const { orderId } = useParams<{ orderId?: string }>();
  const order = orderId ? marketplaceApi.listOrders().find((candidate) => candidate.id === orderId) : undefined;

  if (order) return <DashboardLayout title="Order room"><OrderRoom order={order} /></DashboardLayout>;
  if (pathname === '/app/cart') return <DashboardLayout title="Cart"><CartWorkspace /></DashboardLayout>;
  if (pathname === '/app/quotes') return <DashboardLayout title="Quotes"><QuotesWorkspace /></DashboardLayout>;
  return <DashboardLayout title="Orders"><OrdersWorkspace /></DashboardLayout>;
}
