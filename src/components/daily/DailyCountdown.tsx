'use client';

import { useSyncExternalStore } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { msUntilKstMidnight } from '@/lib/game/daily';

interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
}

const ZERO: Countdown = { hours: 0, minutes: 0, seconds: 0 };

// The daily puzzle rolls over at KST midnight regardless of where the player
// is, so the countdown has to track that instant — not the device's own
// midnight, which was off by the timezone offset for everyone outside Korea.
function subscribe(onChange: () => void): () => void {
  const interval = setInterval(onChange, 1000);
  return () => clearInterval(interval);
}

// useSyncExternalStore compares snapshots by identity, so a fresh object every
// call would re-render forever. Cache and only rebuild when the second ticks.
let cachedSeconds = -1;
let cached: Countdown = ZERO;

function getSnapshot(): Countdown {
  const totalSeconds = Math.max(0, Math.floor(msUntilKstMidnight() / 1000));
  if (totalSeconds !== cachedSeconds) {
    cachedSeconds = totalSeconds;
    cached = {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }
  return cached;
}

function getServerSnapshot(): Countdown {
  return ZERO;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function DailyCountdown() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-indigo-400" />
        <span className="text-sm text-slate-400">다음 도전까지</span>
      </div>
      <div className="flex items-center gap-1 font-number">
        <TimeUnit value={time.hours} label="시" />
        <span className="text-slate-500 text-sm font-bold">:</span>
        <TimeUnit value={time.minutes} label="분" />
        <span className="text-slate-500 text-sm font-bold">:</span>
        <TimeUnit value={time.seconds} label="초" />
      </div>
    </Card>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className="text-lg font-bold text-white">{pad(value)}</span>
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}
