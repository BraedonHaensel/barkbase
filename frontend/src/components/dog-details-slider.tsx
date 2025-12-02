'use client';

import { SessionContext } from '@/context/session-context';
import { DogDto } from '@/dto/dto';
import { DogSize } from '@/enums/dog-size';
import api from '@/lib/api';
import { Dog } from '@/types/dog';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import DogDetailsForm from './dog-details-form';
import { Button } from './ui/button';
import { AccountType } from '@/enums/account-type';

type Props = {
  ownerEmail: string;
  dogNames: Array<string>;
};

const DogDetailsSlider = ({ ownerEmail, dogNames }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dogDetails, setDogDetails] = useState<Array<Dog>>([]);
  const { session } = useContext(SessionContext);
  const [dogIndex, setDogIndex] = useState(0);

  // Fetch all of the owner's dog details from the API
  const getDogDetails = async () => {
    setIsLoading(true);
    api
      .get(
        `/dogs/${session?.accountType === AccountType.OWNER ? 'me' : ownerEmail}`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      )
      .then((response) => {
        // Parse each dog from the response
        const newDogs: Array<Dog> = [];
        const data: Array<DogDto> = response.data;
        data.forEach((dog) => {
          const dogData: Dog = {
            name: dog.name,
            birthDate: new Date(dog.birth_date),
            size: DogSize[dog.size.toUpperCase() as keyof typeof DogSize],
            imageUrl: dog.image_url,
            breeds: dog.breeds,
          };
          if (dogNames.includes(dogData.name)) {
            newDogs.push(dogData);
          }
        });
        setDogDetails(newDogs);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get dog details: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get dog details. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getDogDetails();
  }, []);

  const nextDog = () => {
    setDogIndex(Math.min(dogDetails.length - 1, dogIndex + 1));
  };

  const previousDog = () => {
    setDogIndex(Math.max(0, dogIndex - 1));
  };

  if (isLoading || dogDetails.length == 0) {
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
  }

  return (
    <div className="space-y-4 border-3 p-2">
      {/* Dog details section for current dog index */}
      <DogDetailsForm dog={dogDetails[dogIndex]} />

      {/* Navigation arrows */}
      {dogDetails.length > 1 && (
        <div className="flex gap-4 pr-4">
          <Button
            type="button"
            variant="secondary"
            className="w-1/2"
            onClick={previousDog}
            disabled={dogIndex <= 0}
          >
            <div>
              <ChevronLeft className="h-8! w-8!" />
            </div>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-1/2"
            onClick={nextDog}
            disabled={dogIndex >= dogDetails.length - 1}
          >
            <div>
              <ChevronRight className="h-8! w-8!" />
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default DogDetailsSlider;
