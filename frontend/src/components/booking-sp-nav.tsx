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
  userDetails: {
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    rating?: number;
  };
};

// Booking owner or service provider icon with a dropdown menu for their details
const BookingProfileIcon = ({ userDetails }: Props) => {
  const [open, setOpen] = useState(false);

  console.log(userDetails.imageUrl);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Profile icon button */}
      <DropdownMenuTrigger className="aspect-square h-full hover:cursor-pointer hover:opacity-60 focus:outline-none">
        <Avatar className="h-full w-full">
          <AvatarImage
            src={userDetails.imageUrl}
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
            {userDetails.firstName} {userDetails.lastName}
          </p>
          <p className="text-muted-foreground truncate text-sm">
            {userDetails.email}
          </p>
        </div>
        {userDetails.rating && (
          <>
            {/* Star rating */}
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <Star
                  key={num}
                  size={18}
                  fill={num <= (userDetails.rating ?? 0) ? 'yellow' : '#111'}
                />
              ))}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookingProfileIcon;
