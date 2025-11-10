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
import { UserContext } from '@/context/user-context';

const ProvileNav = () => {
  const [open, setOpen] = useState(false);
  const { clearSession } = useContext(SessionContext);
  const { user } = useContext(UserContext);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="h-full w-full hover:opacity-60 focus:outline-none"
        disabled={!user}
      >
        <Avatar className="h-full w-full">
          <AvatarImage
            src={!!user ? 'https://github.com/shadcn.png' : undefined}
            alt="Profile image"
          />
          <AvatarFallback className="bg-white">
            <CircleUser className="h-full w-full" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      {user && (
        <DropdownMenuContent className="max-w-[min(400px,100vw)]" align="end">
          <div className="p-2">
            <p className="truncate font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-muted-foreground truncate text-sm">
              {user.email}
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
              clearSession();
              redirect('/login');
            }}
          >
            Log Out
            <LogOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default ProvileNav;
