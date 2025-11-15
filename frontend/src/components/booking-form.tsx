import { Booking } from '@/types/booking';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';
import DatePicker from './date-picker';
import { bookingSchema } from '@/lib/schemas/bookings';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Edit, LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Form schema for a general booking view
type BookingSchema = z.infer<typeof bookingSchema>;

type Props = {
  booking: Booking;
  onDelete: (id: string) => Promise<void>;
};

// General use form for displaying a booking
const BookingForm = ({ booking, onDelete }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

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
              <Textarea
                placeholder="No notes."
                value={value}
                onChange={() => {}}
              />
            </FormItem>
          )}
        />

        <div className="mx-2 flex justify-center gap-4">
          {/* Edit button */}
          <Button type="button" className="w-1/2" onClick={() => {}}>
            Edit <Edit />
          </Button>

          {/* Delete button */}
          <Button
            type="button"
            className="bg-destructive/30 w-1/2"
            variant="destructive"
            onClick={async () => {
              setIsDeleting(true);
              if (window.confirm('Are you sure you want to delete?')) {
                await onDelete(booking.id);
              }
              setIsDeleting(false);
            }}
          >
            {isDeleting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <>
                <p>Delete</p> <Trash2 />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingForm;
