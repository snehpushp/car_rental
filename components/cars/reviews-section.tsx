'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Review } from '@/lib/types/database';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface ReviewsSectionProps {
  reviews?: Review[];
}

export function ReviewsSection({ reviews = [] }: ReviewsSectionProps) {
  const [visibleReviews, setVisibleReviews] = useState(5);

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No reviews yet for this car.</p>
      </div>
    );
  }

  const handleShowMore = () => {
    setVisibleReviews((prev) => prev + 5);
  };

  return (
    <div>
      <ul className="space-y-6">
        {reviews.slice(0, visibleReviews).map((review) => (
          <li key={review.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={review.customer?.avatar_url || ''} alt={review.customer?.full_name || ''} />
              <AvatarFallback>{review.customer?.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{review.customer?.full_name}</h4>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(review.created_at), 'MMM dd, yyyy')}
                </p>
              </div>
              <p className="mt-2 text-muted-foreground">{review.comment}</p>
            </div>
          </li>
        ))}
      </ul>
      {visibleReviews < reviews.length && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={handleShowMore}>
            Show More Reviews
          </Button>
        </div>
      )}
    </div>
  );
} 