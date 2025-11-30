'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import BookingForm from '@/components/booking-form';
import { ServiceType } from '@/enums/service-type';
import { Footprints, House } from 'lucide-react';
import BookingProfileIcon from '@/components/booking-profile-icon';
import { AccountType } from '@/enums/account-type';

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
            <p className="truncate">
              {booking.firstName} {(booking.lastName ?? '').charAt(0)}.
            </p>
            <BookingProfileIcon
              userDetails={{
                accountType: AccountType.OWNER,
                firstName: booking.firstName ?? '',
                lastName: booking.lastName ?? '',
                email: booking.oEmail,
                phoneNumber: booking.phoneNumber ?? '',
                imageUrl: booking.imageUrl ?? '',
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
