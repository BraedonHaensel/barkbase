import z from 'zod';

export const dogSchema = z.object({
  name: z.string().nonempty('Required field'),
  date: z.date(),
});
