import { ChevronRight, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { getAppImage } from '../../../libs/images/image-manifest';
import { marketSuppliers, marketplaceApi } from '../../../libs/marketplace/marketplace.api';
import { WorkspaceEmpty } from './WorkspaceEmpty';
import { WorkspaceHeader } from './WorkspaceHeader';

export function OrdersWorkspace() {
  const navigate = useNavigate();
  const orders = marketplaceApi.listOrders();
  return (
    <div className="mx-auto w-full max-w-6xl">
      <WorkspaceHeader
        eyebrow="Wholesale orders"
        title="Follow every supplier order independently"
        description="Production, agent checks, payment readiness, consolidation, shipping, and delivery stay connected to the correct supplier order."
        icon={Package}
        image={getAppImage('orders', 'A wholesale order moving through supplier and delivery stages')}
      />
      {orders.length === 0 ? (
        <WorkspaceEmpty icon={Package} title="No orders yet" description="Accepted supplier quotes appear here as separate orders." actionLabel="View quotes" onAction={() => navigate('/app/quotes')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const supplier = marketSuppliers.find((candidate) => candidate.id === order.supplierId);
            return (
              <Card key={order.id} className="flex flex-col rounded-2xl p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <Badge>{order.deliveryMode === 'international' ? 'China import' : 'Nigeria local'}</Badge>
                  <Badge variant="outline" className="capitalize">{order.status.replace(/_/g, ' ')}</Badge>
                </div>
                <h2 className="mt-4 font-bold">{supplier?.name ?? 'Supplier order'}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{order.reference}</p>
                <div className="mt-5 flex flex-1 items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Current stage</p>
                    <p className="mt-1 text-sm font-semibold capitalize">{order.status.replace(/_/g, ' ')}</p>
                  </div>
                  <Button variant="ghost" className="rounded-full" onClick={() => navigate(`/app/orders/${order.id}`)}>Open <ChevronRight size={14} /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
