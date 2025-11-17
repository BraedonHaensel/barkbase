'use client';

import BookingCard from '@/components/booking-card';
import { SessionContext } from '@/context/session-context';
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

// Find bookings page for service providers to find new bookings
export default function FindBookingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Array<Booking>>([]);
  const { session } = useContext(SessionContext);

  // A service provider session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.SERVICE_PROVIDER) {
      redirect('/login');
    }
  }, [session]);

  // Fetch all of the available bookings from the API
  const getAvailableBookings = async () => {
    setIsLoading(true);
    api
      .get('/bookings/available', {
        params: {
          when: 'upcoming',
        },
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse each available booking from the response
        const newBookings: Array<Booking> = [];
        const data = response.data;
        data.forEach((booking: any) => {
          const bookingData: Booking = {
            id: booking.id,
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
            price: booking.price,
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
    getAvailableBookings();
  }, []);

  if (isLoading) {
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        Available Bookings
      </p>
      {bookings.length == 0 ? (
        <div className="flex justify-center">
          <p className="text-muted-foreground">No available bookings.</p>
        </div>
      ) : (
        <div
          className={
            bookings.length == 1
              ? 'mx-auto w-1/2'
              : 'grid min-w-[400px] gap-6 lg:grid-cols-2'
          }
        >
          {/* Render a card for each upcoming booking */}
          {bookings.map((booking, id) => (
            <BookingCard
              key={id}
              booking={booking}
              onDelete={async () => {
                /* TODO */
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
