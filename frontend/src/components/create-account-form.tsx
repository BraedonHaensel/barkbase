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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AccountType } from '@/enums/account-type';
import { createAccountSchema } from '@/lib/schemas/create-account';
import { LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Province } from '@/enums/province';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// Schema for the create account form
type CreateAccountSchema = z.infer<typeof createAccountSchema>;

// Create account form for both owners and service providers
const CreateAccountForm = () => {
  const [stageNum, setStageNum] = useState(1);
  const router = useRouter();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  // Form initialization
  const form = useForm<CreateAccountSchema>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      province: Province.AB,
      city: '',
      street: '',
      password: '',
      confirmPassword: '',
      accountType: AccountType.OWNER,
      image: undefined,
    },
  });

  form.watch();

  // Create account API request
  const { mutate: postCreateAccount, isPending } = useMutation({
    mutationFn: async (input: CreateAccountSchema) => {
      // Use a FormData to handle uploading the user image file
      const formData = new FormData();
      formData.append('province', input.province);
      formData.append('city', input.city);
      formData.append('street', input.street);
      formData.append('email', input.email);
      formData.append('f_name', input.firstName);
      formData.append('l_name', input.lastName);
      formData.append('password', input.password);
      formData.append('phone_num', input.phoneNumber);
      formData.append('account_type', input.accountType);
      formData.append('image_file', input.image);

      const response = await api.post('/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });

  // Handle form submission
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
        {/* First stage of the form */}
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

        {/* Second stage of the form */}
        {stageNum === 2 && (
          <>
            <div className="flex gap-4">
              {/* First name field */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="h-full w-1/2">
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
                  <FormItem className="h-full w-1/2">
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {/* Street field */}
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              {/* City field */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="h-full w-1/2">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Province field */}
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem className="h-full w-1/2">
                    <FormLabel>Province / Territory</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Province).map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {stageNum === 3 && (
          <>
            {/* Profile image field */}
            {/* CITATION: Field developed with reference to:
             * File uploads made easy with react and flask. (n.d.). Dunder Method Paper Company.
             * Retrieved November 10, 2025, from https://dundermethodpaperco.hashnode.dev/file-uploads-made-easy-with-react-and-flask
             */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProfileImagePreview(URL.createObjectURL(file));
                            onChange(file);
                          }
                        }}
                        {...rest}
                      />

                      {profileImagePreview && (
                        <img
                          src={profileImagePreview}
                          alt="Profile image preview"
                          className="aspect-square w-full object-cover"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form submit button */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="h-6! w-6! animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </>
        )}

        {/* Previous stage button */}
        <Button
          type="button"
          disabled={stageNum <= 1}
          className="w-1/2 text-lg"
          onClick={() => setStageNum(stageNum - 1)}
          variant="link"
        >
          Previous
        </Button>

        {/* Next stage button */}
        <Button
          type="button"
          disabled={stageNum >= 3}
          className="w-1/2 text-lg"
          onClick={async () => {
            const isValid = await form.trigger(
              stageNum === 1
                ? ['email', 'password', 'confirmPassword', 'accountType']
                : [
                    'firstName',
                    'lastName',
                    'phoneNumber',
                    'street',
                    'city',
                    'province',
                  ]
            );
            if (isValid) {
              if (stageNum === 1) {
                // Password and confirm password fields must match
                const { password, confirmPassword } = form.getValues();
                if (password !== confirmPassword) {
                  form.setError("confirmPassword", {
                    message: "Passwords do not match",
                  });
                  return;
                }
              }
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
