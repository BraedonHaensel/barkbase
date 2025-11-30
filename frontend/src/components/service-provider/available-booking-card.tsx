'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import BookingForm from '@/components/booking-form';
import { ServiceType } from '@/enums/service-type';
import {
  CheckLine,
  CircleUser,
  Footprints,
  House,
  LoaderCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type Props = {
  booking: Booking;
  onAccept: (id: string) => Promise<void>;
};

// Card for dispalying an available booking for a service provider to accept
const AvailableBookingCard = ({ booking, onAccept }: Props) => {
  const [isAccepting, setIsAccepting] = useState(false);

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
              {booking.firstName} {booking.lastName?.charAt(0)}.
            </p>
            <div className="aspect-square h-full">
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={booking.imageUrl}
                  alt="Profile image"
                  className="object-cover"
                />
                <AvatarFallback className="bg-white">
                  <CircleUser className="h-full w-full" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BookingForm booking={booking} />
        <div className="mt-4 flex justify-center">
          {/* Delete button */}
          <Button
            type="button"
            className="w-full"
            onClick={async () => {
              setIsAccepting(true);
              if (
                window.confirm('Are you sure you want to accept this booking?')
              ) {
                await onAccept(booking.id);
              }
              setIsAccepting(false);
            }}
          >
            {isAccepting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <>
                <p>Accept Booking</p> <CheckLine strokeWidth={3} />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableBookingCard;
