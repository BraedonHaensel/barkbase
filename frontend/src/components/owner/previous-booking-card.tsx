'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import BookingForm from '@/components/booking-form';
import { ServiceType } from '@/enums/service-type';
import { Footprints, House, PencilLine } from 'lucide-react';
import BookingSPProfile from '@/components/booking-sp-nav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import CreateReviewForm from './create-review-form';

type Props = {
  booking: Booking;
};

// Card for dispalying an owner's previous booking
const PreviousBookingCard = ({ booking }: Props) => {
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
            {/* TODO get sp details */}
            <p className="truncate">John D.</p>
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
        <Dialog>
          <form>
            <DialogTrigger asChild>
              {/* Review button */}
              <Button className="mt-4 w-full">
                <p>Write a Review</p> <PencilLine />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">
                  Write a Review
                </DialogTitle>
              </DialogHeader>
              <CreateReviewForm booking={booking} />
            </DialogContent>
          </form>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PreviousBookingCard;
