'use client';

import React, { useState } from 'react';
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

type Props = {
  user: Pick<User, 'email' | 'firstName' | 'lastName'>;
};

const UserAccountNav = ({ user }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="h-full w-full focus:outline-none">
        <Avatar className="h-full w-full">
          <AvatarImage
            src="https://github.com/shadcn.png"
            alt="Profile image"
          />
          <AvatarFallback className="bg-gray-200">
            <CircleUser className="h-full w-full" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-[min(400px,100vw)]" align="end">
        <div className="p-2">
          <p className="truncate font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-muted-foreground truncate text-sm">{user.email}</p>
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
            // TODO: Request logout on the backend
            redirect('/login');
          }}
        >
          Sign Out
          <LogOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
