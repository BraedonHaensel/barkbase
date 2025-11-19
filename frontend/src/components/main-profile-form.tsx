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
import { Province } from '@/enums/province';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { UserContext } from '@/context/user-context';
import { mainProfileSchema } from '@/lib/schemas/profile';
import { User } from '@/types/user';
import { SessionContext } from '@/context/session-context';

// Schema for the main profile form
type MainProfileSchema = z.infer<typeof mainProfileSchema>;

type Props = {
  isEditingASection: boolean;
  setIsEditingASection: React.Dispatch<React.SetStateAction<boolean>>; // Called to notify parent when this section is being edited
};

// Create account form for both owners and service providers
const MainProfileForm = ({
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
  const form = useForm<MainProfileSchema>({
    resolver: zodResolver(mainProfileSchema),
    defaultValues: {
      image: undefined,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNum,
      province: user.province,
      city: user.city,
      street: user.street,
    },
  });

  form.watch();

  const formInputToUser = (input: MainProfileSchema): User => {
    const user: User = {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNum: input.phoneNumber,
      province: input.province,
      city: input.city,
      street: input.street,
      imageUrl: profileImagePreview ?? '',
    };
    return user;
  };

  const formContainsChanges = () => {
    return (
      JSON.stringify(user) !== JSON.stringify(formInputToUser(form.getValues()))
    );
  };

  // Update profile API request
  const { mutate: patchUpdateProfile, isPending } = useMutation({
    mutationFn: async (input: MainProfileSchema) => {
      // Use a FormData to handle uploading the user image file
      const formData = new FormData();
      if (input.image) formData.append('image_file', input.image);
      formData.append('phone_num', input.phoneNumber);
      formData.append('f_name', input.firstName);
      formData.append('l_name', input.lastName);
      formData.append('street', input.street);
      formData.append('city', input.city);
      formData.append('province', input.province);

      const response = await api.patch('/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.token}`,
        },
      });
      return response.data;
    },
  });

  // Handle form submission
  function onSubmit(input: MainProfileSchema) {
    patchUpdateProfile(input, {
      onSuccess: ({ message }) => {
        console.info(message);
        toast.success('Profile updated!');
        refreshUser();
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
          <div className="flex w-full items-center gap-4">
            {/* Profile image field */}
            {/* CITATION: Field developed with reference to:
             * File uploads made easy with react and flask. (n.d.). Dunder Method Paper Company.
             * Retrieved November 10, 2025, from https://dundermethodpaperco.hashnode.dev/file-uploads-made-easy-with-react-and-flask
             */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem className="h-full w-1/2">
                  <FormLabel>Image</FormLabel>
                  <FormControl>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {profileImagePreview && (
              <img
                src={profileImagePreview}
                alt="Profile image preview"
                className="mx-auto aspect-square w-25 object-cover"
              />
            )}
          </div>

          <div className="flex w-full gap-4">
            {/* Email field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field: { value } }) => (
                <FormItem className="h-full w-1/2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div
                      onClick={() => {
                        console.log('click');
                        toast.warning("Email can't be changed!");
                      }}
                    >
                      <Input
                        disabled
                        className={
                          isEditing ? 'bg-gray-100 disabled:opacity-100' : ''
                        }
                        value={value}
                      />
                    </div>
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
                <FormItem className="h-full w-1/2">
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                Discard Changes
              </Button>

              {/* Save changes button */}
              <Button
                type="submit"
                className="w-1/2"
                disabled={!formContainsChanges()}
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}
        </fieldset>
      </form>
    </Form>
  );
};

export default MainProfileForm;
