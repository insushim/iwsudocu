'use client';

import { useEffect } from 'react';
import { Target, Gift } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/lib/store/userStore';
import { getWeekId } from '@/lib/game/daily';
import { cn } from '@/lib/utils/cn';

export function WeeklyMissions() {
  const weeklyMissions = useUserStore((s) => s.profile.weeklyMissions);
  const getWeeklyMissions = useUserStore((s) => s.getWeeklyMissions);
  const claimWeeklyMission = useUserStore((s) => s.claimWeeklyMission);

  // Ensure the current week's missions exist (creates/rolls over if needed).
  useEffect(() => {
    const weekId = getWeekId(new Date());
    if (!weeklyMissions || weeklyMissions.weekId !== weekId) {
      getWeeklyMissions();
    }
  }, [weeklyMissions, getWeeklyMissions]);

  const missions = weeklyMissions?.missions ?? [];
  if (missions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Target className="h-4 w-4 text-indigo-400" />
        <h2 className="text-sm font-bold text-white">주간 미션</h2>
        <span className="text-[10px] text-slate-500">매주 초기화</span>
      </div>

      {missions.map((m) => {
        const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
        const done = m.progress >= m.target;
        return (
          <Card key={m.id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">{m.descriptionKo}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      done ? 'bg-emerald-400' : 'bg-indigo-400',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  {Math.min(m.progress, m.target)} / {m.target} · +{m.xpReward} XP · +{m.coinReward} 코인
                </p>
              </div>
              {m.claimed ? (
                <span className="shrink-0 text-xs font-semibold text-emerald-400">완료</span>
              ) : (
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => claimWeeklyMission(m.id)}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                    done
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'cursor-not-allowed bg-white/5 text-slate-500',
                  )}
                >
                  <Gift className="mr-1 inline h-3 w-3" />
                  {done ? '받기' : '진행 중'}
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
