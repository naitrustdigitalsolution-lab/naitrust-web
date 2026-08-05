import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { BusinessTransactionReview } from '../../../libs/business-reviews/types';
import { Button } from '../../ui/button';

interface BusinessReviewFeedProps {
  reviews: BusinessTransactionReview[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function BusinessReviewFeed({
  reviews,
  page,
  pageSize,
  onPageChange,
}: BusinessReviewFeedProps) {
  const pageCount = Math.max(1, Math.ceil(reviews.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const visibleReviews = reviews.slice(pageStart, pageStart + pageSize);

  if (reviews.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No transaction-backed customer reviews yet.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
        {visibleReviews.map((review) => (
          <article key={review.id} className="border-b p-4 last:border-b-0 sm:p-5">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {review.reviewerName.split(' ').map((word) => word[0]).slice(0, 2).join('')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{review.reviewerName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Completed Naitrust transaction · {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={13}
                        className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}
                      />
                    ))}
                  </span>
                </div>
                {review.comment && <p className="mt-3 text-sm leading-6 text-foreground/80">{review.comment}</p>}
                {review.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {review.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Page {page} of {pageCount}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={page === 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={page === pageCount}
              onClick={() => onPageChange(Math.min(pageCount, page + 1))}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

