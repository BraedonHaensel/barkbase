// Review data type
export interface Review {
  id: string;
  oEmail: string;
  spEmail: string;
  serviceType: string;
  date: Date;
  starRating: number;
  description?: string;
}
