import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
    (useQuery as unknown as vi.Mock).mockReturnValue(undefined);
    render(<EpisodesPage />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows redirecting state when no podcast and triggers router.replace', async () => {
    const replace = vi.fn();
    // override useRouter for this test
    vi.doMock('next/navigation', () => ({ useRouter: () => ({ replace, back: vi.fn() }) }));

    (useQuery as unknown as vi.Mock).mockReturnValue({ podcast: null, episodes: [] });
    const Page = (await import('./page')).default;

    render(<Page />);
    expect(screen.getByText('Redirecting…')).toBeInTheDocument();
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/app/onboarding');
    });
  });

  it('shows empty state when there are no episodes', () => {
    (useQuery as unknown as vi.Mock).mockReturnValue({
      podcast: { title: 'My Pod', description: 'Desc' },
      episodes: [],
    });
    render(<EpisodesPage />);
    expect(screen.getByText('No episodes yet.')).toBeInTheDocument();
  });

  it('renders podcast header and list when episodes exist', () => {
    (useQuery as unknown as vi.Mock).mockReturnValue({
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
