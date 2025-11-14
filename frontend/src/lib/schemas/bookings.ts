import { Province } from '@/enums/province';
import { ServiceType } from '@/enums/service-type';
import { z } from 'zod';

// Schema for the create booking form
export const createBookingSchema = z.object({
  serviceType: z.enum(ServiceType),
  startDate: z.date(),
  startTime: z.string().nonempty('Required field'),
  endDate: z.date(),
  endTime: z.string().nonempty('Required field'),
  dogNames: z.array(z.string()).nonempty('Must select at least 1 dog'),
  street: z.string().nonempty('Required field'),
  city: z.string().nonempty('Required field'),
  province: z.string().nonempty('Required field'),
  note: z.string().optional(),
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
