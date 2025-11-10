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

interface UserContextType {
  user: User | null;
  refreshUser: () => void;
  clearUser: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: () => {},
  clearUser: () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session, clearSession } = useContext(SessionContext);

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
        const data = response.data;
        const userData: User = {
          email: data.email,
          firstName: data.f_name,
          lastName: data.l_name,
          phoneNum: data.phone_num,
          address: data.address,
        };
        setUser(userData);
        setIsLoading(false);
      })
      .catch((error) => {
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get user profile: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get user profile. Please try again.');
        }
        clearSession();
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getUser();
  }, [session]);

  const clearUser = () => setUser(null);

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
