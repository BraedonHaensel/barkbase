import { Card, CardContent } from '@/components/ui/card';
import DogCardForm from './dog-card-form';
import { useState } from 'react';
import { Dog } from '@/types/dog';

type Props = {
  dog?: Dog;
};

// Base card to view and manage the dog of an owner
const DogCard = ({ dog }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  console.log(`Got dog in card: ${JSON.stringify(dog)}`);

  return (
    <Card
      className={`border-3 ${!isEditing && 'hover:cursor-pointer hover:opacity-60'}`}
      onClick={() => {
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
    >
      <CardContent>
        <DogCardForm
          dog={dog}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </CardContent>
    </Card>
  );
};

export default DogCard;
