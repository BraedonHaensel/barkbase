'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import BookingForm from '@/components/booking-form';
import { ServiceType } from '@/enums/service-type';
import {
  Edit,
  Footprints,
  House,
  LoaderCircle,
  Timer,
  Trash2,
} from 'lucide-react';
import BookingProfileIcon from '@/components/booking-profile-icon';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { AccountType } from '@/enums/account-type';

type Props = {
  booking: Booking;
  onDelete: (id: string) => Promise<void>;
};

// Card for dispalying an owner's upcoming booking
const UpcomingBookingCard = ({ booking, onDelete }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

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
          {booking.spEmail ? (
            <div className="flex items-center gap-2">
              <p>ACCEPTED</p>
              <BookingProfileIcon
                userDetails={{
                  accountType: AccountType.SERVICE_PROVIDER,
                  firstName: booking.firstName ?? '',
                  lastName: booking.lastName ?? '',
                  email: booking.spEmail,
                  phoneNumber: booking.phoneNumber ?? '',
                  imageUrl: booking.imageUrl ?? '',
                }}
              />
            </div>
          ) : (
            <div className="flex h-full items-center gap-2">
              <p>PENDING</p>
              <Timer />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BookingForm booking={booking} />
        <div className="mx-2 mt-4 flex justify-center gap-4">
          {/* Edit button */}
          <Button
            type="button"
            className="w-1/2"
            onClick={() => {
              redirect(`/owner/edit-booking/${booking.id}`);
            }}
          >
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
      </CardContent>
    </Card>
  );
};

export default UpcomingBookingCard;
