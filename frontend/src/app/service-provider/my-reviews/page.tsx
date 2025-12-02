'use client';

import ReviewCard from '@/components/service-provider/review-card';
import { SessionContext } from '@/context/session-context';
import { UserContext } from '@/context/user-context';
import { ReviewDto } from '@/dto/dto';
import { AccountType } from '@/enums/account-type';
import { ServiceType } from '@/enums/service-type';
import api from '@/lib/api';
import { Review } from '@/types/review';
import { LoaderCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Service provider reviews page
export default function MyReviewsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Array<Review>>([]);
  const { session } = useContext(SessionContext);
  const { user } = useContext(UserContext);

  // A service provider session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.SERVICE_PROVIDER) {
      redirect('/login');
    }
  }, [session]);

  // Fetch all of the provider's reviews from the API
  const getReviews = async () => {
    setIsLoading(true);
    api
      .get(`/reviews/service_provider/${user?.email}`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse each review from the response
        const newReviews: Array<Review> = [];
        const data: Array<ReviewDto> = response.data;
        data.forEach((review) => {
          const reviewData: Review = {
            id: review.id,
            oEmail: review.o_email,
            oImageUrl: review.o_image_url,
            spEmail: review.sp_email,
            serviceType:
              ServiceType[review.service_type as keyof typeof ServiceType],
            date: new Date(review.date),
            starRating: review.star_rating,
            description: review.description,
          };
          newReviews.push(reviewData);
        });
        setReviews(newReviews);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get reviews: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get reviews. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getReviews();
  }, []);

  if (isLoading) {
    return <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        My Reviews
      </p>
      {reviews.length == 0 ? (
        <div className="flex justify-center">
          <p className="text-muted-foreground">You don't have any reviews.</p>
        </div>
      ) : (
        <div className="mx-auto flex w-150 flex-col gap-6">
          {/* Render a card for each review */}
          {reviews.map((review, id) => (
            <ReviewCard key={id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
