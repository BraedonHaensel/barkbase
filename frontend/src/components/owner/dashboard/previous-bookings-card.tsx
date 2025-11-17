import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dashboard card to view previous bookings
const PreviousBookingsCard = () => {
  const router = useRouter();

  return (
    <Card
      className="border-3 hover:cursor-pointer hover:opacity-60"
      onClick={() => router.push('owner/previous-bookings')}
    >
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-2xl font-bold">Previous Bookings</CardTitle>
        <History size={32} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          View and write reviews for previous bookings!
        </p>
      </CardContent>
    </Card>
  );
};

export default PreviousBookingsCard;
