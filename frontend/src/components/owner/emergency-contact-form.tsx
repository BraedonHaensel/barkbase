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
import { emergencyContactSchema } from '@/lib/schemas/emergency-contact';
import { useState } from 'react';
import { EmergencyContact } from '@/types/emergency-contact';

// Schema for the emergency contact form
type EmergencyContactSchema = z.infer<typeof emergencyContactSchema>;

type Props = {
  emergencyContact: EmergencyContact;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  updateContact: (
    oldPhoneNumber: string,
    newContactData: EmergencyContact
  ) => Promise<void>;
  deleteContact: (phoneNumber: string) => Promise<void>;
};

// Emergency contact form for viewing and editing values
const EmergencyContactForm = ({
  emergencyContact,
  isEditing,
  setIsEditing,
  updateContact,
  deleteContact,
}: Props) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const formInputToContact = (
    input: EmergencyContactSchema
  ): EmergencyContact => {
    const contact: EmergencyContact = {
      phoneNumber: input.phoneNumber,
      relationship: input.relationship,
      firstName: input.firstName,
      lastName: input.lastName,
      ...(input.email ? { email: input.email } : {}),
    };
    return contact;
  };

  const formContainsChanges = () => {
    return (
      JSON.stringify(emergencyContact) !==
      JSON.stringify(formInputToContact(form.getValues()))
    );
  };

  // Handle form submission
  async function onSubmit(input: EmergencyContactSchema) {
    setIsSaving(true);
    await updateContact(
      emergencyContact.phoneNumber,
      formInputToContact(input)
    );
    setIsSaving(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          disabled={!isEditing || isSaving || isDeleting}
          className="space-y-5"
        >
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
                  <Input
                    placeholder="e.g., Friend, Spouse, Parent"
                    {...field}
                  />
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
              <Button
                type="submit"
                className="w-full"
                disabled={!formContainsChanges()}
              >
                {isSaving ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </Button>

              {/* Delete button */}
              <Button
                type="button"
                className="bg-destructive/30 mt-4 w-full"
                variant="destructive"
                onClick={async () => {
                  setIsDeleting(true);
                  if (window.confirm(`Are you sure you want to delete?`)) {
                    await deleteContact(emergencyContact.phoneNumber);
                  }
                  setIsDeleting(false);
                }}
              >
                {isDeleting ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          )}
        </fieldset>
      </form>
    </Form>
  );
};

export default EmergencyContactForm;
