import { Card, CardContent } from '../ui/card';
import DogCardForm from './dog-card-form';
import { useState } from 'react';

const DogCard = () => {
  const [isEditing, setIsEditing] = useState(false);

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
        <DogCardForm isEditing={isEditing} setIsEditing={setIsEditing} />
      </CardContent>
    </Card>
  );
};

export default DogCard;
