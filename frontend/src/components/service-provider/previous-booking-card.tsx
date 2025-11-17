'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import BookingForm from '@/components/booking-form';
import { ServiceType } from '@/enums/service-type';
import { Footprints, House } from 'lucide-react';
import BookingSPProfile from '@/components/booking-sp-nav';

type Props = {
  booking: Booking;
};

// Card for dispalying a service provider's previous booking
const PreviousBookingCard = ({ booking }: Props) => {
  return (
    <Card className="min-w-[450px] border-3">
      <CardHeader className="flex h-10 items-center justify-between">
        <CardTitle className="min-w-fit text-xl font-bold">
          {booking.serviceType === ServiceType.WALKING ? (
            <div className="flex gap-2">
              <Footprints /> <span>DOG WALK</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <House /> <span>DOG SITTING</span>
            </div>
          )}
        </CardTitle>
        <CardTitle className="flex h-full text-xl">
          <div className="flex items-center gap-2">
            {/* TODO get owner details */}
            <BookingSPProfile
              spDetails={{
                firstName: 'John',
                lastName: 'Doe',
                email: 'jdoe@gmail.com',
                imageUrl:
                  'http://127.0.0.1:5000/static/images/users/3549e957-3b4d-43f7-b790-f230597a1711.jpg',
                rating: 4,
              }}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BookingForm booking={booking} />
      </CardContent>
    </Card>
  );
};

export default PreviousBookingCard;
