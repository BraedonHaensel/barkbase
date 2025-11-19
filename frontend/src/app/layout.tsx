import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';
import Providers from '@/components/providers';
import { Toaster } from 'sonner';

// Geist Sans font
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono font
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Application metadata
export const metadata: Metadata = {
  title: 'BarkBase',
  description: 'An application for dog walking and sitting services.',
};

// Base layout for the application's HTML structure
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Toaster is a notification popup handler. See: https://ui.shadcn.com/docs/components/sonner */}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              success: '!bg-green-300 !border-green-300',
              warning: '!bg-amber-300 !border-amber-300',
              error: '!bg-red-300 !border-red-300',
            },
          }}
        />
        {/* Context providers */}
        <Providers>
          <div
            className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen min-w-[320px] flex-col antialiased`}
          >
            {/* Navbar at top of page */}
            <header>
              <div className="border-black-200 h-[70px] w-full border-b bg-teal-100 py-2">
                <div className="mx-auto h-full max-w-7xl px-8">
                  <Navbar />
                </div>
              </div>
            </header>
            {/* Main page body */}
            <main>
              <div className="mx-auto max-w-7xl p-8">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
