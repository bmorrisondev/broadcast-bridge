import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({ isSignedIn: true, getToken: vi.fn() }),
}));

// Ensure env is set before importing the module that reads it at top-level
beforeEach(() => {
  process.env.NEXT_PUBLIC_CONVEX_URL = 'https://convex.example.com';
});

describe('ConvexClientProvider', () => {
  it('renders children', async () => {
    const mod = await import('./convex-client-provider');
    const { ConvexClientProvider } = mod;
    const { ClerkProvider } = await import('@clerk/nextjs');

    render(
      <ClerkProvider>
        <ConvexClientProvider>
          <div data-testid="child">hello</div>
        </ConvexClientProvider>
      </ClerkProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('hello');
  });
});
