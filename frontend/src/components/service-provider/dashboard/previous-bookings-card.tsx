import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Previous bookings dashboard card
const PreviousBookingsCard = () => {
  const router = useRouter();

  return (
    <Card
      className="border-3 hover:cursor-pointer hover:opacity-60"
      onClick={() => router.push('service-provider/previous-bookings')}
    >
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-2xl font-bold">Previous Bookings</CardTitle>
        <History size={32} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          View your previuosly completed bookings!
        </p>
      </CardContent>
    </Card>
  );
};

export default PreviousBookingsCard;
