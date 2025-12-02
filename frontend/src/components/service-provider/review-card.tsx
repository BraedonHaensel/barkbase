'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Review } from '@/types/review';
import { ServiceType } from '@/enums/service-type';
import { CircleUser, Footprints, House } from 'lucide-react';
import ReviewForm from './review-form';
import { dateToLocalYMD } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type Props = {
  review: Review;
};

// Card for dispalying a service provider's review
const ReviewCard = ({ review }: Props) => {
  return (
    <Card className="border-3">
      <CardHeader className="flex items-center">
        <CardTitle className="grid w-full grid-cols-2 text-xl font-bold">
          <div>
            {review.serviceType === ServiceType.WALKING ? (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Footprints /> <span>DOG WALK</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <House /> <span>DOG SITTING</span>
              </div>
            )}
            <p className="text-lg font-medium">{dateToLocalYMD(review.date)}</p>
          </div>

          <div className="flex h-10 items-center justify-end gap-4">
            <p className="truncate">
              {review.oFirstName} {(review.oLastName ?? '').charAt(0)}.
            </p>
            <div className="aspect-square h-full focus:outline-none">
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={review.oImageUrl}
                    alt="Profile image"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-white">
                    <CircleUser className="h-full w-full" />
                  </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <ReviewForm review={review} />
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
