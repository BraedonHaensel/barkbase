'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/accountType';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function FindBookingsPage() {
  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (!session || session.accountType !== AccountType.SERVICE_PROVIDER) {
      redirect('/login');
    }
  }, [session]);

  return <p>find bookings page</p>;
}
