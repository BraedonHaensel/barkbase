'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/accountType';
import { useContext, useEffect } from 'react';
import OwnerDashboard from './owner-dashboard';
import { redirect } from 'next/navigation';
import ServiceProviderDashboard from './service-provider-dashboard';

export default function DashboardPage() {
  const { session } = useContext(SessionContext);

  console.log(session);

  // TOOD: Figure out how to guard routes from users without an active session
  // if (!session) {
  //   redirect('/login');
  // }

  return (
    <>
      {session?.accountType === AccountType.OWNER ? (
        <OwnerDashboard session={session} />
      ) : session?.accountType === AccountType.SERVICE_PROVIDER ? (
        <ServiceProviderDashboard session={session} />
      ) : (
        <></>
      )}
    </>
  );
}
