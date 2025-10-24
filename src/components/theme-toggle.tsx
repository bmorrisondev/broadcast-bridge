'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import imac from '@/app/imac.png';
import retro from '@/app/retro.png';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleToggle() {
    const current = theme ?? 'standard';
    setTheme(current === 'retro' ? 'standard' : 'retro');
  }

  if (!mounted) return null;

  const isRetro = (theme ?? 'standard') === 'retro';

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label={isRetro ? 'Switch to standard theme' : 'Switch to retro theme'}
      onClick={handleToggle}
    >
      <Image
        src={isRetro ? imac : retro}
        alt={isRetro ? 'Retro theme' : 'Standard theme'}
        width={20}
        height={20}
        priority
      />
    </Button>
  );
}

