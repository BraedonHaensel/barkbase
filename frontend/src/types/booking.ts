import { Province } from '@/enums/province';
import { ServiceType } from '@/enums/service-type';

// Booking data type
export interface Booking {
  id: string;
  oEmail: string;
  dogNames: Array<string>;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  serviceType: ServiceType;
  street: string;
  city: string;
  province: Province;
  price: string;
  note: string;
  spEmail: string;
}
