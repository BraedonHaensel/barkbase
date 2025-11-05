'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/accountType';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function CreateBookingPage() {
  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  return <p>create booking page</p>;
}
