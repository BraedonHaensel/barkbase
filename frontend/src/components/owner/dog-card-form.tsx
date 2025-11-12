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
import { Dog } from '@/types/dog';

// Schema for the dog form
type DogSchema = z.infer<typeof dogSchema>;

type Props = {
  dog: Dog;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  updateDog: (oldName: string, newDogData: Dog) => {};
  deleteDog: (name: string) => {};
};

// Form to view and edit the dog of an owner
const DogCardForm = ({
  dog,
  isEditing,
  setIsEditing,
  updateDog,
  deleteDog,
}: Props) => {
  // Form initialization
  const form = useForm<DogSchema>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: dog.name,
      birthDate: dog.birthDate,
      size: dog.size,
      breeds: dog.breeds.join(', '),
    },
  });

  form.watch();

  const formInputToDog = (input: DogSchema): Dog => {
    const dog: Dog = {
      name: input.name,
      birthDate: input.birthDate,
      size: input.size,
      // Convert the comma-separated breeds string into a list
      breeds: input.breeds.split(',').map((s) => s.trim()),
    };
    return dog;
  };

  const formContainsChanges = () => {
    return (
      JSON.stringify(dog) !== JSON.stringify(formInputToDog(form.getValues()))
    );
  };

  // Handle form submission
  function onSubmit(input: DogSchema) {
    updateDog(dog.name, formInputToDog(input));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset disabled={!isEditing} className="space-y-5">
          {/* Handle dog image uploads */}
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
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <DatePicker blockFuture {...field} />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                    <SelectItem value={DogSize.LARGE}>
                      Large (41+ lbs)
                    </SelectItem>
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
              <Button
                type="submit"
                className="w-full"
                disabled={!formContainsChanges()}
              >
                Save Changes
              </Button>

              {/* Delete button */}
              <Button
                type="button"
                className="bg-destructive/30 mt-4 w-full"
                variant="destructive"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete?`)) {
                    deleteDog(dog.name);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </fieldset>
      </form>
    </Form>
  );
};

export default DogCardForm;
