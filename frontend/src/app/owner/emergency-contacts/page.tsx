'use client';

import EmergencyContactCard from '@/components/owner/emergency-contact-card';
import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { SquarePlus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

// Emergency contacts management page
export default function EmergencyContactsPage() {
  const { session } = useContext(SessionContext);

  // A session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  // TODO temporary emergency contacts
  const emergencyContact1: EmergencyContact = {
    phoneNumber: '4039997777',
    relationship: 'Mother',
    firstName: 'Fred',
    lastName: 'Smith',
    email: 'friend@gmail.com',
  };

  const emergencyContact2: EmergencyContact = {
    phoneNumber: '4039997777',
    relationship: 'Friend',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  const emergencyContacts = [emergencyContact1, emergencyContact2];

  // TODO: Have a refresh method passed to children for when they save?

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        Emergency Contacts
      </p>
      <div className="grid min-w-[400px] gap-6 md:grid-cols-2">
        {/* Render a card for each emergency contact */}
        {emergencyContacts.map((emergencyContact, id) => (
          <EmergencyContactCard key={id} emergencyContact={emergencyContact} />
        ))}
        {/* Add new emergency contacts button */}
        <div
          className={`flex min-h-50 items-center justify-center ${emergencyContacts.length % 2 == 0 && 'col-span-2 mx-auto w-1/2'}`}
          onClick={() => {
            console.log('TODO add new contact...');
          }}
        >
          {/* TODO Emergency contact count <= 2 &&*/}
          <SquarePlus
            className="text-teal-600 hover:cursor-pointer hover:opacity-60"
            size={50}
          />
        </div>
      </div>
    </div>
  );
}
