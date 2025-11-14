import { Card, CardContent } from '@/components/ui/card';
import DogCardForm from './dog-card-form';
import { useState } from 'react';
import { Dog } from '@/types/dog';
import { toast } from 'sonner';

type Props = {
  dog: Dog;
  isEditingADog: boolean;
  setIsEditingADog: React.Dispatch<React.SetStateAction<boolean>>; // Called to notify parent when this card is being edited
  updateDog: (
    oldName: string,
    newDogData: Dog,
    imageFile: File | undefined
  ) => Promise<void>;
  deleteDog: (name: string) => Promise<void>;
};

// Base card to view and manage the dog of an owner
const DogCard = ({
  dog,
  isEditingADog,
  setIsEditingADog,
  updateDog,
  deleteDog,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card
      className={`border-3 ${isEditing ? 'border-teal-400/50' : 'hover:cursor-pointer hover:opacity-60'}`}
      onClick={() => {
        if (!isEditing) {
          // Check if another dog is already being edited
          if (isEditingADog) {
            toast.warning('Only one dog can be edited at a time!');
          } else {
            setIsEditing(true);
            setIsEditingADog(true);
          }
        }
      }}
    >
      <CardContent>
        <DogCardForm
          dog={dog}
          isEditing={isEditing}
          setIsEditing={(val) => {
            setIsEditing(val);
            setIsEditingADog(val);
          }}
          updateDog={updateDog}
          deleteDog={deleteDog}
        />
      </CardContent>
    </Card>
  );
};

export default DogCard;
