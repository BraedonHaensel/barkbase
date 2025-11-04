'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

type Props = {};

export default function CreateAccountPage() {
  const api = axios.create({
    baseURL: 'http://localhost:5000/',
  });

  const { mutate: createAccount, isPending } = useMutation({
    mutationFn: async ({
      address,
      email,
      f_name,
      l_name,
      password,
      phone_num,
      role,
    }: any) => {
      const response = await axios.post('/auth/signup', {
        address,
        email,
        f_name,
        l_name,
        password,
        phone_num,
        role,
      });
      return response.data;
    },
  });

  // TODO: Try toast?

  const onSubmit = () => {
    console.log(`env: {${process.env.REACT_APP_API_URL}}`);
    console.log();
    console.log('Sending query...');
    createAccount(
      {
        address: 'a',
        email: 'b',
        f_name: 'c',
        l_name: 'g',
        password: 'e',
        phone_num: 'f',
        role: 'g',
      },
      {
        onSuccess: ({ message }) => {
          console.log('Got a response!');
          console.log(`Message: ${message}`);
          toast.success('Account successfully created!');
        },
        onError: (error: unknown) => {
          console.log('Got an error!:');
          console.error(error);
          if (axios.isAxiosError(error)) {
            if (error.response) {
              console.log(error.response.data.error);
            }
          }
          toast.error('Failed to create account. Please try again.');
        },
      }
    );
  };

  const onGet = async () => {
    console.log('Getting...');
    const response = await axios.get('/owners');
    console.log('Got resopnse:');
    console.log(JSON.stringify(response));
  };

  return (
    <div>
      <p>Hello, requests!</p>
      <Button onClick={onSubmit}>Hello</Button>
      <Button onClick={onGet}>Get</Button>
    </div>
  );
}
