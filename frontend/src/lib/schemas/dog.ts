import { DogSize } from '@/enums/dog-size';
import z from 'zod';

// Schema for the dog management form
export const dogSchema = z
  .object({
    name: z.string().nonempty('Required field'),
    birthDate: z.date(),
    size: z.enum([DogSize.SMALL, DogSize.MEDIUM, DogSize.LARGE]),
    breeds: z.string().nonempty('Required field'),
    image: z.union([z.file(), z.literal('newDogNoImage')]).optional(),
  })
  .refine(
    (data) => {
      // Image must be provided for new dogs
      return data.image !== 'newDogNoImage';
    },
    {
      message: 'Image required',
      path: ['image'],
    }
  );
