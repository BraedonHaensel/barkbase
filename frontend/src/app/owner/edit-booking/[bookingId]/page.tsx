'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { redirect, useParams, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateEditBookingForm from '@/components/owner/create-edit-booking-form';
import { LoaderCircle } from 'lucide-react';
import api from '@/lib/api';
import { Booking } from '@/types/booking';
import { ServiceType } from '@/enums/service-type';
import { getHMFromIsoString } from '@/lib/utils';
import { Province } from '@/enums/province';
import { toast } from 'sonner';
import { BookingDto } from '@/dto/dto';
import CenteredPageContainer from '@/components/centered-page-container';

// Page to edit an existing booking
export default function EditBookingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const { bookingId } = useParams<{ bookingId: string }>();
  const { session } = useContext(SessionContext);
  const router = useRouter();

  // An owner session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  // Fetch the desired booking from the API
  const findBooking = async () => {
    setIsLoading(true);
    api
      .get('/bookings/me', {
        params: {
          when: 'upcoming',
        },
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse each upcoming booking from the response
        let foundBooking: Booking | undefined = undefined;
        const data: Array<BookingDto> = response.data;
        data.forEach((booking) => {
          // Search for the booking with the given bookingId
          if (booking.id != bookingId) {
            return;
          }
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
          foundBooking = bookingData;
        });
        if (foundBooking) {
          setBooking(foundBooking);
          setIsLoading(false);
        } else {
          toast.error('Failed to find the booking');
          router.push('/dashboard');
        }
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
        router.push('/dashboard');
      });
  };

  useEffect(() => {
    findBooking();
  }, []);

  if (isLoading) {
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
  }

  return (
    <CenteredPageContainer>
      <Card className="w-[450px] px-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Edit Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateEditBookingForm
            isEditingBooking={true}
            bookingDetails={booking}
          />
        </CardContent>
      </Card>
    </CenteredPageContainer>
  );
}
