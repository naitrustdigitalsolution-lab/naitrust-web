import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { useBusinessSearch, usePublicBusiness } from '../../hooks/useBusinessDirectory';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import Spinner from '../ui/spinner';

function BusinessProfileView({ businessId }: { businessId: string }) {
  const navigate = useNavigate();
  const { data: business, isLoading } = usePublicBusiness(businessId);

  if (isLoading) return <div className="flex min-h-64 items-center justify-center"><Spinner size="lg" /></div>;
  if (!business) return <Card className="p-8 text-center">This verified business profile is not available.</Card>;

  return (
    <div className="mx-auto max-w-4xl">
      <button type="button" onClick={() => navigate('/app/businesses')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft size={16} /> Find businesses
      </button>
      <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
        <div className="bg-[#071b31] p-7 text-white sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold">
              {business.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{business.name}</h1>
                <BadgeCheck className="text-emerald-400" size={20} />
              </div>
              <p className="mt-1 text-sm text-white/65">{business.category} · {business.ntId}</p>
              {(business.city || business.state) && <p className="mt-2 flex items-center gap-1.5 text-sm text-white/75"><MapPin size={14} /> {[business.city, business.state].filter(Boolean).join(', ')}</p>}
            </div>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About this business</p>
            <p className="mt-2 max-w-2xl leading-7">{business.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button className="h-12 rounded-xl" onClick={() => navigate(`/pay/${business.slug ?? business.id}`)}>
              Pay business <ArrowRight size={17} className="ml-2" />
            </Button>
            <Button variant="outline" className="h-12 rounded-xl" onClick={() => navigate(`/app/deals/new?business=${business.id}&name=${encodeURIComponent(business.name)}&email=${encodeURIComponent(business.email ?? '')}`)}>
              <ShieldCheck size={17} className="mr-2" /> Start Protected Deal
            </Button>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">An ordinary payment is not protected. Choose “Start Protected Deal” when you need agreed terms, evidence, milestones, and controlled release.</p>
        </div>
      </Card>
    </div>
  );
}

export function BusinessDiscoveryPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data: businesses, isLoading } = useBusinessSearch(query);

  return (
    <DashboardLayout title={businessId ? 'Business profile' : 'Find a business'}>
      <div className="mx-auto w-full max-w-9xl">
        {businessId ? <BusinessProfileView businessId={businessId} /> : (
          <>
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Verified business directory</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">Find a business</h1>
              <p className="mt-1 text-sm text-muted-foreground">Search by business name, NT ID, phone number, location, or scan its Naitrust QR code.</p>
            </div>
            <div className="mb-6 flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 pl-10" placeholder="Business name, NT ID, phone or location" />
              </div>
              <Button variant="outline" className="h-12 px-4" title="Scan business QR"><QrCode size={19} /><span className="hidden sm:inline">Scan QR</span></Button>
            </div>
            {isLoading ? <div className="flex min-h-52 items-center justify-center"><Spinner /></div> : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {businesses?.map((business) => (
                  <Card key={business.id} className="rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 size={21} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5"><h2 className="truncate font-bold">{business.name}</h2><BadgeCheck size={16} className="shrink-0 text-emerald-600" /></div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{business.category}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <Badge variant="outline">{business.ntId}</Badge>
                      <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(`/app/businesses/${business.id}`)}>View profile <ArrowRight size={14} className="ml-1" /></Button>
                    </div>
                  </Card>
                ))}
                {businesses?.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">No verified businesses match that search.</Card>}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
