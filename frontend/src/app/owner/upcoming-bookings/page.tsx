'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function UpcomingBookingsPage() {
  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  return <p>upcoming bookings page</p>;
}
