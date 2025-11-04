'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import { createAccountSchema } from '@/lib/schemas/create-account';
import { LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { redirect, useRouter } from 'next/navigation';

type Props = {};

type CreateAccountSchema = z.infer<typeof createAccountSchema>;

const CreateAccountForm = (props: Props) => {
  const [stageNum, setStageNum] = useState(1);
  const router = useRouter();

  const form = useForm<CreateAccountSchema>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: '',
      accountType: AccountType.OWNER,
    },
  });

  form.watch();

  const { mutate: postCreateAccount, isPending } = useMutation({
    mutationFn: async (input: CreateAccountSchema) => {
      const response = await api.post('/auth/signup', {
        address: input.address,
        email: input.email,
        f_name: input.firstName,
        l_name: input.lastName,
        password: input.password,
        phone_num: input.phoneNumber,
        role: input.accountType,
      });
      return response.data;
    },
  });

  function onSubmit(input: CreateAccountSchema) {
    postCreateAccount(input, {
      onSuccess: ({ message }) => {
        console.info(message);
        toast.success('Account created! Please log in.');
        router.push('/login');
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to create account: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to create account. Please try again.');
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {stageNum === 1 && (
          <>
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

            {/* Confirm password field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
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
                          'accountType' as keyof CreateAccountSchema,
                          AccountType.OWNER
                        );
                      }}
                      variant={
                        form.getValues(
                          'accountType' as keyof CreateAccountSchema
                        ) === AccountType.OWNER
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
                          'accountType' as keyof CreateAccountSchema,
                          AccountType.SERVICE_PROVIDER
                        );
                      }}
                      variant={
                        form.getValues(
                          'accountType' as keyof CreateAccountSchema
                        ) === AccountType.SERVICE_PROVIDER
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
          </>
        )}

        {stageNum === 2 && (
          <>
            {/* First name field */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last name field */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone number field */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={stageNum < 2 || isPending}
              variant={stageNum === 2 ? 'default' : 'secondary'}
            >
              {isPending ? (
                <LoaderCircle className="h-6! w-6! animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </>
        )}

        <Button
          type="button"
          disabled={stageNum <= 1}
          className="w-1/2 text-lg"
          onClick={() => setStageNum(stageNum - 1)}
          variant="link"
        >
          Previous
        </Button>
        <Button
          type="button"
          disabled={stageNum >= 2}
          className="w-1/2 text-lg"
          onClick={async () => {
            const isValid = await form.trigger([
              'email',
              'password',
              'confirmPassword',
              'accountType',
            ]);
            if (isValid) {
              setStageNum(stageNum + 1);
            }
          }}
          variant="link"
        >
          Next
        </Button>
      </form>
    </Form>
  );
};

export default CreateAccountForm;
