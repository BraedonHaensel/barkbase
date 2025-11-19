import { Province } from '@/enums/province';

// User login session data type
export interface Session {
  token: string;
  accountType: string;
}

// General user information data type
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  phoneNum: string;
  province: Province;
  city: string;
  street: string;
  imageUrl: string;
}
