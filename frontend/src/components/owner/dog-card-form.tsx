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
import { dogSchema } from '@/lib/schemas/dog';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Calendar } from '../ui/calendar';
import DatePicker from '../date-picker';
import { dateToAge } from '@/lib/utils';

type DogSchema = z.infer<typeof dogSchema>;

const DogCardForm = () => {
  const router = useRouter();

  // temporary dog
  const dog = {
    name: 'Chico',
    date: '',
  };

  const form = useForm<DogSchema>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: dog.name,
      date: undefined,
    },
  });

  form.watch();

  const { mutate: postUpdateDog, isPending } = useMutation({
    mutationFn: async (input: DogSchema) => {
      const response = await api.post('/TODO', {
        address: input.name,
      });
      return response.data;
    },
  });

  function onSubmit(input: DogSchema) {
    console.log(`Submitting:`, JSON.stringify(input));
    postUpdateDog(input, {
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
        <div className="flex h-20 w-20 items-center gap-10">
          [TODO Upload]
          <img src="https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*" />
        </div>

        {/* Name field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of birth field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <DatePicker {...field} />
                  {field.value && (
                    <p className="text-muted-foreground">
                      ({dateToAge(field.value)} old)
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <LoaderCircle className="h-6! w-6! animate-spin" />
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default DogCardForm;
