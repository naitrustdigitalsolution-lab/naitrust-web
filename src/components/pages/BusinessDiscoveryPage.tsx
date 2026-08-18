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
  Bookmark,
  Copy,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { useBusinessSearch } from '../../hooks/useBusinessDirectory';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import Spinner from '../ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { PublicTrustProfilePage } from './PublicTrustProfilePage';
import {
  BUSINESS_DIRECTORY_RATING_OPTIONS,
  BUSINESS_DIRECTORY_SORT_OPTIONS,
  businessDirectoryCategories,
  businessDirectoryLocations,
  filterBusinessDirectory,
  type BusinessDirectorySort,
} from '../../libs/business-directory/filters';
import { useSavedBusinesses } from '../../hooks/useSavedBusinesses';
import { useAuth } from '../../libs/auth-context';
import { accountTypeOf } from '../../libs/utils/account';

export function BusinessDiscoveryPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasBusinessAccount = accountTypeOf(user) !== 'customer';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [minimumRating, setMinimumRating] = useState('0');
  const [sort, setSort] = useState<BusinessDirectorySort>('trusted');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { data: businesses = [], isLoading } = useBusinessSearch('');
  const { savedBusinessIds, toggleSavedBusiness } = useSavedBusinesses();
  const categories = useMemo(() => businessDirectoryCategories(businesses), [businesses]);
  const locations = useMemo(() => businessDirectoryLocations(businesses), [businesses]);
  const filteredBusinesses = useMemo(
    () => filterBusinessDirectory(businesses, {
      query,
      category,
      location,
      minimumRating: Number(minimumRating),
      sort,
    }).filter((business) => !showSavedOnly || savedBusinessIds.includes(business.id)),
    [businesses, category, location, minimumRating, query, savedBusinessIds, showSavedOnly, sort],
  );
  const hasFilters = Boolean(query.trim()) || category !== 'all' || location !== 'all' || minimumRating !== '0' || showSavedOnly;

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setLocation('all');
    setMinimumRating('0');
    setSort('trusted');
    setShowSavedOnly(false);
  };

  const copyBusinessValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
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
        <div className="mb-5 flex items-end justify-between gap-3 sm:mb-7">
          <div><p className="hidden text-xs font-bold uppercase tracking-[0.16em] text-primary sm:block">Verified business directory</p><h1 className="text-xl font-bold tracking-tight sm:mt-2 sm:text-2xl">Find a business</h1><p className="mt-1 hidden max-w-2xl text-sm leading-6 text-muted-foreground sm:block">Search verified businesses by name, category, location, Naitrust ID, email, or phone number.</p></div>
          <div className="flex items-center gap-1.5">
            {hasBusinessAccount && <Button variant="outline" size="icon" className="rounded-full sm:hidden" aria-label="View my Trust Profile" onClick={() => navigate('/app/trust-profile')}><BadgeCheck size={16} /></Button>}
            {hasBusinessAccount && <Button variant="outline" className="hidden rounded-full sm:inline-flex" onClick={() => navigate('/app/trust-profile')}><BadgeCheck size={15} /> My Trust Profile</Button>}
            <Button variant="outline" size="icon" className="rounded-full sm:hidden" aria-label="Search businesses" onClick={() => setShowMobileSearch((value) => !value)}><Search size={16} /></Button>
            <Button variant="outline" size="icon" className="relative rounded-full sm:hidden" aria-label="Filter businesses" onClick={() => setShowMobileFilters(true)}><SlidersHorizontal size={16} />{hasFilters && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}</Button>
            <Button variant={showSavedOnly ? 'default' : 'outline'} size="icon" className="relative rounded-full sm:hidden" aria-label="Show saved businesses" onClick={() => setShowSavedOnly((value) => !value)}><Bookmark size={15} className={showSavedOnly ? 'fill-current' : ''} />{savedBusinessIds.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-secondary px-1.5 text-[9px] text-secondary-foreground">{savedBusinessIds.length}</span>}</Button>
            <Button variant={showSavedOnly ? 'default' : 'outline'} className="hidden rounded-full sm:inline-flex" onClick={() => setShowSavedOnly((value) => !value)}><Bookmark size={15} className={showSavedOnly ? 'fill-current' : ''} /> Saved businesses <Badge variant="secondary" className="ml-1 rounded-full px-2">{savedBusinessIds.length}</Badge></Button>
          </div>
        </div>

        {showMobileSearch && <div className="relative mb-4 sm:hidden"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 pl-10" placeholder="Search businesses" /></div>}

        <Card className="mb-6 hidden gap-4 rounded-2xl p-4 shadow-sm sm:flex sm:p-5">
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
          <p className="text-xs text-muted-foreground sm:text-sm">
            {filteredBusinesses.length} verified {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
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
                    <div className="flex items-center gap-1.5"><h2 className="truncate font-bold">{business.name}</h2><BadgeCheck size={16} className="shrink-0 text-emerald-600" /><button type="button" className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Copy ${business.name}`} onClick={() => void copyBusinessValue(business.name, 'Business name')}><Copy size={13} /></button></div>
                    <p className="mt-1 truncate text-xs text-muted-foreground group-hover:text-[#35546f] group-focus-within:text-[#35546f] dark:group-hover:text-muted-foreground dark:group-focus-within:text-muted-foreground">{business.category}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground group-hover:text-[#35546f] dark:group-hover:text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin size={13} /> {business.city || business.state}</span>
                  <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {business.ratingAverage?.toFixed(1) ?? 'Not available'}</span>
                  <span>{business.completedProtectedTransactions ?? 0} completed deals</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-full border bg-background/70 pl-2.5 pr-1 text-xs font-medium"><span>{business.ntId}</span><button type="button" className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Copy ${business.ntId}`} onClick={() => void copyBusinessValue(business.ntId, 'Naitrust ID')}><Copy size={12} /></button></div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={savedBusinessIds.includes(business.id) ? `Remove ${business.name} from saved businesses` : `Save ${business.name}`} onClick={() => toggleSavedBusiness(business.id)}><Bookmark size={14} className={savedBusinessIds.includes(business.id) ? 'fill-primary text-primary' : ''} /></Button>
                    <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(`/app/businesses/${business.id}`)}>View profile <ArrowRight size={14} className="ml-1" /></Button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredBusinesses.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">No verified businesses match these filters.</div>}
          </div>
        )}
      </div>

      <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <SheetContent side="right" className="w-[88vw] max-w-sm">
          <SheetHeader>
            <SheetTitle>Filter businesses</SheetTitle>
            <SheetDescription>Narrow the directory by category, location, rating, or order.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 p-4">
            <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-full"><SelectValue placeholder="All categories" /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
            <Select value={location} onValueChange={setLocation}><SelectTrigger className="w-full"><SelectValue placeholder="All locations" /></SelectTrigger><SelectContent><SelectItem value="all">All locations</SelectItem>{locations.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
            <Select value={minimumRating} onValueChange={setMinimumRating}><SelectTrigger className="w-full"><SelectValue placeholder="Any rating" /></SelectTrigger><SelectContent>{BUSINESS_DIRECTORY_RATING_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Select value={sort} onValueChange={(value) => setSort(value as BusinessDirectorySort)}><SelectTrigger className="w-full"><SelectValue placeholder="Sort businesses" /></SelectTrigger><SelectContent>{BUSINESS_DIRECTORY_SORT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <div className="flex gap-2 pt-2"><Button variant="outline" className="flex-1 rounded-full" onClick={clearFilters}>Reset</Button><Button className="flex-1 rounded-full" onClick={() => setShowMobileFilters(false)}>Show {filteredBusinesses.length}</Button></div>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
