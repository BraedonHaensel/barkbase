'use client';

import MainProfileForm from '@/components/main-profile-form';
import { Separator } from '@/components/ui/separator';
import { UserContext } from '@/context/user-context';
import { redirect } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

// User profile page
export default function ProfilePage() {
  const { user } = useContext(UserContext);
  const [isEditingASection, setIsEditingASection] = useState(false);

  // A session is required
  useEffect(() => {
    if (!user) {
      redirect('/dashboard');
    }
  }, [user]);

  return (
    <div className="mx-auto flex max-w-[700px] flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        User Profile
      </p>
      <MainProfileForm
        isEditingASection={isEditingASection}
        setIsEditingASection={setIsEditingASection}
      />
      <Separator className="my-6" />
      <p>Password change section TODO</p>
    </div>
  );
}
