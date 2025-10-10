import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Make React globally available for JSX
(globalThis as any).React = React;

// Clean up the DOM after each test
afterEach(() => {
  cleanup();
});

// JSDOM doesn't implement matchMedia; provide a minimal stub for components if needed
if (typeof window !== 'undefined' && !('matchMedia' in window)) {
  // @ts-expect-error augment jsdom
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}
