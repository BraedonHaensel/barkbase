import { Province } from '@/enums/province';
import { z } from 'zod';

// Schema for the main profile form
export const mainProfileSchema = z.object({
  image: z.file().optional(),
  email: z.email(),
  phoneNumber: z.string().regex(/^\d{10,15}$/, 'Invalid phone number'),
  firstName: z.string().nonempty('Required field'),
  lastName: z.string().nonempty('Required field'),
  street: z.string().nonempty('Required field'),
  city: z.string().nonempty('Required field'),
  province: z.enum(Province),
});
