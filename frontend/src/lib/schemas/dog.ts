import { DogSize } from '@/enums/dog-size';
import z from 'zod';

// Schema for the dog management form
export const dogSchema = z.object({
  name: z.string().nonempty('Required field'),
  birthDate: z.date(),
  size: z.enum([DogSize.SMALL, DogSize.MEDIUM, DogSize.LARGE]),
  breeds: z.string(),
});
