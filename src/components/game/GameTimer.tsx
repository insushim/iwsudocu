'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatTime } from '@/lib/utils/format';
import { useGameStore } from '@/lib/store/gameStore';

export default function GameTimer() {
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const status = useGameStore((s) => s.status);
  const tick = useGameStore((s) => s.tick);

  const isPaused = status === 'paused';
  const isPlaying = status === 'playing';

  // Drive the timer tick
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, tick]);

  return (
    <span
      className={cn(
        'font-mono text-lg font-semibold tabular-nums tracking-wider',
        isPaused ? 'blur-sm text-white/30' : 'text-white/90',
      )}
    >
      {formatTime(elapsedTime)}
    </span>
  );
}
