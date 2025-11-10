'use client';

import LoginForm from '@/components/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SessionContext } from '@/context/session-context';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function LoginPage() {
  const { session } = useContext(SessionContext);

  // Redirect to dashbaord if a session already exists
  useEffect(() => {
    if (session) {
      redirect('/dashboard');
    }
  }, [session]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Card className="w-[450px] px-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🐶 Welcome to BarkBase! 🐶
          </CardTitle>
        </CardHeader>
        <CardDescription className="text-foreground text-center text-lg">
          BarkBase is a brand new platform for dog walking and sitting services!
          Log in below to get started!
        </CardDescription>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
