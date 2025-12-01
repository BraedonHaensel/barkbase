import { Booking } from '@/types/booking';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';
import { bookingSchema } from '@/lib/schemas/bookings';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { dateToLocalYMD } from '@/lib/utils';
import DogDetailsSlider from './dog-details-slider';

// Form schema for a general booking view
type BookingSchema = z.infer<typeof bookingSchema>;

type Props = {
  booking: Booking;
};

// General use form for displaying a booking
const BookingForm = ({ booking }: Props) => {
  // Initialize the form
  const form = useForm<BookingSchema>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { ...booking },
  });

  form.watch();

  return (
    <Form {...form}>
      <form className="space-y-5">
        {/* Dogs field */}
        <FormField
          control={form.control}
          name="dogNames"
          render={({ field: { value } }) => (
            <FormItem>
              <FormLabel>Booked dogs ({value.length})</FormLabel>
              <Input readOnly value={value.join(', ')} />
            </FormItem>
          )}
        />

        {/* Display a slider for each of the dog details */}
        <DogDetailsSlider
          ownerEmail={booking.oEmail}
          dogNames={booking.dogNames}
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
                  <Input readOnly value={dateToLocalYMD(field.value)} />
                </FormControl>
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
                  <Input readOnly type="time" step="60" value={field.value} />
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
                  <Input readOnly value={dateToLocalYMD(field.value)} />
                </FormControl>
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
                  <Input readOnly type="time" step="60" value={field.value} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Street field */}
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <Input readOnly value={field.value} />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          {/* City field */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>City</FormLabel>
                <Input readOnly value={field.value} />
              </FormItem>
            )}
          />
          {/* Province field */}
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Province / Territory</FormLabel>
                <Input readOnly value={field.value} />
              </FormItem>
            )}
          />
        </div>

        {/* Price field */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <Input readOnly value={`${field.value} $`} />
            </FormItem>
          )}
        />

        {/* Note field */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking notes</FormLabel>
              <Textarea readOnly placeholder="N/A" value={field.value} />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default BookingForm;
