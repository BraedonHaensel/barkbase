'use client';

import PreviousBookingCard from '@/components/owner/previous-booking-card';
import { SessionContext } from '@/context/session-context';
import { BookingDto } from '@/dto/dto';
import { AccountType } from '@/enums/account-type';
import { Province } from '@/enums/province';
import { ServiceType } from '@/enums/service-type';
import api from '@/lib/api';
import { getHMFromIsoString } from '@/lib/utils';
import { Booking } from '@/types/booking';
import { LoaderCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Previous bookings page
export default function PreviousBookingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Array<Booking>>([]);
  const { session } = useContext(SessionContext);

  // An owner session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  // Fetch all of the owner's past bookings from the API
  const getPastBookings = async () => {
    setIsLoading(true);
    api
      .get('/bookings/me', {
        params: {
          when: 'past',
        },
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse each upcoming booking from the response
        const newBookings: Array<Booking> = [];
        const data: Array<BookingDto> = response.data;
        data.forEach((booking) => {
          const bookingData: Booking = {
            id: booking.id,
            oEmail: booking.o_email,
            serviceType:
              ServiceType[booking.service_type as keyof typeof ServiceType],
            // Parse the start and end dates and times from the local ISO strings
            startDate: new Date(booking.start_datetime),
            startTime: getHMFromIsoString(booking.start_datetime),
            endDate: new Date(booking.end_datetime),
            endTime: getHMFromIsoString(booking.end_datetime),
            dogNames: booking.dog_names,
            street: booking.street,
            city: booking.city,
            province: Province[booking.province as keyof typeof Province],
            price: String(booking.price),
            note: booking.note,
            spEmail: booking.sp_email,
          };
          newBookings.push(bookingData);
        });
        setBookings(newBookings);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get bookings: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get bookings. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getPastBookings();
  }, []);

  if (isLoading) {
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        Previous Bookings
      </p>
      {bookings.length == 0 ? (
        <div className="flex justify-center">
          <p className="text-muted-foreground">No previous bookings.</p>
        </div>
      ) : (
        <div
          className={
            bookings.length == 1
              ? 'mx-auto w-1/2'
              : 'grid min-w-[400px] gap-6 lg:grid-cols-2'
          }
        >
          {/* Render a card for each prevous booking */}
          {bookings.map((booking, id) => (
            <PreviousBookingCard key={id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
