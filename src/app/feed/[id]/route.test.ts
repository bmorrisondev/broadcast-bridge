import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('convex/nextjs', () => ({
  fetchQuery: vi.fn(),
}));

import { fetchQuery } from 'convex/nextjs';
import { GET } from './route';

const asText = async (res: Response) => await res.text();

describe('RSS GET route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 404 when podcast is not found', async () => {
    (fetchQuery as unknown as Mock).mockResolvedValue({ podcast: null, episodes: [] });
    const req = new Request('https://example.com/feed/abc.xml');
    const res = await GET(req, { params: Promise.resolve({ id: 'abc.xml' }) });
    expect(res.status).toBe(404);
    expect(await asText(res)).toContain('Feed not found');
  });

  it('returns 200 with valid RSS XML and escapes values', async () => {
    (fetchQuery as unknown as Mock).mockResolvedValue({
      podcast: {
        title: 'My & Show',
        description: 'Desc <test>',
        language: 'en-us',
        copyright: '© 2025',
        author: 'Me',
        ownerName: 'Owner',
        ownerEmail: 'owner@example.com',
        category: 'Tech',
        explicit: false,
        imageUrl: 'https://example.com/image.png',
        websiteUrl: 'https://example.com',
        lastUpdated: 1733788800000,
      },
      episodes: [
        {
          _id: '1',
          _creationTime: 1733788800000,
          title: 'Ep 1 > Start',
          description: 'Hello',
          pubDate: 1733788800000,
          guid: 'ep1',
          audioUrl: 'https://cdn.example.com/1.mp3',
          audioType: 'audio/mpeg',
          audioLength: 123,
          duration: '10:00',
          episodeNumber: 1,
          seasonNumber: 1,
          explicit: true,
          keywords: ['a', 'b'],
        },
      ],
    });

    const req = new Request('https://example.com/feed/pod-id');
    const res = await GET(req, { params: Promise.resolve({ id: 'pod-id' }) });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/rss+xml');
    const xml = await asText(res);
    expect(xml).toContain('<rss');
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&lt;');
    expect(xml).toContain('<itunes:explicit>no</itunes:explicit>');
    expect(xml).toContain('<itunes:keywords>a, b</itunes:keywords>');
    expect(xml).toContain('<enclosure url=');
  });
});
