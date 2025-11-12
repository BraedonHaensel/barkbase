'use client';

import DogCard from '@/components/owner/dog-card';
import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { DogSize } from '@/enums/dog-size';
import api from '@/lib/api';
import { LoaderCircle, SquarePlus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dog } from '@/types/dog';
import { dateToIsoStringYMD } from '@/lib/utils';

// Manage dogs page
export default function ManageDogsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dogs, setDogs] = useState<Array<Dog>>([]);
  const { session } = useContext(SessionContext);

  // A session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  const getDogs = async () => {
    setIsLoading(true);
    api
      .get('/dogs/me', {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse dog information fields from the response
        const newDogs: Array<Dog> = [];
        const data = response.data;
        data.forEach((dog: any) => {
          const dogData: Dog = {
            name: dog.name,
            birthDate: new Date(dog.birth_date),
            size: DogSize[dog.size.toUpperCase() as keyof typeof DogSize],
            breeds: dog.breeds,
          };
          newDogs.push(dogData);
        });
        setDogs(newDogs);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get dogs: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get dogs. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getDogs();
  }, []);

  // TODO limit dogs to 10

  const updateDog = async (oldName: string, newDogData: Dog) => {
    // TODO if name is '' then it's a new dog, do a post!

    setIsLoading(true);
    const payload: any = {
      name: newDogData.name,
      birth_date: dateToIsoStringYMD(newDogData.birthDate),
      size: newDogData.size,
      breeds: newDogData.breeds,
    };
    // Add old_name field if the dog's name changed
    if (oldName !== newDogData.name) {
      payload.old_name = oldName;
    }
    api
      .put('/dogs', payload, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to save changes: ${apiError}`);
        } else {
          console.error(error);
          toast.error(`Failed to save changes. Please try again.`);
        }
      })
      .finally(() => {
        // Refresh the owner's dogs
        getDogs();
      });
  };

  useEffect(() => {
    getDogs();
  }, []);

  const deleteDog = async (name: string) => {
    setIsLoading(true);
    api
      .delete('/dogs', {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
        data: {
          name,
        },
      })
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to delete: ${apiError}`);
        } else {
          console.error(error);
          toast.error(`Failed to delete. Please try again.`);
        }
      })
      .finally(() => {
        // Refresh the owner's dogs
        getDogs();
      });
  };

  return (
    <>
      {isLoading ? (
        <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Page title */}
          <p style={{ fontSize: '35px' }} className="text-center font-bold">
            Dog Manager
          </p>
          <div className="grid min-w-[400px] gap-6 md:grid-cols-2">
            {/* Render a card for each dog */}
            {dogs.map((dog, id) => (
              <DogCard
                key={id}
                dog={dog}
                updateDog={updateDog}
                deleteDog={deleteDog}
              />
            ))}
            {/* Add new dogs button */}
            <div
              className={`flex min-h-50 items-center justify-center ${dogs.length % 2 == 0 && 'col-span-2 mx-auto w-1/2'}`}
              onClick={() => {
                console.log('TODO add new dog...');
              }}
            >
              <SquarePlus
                className="text-teal-600 hover:cursor-pointer hover:opacity-60"
                size={50}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
