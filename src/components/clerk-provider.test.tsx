import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import { ClerkProvider } from './clerk-provider';

describe('ClerkProvider', () => {
  it('renders children', () => {
    render(
      <ClerkProvider>
        <div data-testid="child">ok</div>
      </ClerkProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('ok');
  });
});
