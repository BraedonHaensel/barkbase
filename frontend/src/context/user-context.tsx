'use client';

import api from '@/lib/api';
import { LoaderCircle } from 'lucide-react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { SessionContext } from './session-context';
import { toast } from 'sonner';
import { Province } from '@/enums/province';
import { User } from '@/types/user';
import { OwnerDto, ServiceProviderDto } from '@/dto/dto';

// Type for the UserContext
interface UserContextType {
  user: User | null;
  refreshUser: () => void;
  clearUser: () => void;
}

// User Context default setup
export const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: () => {},
  clearUser: () => {},
});

// Provider for the UserContext
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session, clearSession } = useContext(SessionContext);

  // Get the user information from the API
  const getUser = async () => {
    setIsLoading(true);
    clearUser();
    if (!session) {
      setIsLoading(false);
      return;
    }
    api
      .get('/users/me', {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse user information fields from the response
        const data: OwnerDto | ServiceProviderDto = response.data;
        const userData: User = {
          email: data.email,
          firstName: data.f_name,
          lastName: data.l_name,
          phoneNum: data.phone_num,
          province: Province[data.province as keyof typeof Province],
          city: data.city,
          street: data.street,
          imageUrl: data.image_url,
        };
        setUser(userData);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get user profile: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get user profile. Please try again.');
        }
        clearSession();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Get the new user information after any session changes
  useEffect(() => {
    getUser();
  }, [session]);

  // Clear user information
  const clearUser = () => setUser(null);

  // Refresh the user information
  const refreshUser = () => {
    getUser();
  };

  return (
    <>
      {isLoading ? (
        <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />
      ) : (
        <UserContext.Provider value={{ user, refreshUser, clearUser }}>
          {children}
        </UserContext.Provider>
      )}
    </>
  );
};
