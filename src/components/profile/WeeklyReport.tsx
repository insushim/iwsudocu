'use client';

import { useMemo } from 'react';
import { CalendarRange } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/lib/store/userStore';
import { formatTime } from '@/lib/utils/format';
import { kstDaysAgo } from '@/lib/game/daily';
import { DIFFICULTY_CONFIGS } from '@/lib/utils/constants';
import type { GameSession } from '@/types';

function summarize(sessions: GameSession[]) {
  if (sessions.length === 0) return null;
  const games = sessions.length;
  const totalTime = sessions.reduce((a, s) => a + s.timeInSeconds, 0);
  const mistakes = sessions.reduce((a, s) => a + s.mistakes, 0);
  const best = sessions.reduce((a, s) => Math.max(a, s.score), 0);
  const days = new Set(sessions.map((s) => s.date)).size;
  const hardest = sessions.reduce((a, s) => {
    const order: string[] = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master'];
    return order.indexOf(s.difficulty) > order.indexOf(a) ? s.difficulty : a;
  }, 'beginner' as string);
  return { games, totalTime, mistakes, best, days, hardest };
}

/** Last-7-day summary — the "brain training report" side of the product. */
export function WeeklyReport() {
  const sessions = useUserStore((s) => s.profile.stats.recentSessions);

  const { thisWeek, lastWeek } = useMemo(() => {
    const all = sessions ?? [];
    const d7 = kstDaysAgo(6);
    const d14 = kstDaysAgo(13);
    return {
      thisWeek: summarize(all.filter((s) => s.date >= d7)),
      lastWeek: summarize(all.filter((s) => s.date >= d14 && s.date < d7)),
    };
  }, [sessions]);

  if (!thisWeek) {
    return (
      <Card className="space-y-1 py-4">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">주간 리포트</h3>
        </div>
        <p className="text-xs text-slate-500">
          이번 주 기록이 아직 없습니다. 한 판 완료하면 리포트가 만들어져요.
        </p>
      </Card>
    );
  }

  const delta = lastWeek ? thisWeek.games - lastWeek.games : null;
  const avgMistakes = (thisWeek.mistakes / thisWeek.games).toFixed(1);

  const rows: { label: string; value: string }[] = [
    { label: '플레이', value: `${thisWeek.games}판 · ${thisWeek.days}일` },
    { label: '총 플레이 시간', value: formatTime(thisWeek.totalTime) },
    { label: '판당 평균 실수', value: `${avgMistakes}회` },
    { label: '최고 점수', value: `${thisWeek.best.toLocaleString()}점` },
    {
      label: '최고 난이도',
      value: `${DIFFICULTY_CONFIGS[thisWeek.hardest as keyof typeof DIFFICULTY_CONFIGS].icon} ${
        DIFFICULTY_CONFIGS[thisWeek.hardest as keyof typeof DIFFICULTY_CONFIGS].nameKo
      }`,
    },
  ];

  return (
    <Card className="space-y-3 py-4">
      <div className="flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">주간 리포트</h3>
        <span className="text-[10px] text-slate-500">최근 7일</span>
      </div>

      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{r.label}</span>
            <span className="font-semibold text-white tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>

      {delta !== null && (
        <p className="text-xs text-slate-500">
          지난주 대비{' '}
          <span className={delta >= 0 ? 'text-emerald-400' : 'text-orange-400'}>
            {delta >= 0 ? `+${delta}` : delta}판
          </span>
        </p>
      )}
    </Card>
  );
}
