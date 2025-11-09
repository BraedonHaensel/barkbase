import { DogSize } from '@/enums/dog-size';
import z from 'zod';

export const dogSchema = z.object({
  name: z.string().nonempty('Required field'),
  date: z.date(),
  size: z.enum([DogSize.SMALL, DogSize.MEDIUM, DogSize.LARGE]),
  breeds: z.string(),
});
