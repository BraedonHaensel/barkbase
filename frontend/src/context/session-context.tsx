'use client';

import { LoaderCircle } from 'lucide-react';
import { createContext, ReactNode, useEffect, useState } from 'react';

interface SessionContextType {
  session: Session | null;
  setSession: (user: Session) => void;
  clearSession: () => void;
}

export const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => {},
  clearSession: () => {},
});

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to load the session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('session');
      setSession(stored ? JSON.parse(stored) : null);
    } catch {
      setSession(null);
    }
    setIsLoading(false);
  }, []);

  // Update localStorage if the session changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session));
    } else {
      localStorage.removeItem('session');
    }
  }, [session]);

  const clearSession = () => setSession(null);

  return (
    <>
      {isLoading ? (
        <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />
      ) : (
        <SessionContext.Provider value={{ session, setSession, clearSession }}>
          {children}
        </SessionContext.Provider>
      )}
    </>
  );
};
