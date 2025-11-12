import { AccountType } from '@/enums/account-type';
import { Province } from '@/enums/province';
import { z } from 'zod';

// Schema for the create account form
export const createAccountSchema = z
  .object({
    firstName: z.string().nonempty('Required field'),
    lastName: z.string().nonempty('Required field'),
    email: z.email(),
    phoneNumber: z.string().regex(/^\d{10,15}$/, 'Invalid phone number'),
    province: z.enum(Province),
    city: z.string().nonempty('Required field'),
    street: z.string().nonempty('Required field'),
    password: z.string().min(5, 'Password must be at least 5 characters'),
    confirmPassword: z.string(),
    accountType: z.enum(AccountType),
    image: z.file(),
  })
  // Password and confirm password fields must match
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
