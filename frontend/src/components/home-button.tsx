'use client';

import Link from 'next/link';

// BarkBase homepage button
const HomeButton = () => {
  return (
    <Link
      href={'/'}
      className="block rounded-lg border-2 border-r-4 border-b-4 border-black px-2 py-1 hover:opacity-60"
    >
      <p className="text-xl font-bold">BarkBase</p>
    </Link>
  );
};

export default HomeButton;
