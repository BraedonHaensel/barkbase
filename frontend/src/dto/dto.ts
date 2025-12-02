// Common data transfer objects for API requests

export interface OwnerDto {
  email: string;
  f_name: string;
  l_name: string;
  province: string;
  city: string;
  street: string;
  phone_num: string;
  image_url: string;
}

export interface EmergencyContactDto {
  phone_num: string;
  owner_email: string;
  relationship: string;
  email: string;
  f_name: string;
  l_name: string;
}

export interface DogDto {
  name: string;
  o_email: string;
  birth_date: string; // Serialized ISO string
  size: string;
  image_url: string;
  breeds: Array<string>;
}

export interface BookingDto {
  id: string;
  o_email: string;
  sp_email: string;
  start_datetime: string; // Serialized ISO string
  end_datetime: string; // Serialized ISO string
  service_type: string; // "WALKING" or "SITTING"
  price: number;
  dog_names: Array<string>;
  province: string;
  city: string;
  street: string;
  note: string;
  f_name?: string;
  l_name?: string;
  phone_num?: string;
  image_url?: string;
}

export interface ServiceProviderDto {
  email: string;
  f_name: string;
  l_name: string;
  province: string;
  city: string;
  street: string;
  phone_num: string;
  image_url: string;
}

export interface ReviewDto {
  id: string;
  o_email: string;
  o_image_url: string;
  sp_email: string;
  service_type: string;
  date: Date;
  star_rating: number;
  description?: string;
}
