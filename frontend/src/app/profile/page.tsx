'use client';

import MainProfileForm from '@/components/main-profile-form';
import PasswordChangeForm from '@/components/password-change-form';
import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { redirect } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

// User profile page
export default function ProfilePage() {
  const { session } = useContext(SessionContext);
  const [isEditingASection, setIsEditingASection] = useState(false);

  // A session is required
  useEffect(() => {
    if (!session) {
      redirect('/dashboard');
    }
  }, [session]);

  return (
    <div className="mx-auto flex max-w-[700px] flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        {session?.accountType === AccountType.OWNER
          ? 'Owner Profile'
          : 'Service Provider Profile'}
      </p>
      <MainProfileForm
        isEditingASection={isEditingASection}
        setIsEditingASection={setIsEditingASection}
      />
      {/* Change password title */}
      <p style={{ fontSize: '35px' }} className="mt-8 text-center font-bold">
        Change Password
      </p>
      <PasswordChangeForm
        isEditingASection={isEditingASection}
        setIsEditingASection={setIsEditingASection}
      />
    </div>
  );
}
