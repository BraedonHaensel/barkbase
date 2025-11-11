import { Province } from '@/enums/province';
import { ServiceType } from '@/enums/service-type';

// Dog data type
export interface OUpcomingBooking {
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
}
