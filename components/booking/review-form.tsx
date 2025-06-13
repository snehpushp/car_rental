'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReviewCreateRequest } from '@/lib/types/database';

const reviewFormSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500, 'Comment must be at most 500 characters').optional().or(z.literal('')),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
    bookingId: string;
    carId: string;
    onReviewSubmit: () => void;
}

export function ReviewForm({ bookingId, carId, onReviewSubmit }: ReviewFormProps) {
    const router = useRouter();
    const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    const reviewData: ReviewCreateRequest = {
        booking_id: bookingId,
        rating: data.rating,
        comment: data.comment || undefined
    }

    const promise = fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
    }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to submit review.');
        }
        return data;
    });

    toast.promise(promise, {
        loading: 'Submitting review...',
        success: () => {
            onReviewSubmit();
            router.refresh();
            return 'Review submitted successfully!';
        },
        error: (err) => err.message || 'Failed to submit review.'
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                "h-8 w-8 cursor-pointer",
                                (hoverRating || field.value) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            )}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => field.onChange(star)}
                        />
                    ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about your experience..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Form>
  );
} 