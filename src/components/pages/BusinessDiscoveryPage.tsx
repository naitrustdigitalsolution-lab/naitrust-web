import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  QrCode,
  Search,
} from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { useBusinessSearch } from '../../hooks/useBusinessDirectory';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import Spinner from '../ui/spinner';
import { PublicTrustProfilePage } from './PublicTrustProfilePage';

export function BusinessDiscoveryPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data: businesses, isLoading } = useBusinessSearch(query);

  if (businessId) {
    return (
      <DashboardLayout title="Trust profile">
        <PublicTrustProfilePage businessIdentifier={businessId} embedded />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Find a business">
      <div className="mx-auto w-full max-w-9xl">
        <>
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Verified business directory</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">Find a business</h1>
              <p className="mt-1 text-sm text-muted-foreground">Search by business name, account number, email, phone number, location, or scan its Naitrust QR code.</p>
            </div>
            <div className="mb-6 flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 pl-10" placeholder="Business name, account number, email or phone" />
              </div>
              <Button variant="outline" className="h-12 px-4" title="Scan business QR"><QrCode size={19} /><span className="hidden sm:inline">Scan QR</span></Button>
            </div>
            {isLoading ? <div className="flex min-h-52 items-center justify-center"><Spinner /></div> : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {businesses?.map((business) => (
                  <Card key={business.id} className="group rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#071b31]/10 hover:bg-[#c4e9fdb3] hover:text-[#071b31] hover:shadow-md focus-within:border-[#071b31]/10 focus-within:bg-[#c4e9fdb3] dark:hover:border-primary/20 dark:hover:bg-primary/10 dark:hover:text-foreground dark:focus-within:border-primary/20 dark:focus-within:bg-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 size={21} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5"><h2 className="truncate font-bold">{business.name}</h2><BadgeCheck size={16} className="shrink-0 text-emerald-600" /></div>
                        <p className="mt-1 truncate text-xs text-muted-foreground group-hover:text-[#35546f] group-focus-within:text-[#35546f] dark:group-hover:text-muted-foreground dark:group-focus-within:text-muted-foreground">{business.category}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <Badge variant="outline">{business.ntId}</Badge>
                      <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(`/app/businesses/${business.id}`)}>View profile <ArrowRight size={14} className="ml-1" /></Button>
                    </div>
                  </Card>
                ))}
                {businesses?.length === 0 && <Card className="border-[#071b31]/10 bg-[#c4e9fdb3] p-8 text-center text-sm text-[#35546f] shadow-sm dark:border-primary/20 dark:bg-primary/10 dark:text-muted-foreground md:col-span-2 xl:col-span-3">No verified businesses match that search.</Card>}
              </div>
            )}
          </>
      </div>
    </DashboardLayout>
  );
}
