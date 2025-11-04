'use client';

import { loginSchema } from '@/lib/schemas/login';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
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
import { AccountType } from '@/enums/accountType';
import Link from 'next/link';

type Props = {};

type LoginSchema = z.infer<typeof loginSchema>;

const LoginForm = (props: Props) => {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      accountType: AccountType.OWNER,
    },
  });

  form.watch();

  function onSubmit(input: LoginSchema) {
    // Do soemthing after submitting the form, hit the login api?
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

        <Button type="submit" className="w-full">
          Log In
        </Button>
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
