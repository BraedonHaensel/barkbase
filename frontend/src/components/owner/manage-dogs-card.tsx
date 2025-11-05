import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dog } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ManageDogsCard = () => {
  const router = useRouter();

  return (
    <Card
      className="border-3 hover:cursor-pointer hover:opacity-60"
      onClick={() => router.push('owner/manage-dogs')}
    >
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-2xl font-bold">Manage Your Dogs</CardTitle>
        <Dog size={32} />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Add new dogs and update their information!
        </p>
      </CardContent>
    </Card>
  );
};

export default ManageDogsCard;
