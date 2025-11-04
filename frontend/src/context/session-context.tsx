'use client';

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);

  // Try to load the session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('session');
      setSession(stored ? JSON.parse(stored) : null);
    } catch {
      setSession(null);
    }
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
    <SessionContext.Provider value={{ session, setSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};
