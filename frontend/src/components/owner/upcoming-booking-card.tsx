import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OUpcomingBooking } from '@/types/booking';
import OUpcomingBookingForm from './upcoming-booking-form';
import { ServiceType } from '@/enums/service-type';
import { Footprints, House, Timer } from 'lucide-react';

type Props = {
  booking: OUpcomingBooking;
};

// Owner upcoming booking card
const OUpcomingBookingCard = ({ booking }: Props) => {
  return (
    <Card className="border-3">
      <CardHeader className="flex justify-between">
        <CardTitle className="text-xl font-bold">
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
        <CardTitle className="flex gap-2 text-xl font-bold">
          {/* TODO Status / Provider icon / Provider star rating? */}
          PENDING <Timer />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OUpcomingBookingForm booking={booking} />
      </CardContent>
    </Card>
  );
};

export default OUpcomingBookingCard;
