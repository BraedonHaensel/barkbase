'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import BookingForm from '@/components/booking-form';
import { ServiceType } from '@/enums/service-type';
import { Footprints, House } from 'lucide-react';
import BookingProfileIcon from '@/components/booking-profile-icon';

type Props = {
  booking: Booking;
};

// Card for dispalying a service provider's previous booking
const PreviousBookingCard = ({ booking }: Props) => {
  return (
    <Card className="min-w-[450px] border-3">
      <CardHeader className="flex h-10 items-center justify-between">
        <CardTitle className="grid w-full grid-cols-2 text-xl font-bold">
          {booking.serviceType === ServiceType.WALKING ? (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Footprints /> <span>DOG WALK</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <House /> <span>DOG SITTING</span>
            </div>
          )}
          <div className="flex h-10 items-center justify-end gap-4">
            {/* TODO get sp details */}
            <p className="truncate">John D.</p>
            <BookingProfileIcon
              userDetails={{
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
