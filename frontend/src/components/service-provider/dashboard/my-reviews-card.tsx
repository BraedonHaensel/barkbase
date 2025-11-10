import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

// My reviews dashboard card
const MyReviewsCard = () => {
  const router = useRouter();

  return (
    <Card
      className="border-3 hover:cursor-pointer hover:opacity-60"
      onClick={() => router.push('service-provider/my-reviews')}
    >
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-2xl font-bold">My Reviews</CardTitle>
        <Star size={32} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">View your reviews from owners!</p>
      </CardContent>
    </Card>
  );
};

export default MyReviewsCard;
