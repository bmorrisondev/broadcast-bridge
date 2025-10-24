import { ClerkProvider } from '@/components/clerk-provider';
import { ConvexClientProvider } from '@/components/convex-client-provider';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Press_Start_2P } from 'next/font/google';
import './globals.css';
import { shadcn } from '@clerk/themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const pressStart2P = Press_Start_2P({
  variable: '--font-retro',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Broadcast Bridge',
  description: 'The simple bridge between recording and every podcast app',
  icons: {
    icon: '/bblogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      theme: shadcn,
    }}>
      <ConvexClientProvider>
        <html
          lang='en'
          className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} h-full`}
          suppressHydrationWarning
        >
          <body className={`flex min-h-full flex-col antialiased`}>
            <ThemeProvider
              attribute='class'
              defaultTheme='standard'
              themes={['standard', 'retro']}
              value={{ standard: 'light', retro: 'retro' }}
              disableTransitionOnChange
            >
              <Header />
              {children}
            </ThemeProvider>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
