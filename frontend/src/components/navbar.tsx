import React from 'react';
import HomeButton from '@/components/home-button';

type Props = {};

const Navbar = (props: Props) => {
  return (
    <div className="flex h-full items-center justify-between gap-3">
      <div>
        <HomeButton />
      </div>

      <div className="flex h-full items-center bg-blue-500">
        I am the right div
      </div>
    </div>
  );
};

export default Navbar;
