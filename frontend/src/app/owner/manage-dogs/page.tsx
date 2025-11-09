'use client';

import DogCard from '@/components/owner/dog-card';
import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function ManageDogsPage() {
  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DogCard />
    </div>
  );
}
