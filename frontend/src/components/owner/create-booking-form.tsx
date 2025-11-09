'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AccountType } from '@/enums/account-type';
import { LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { BookingType } from '@/enums/booking-type';
import { createBookingSchema } from '@/lib/schemas/create-booking';
import DatePicker from '../date-picker';

type CreateBookingSchema = z.infer<typeof createBookingSchema>;

const CreateBookingForm = () => {
  const [stageNum, setStageNum] = useState(1);
  const router = useRouter();

  const form = useForm<CreateBookingSchema>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      bookingType: BookingType.WALKING,
      startDate: new Date(),
      startTime: '12:00',
      endDate: new Date(),
      endTime: '13:00',
    },
  });

  form.watch();

  const { mutate: postCreateAccount, isPending } = useMutation({
    mutationFn: async (input: CreateBookingSchema) => {
      // TODO waiting for api
      const response = await api.post('/TODO', {
        booking_type: input.bookingType,
      });
      return response.data;
    },
  });

  function onSubmit(input: CreateBookingSchema) {
    console.log(input.startTime);
    postCreateAccount(input, {
      onSuccess: ({ message }) => {
        console.info(message);
        toast.success('Account created! Please log in.');
        router.push('/login');
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to create account: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to create account. Please try again.');
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {stageNum === 1 && (
          <>
            {/* Booking type field */}
            <FormField
              control={form.control}
              name="bookingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Type</FormLabel>
                  <div className="flex">
                    <Button
                      type="button"
                      className="w-1/2 rounded-none rounded-l-lg"
                      onClick={() => {
                        form.setValue(
                          'bookingType' as keyof CreateBookingSchema,
                          BookingType.WALKING
                        );
                      }}
                      variant={
                        form.getValues(
                          'bookingType' as keyof CreateBookingSchema
                        ) === BookingType.WALKING
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      Walking
                    </Button>
                    <Button
                      type="button"
                      className="w-1/2 rounded-none rounded-r-lg"
                      onClick={() => {
                        form.setValue(
                          'bookingType' as keyof CreateBookingSchema,
                          BookingType.SITTING
                        );
                      }}
                      variant={
                        form.getValues(
                          'bookingType' as keyof CreateBookingSchema
                        ) === BookingType.SITTING
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      Sitting
                    </Button>
                  </div>
                </FormItem>
              )}
            />

            <FormLabel>Start date</FormLabel>
            <div className="flex gap-2">
              {/* Start date field */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <DatePicker blockPast {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Start time field */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        id="time-picker"
                        step="60"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormLabel>End date</FormLabel>
            <div className="flex gap-2">
              {/* End date field */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <DatePicker blockPast {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* End time field */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        id="time-picker"
                        step="60"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {stageNum === 2 && (
          <>
            {/* TODO: Dog selection, address, etc. */}

            <p>More stages TODO...</p>

            <Button
              type="submit"
              className="w-full"
              disabled={stageNum < 2 || isPending}
              variant={stageNum === 2 ? 'default' : 'secondary'}
            >
              {isPending ? (
                <LoaderCircle className="h-6! w-6! animate-spin" />
              ) : (
                'Create Booking'
              )}
            </Button>
          </>
        )}

        <Button
          type="button"
          disabled={stageNum <= 1}
          className="w-1/2 text-lg"
          onClick={() => setStageNum(stageNum - 1)}
          variant="link"
        >
          Previous
        </Button>
        <Button
          type="button"
          disabled={stageNum >= 2}
          className="w-1/2 text-lg"
          onClick={async () => {
            const isValid = await form.trigger(['startDate', 'startTime']);
            if (isValid) {
              setStageNum(stageNum + 1);
            }
          }}
          variant="link"
        >
          Next
        </Button>
      </form>
    </Form>
  );
};

export default CreateBookingForm;
