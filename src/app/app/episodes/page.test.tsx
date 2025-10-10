import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ replace: vi.fn(), back: vi.fn() }),
  };
});

// Mock next/link to render children directly for simplicity in tests
vi.mock('next/link', () => ({
  default: ({ children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) => (
    <a {...rest}>{children}</a>
  ),
}));

import { useQuery } from 'convex/react';
import EpisodesPage from './page';

describe('EpisodesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state when data is undefined', () => {
    (useQuery as unknown as Mock).mockReturnValue(undefined);
    render(<EpisodesPage />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty episodes state when no podcast and redirects after timeout', async () => {
    vi.useFakeTimers();
    
    const replace = vi.fn();
    
    // Mock the router before importing the component
    const mockUseRouter = vi.fn(() => ({ replace, back: vi.fn() }));
    vi.doMock('next/navigation', () => ({ 
      useRouter: mockUseRouter
    }));

    // Clear module cache and re-import
    vi.resetModules();
    const { default: Page } = await import('./page');
    
    (useQuery as unknown as Mock).mockReturnValue({ podcast: null, episodes: [] });

    render(<Page />);
    
    // Initially shows empty state, not redirecting immediately
    expect(screen.getByText('No episodes yet.')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    
    // Fast forward past the 3 second timeout
    act(() => {
      vi.advanceTimersByTime(3100);
    });
    
    expect(replace).toHaveBeenCalledWith('/app/onboarding');
    
    vi.useRealTimers();
  });

  it('shows empty state when there are no episodes', () => {
    (useQuery as unknown as Mock).mockReturnValue({
      podcast: { title: 'My Pod', description: 'Desc' },
      episodes: [],
    });
    render(<EpisodesPage />);
    expect(screen.getByText('No episodes yet.')).toBeInTheDocument();
  });

  it('renders podcast header and list when episodes exist', () => {
    (useQuery as unknown as Mock).mockReturnValue({
      podcast: { title: 'My Pod', description: 'Desc', imageUrl: 'https://img' },
      episodes: [
        { _id: '1', title: 'Ep 1', description: 'd1', pubDate: 1733788800000 },
        { _id: '2', title: 'Ep 2' },
      ],
    });
    render(<EpisodesPage />);
    expect(screen.getByText('My Pod')).toBeInTheDocument();
    expect(screen.getByText('Ep 1')).toBeInTheDocument();
    expect(screen.getByText('Ep 2')).toBeInTheDocument();
  });
});
