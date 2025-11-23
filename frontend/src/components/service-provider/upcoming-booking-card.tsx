'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types/booking';
import BookingForm from '@/components/booking-form';
import { ServiceType } from '@/enums/service-type';
import { Footprints, House, LoaderCircle, ShieldUser } from 'lucide-react';
import BookingSPProfile from '@/components/booking-sp-nav';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import GetContactsDialogContent from './get-contacts-dialog-content';

type Props = {
  booking: Booking;
  onDecline: (id: string) => Promise<void>;
};

// Card for dispalying a service provider's upcoming booking
const UpcomingBookingCard = ({ booking, onDecline }: Props) => {
  const [isDeclining, setIsDeclining] = useState(false);
  const [isViewingContacts, setIsViewingContacts] = useState(false);

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
      <CardContent className="space-y-4">
        <BookingForm booking={booking} />

        {/* Decline button */}
        <Button
          type="button"
          className="bg-destructive/30 w-full"
          variant="destructive"
          onClick={async () => {
            setIsDeclining(true);
            if (
              window.confirm('Are you sure you want to decline this booking?')
            ) {
              await onDecline(booking.id);
            }
            setIsDeclining(false);
          }}
        >
          {isDeclining ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <>
              <p>Decline Booking</p>
            </>
          )}
        </Button>

        {/* Get emergency contacts button */}
        <Dialog open={isViewingContacts} onOpenChange={setIsViewingContacts}>
          <form>
            <DialogTrigger asChild>
              <Button className="w-full">
                <p>Get Emergency Contacts</p> <ShieldUser />
              </Button>
            </DialogTrigger>
            {isViewingContacts && (
              <GetContactsDialogContent ownerEmail={booking.oEmail} />
            )}
          </form>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UpcomingBookingCard;
