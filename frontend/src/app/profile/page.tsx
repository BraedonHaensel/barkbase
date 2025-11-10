'use client';

import { UserContext } from '@/context/user-context';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

// User profile page
export default function ProfilePage() {
  const { user } = useContext(UserContext);

  // A session is required
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
