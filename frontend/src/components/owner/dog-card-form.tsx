'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dogSchema } from '@/lib/schemas/dog';
import { LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import DatePicker from '../date-picker';
import { dateToAge } from '@/lib/utils';
import { DogSize } from '@/enums/dog-size';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DogSchema = z.infer<typeof dogSchema>;

type Props = {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

const DogCardForm = ({ isEditing, setIsEditing }: Props) => {
  const router = useRouter();

  // temporary dog
  const dog = {
    name: 'Chico',
    date: new Date('2024-11-03T07:00:00.000Z'),
    size: DogSize.MEDIUM,
    breeds: 'golden retriever, labrador',
  };

  const form = useForm<DogSchema>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: dog.name,
      date: dog.date,
      size: dog.size,
      breeds: dog.breeds,
    },
  });

  form.watch();

  const { mutate: postUpdateDog, isPending } = useMutation({
    mutationFn: async (input: DogSchema) => {
      //TODO: Format breeds as array?
      const response = await api.post('/TODO', {
        name: input.name,
        date: input.date,
        size: input.size,
        breeds: input.breeds,
      });
      return response.data;
    },
  });

  function onSubmit(input: DogSchema) {
    console.log(`Submitting:`, JSON.stringify(input));
    postUpdateDog(input, {
      onSuccess: ({ message }) => {
        console.info(message);
        toast.success('Saved changes.');
        // TODO: reload page? Call parent update function?
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to save changes: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to save changes. Please try again.');
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex h-20 w-20 items-center gap-10">
          [TODO Upload]
          <img src="https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*" />
        </div>

        {/* Name field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of birth field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <DatePicker {...field} />
                  {field.value && (
                    <p className="text-muted-foreground">
                      ({dateToAge(field.value)} old)
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Size field */}
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Citation: Size weights are taken from:
                   * Rover.com: Book Dog Boarding, Dog Walking and More. (n.d.). Rover.com. Retrieved November 8, 2025, https://www.rover.com/ca/
                   */}
                  <SelectItem value={DogSize.SMALL}>
                    Small (0-15 lbs)
                  </SelectItem>
                  <SelectItem value={DogSize.MEDIUM}>
                    Medium (16-40 lbs)
                  </SelectItem>
                  <SelectItem value={DogSize.LARGE}>Large (41+ lbs)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Breeds field */}
        <FormField
          control={form.control}
          name="breeds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breeds</FormLabel>
              <Input {...field} />
              <FormDescription>
                Separate multiple breeds with commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <div className="flex flex-col gap-3">
            {/* Discard changes button */}
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
              variant="secondary"
            >
              Discard Changes
            </Button>

            {/* Save changes button */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="h-6! w-6! animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>

            {/* Delete button */}
            <Button
              type="button"
              className="bg-destructive/30 mt-4 w-full"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(`Are you sure you want to delete ${dog.name}?`)
                ) {
                  console.log('Deleting...');
                }
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default DogCardForm;
