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

  useEffect(() => {
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
              birth_date: new Date(dog.birth_date),
              size: DogSize[dog.size.toUpperCase() as keyof typeof DogSize],
              breeds: dog.breeds,
            };
            console.log(`Parsed dog: ${JSON.stringify(dogData)}`);
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

    getDogs();
  }, []);

  // TODO refresh method passed to children?
  // TODO limit dogs to 10

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
              <DogCard key={id} dog={dog} />
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
