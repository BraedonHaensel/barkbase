'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/context/session-context';
import { UserProvider } from '@/context/user-context';

const queryClient = new QueryClient();

const Providers = ({ children }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <UserProvider>{children}</UserProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default Providers;
