import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dashboard card to create a booking
const CreateBookingCard = () => {
  const router = useRouter();

  return (
    <Card
      className="border-3 hover:cursor-pointer hover:opacity-60"
      onClick={() => router.push('owner/create-booking')}
    >
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-2xl font-bold">Create a Booking</CardTitle>
        <SquareArrowOutUpRight size={32} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Create a new booking for your dogs!
        </p>
      </CardContent>
    </Card>
  );
};

export default CreateBookingCard;
