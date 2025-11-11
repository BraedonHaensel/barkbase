'use client';

import { loginSchema } from '@/lib/schemas/login';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { AccountType } from '@/enums/account-type';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useContext } from 'react';
import { SessionContext } from '@/context/session-context';
import { UserContext } from '@/context/user-context';

// Schema for the login form
type LoginSchema = z.infer<typeof loginSchema>;

// Login form for owners and service providers
const LoginForm = () => {
  const router = useRouter();
  const { setSession } = useContext(SessionContext);
  const { refreshUser } = useContext(UserContext);

  // Form initialization
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      accountType: AccountType.OWNER,
    },
  });

  form.watch();

  // Send the login request to the API
  const { mutate: postLogin, isPending } = useMutation({
    mutationFn: async (input: LoginSchema) => {
      const response = await api.post('/auth/login', {
        email: input.email,
        password: input.password,
        role: input.accountType,
      });
      return response.data;
    },
  });

  // Handle form submission
  function onSubmit(input: LoginSchema) {
    postLogin(input, {
      onSuccess: ({ role, token }) => {
        console.info(`Logged in as ${role} with token ${token}`);
        setSession({ token, accountType: role });
        refreshUser();
        router.push('/dashboard');
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Login failed: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Login failed. Please try again.');
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
        {/* Email field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account type field */}
        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <div className="flex">
                <Button
                  type="button"
                  className="w-1/2 rounded-none rounded-l-lg"
                  onClick={() => {
                    form.setValue(
                      'accountType' as keyof LoginSchema,
                      AccountType.OWNER
                    );
                  }}
                  variant={
                    form.getValues('accountType' as keyof LoginSchema) ===
                    AccountType.OWNER
                      ? 'default'
                      : 'secondary'
                  }
                >
                  Owner
                </Button>
                <Button
                  type="button"
                  className="w-1/2 rounded-none rounded-r-lg"
                  onClick={() => {
                    form.setValue(
                      'accountType' as keyof LoginSchema,
                      AccountType.SERVICE_PROVIDER
                    );
                  }}
                  variant={
                    form.getValues('accountType' as keyof LoginSchema) ===
                    AccountType.SERVICE_PROVIDER
                      ? 'default'
                      : 'secondary'
                  }
                >
                  Service Provider
                </Button>
              </div>
            </FormItem>
          )}
        />

        {/* Form submit button */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <LoaderCircle className="h-6! w-6! animate-spin" />
          ) : (
            'Log In'
          )}
        </Button>

        {/* Sign up link */}
        <p className="text-sm">
          Don't have an account?{' '}
          <Link
            href="/create-account"
            className="text-blue-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  );
};

export default LoginForm;
