import { AccountType } from '@/enums/account-type';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(5, 'Password must be at least 5 characters'),
  accountType: z.enum([AccountType.OWNER, AccountType.SERVICE_PROVIDER]),
});
