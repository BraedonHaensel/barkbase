'use client';

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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { emergencyContactSchema } from '@/lib/schemas/emergency-contact';

// Schema for the emergency contact form
type EmergencyContactSchema = z.infer<typeof emergencyContactSchema>;

type Props = {
  emergencyContact?: EmergencyContact;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

// Emergency contact form for viewing and editing values
const EmergencyContactForm = ({
  emergencyContact,
  isEditing,
  setIsEditing,
}: Props) => {
  // Form initialization
  const form = useForm<EmergencyContactSchema>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: emergencyContact
      ? {
          phoneNumber: emergencyContact.phoneNumber,
          relationship: emergencyContact.relationship,
          // TODO: optional email
          email: emergencyContact.email ? emergencyContact.email : '',
          firstName: emergencyContact.firstName,
          lastName: emergencyContact.lastName,
        }
      : {
          phoneNumber: '',
          relationship: '',
          email: '',
          firstName: '',
          lastName: '',
        },
  });

  form.watch();

  // Update emergency contact query
  const { mutate: postUpdateEmergencyContact, isPending } = useMutation({
    mutationFn: async (input: EmergencyContactSchema) => {
      const response = await api.post('/TODO', {
        phone_num: input.phoneNumber,
        relationship: input.relationship,
        //TODO: optional email
        email: input.email,
        f_name: input.firstName,
        l_name: input.lastName,
      });
      return response.data;
    },
  });

  // Handle form submission
  function onSubmit(input: EmergencyContactSchema) {
    console.log(`Submitting:`, JSON.stringify(input));
    postUpdateEmergencyContact(input, {
      onSuccess: ({ message }) => {
        console.info(message);
        toast.success('Saved changes.');
        // TODO: reload page? Call parent update function?
      },
      onError: (error: any) => {
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to save changes: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to save changes. Please try again.');
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

        <div className="flex gap-4">
          {/* Phone number field */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="h-full w-1/2">
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="h-full w-1/2">
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Relationship field */}
        <FormField
          control={form.control}
          name="relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Friend, Spouse, Parent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <div className="flex flex-col gap-3">
            {/* Discard changes button */}
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
              variant="secondary"
            >
              Discard Changes
            </Button>

            {/* Save changes button */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="h-6! w-6! animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>

            {/* Delete button */}
            <Button
              type="button"
              className="bg-destructive/30 mt-4 w-full"
              variant="destructive"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete?`)) {
                  console.log('Deleting...');
                }
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default EmergencyContactForm;
