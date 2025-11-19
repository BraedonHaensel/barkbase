'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useEffect, useState } from 'react';
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
import { createEditBookingSchema } from '@/lib/schemas/bookings';
import DatePicker from '../date-picker';
import { SessionContext } from '@/context/session-context';
import { MultiSelect } from '../multi-select';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Province } from '@/enums/province';
import { dateToLocalYMD } from '@/lib/utils';
import { Booking } from '@/types/booking';
import { UserContext } from '@/context/user-context';
import { DogDto } from '@/dto/dto';

// Form schema to create or edit a booking
type CreateEditBookingSchema = z.infer<typeof createEditBookingSchema>;

type Props = {
  isEditingBooking?: boolean;
  bookingDetails?: Booking | undefined;
};

// Form to create or edit a booking
const CreateEditBookingForm = ({
  isEditingBooking = false,
  bookingDetails = undefined,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stageNum, setStageNum] = useState(1);
  const router = useRouter();
  const [dogNames, setDogNames] = useState<Array<string>>([]);
  const { session } = useContext(SessionContext);
  const { user } = useContext(UserContext);

  // Verify that the editingBooking and bookingDetails props are used together
  useEffect(() => {
    if (isEditingBooking && !bookingDetails) {
      console.error('Booking details must be supplied when in editing mode!');
      toast.error('Failed to edit booking. Please try again.');
      router.push('/dashboard');
    }
    if (!isEditingBooking && bookingDetails) {
      console.error(
        'Editing booking flag must be set when a booking is being edited'
      );
      toast.error('Failed to edit booking. Please try again.');
      router.push('/dashboard');
    }
  }, [isEditingBooking, bookingDetails]);

  // Fetch all of the owner's dog names from the API
  const getDogNames = async () => {
    setIsLoading(true);
    api
      .get('/dogs/me', {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse each dog name from the response
        const newDogNames: Array<string> = [];
        const data: Array<DogDto> = response.data;
        data.forEach((dog) => {
          newDogNames.push(dog.name);
        });
        if (newDogNames.length == 0) {
          toast.error(
            'No dogs! You need at least one dog to create a booking!'
          );
          router.push('/owner/manage-dogs');
        }
        setDogNames(newDogNames);
        setIsLoading(false);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get dogs: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get dogs. Please try again.');
        }
        router.push('/dashboard');
      });
  };

  useEffect(() => {
    // Get owner's dogs to select for the booking
    getDogNames();
  }, []);

  // Initialize the form
  const form = useForm<CreateEditBookingSchema>({
    resolver: zodResolver(createEditBookingSchema),
    // Set the default values either from the provided booking to edit, or for a blank new booking
    defaultValues:
      isEditingBooking && bookingDetails
        ? {
            serviceType: bookingDetails.serviceType,
            startDate: bookingDetails.startDate,
            startTime: bookingDetails.startTime,
            endDate: bookingDetails.endDate,
            endTime: bookingDetails.endTime,
            dogNames: bookingDetails.dogNames,
            street: bookingDetails.street,
            city: bookingDetails.city,
            province: bookingDetails.province,
            price: String(bookingDetails.price),
            note: bookingDetails.note,
          }
        : {
            serviceType: ServiceType.WALKING,
            startDate: new Date(),
            startTime: '12:00',
            endDate: new Date(),
            endTime: '13:00',
            dogNames: [],
            street: user?.street,
            city: user?.city,
            province: user?.province,
            price: '',
            note: '',
          },
  });

  form.watch();

  // Update existing booking request
  const { mutate: postUpdateBooking, isPending: isUpdatePending } = useMutation(
    {
      mutationFn: async (input: CreateEditBookingSchema) => {
        const response = await api.put(
          `/bookings/${bookingDetails?.id}`,
          {
            service_type: input.serviceType,
            // Format the dates as "2025-10-30T14:30:00" in the local timezone
            start_datetime: `${dateToLocalYMD(input.startDate)}T${input.startTime}:00`,
            end_datetime: `${dateToLocalYMD(input.endDate)}T${input.endTime}:00`,
            dog_names: input.dogNames,
            street: input.street,
            city: input.city,
            province: input.province,
            price: input.price,
            note: input.note,
          },
          {
            headers: {
              Authorization: `Bearer ${session?.token}`,
            },
          }
        );
        return response.data;
      },
    }
  );

  // Create booking request
  const { mutate: postCreateBooking, isPending: isCreatePending } = useMutation(
    {
      mutationFn: async (input: CreateEditBookingSchema) => {
        const response = await api.post(
          '/bookings',
          {
            service_type: input.serviceType,
            // Format the dates as "2025-10-30T14:30:00" in the local timezone
            start_datetime: `${dateToLocalYMD(input.startDate)}T${input.startTime}:00`,
            end_datetime: `${dateToLocalYMD(input.endDate)}T${input.endTime}:00`,
            dog_names: input.dogNames,
            street: input.street,
            city: input.city,
            province: input.province,
            price: input.price,
            ...(input.note ? { note: input.note } : {}),
          },
          {
            headers: {
              Authorization: `Bearer ${session?.token}`,
            },
          }
        );
        return response.data;
      },
    }
  );

  const isPending = isUpdatePending || isCreatePending;

  // Handle form submission
  async function onSubmit(input: CreateEditBookingSchema) {
    if (isEditingBooking) {
      // Send request to update an existing booking
      postUpdateBooking(input, {
        onSuccess: ({ message }) => {
          console.info(message);
          toast.success('Booking updated!');
          router.push('/owner/upcoming-bookings');
        },
        onError: (error: any) => {
          const apiError = error?.response?.data?.error;
          if (apiError) {
            console.error(`API error: ${apiError}`);
            toast.error(`Failed to update booking: ${apiError}`);
          } else {
            console.error(error);
            toast.error('Failed to update booking. Please try again.');
          }
        },
      });
    } else {
      // Send request to create a new booking
      postCreateBooking(input, {
        onSuccess: ({ message }) => {
          console.info(message);
          toast.success('Booking created!');
          router.push('/owner/upcoming-bookings');
        },
        onError: (error: any) => {
          const apiError = error?.response?.data?.error;
          if (apiError) {
            console.error(`API error: ${apiError}`);
            toast.error(`Failed to create booking: ${apiError}`);
          } else {
            console.error(error);
            toast.error('Failed to create booking. Please try again.');
          }
        },
      });
    }
  }

  if (isLoading) {
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
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
                          'serviceType' as keyof CreateEditBookingSchema,
                          ServiceType.WALKING
                        );
                      }}
                      variant={
                        form.getValues(
                          'serviceType' as keyof CreateEditBookingSchema
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
                          'serviceType' as keyof CreateEditBookingSchema,
                          ServiceType.SITTING
                        );
                      }}
                      variant={
                        form.getValues(
                          'serviceType' as keyof CreateEditBookingSchema
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* Second page of the form */}
        {stageNum === 2 && (
          <>
            {/* Select dogs field */}
            <FormField
              control={form.control}
              name="dogNames"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Dogs</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={dogNames.map((name) => ({
                        value: name,
                        label: name,
                      }))}
                      onValueChange={onChange}
                      defaultValue={value}
                      placeholder="Select dogs..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Street field */}
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              {/* City field */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="h-full w-1/2">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Province field */}
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem className="h-full w-1/2">
                    <FormLabel>Province / Territory</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Province).map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* Third page of the form */}
        {stageNum === 3 && (
          <>
            {/* Price field */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Price ($)</FormLabel>
                  <FormControl>
                    <Input placeholder="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note field */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking notes (optional)</FormLabel>
                  <FormControl className="max-h-50 min-h-25">
                    <Textarea
                      placeholder="Additional details for the service providers..."
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
            <Button
              type="submit"
              className="w-full"
              disabled={stageNum < 2 || isPending}
            >
              {isPending ? (
                <LoaderCircle className="h-6! w-6! animate-spin" />
              ) : isEditingBooking ? (
                'Save Changes'
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
          disabled={stageNum >= 3}
          className="w-1/2 text-lg"
          onClick={async () => {
            const isValid = await form.trigger(
              stageNum === 1
                ? [
                    'serviceType',
                    'startDate',
                    'startTime',
                    'endDate',
                    'endTime',
                  ]
                : ['dogNames', 'street', 'city', 'province']
            );
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

export default CreateEditBookingForm;
