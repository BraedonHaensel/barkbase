import { AccountType } from '@/enums/account-type';
import { z } from 'zod';

// Schema for the login form
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  accountType: z.enum([AccountType.OWNER, AccountType.SERVICE_PROVIDER]),
});
