'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CircleUser, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Props = {
  spDetails: {
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    rating: number;
  };
};

// Booking service provider icon with a dropdown menu
const BookingSPProfile = ({ spDetails }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Profile icon button */}
      <DropdownMenuTrigger className="aspect-square h-full hover:cursor-pointer hover:opacity-60 focus:outline-none">
        <Avatar className="h-full w-full">
          <AvatarImage
            src={spDetails.imageUrl}
            alt="Profile image"
            className="object-cover"
          />
          <AvatarFallback className="bg-white">
            <CircleUser className="h-full w-full" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* Dropdown contents */}
      <DropdownMenuContent className="max-w-[min(400px,100vw)]" align="end">
        {/* Service provider name and email */}
        <div className="p-2">
          <p className="truncate font-medium">
            {spDetails.firstName} {spDetails.lastName}
          </p>
          <p className="text-muted-foreground truncate text-sm">
            {spDetails.email}
          </p>
        </div>
        {/* Star rating */}
        <div className="flex justify-center">
          {[1, 2, 3, 4, 5].map((num) => (
            <Star
              key={num}
              size={18}
              fill={num <= spDetails.rating ? 'yellow' : '#111'}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookingSPProfile;
