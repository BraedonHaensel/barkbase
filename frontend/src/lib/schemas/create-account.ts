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
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    accountType: z.enum(AccountType),
    image: z.file(),
  });
  