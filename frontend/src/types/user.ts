// User login session data type
interface Session {
  token: string;
  accountType: string;
}

// General user information data type
interface User {
  email: string;
  firstName: string;
  lastName: string;
  phoneNum: string;
  address: string;
  image_url: string;
}
