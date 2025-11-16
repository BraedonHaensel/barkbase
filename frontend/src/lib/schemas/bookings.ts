import { Province } from '@/enums/province';
import { ServiceType } from '@/enums/service-type';
import { z } from 'zod';

// Schema for the create or edit booking form
export const createEditBookingSchema = z.object({
  serviceType: z.enum(ServiceType),
  startDate: z.date(),
  startTime: z.string().nonempty('Required field'),
  endDate: z.date(),
  endTime: z.string().nonempty('Required field'),
  dogNames: z.array(z.string()).nonempty('Must select at least 1 dog'),
  street: z.string().nonempty('Required field'),
  city: z.string().nonempty('Required field'),
  province: z.string().nonempty('Required field'),
  price: z
    .string()
    .nonempty('Required field')
    .regex(/^\d*$/, 'Price must be a whole number')
    .min(2, 'Price is too low!')
    .max(4, 'Price is too high!'),
  note: z.string().optional(),
});

// Schema for the general booking view form
export const bookingSchema = z.object({
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
