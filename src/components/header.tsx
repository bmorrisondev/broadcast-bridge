import { Button } from '@/components/ui/button';
import { OrganizationSwitcher, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function Header() {
  return (
    <header className='flex h-16 items-center justify-between gap-4 border-b px-4'>
      <Link
        href='/'
        className='flex items-center gap-x-4'
      >
        <span className='font-semibold'>Broadcast Bridge</span>
      </Link>
      <div className='flex items-center gap-x-4'>
        <SignedOut>
          <SignInButton>
            <Button variant='ghost'>Sign in</Button>
          </SignInButton>
          <SignUpButton>
            <Button>Sign up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton showName />
        </SignedIn>
      </div>
    </header>
  );
}
