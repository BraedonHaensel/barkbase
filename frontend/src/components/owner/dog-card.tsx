import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DogCardForm from './dog-card-form';

const DogCard = () => {
  return (
    <Card className="border-3">
      <CardContent>
        <DogCardForm />
      </CardContent>
    </Card>
  );
};

export default DogCard;
