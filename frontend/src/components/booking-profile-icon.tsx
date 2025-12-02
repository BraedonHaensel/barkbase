'use client';

import { useContext, useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CircleUser, LoaderCircle, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SessionContext } from '@/context/session-context';
import api from '@/lib/api';
import { toast } from 'sonner';
import { AccountType } from '@/enums/account-type';

type Props = {
  userDetails: {
    accountType: AccountType;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    imageUrl: string;
  };
};

// Booking owner or service provider icon with a dropdown menu for their details
const BookingProfileIcon = ({ userDetails }: Props) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avgRating, setAvgRating] = useState<number>();
  const { session } = useContext(SessionContext);

  // Gets a user's average review rating (service providers only)
  const getAvgRating = async () => {
    setIsLoading(true);
    api
      .get(`/reviews/service_provider/${userDetails.email}/average`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse the average rating from the response
        const data = response.data;
        setAvgRating(Number(data.average_rating));
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          if (apiError.includes('No reviews found')) {
            // No reviews, hide the error
            return;
          }
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get average rating: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get average rating. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (userDetails.accountType === AccountType.SERVICE_PROVIDER) {
      // Get avergae rating if this is for a service provider
      getAvgRating();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
  }

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
        {/* User name, email, and phone number */}
        <div className="p-2">
          <p className="truncate font-medium">
            {userDetails.firstName} {userDetails.lastName}
          </p>
          <p className="text-muted-foreground truncate text-sm">
            {userDetails.email}
          </p>
          <p className="text-muted-foreground truncate text-sm">
            {userDetails.phoneNumber}
          </p>
        </div>
        {/* Display the average review rating (must be a service provider) */}
        {avgRating && (
          <>
            {/* Star rating */}
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <Star
                  key={num}
                  size={18}
                  fill={num <= avgRating ? 'yellow' : '#111'}
                />
              ))}
            </div>
          </>
        )}
        {/* Display a no reviews message if not found (must be a service provider) */}
        {!avgRating &&
          userDetails.accountType === AccountType.SERVICE_PROVIDER && (
            <div className="flex justify-center">
              <p className="text-muted-foreground truncate text-sm">
                No reviews.
              </p>
            </div>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookingProfileIcon;
