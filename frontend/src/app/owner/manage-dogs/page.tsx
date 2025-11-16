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
import { dateToLocalYMD } from '@/lib/utils';

// Manage dogs page
export default function ManageDogsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dogs, setDogs] = useState<Array<Dog>>([]);
  const [isEditingADog, setIsEditingADog] = useState(false);
  const { session } = useContext(SessionContext);

  // A session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  // Fetch all of the owner's dogs from the API
  const getDogs = async () => {
    setIsLoading(true);
    api
      .get('/dogs/me', {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse each dog from the response
        const newDogs: Array<Dog> = [];
        const data = response.data;
        data.forEach((dog: any) => {
          const dogData: Dog = {
            name: dog.name,
            birthDate: new Date(dog.birth_date),
            size: DogSize[dog.size.toUpperCase() as keyof typeof DogSize],
            imageUrl: dog.image_url,
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

  // Create a new dog
  const createDog = async (dogData: Dog, imageFile: File) => {
    // Use a FormData to handle uploading the dog image file
    const formData = new FormData();
    formData.append('name', dogData.name);
    // Use the local time's YYYY-MM-DD as the birth date
    formData.append('birth_date', dateToLocalYMD(dogData.birthDate));
    formData.append('size', dogData.size);
    formData.append('image_file', imageFile);
    // Add an item for each breed
    dogData.breeds.forEach((breed) => {
      formData.append('breeds', breed);
    });
    api
      .post('/dogs', formData, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        toast.success(response.data.message);
        // Refresh the owner's dogs
        getDogs();
        setIsEditingADog(false);
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
      });
  };

  // Update the details for an existing dog
  const updateDog = async (
    oldName: string,
    newDogData: Dog,
    imageFile: File | undefined
  ) => {
    // Check if this is a new dog
    if (oldName === '') {
      if (imageFile === undefined) {
        toast.error('Image error. Please upload a new image');
      } else {
        // This is a new dog, use a POST request to create it
        createDog(newDogData, imageFile);
      }
      return;
    }

    // Updating an existing dog
    // Use a FormData to handle uploading the dog image file
    const formData = new FormData();
    formData.append('name', newDogData.name);
    // Use the local time's YYYY-MM-DD as the birth date
    formData.append('birth_date', dateToLocalYMD(newDogData.birthDate));
    formData.append('size', newDogData.size);
    if (imageFile) formData.append('image_file', imageFile);
    // Add an item for each breed
    newDogData.breeds.forEach((breed) => {
      formData.append('breeds', breed);
    });
    // Add old_name field if the dog's name changed
    if (oldName !== newDogData.name) {
      formData.append('old_name', oldName);
    }
    api
      .put('/dogs', formData, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        toast.success(response.data.message);
        // Refresh the owner's dogs
        getDogs();
        setIsEditingADog(false);
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
      });
  };

  // Delete a dog
  const deleteDog = async (name: string) => {
    if (name === '') {
      // This is the newest dog. Delete it directly
      setDogs((prevDogs) => {
        return prevDogs.slice(0, -1);
      });
      toast.success('Dog successfully deleted');
      setIsEditingADog(false);
      return;
    }
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
        // Refresh the owner's dogs
        getDogs();
        setIsEditingADog(false);
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
      });
  };

  if (isLoading) {
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
  }

  return (
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
            isEditingADog={isEditingADog}
            setIsEditingADog={setIsEditingADog}
            updateDog={updateDog}
            deleteDog={deleteDog}
          />
        ))}
        {/* Add new dogs button */}
        <div
          className={`flex min-h-50 items-center justify-center ${dogs.length % 2 == 0 && 'md:col-span-2'}`}
        >
          <SquarePlus
            className="text-teal-600 hover:cursor-pointer hover:opacity-60"
            size={50}
            onClick={() => {
              // Check for max number of dogs
              if (dogs.length >= 10) {
                toast.warning('Maximum number of dogs reached!');
                return;
              }

              // Check if another dog is currently being edited
              if (isEditingADog) {
                toast.warning(
                  'Finish editing all dogs before adding a new one!'
                );
                return;
              }

              // Check if the previous dog is new and needs to be saved first
              if (dogs.length >= 1 && dogs[dogs.length - 1].name === '') {
                toast.warning('Save the previous dog before adding a new one!');
                return;
              }

              setDogs((prevDogs) => {
                const newDog: Dog = {
                  name: '',
                  birthDate: new Date(),
                  size: DogSize.MEDIUM,
                  imageUrl: '',
                  breeds: [],
                };
                return [...prevDogs, newDog];
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
