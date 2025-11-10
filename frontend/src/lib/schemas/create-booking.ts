import { BookingType } from '@/enums/booking-type';
import { z } from 'zod';

export const createBookingSchema = z.object({
  bookingType: z.enum([BookingType.WALKING, BookingType.SITTING]),
  startDate: z.date(),
  startTime: z.string(),
  endDate: z.date(),
  endTime: z.string(),
});
