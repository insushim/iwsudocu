'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUserStore } from '@/lib/store/userStore';
import { kstToday, kstDaysAgo, msUntilKstMidnight } from '@/lib/game/daily';

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

/**
 * In-app warning shown on the day a streak is about to lapse. Push notifications
 * would reach players who aren't in the app, but they need an FCM sender key and
 * a notification permission flow — this covers the in-session case meanwhile.
 */
export function StreakRiskBanner() {
  const streak = useUserStore((s) => s.profile.streak);
  const freezes = streak.streakFreezeCount;
  const [remaining, setRemaining] = useState(() => msUntilKstMidnight());

  useEffect(() => {
    const id = setInterval(() => setRemaining(msUntilKstMidnight()), 60000);
    return () => clearInterval(id);
  }, []);

  // At risk only when a live streak exists, today isn't done yet, and the last
  // play was literally yesterday (an older date means it already lapsed).
  const atRisk =
    streak.currentStreak > 0 &&
    streak.lastPlayDate !== kstToday() &&
    streak.lastPlayDate === kstDaysAgo(1);

  if (!atRisk) return null;

  return (
    <Link
      href="/play"
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3',
        'border border-orange-500/30 bg-orange-500/10',
        'transition-colors hover:bg-orange-500/15',
      )}
    >
      <Flame className="h-5 w-5 shrink-0 text-orange-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-orange-200">
          {streak.currentStreak}일 연속 기록이 끊길 수 있어요
        </p>
        <p className="text-xs text-orange-300/60">
          {formatCountdown(remaining)} 안에 한 판만 완료하면 유지됩니다
          {freezes > 0 && ` · 스트릭 보호 ${freezes}개 보유`}
        </p>
      </div>
      <span className="shrink-0 rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs font-bold text-orange-200">
        지금 도전
      </span>
    </Link>
  );
}
