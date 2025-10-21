'use client';
import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className='flex h-16 items-center justify-between gap-4 border-b px-4'>
      <Link
        href='/'
        className='flex items-center gap-x-4'
      >
        <Image src='/bblogo.png' alt='Broadcast Bridge' width={28} height={28} />
        <span className='font-semibold'>Broadcast Bridge</span>
      </Link>
      <SignedOut>
        <nav className='hidden items-center gap-6 sm:flex'>
          <Link href='#features' className='text-sm text-muted-foreground hover:text-foreground'>
            Features
          </Link>
          <Link href='#how-it-works' className='text-sm text-muted-foreground hover:text-foreground'>
            How it works
          </Link>
          <Link href='#pricing' className='text-sm text-muted-foreground hover:text-foreground'>
            Pricing
          </Link>
        </nav>
      </SignedOut>
      <div className='flex items-center gap-x-4'>
        <ThemeToggle />
        <SignedOut>
          <Link href='/sign-in-2'>
            <Button variant='ghost'>Sign in</Button>
          </Link>
          <Link href='/sign-up-2'>
            <Button>Sign up</Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href='/app/episodes'>
            <Button variant='ghost'>Dashboard</Button>
          </Link>
          <UserButton showName />
        </SignedIn>
      </div>
    </header>
  );
}
