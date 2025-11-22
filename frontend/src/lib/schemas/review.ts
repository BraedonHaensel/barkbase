import z from 'zod';

// Schema for the create review form
export const createReviewSchema = z.object({
  rating: z.number(),
  description: z.string().optional(),
});

// Schema for viewwing reviews
export const reviewSchema = z.object({
  rating: z.number(),
  description: z.string().optional(),
});
