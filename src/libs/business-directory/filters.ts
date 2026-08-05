import type { BusinessProfile } from '../store/types';

export type BusinessDirectorySort = 'trusted' | 'rating' | 'activity' | 'name';

export interface BusinessDirectoryFilters {
  query: string;
  category: string;
  location: string;
  minimumRating: number;
  sort: BusinessDirectorySort;
}

export const BUSINESS_DIRECTORY_SORT_OPTIONS: ReadonlyArray<{
  value: BusinessDirectorySort;
  label: string;
}> = [
  { value: 'trusted', label: 'Most trusted' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'activity', label: 'Most completed deals' },
  { value: 'name', label: 'Business name' },
];

export const BUSINESS_DIRECTORY_RATING_OPTIONS = [
  { value: '0', label: 'Any rating' },
  { value: '4', label: '4.0 and above' },
  { value: '4.5', label: '4.5 and above' },
] as const;

export function businessDirectoryCategories(businesses: readonly BusinessProfile[]): string[] {
  return [...new Set(businesses.map((business) => business.category).filter(Boolean))].sort();
}

export function businessDirectoryLocations(businesses: readonly BusinessProfile[]): string[] {
  return [...new Set(businesses.map((business) => business.state || business.city).filter(Boolean) as string[])].sort();
}

export function filterBusinessDirectory(
  businesses: readonly BusinessProfile[],
  filters: BusinessDirectoryFilters,
): BusinessProfile[] {
  const filtered = businesses.filter((business) => {
    const location = business.state || business.city || '';
    const term = filters.query.trim().toLowerCase();
    const matchesQuery = !term || [
      business.name,
      business.ntId,
      business.email,
      business.phone,
      business.category,
      business.city,
      business.state,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(term));
    return (
      matchesQuery &&
      (filters.category === 'all' || business.category === filters.category) &&
      (filters.location === 'all' || location === filters.location) &&
      (business.ratingAverage ?? 0) >= filters.minimumRating
    );
  });

  return filtered.sort((left, right) => {
    if (filters.sort === 'name') return left.name.localeCompare(right.name);
    if (filters.sort === 'rating') return (right.ratingAverage ?? 0) - (left.ratingAverage ?? 0);
    if (filters.sort === 'activity') {
      return (right.completedProtectedTransactions ?? 0) - (left.completedProtectedTransactions ?? 0);
    }
    const leftTrust = (left.ratingAverage ?? 0) * (left.completionRatePercent ?? 0);
    const rightTrust = (right.ratingAverage ?? 0) * (right.completionRatePercent ?? 0);
    return rightTrust - leftTrust;
  });
}
