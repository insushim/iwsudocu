'use client';

import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

function getDaysInRange(weeksBack: number): string[] {
  const days: string[] = [];
  const today = new Date();
  const totalDays = weeksBack * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

export function StreakCalendar() {
  const streak = useUserStore((s) => s.profile.streak);

  const days = useMemo(() => getDaysInRange(12), []);
  const playedSet = useMemo(
    () => new Set(streak.streakHistory),
    [streak.streakHistory]
  );

  // Build weeks (columns) of 7 days each
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <Card className="space-y-3">
      {/* Streak number */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          활동 기록
        </h3>
        <div className="flex items-center gap-1.5">
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="text-xl font-extrabold text-orange-400 font-number">
            {streak.currentStreak}
          </span>
          <span className="text-xs text-slate-400">일 연속</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="flex h-3 w-5 items-center justify-center text-[8px] text-slate-500"
            >
              {i % 2 === 0 ? label : ''}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const isPlayed = playedSet.has(day);
              const isToday =
                day ===
                new Date().toISOString().split('T')[0];

              return (
                <div
                  key={day}
                  title={day}
                  className={cn(
                    'h-3 w-3 rounded-sm transition-colors',
                    isPlayed
                      ? 'bg-green-500'
                      : 'bg-white/5',
                    isPlayed &&
                      isToday &&
                      'ring-1 ring-green-300'
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span>최장 스트릭: {streak.longestStreak}일</span>
        <span className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-white/5" /> 미플레이
        </span>
        <span className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-green-500" /> 플레이
        </span>
      </div>
    </Card>
  );
}
