'use client';

import { SessionContext } from '@/context/session-context';
import { redirect } from 'next/navigation';
import { useContext } from 'react';

// Root page. Redirects to the login or dashboard page based on if the user has an active session.
export default function Home() {
  const { session } = useContext(SessionContext);

  if (!session) {
    return redirect('/login');
  }

  return redirect('/dashboard');
}
