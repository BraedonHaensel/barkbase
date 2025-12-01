'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { dogDetailsSchema } from '@/lib/schemas/dog';
import { dateToAge, dateToLocalYMD } from '@/lib/utils';
import { DogSize } from '@/enums/dog-size';
import { Dog } from '@/types/dog';
import { useEffect } from 'react';

// Schema for the dog details form
type DogSchema = z.infer<typeof dogDetailsSchema>;

type Props = {
  dog: Dog;
};

// Form to view the details of a dog in a booking
const DogDetailsForm = ({ dog }: Props) => {
  // Form initialization
  let form = useForm<DogSchema>({
    resolver: zodResolver(dogDetailsSchema),
    defaultValues: {
      name: dog.name,
      birthDate: dog.birthDate,
      size: dog.size,
      imageUrl: dog.imageUrl,
      breeds: dog.breeds.join(', '),
    },
  });

  form.watch();

  useEffect(() => {
    form.reset({
      name: dog.name,
      birthDate: dog.birthDate,
      size: dog.size,
      imageUrl: dog.imageUrl,
      breeds: dog.breeds.join(', '),
    });
  }, [dog]);

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        {/* Dog image field */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormControl>
                <img
                  src={field.value}
                  alt="Profile image preview"
                  className="my-auto aspect-square w-full object-cover"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="my-auto w-1/2 space-y-5">
          {/* Name field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <Input readOnly {...field} />
              </FormItem>
            )}
          />

          {/* Date of birth field */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input
                    className="w-50"
                    readOnly
                    value={dateToLocalYMD(field.value)}
                  />
                </FormControl>
                <FormDescription>
                  ({dateToAge(field.value)} old)
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Size field */}
          <FormField
            control={form.control}
            name="size"
            render={({ field: { value } }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Input
                  readOnly
                  value={
                    value === DogSize.SMALL
                      ? 'Small (0-15 lbs)'
                      : value === DogSize.MEDIUM
                        ? 'Medium (16-40 lbs)'
                        : 'Large (41+ lbs)'
                  }
                />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Breeds field */}
      <FormField
        control={form.control}
        name="breeds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Breeds</FormLabel>
            <Input readOnly {...field} />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DogDetailsForm;
