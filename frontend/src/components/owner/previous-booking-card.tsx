'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import BookingForm from '@/components/booking-form';
import { ServiceType } from '@/enums/service-type';
import { Footprints, House, PencilLine } from 'lucide-react';
import BookingProfileIcon from '@/components/booking-profile-icon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import CreateReviewForm from './create-review-form';
import { useState } from 'react';
import { AccountType } from '@/enums/account-type';

type Props = {
  booking: Booking;
};

// Card for dispalying an owner's previous booking
const PreviousBookingCard = ({ booking }: Props) => {
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);

  return (
    <Card className="min-w-[450px] border-3">
      <CardHeader>
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
                accountType: AccountType.SERVICE_PROVIDER,
                firstName: booking.firstName ?? '',
                lastName: booking.lastName ?? '',
                email: booking.spEmail,
                phoneNumber: booking.phoneNumber ?? '',
                imageUrl: booking.imageUrl ?? '',
              }}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BookingForm booking={booking} />

        {/* Review button */}
        <Dialog open={writeReviewOpen} onOpenChange={setWriteReviewOpen}>
          <form>
            <DialogTrigger asChild>
              <Button className="mt-4 w-full">
                <p>Write a Review</p> <PencilLine />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">
                  Write a Review
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Use this form to write a review.
                </DialogDescription>
              </DialogHeader>
              <CreateReviewForm
                booking={booking}
                setOpen={setWriteReviewOpen}
              />
            </DialogContent>
          </form>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PreviousBookingCard;
