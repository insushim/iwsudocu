'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/store/userStore';

/**
 * Mirrors accessibility preferences onto the document root so plain CSS can
 * react to them (see globals.css). Kept out of the game components so the
 * preference applies everywhere — board, number pad, print sheet.
 */
export function AccessibilitySync() {
  const largeText = useUserStore((s) => s.profile.settings.largeText);

  useEffect(() => {
    document.documentElement.dataset.largeText = largeText ? 'true' : 'false';
  }, [largeText]);

  return null;
}
