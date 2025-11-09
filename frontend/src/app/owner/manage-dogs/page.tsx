'use client';

import DogCard from '@/components/owner/dog-card';
import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { SquarePlus } from 'lucide-react';
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
    <div className="grid min-w-[400px] gap-6 md:grid-cols-2">
      <DogCard />
      <DogCard />
      <div
        className="flex min-h-50 items-center justify-center"
        onClick={() => {
          console.log('TODO add new dog...');
        }}
      >
        <SquarePlus
          className="text-teal-600 hover:cursor-pointer hover:opacity-60"
          size={50}
        />
      </div>
    </div>
  );
}
