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
import { LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ServiceType } from '@/enums/service-type';
import { createBookingSchema } from '@/lib/schemas/bookings';
import DatePicker from '../date-picker';

// Form schema to create a booking
type CreateBookingSchema = z.infer<typeof createBookingSchema>;

// Form to create a booking
const CreateBookingForm = () => {
  const [stageNum, setStageNum] = useState(1);
  const router = useRouter();

  // Initialize the form
  const form = useForm<CreateBookingSchema>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      serviceType: ServiceType.WALKING,
      startDate: new Date(),
      startTime: '12:00',
      endDate: new Date(),
      endTime: '13:00',
    },
  });

  form.watch();

  // Create account request
  const { mutate: postCreateAccount, isPending } = useMutation({
    mutationFn: async (input: CreateBookingSchema) => {
      // TODO waiting for api
      const response = await api.post('/TODO', {
        booking_type: input.serviceType,
      });
      return response.data;
    },
  });

  // Handle form submission
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
        {/* First page of the form */}
        {stageNum === 1 && (
          <>
            {/* Service type field */}
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <div className="flex">
                    <Button
                      type="button"
                      className="w-1/2 rounded-none rounded-l-lg"
                      onClick={() => {
                        form.setValue(
                          'serviceType' as keyof CreateBookingSchema,
                          ServiceType.WALKING
                        );
                      }}
                      variant={
                        form.getValues(
                          'serviceType' as keyof CreateBookingSchema
                        ) === ServiceType.WALKING
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
                          'serviceType' as keyof CreateBookingSchema,
                          ServiceType.SITTING
                        );
                      }}
                      variant={
                        form.getValues(
                          'serviceType' as keyof CreateBookingSchema
                        ) === ServiceType.SITTING
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
            <div className="flex gap-4">
              {/* Start date field */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DatePicker blockPast {...field} />
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
            <div className="flex gap-4">
              {/* End date field */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DatePicker blockPast {...field} />
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

        {/* Second page of the form */}
        {stageNum === 2 && (
          <>
            {/* TODO: Dog selection, address, etc. */}

            <p>More stages TODO...</p>

            {/* Form submit button */}
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

        {/* Previous page button */}
        <Button
          type="button"
          disabled={stageNum <= 1}
          className="w-1/2 text-lg"
          onClick={() => setStageNum(stageNum - 1)}
          variant="link"
        >
          Previous
        </Button>

        {/* Next page button */}
        <Button
          type="button"
          disabled={stageNum >= 2}
          className="w-1/2 text-lg"
          onClick={async () => {
            const isValid = await form.trigger([
              'serviceType',
              'startDate',
              'startTime',
              'endDate',
              'endTime',
            ]);
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
