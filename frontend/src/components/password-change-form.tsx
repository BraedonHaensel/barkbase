'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useState } from 'react';
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
import { LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { UserContext } from '@/context/user-context';
import { passwordChangeSchema } from '@/lib/schemas/profile';
import { User } from '@/types/user';
import { SessionContext } from '@/context/session-context';

// Schema for the main profile form
type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>;

type Props = {
  isEditingASection: boolean;
  setIsEditingASection: React.Dispatch<React.SetStateAction<boolean>>; // Called to notify parent when this section is being edited
};

// Create account form for both owners and service providers
const PasswordChangeForm = ({
  isEditingASection,
  setIsEditingASection,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const { user, refreshUser } = useContext(UserContext);
  const { session } = useContext(SessionContext);

  if (!user) {
    // Loading user details
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
  }

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    user.imageUrl
  );

  // Form initialization
  const form = useForm<PasswordChangeSchema>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  form.watch();

  // Update profile API request
  const { mutate: patchUpdateProfile, isPending } = useMutation({
    mutationFn: async (input: PasswordChangeSchema) => {
      const response = await api.patch(
        '/users/change_password',
        {
          old_password: input.oldPassword,
          new_password: input.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );
      return response.data;
    },
  });

  // Handle form submission
  function onSubmit(input: PasswordChangeSchema) {
    patchUpdateProfile(input, {
      onSuccess: ({ message }) => {
        console.info(message);
        toast.success('Password changed!');
        form.reset();
        setIsEditing(false);
        setIsEditingASection(false);
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to update profile: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to update profile. Please try again.');
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          disabled={!isEditing}
          className={`space-y-5 ${isEditing ? 'border-teal-400/50' : 'hover:cursor-pointer hover:opacity-60'}`}
          onClick={() => {
            if (!isEditing) {
              // Check if another section is already being edited
              if (isEditingASection) {
                toast.warning('Only one section can be edited at a time!');
              } else {
                setIsEditing(true);
                setIsEditingASection(true);
              }
            }
          }}
        >
          {/* Old password field */}
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem className="h-full w-1/2">
                <FormLabel>Old password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            {/* First name field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="h-full w-1/2">
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last name field */}
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem className="h-full w-1/2">
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isEditing && (
            <div className="flex gap-4">
              {/* Discard changes button */}
              <Button
                type="button"
                className="w-1/2"
                onClick={() => {
                  form.reset();
                  setProfileImagePreview(user.imageUrl);
                  setIsEditing(false);
                  setIsEditingASection(false);
                }}
                variant="secondary"
              >
                Cancel
              </Button>

              {/* Confirm change button */}
              <Button
                type="submit"
                className="bg-destructive/30 w-1/2"
                variant="destructive"
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  'Confirm Change'
                )}
              </Button>
            </div>
          )}
        </fieldset>
      </form>
    </Form>
  );
};

export default PasswordChangeForm;
