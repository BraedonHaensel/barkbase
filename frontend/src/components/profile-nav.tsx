'use client';

import { useContext, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CircleUser, LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SessionContext } from '@/context/session-context';

const ProvileNav = () => {
  const [open, setOpen] = useState(false);
  const { session, clearSession } = useContext(SessionContext);

  const tempUser = {
    email: 'email@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="h-full w-full hover:opacity-60 focus:outline-none"
        disabled={!session}
      >
        <Avatar className="h-full w-full">
          <AvatarImage
            src={!!session ? 'https://github.com/shadcn.png' : undefined}
            alt="Profile image"
          />
          <AvatarFallback className="bg-white">
            <CircleUser className="h-full w-full" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-[min(400px,100vw)]" align="end">
        <div className="p-2">
          <p className="truncate font-medium">
            {tempUser.firstName} {tempUser.lastName}
          </p>
          <p className="text-muted-foreground truncate text-sm">
            {tempUser.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            redirect('/profile');
          }}
        >
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            setOpen(false);
            // TODO: Request logout on the backend? Or let token expire
            clearSession();
            redirect('/login');
          }}
        >
          Log Out
          <LogOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProvileNav;
