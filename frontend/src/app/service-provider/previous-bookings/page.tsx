'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function PreviousBookingsPage() {
  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (!session || session.accountType !== AccountType.SERVICE_PROVIDER) {
      redirect('/login');
    }
  }, [session]);

  return <p>previous bookings page</p>;
}
