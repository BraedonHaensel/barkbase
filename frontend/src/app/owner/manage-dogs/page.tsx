'use client';

import DogCard from '@/components/owner/dog-card';
import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { DogSize } from '@/enums/dog-size';
import { SquarePlus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

// Manage dogs page
export default function ManageDogsPage() {
  const { session } = useContext(SessionContext);

  // A session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  // TODO temporary dogs
  const dog1 = {
    name: 'Chico',
    date: new Date('2024-11-03T07:00:00.000Z'),
    size: DogSize.MEDIUM,
    breeds: 'golden retriever, labrador',
  };

  const dog2 = {
    name: 'Bear',
    date: new Date('2023-12-03T07:00:00.000Z'),
    size: DogSize.MEDIUM,
    breeds: 'chihuahua',
  };

  const dogs = [dog1, dog2];

  // TODO refresh method passed to children?
  // TODO limit dogs to 10

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        Dog Manager
      </p>
      <div className="grid min-w-[400px] gap-6 md:grid-cols-2">
        {/* Render a card for each dog */}
        {dogs.map((dog, id) => (
          <DogCard key={id} dog={dog} />
        ))}
        {/* Add new dogs button */}
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
    </div>
  );
}
