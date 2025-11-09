import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FindBookingsCard = () => {
  const router = useRouter();

  return (
    <Card
      className="border-3 hover:cursor-pointer hover:opacity-60"
      onClick={() => router.push('service-provider/find-bookings')}
    >
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-2xl font-bold">Find New Bookings</CardTitle>
        <TextSearch size={32} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Search for new dog walking and sitting bookings!
        </p>
      </CardContent>
    </Card>
  );
};

export default FindBookingsCard;
