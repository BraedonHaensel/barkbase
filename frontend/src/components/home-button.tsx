'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';

// BarkBase homepage button
const HomeButton = () => {
  return (
    <Link
      href={'/'}
      className="block rounded-lg border-2 border-r-4 border-b-4 border-black px-2 py-1 hover:opacity-60"
    >
      <div className="flex items-center gap-2">
        <Home strokeWidth={2.3} /> <p className="text-xl font-bold">BarkBase</p>
      </div>
    </Link>
  );
};

export default HomeButton;
