import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names and condenses duplicates', () => {
    expect(cn('a', 'b', ['c', { d: true }])).toContain('a');
    const res = cn('px-2', 'px-2', 'py-1');
    expect(res).toBe('px-2 py-1');
  });
});
