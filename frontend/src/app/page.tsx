'use client';

import { SessionContext } from '@/context/session-context';
import { redirect } from 'next/navigation';
import { useContext } from 'react';

export default function Home() {
  const { session } = useContext(SessionContext);

  if (!session) {
    return redirect('/login');
  }

  return redirect('/dashboard');
}
