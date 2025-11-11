import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OUpcomingBooking } from '@/types/booking';
import { Label } from '../ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import DatePicker from '../date-picker';
import { oUpcomingBookingSchema } from '@/lib/schemas/bookings';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// Form schema for an owner upcoming booking
type OUpcomingBookingSchema = z.infer<typeof oUpcomingBookingSchema>;

type Props = {
  booking: OUpcomingBooking;
};

// Owner upcoming booking card
const OUpcomingBookingForm = ({ booking }: Props) => {
  // Initialize the form
  const form = useForm<OUpcomingBookingSchema>({
    resolver: zodResolver(oUpcomingBookingSchema),
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
              <FormLabel>Booked dogs</FormLabel>
              <Input value={value.join(', ')} onChange={() => {}} />
            </FormItem>
          )}
        />

        <FormLabel>Start date</FormLabel>
        <div className="flex gap-4">
          {/* Start date field */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field: { value } }) => (
              <FormItem>
                <FormControl>
                  <DatePicker value={value} onChange={() => {}} />
                </FormControl>
              </FormItem>
            )}
          />
          {/* Start time field */}
          <FormField
            control={form.control}
            name="startTime"
            render={({ field: { value } }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="time"
                    id="time-picker"
                    step="60"
                    value={value}
                    onChange={() => {}}
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
            render={({ field: { value } }) => (
              <FormItem>
                <FormControl>
                  <DatePicker value={value} onChange={() => {}} />
                </FormControl>
              </FormItem>
            )}
          />
          {/* End time field */}
          <FormField
            control={form.control}
            name="endTime"
            render={({ field: { value } }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="time"
                    id="time-picker"
                    step="60"
                    value={value}
                    onChange={() => {}}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Street field */}
        <FormField
          control={form.control}
          name="street"
          render={({ field: { value } }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <Input value={value} onChange={() => {}} />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          {/* City field */}
          <FormField
            control={form.control}
            name="city"
            render={({ field: { value } }) => (
              <FormItem className="w-1/2">
                <FormLabel>City</FormLabel>
                <Input value={value} onChange={() => {}} />
              </FormItem>
            )}
          />
          {/* Province field */}
          <FormField
            control={form.control}
            name="province"
            render={({ field: { value } }) => (
              <FormItem className="w-1/2">
                <FormLabel>Province / Territory</FormLabel>
                <Input value={value} onChange={() => {}} />
              </FormItem>
            )}
          />
        </div>

        {/* Price field */}
        <FormField
          control={form.control}
          name="price"
          render={({ field: { value } }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <Input value={`${value} $`} onChange={() => {}} />
            </FormItem>
          )}
        />

        {/* Note field */}
        <FormField
          control={form.control}
          name="note"
          render={({ field: { value } }) => (
            <FormItem>
              <FormLabel>Booking notes</FormLabel>
              <Textarea value={value} onChange={() => {}} />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default OUpcomingBookingForm;
