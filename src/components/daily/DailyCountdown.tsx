'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function DailyCountdown() {
  const [time, setTime] = useState(getTimeUntilMidnight);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
