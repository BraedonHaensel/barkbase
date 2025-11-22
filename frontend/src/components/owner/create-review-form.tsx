'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Star } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { SessionContext } from '@/context/session-context';
import { Textarea } from '../ui/textarea';
import { Booking } from '@/types/booking';
import { createReviewSchema } from '@/lib/schemas/review';
import { dateToLocalYMD } from '@/lib/utils';

// Form schema to create a review
type CreateReviewSchema = z.infer<typeof createReviewSchema>;

type Props = {
  booking: Booking;
};

// Form to create a review for a booking
const CreateReviewForm = ({ booking }: Props) => {
  const router = useRouter();
  const { session } = useContext(SessionContext);

  // Initialize the form
  const form = useForm<CreateReviewSchema>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 3,
      description: '',
    },
  });

  form.watch();

  // Create review request
  const { mutate: postCreateReview, isPending } = useMutation({
    mutationFn: async (input: CreateReviewSchema) => {
      const response = await api.post(
        `/bookings/${booking.id}`,
        {
          sp_email: booking.spEmail,
          service_type: booking.serviceType,
          date: dateToLocalYMD(new Date()),
          rating: input.rating,
          ...(input.description ? { description: input.description } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );
      return response.data;
    },
  });

  // Handle form submission
  async function onSubmit(input: CreateReviewSchema) {
    // Send request to create a new review
    postCreateReview(input, {
      onSuccess: ({ message }) => {
        console.info(message);
        toast.success('Review created!');
        router.push('/owner/previous-bookings');
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to create review: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to create review. Please try again.');
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Star rating selector */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl className="w-full">
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Star
                      key={num}
                      className="hover:opacity-40"
                      size={40}
                      fill={num <= value ? 'yellow' : '#111'}
                      onClick={() => {
                        onChange(num);
                      }}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl className="max-h-50 min-h-25">
                <Textarea
                  placeholder="Give a reason for your rating..."
                  {...field}
                  maxLength={1000}
                />
              </FormControl>
              <div className="text-muted-foreground text-right text-sm">
                {field.value ? field.value.length : 0}/{1000}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form submit button */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <LoaderCircle className="h-6! w-6! animate-spin" />
          ) : (
            <p>Create Review</p>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CreateReviewForm;
