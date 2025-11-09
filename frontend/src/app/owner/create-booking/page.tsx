'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateBookingForm from '@/components/owner/create-booking-form';

export default function CreateBookingPage() {
  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Card className="w-[450px] px-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateBookingForm />
        </CardContent>
      </Card>
    </div>
  );
}
