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

type Props = {
  user: Pick<OldUser, 'email' | 'firstName' | 'lastName'>;
};

const ProvileNav = ({ user }: Props) => {
  const [open, setOpen] = useState(false);
  const { clearSession } = useContext(SessionContext);

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
