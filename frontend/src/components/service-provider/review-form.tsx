'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Star } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { reviewSchema } from '@/lib/schemas/review';
import { Review } from '@/types/review';

// Form schema to view a review
type ReviewSchema = z.infer<typeof reviewSchema>;

type Props = {
  review: Review;
};

// Form to view a review
const ReviewForm = ({ review }: Props) => {
  // Initialize the form
  const form = useForm<ReviewSchema>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: review.starRating,
      description: review.description ?? '',
    },
  });

  form.watch();

  return (
    <Form {...form}>
      <form className="space-y-5">
        {/* Star rating */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field: { value } }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl className="w-full">
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Star
                      key={num}
                      size={40}
                      fill={num <= value ? 'yellow' : '#111'}
                    />
                  ))}
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Review description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field: { value } }) =>
            value ? (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl className="max-h-50 min-h-fit">
                  <Textarea
                    disabled
                    className="disabled:cursor-pointer disabled:opacity-100"
                    value={value}
                  />
                </FormControl>
              </FormItem>
            ) : (
              <></>
            )
          }
        />
      </form>
    </Form>
  );
};

export default ReviewForm;
