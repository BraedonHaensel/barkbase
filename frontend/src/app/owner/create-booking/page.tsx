'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateEditBookingForm from '@/components/owner/create-edit-booking-form';
import CenteredPageContainer from '@/components/centered-page-container';

// Create booking page
export default function CreateBookingPage() {
  const { session } = useContext(SessionContext);

  // A session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  return (
    <CenteredPageContainer>
      <Card className="w-[450px] px-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateEditBookingForm />
        </CardContent>
      </Card>
    </CenteredPageContainer>
  );
}
