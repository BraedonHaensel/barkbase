'use client';

import { UserContext } from '@/context/user-context';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function ProfilePage() {
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      redirect('/dashboard');
    }
  }, [user]);

  return (
    <div>
      Profile page. Will handle changing user account things, potentially more
      like emergency contacts
    </div>
  );
}
