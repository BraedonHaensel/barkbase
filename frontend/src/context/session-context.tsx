'use client';

import { LoaderCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createContext, ReactNode, useEffect, useState } from 'react';

// Type for the SessionContext
interface SessionContextType {
  session: Session | null;
  setSession: (user: Session) => void;
  clearSession: () => void;
}

// SessionContext default setup
export const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => {},
  clearSession: () => {},
});

// Provider for the SessionContext
export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to load the session from localStorage after mounting
  useEffect(() => {
    try {
      const stored = localStorage.getItem('session');
      setSession(stored ? JSON.parse(stored) : null);
    } catch {
      setSession(null);
    }
    setIsLoading(false);
  }, []);

  // Update localStorage to keep it in sync after session changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session));
    } else {
      localStorage.removeItem('session');
    }
  }, [session]);

  // Clear the active session (log out)
  const clearSession = () => {
    setSession(null);
    redirect('/login');
  };

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
