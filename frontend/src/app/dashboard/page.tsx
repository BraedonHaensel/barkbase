'use client';

import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { useContext, useEffect } from 'react';
import OwnerDashboard from './owner-dashboard';
import { redirect } from 'next/navigation';
import ServiceProviderDashboard from './service-provider-dashboard';

// General dashboard page. Displays the corresponding dashboard layout for owners and service providers
export default function DashboardPage() {
  const { session } = useContext(SessionContext);

  // A session is required
  useEffect(() => {
    if (!session) {
      redirect('/login');
    }
  }, [session]);

  return (
    <>
      {session?.accountType === AccountType.OWNER ? (
        <OwnerDashboard />
      ) : session?.accountType === AccountType.SERVICE_PROVIDER ? (
        <ServiceProviderDashboard />
      ) : (
        <p>Invalid permissions. Please log out and try again.</p>
      )}
    </>
  );
}
