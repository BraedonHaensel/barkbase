import React from 'react';
import HomeButton from '@/components/home-button';
import UserAccountNav from '@/components/user-account-nav';

type Props = {};

const Navbar = (props: Props) => {
  return (
    <div className="flex h-full items-center justify-between gap-3">
      <div>
        <HomeButton />
      </div>

      <div className="aspect-square h-full">
        <UserAccountNav
          user={{
            email: 'email@example.com',
            firstName: 'John',
            lastName: 'Doe',
          }}
        />
      </div>
    </div>
  );
};

export default Navbar;
