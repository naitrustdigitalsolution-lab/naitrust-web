import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { useBusinessSearch } from '../../hooks/useBusinessDirectory';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import Spinner from '../ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PublicTrustProfilePage } from './PublicTrustProfilePage';
import {
  BUSINESS_DIRECTORY_RATING_OPTIONS,
  BUSINESS_DIRECTORY_SORT_OPTIONS,
  businessDirectoryCategories,
  businessDirectoryLocations,
  filterBusinessDirectory,
  type BusinessDirectorySort,
} from '../../libs/business-directory/filters';

export function BusinessDiscoveryPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [minimumRating, setMinimumRating] = useState('0');
  const [sort, setSort] = useState<BusinessDirectorySort>('trusted');
  const { data: businesses = [], isLoading } = useBusinessSearch('');
  const categories = useMemo(() => businessDirectoryCategories(businesses), [businesses]);
  const locations = useMemo(() => businessDirectoryLocations(businesses), [businesses]);
  const filteredBusinesses = useMemo(
    () => filterBusinessDirectory(businesses, {
      query,
      category,
      location,
      minimumRating: Number(minimumRating),
      sort,
    }),
    [businesses, category, location, minimumRating, query, sort],
  );
  const hasFilters = Boolean(query.trim()) || category !== 'all' || location !== 'all' || minimumRating !== '0';

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setLocation('all');
    setMinimumRating('0');
    setSort('trusted');
  };

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
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Verified business directory</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Find a business</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Search verified businesses by name, category, location, Naitrust ID, email, or phone number.</p>
        </div>

        <Card className="mb-6 gap-4 rounded-2xl p-4 shadow-sm sm:p-5">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 pl-10" placeholder="Business name, Naitrust ID, email, or phone" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All locations" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={minimumRating} onValueChange={setMinimumRating}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Any rating" /></SelectTrigger>
              <SelectContent>
                {BUSINESS_DIRECTORY_RATING_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(value) => setSort(value as BusinessDirectorySort)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Sort businesses" /></SelectTrigger>
              <SelectContent>
                {BUSINESS_DIRECTORY_SORT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal size={15} /> {filteredBusinesses.length} verified {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
          </p>
          {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X size={14} className="mr-1" /> Clear filters</Button>}
        </div>

        {isLoading ? <div className="flex min-h-52 items-center justify-center"><Spinner /></div> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="group rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#071b31]/10 hover:bg-[#c4e9fdb3] hover:text-[#071b31] hover:shadow-md focus-within:border-[#071b31]/10 focus-within:bg-[#c4e9fdb3] dark:hover:border-primary/20 dark:hover:bg-primary/10 dark:hover:text-foreground dark:focus-within:border-primary/20 dark:focus-within:bg-primary/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 size={21} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5"><h2 className="truncate font-bold">{business.name}</h2><BadgeCheck size={16} className="shrink-0 text-emerald-600" /></div>
                    <p className="mt-1 truncate text-xs text-muted-foreground group-hover:text-[#35546f] group-focus-within:text-[#35546f] dark:group-hover:text-muted-foreground dark:group-focus-within:text-muted-foreground">{business.category}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground group-hover:text-[#35546f] dark:group-hover:text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin size={13} /> {business.city || business.state}</span>
                  <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {business.ratingAverage?.toFixed(1) ?? 'Not available'}</span>
                  <span>{business.completedProtectedTransactions ?? 0} completed deals</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <Badge variant="outline">{business.ntId}</Badge>
                  <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(`/app/businesses/${business.id}`)}>View profile <ArrowRight size={14} className="ml-1" /></Button>
                </div>
              </Card>
            ))}
            {filteredBusinesses.length === 0 && <Card className="border-[#071b31]/10 bg-[#c4e9fdb3] p-8 text-center text-sm text-[#35546f] shadow-sm dark:border-primary/20 dark:bg-primary/10 dark:text-muted-foreground md:col-span-2 xl:col-span-3">No verified businesses match these filters.</Card>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
