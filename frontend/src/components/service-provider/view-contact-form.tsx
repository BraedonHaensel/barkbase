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
import { emergencyContactSchema } from '@/lib/schemas/emergency-contact';
import { EmergencyContact } from '@/types/emergency-contact';

// Schema for the emergency contact form
type EmergencyContactSchema = z.infer<typeof emergencyContactSchema>;

type Props = {
  emergencyContact: EmergencyContact;
};

// Emergency contact form for viewing and editing values
const ViewContactForm = ({ emergencyContact }: Props) => {
  // Form initialization
  const form = useForm<EmergencyContactSchema>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      phoneNumber: emergencyContact.phoneNumber,
      relationship: emergencyContact.relationship,
      email: emergencyContact.email ? emergencyContact.email : '',
      firstName: emergencyContact.firstName,
      lastName: emergencyContact.lastName,
    },
  });

  form.watch();

  return (
    <Form {...form}>
      <form className="space-y-5">
        <div className="flex gap-4">
          {/* First name field */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="h-full w-1/2">
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input readOnly value={field.value} />
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
                  <Input readOnly value={field.value} />
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
                  <Input readOnly value={field.value} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input readOnly placeholder="N/A" value={field.value} />
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
                <Input readOnly value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ViewContactForm;
