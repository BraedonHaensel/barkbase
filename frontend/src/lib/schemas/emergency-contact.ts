import { z } from 'zod';

export const emergencyContactSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10,15}$/, 'Invalid phone number'),
  relationship: z.string().nonempty('Required field'),
  email: z.union([z.email(), z.literal('')]),
  firstName: z.string().nonempty('Required field'),
  lastName: z.string().nonempty('Required field'),
});
