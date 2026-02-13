'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store/gameStore';

export function useTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const status = useGameStore((state) => state.status);
  const tick = useGameStore((state) => state.tick);

  useEffect(() => {
    if (status === 'playing') {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, tick]);
}
