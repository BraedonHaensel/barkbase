import { Province } from '@/enums/province';
import { ServiceType } from '@/enums/service-type';
import { z } from 'zod';

// Schema for the create booking form
export const createBookingSchema = z.object({
  serviceType: z.enum(ServiceType),
  startDate: z.date(),
  startTime: z.string(),
  endDate: z.date(),
  endTime: z.string(),
});

// Schema for the owner upcoming booking form
export const oUpcomingBookingSchema = z.object({
  dogNames: z.array(z.string()),
  startDate: z.date(),
  startTime: z.string(),
  endDate: z.date(),
  endTime: z.string(),
  serviceType: z.enum(ServiceType),
  street: z.string(),
  city: z.string(),
  province: z.enum(Province),
  price: z.string(),
  note: z.string(),
});
