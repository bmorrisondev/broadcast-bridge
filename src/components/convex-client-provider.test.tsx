import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Ensure env is set before importing the module that reads it at top-level
beforeEach(() => {
  process.env.NEXT_PUBLIC_CONVEX_URL = 'https://convex.example.com';
});

describe('ConvexClientProvider', () => {
  it('renders children', async () => {
    const mod = await import('./convex-client-provider');
    const { ConvexClientProvider } = mod;

    render(
      <ConvexClientProvider>
        <div data-testid="child">hello</div>
      </ConvexClientProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('hello');
  });
});
