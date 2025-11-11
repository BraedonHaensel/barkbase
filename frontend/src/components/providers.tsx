'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/context/session-context';
import { UserProvider } from '@/context/user-context';

// Initialize the TanStack query client. See https://tanstack.com/query/latest/docs/framework/react/quick-start
const queryClient = new QueryClient();

// Application context providers
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
