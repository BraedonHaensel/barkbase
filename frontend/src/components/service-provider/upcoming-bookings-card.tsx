import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookUp2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const UpcomingBookingsCard = () => {
  const router = useRouter();

  return (
    <Card
      className="border-3 hover:cursor-pointer hover:opacity-60"
      onClick={() => router.push('service-provider/upcoming-bookings')}
    >
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-2xl font-bold">Upcoming Bookings</CardTitle>
        <BookUp2 size={32} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          View the details of upcoming bookings!
        </p>
        <span className="text-muted-foreground">
          <br />
          TODO: Show a booking preview
        </span>
      </CardContent>
    </Card>
  );
};

export default UpcomingBookingsCard;
