import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';
import Providers from '@/components/providers';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BarkBase',
  description: 'An application for dog walking and sitting services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              success: '!bg-green-300 !border-green-300',
              error: '!bg-red-300 !border-red-300',
            },
          }}
        />
        <Providers>
          <div
            className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen min-w-[320px] flex-col antialiased`}
          >
            <header>
              <div className="border-black-200 h-15 w-full border-b bg-teal-100 py-2">
                <div className="mx-auto h-full max-w-7xl px-8">
                  <Navbar />
                </div>
              </div>
            </header>
            <main className="h-full">
              <div className="mx-auto h-full max-w-7xl p-8">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
