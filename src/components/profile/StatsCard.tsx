'use client';

import { useUserStore } from '@/lib/store/userStore';
import { Card } from '@/components/ui/Card';
import { formatTime, formatNumber } from '@/lib/utils/format';
import { DIFFICULTY_CONFIGS } from '@/lib/utils/constants';
import type { Difficulty } from '@/types';

interface StatItemProps {
  label: string;
  value: string | number;
  subtext?: string;
}

function StatItem({ label, value, subtext }: StatItemProps) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white/5 p-3">
      <span className="text-xl font-bold text-white font-number">{value}</span>
      <span className="mt-0.5 text-xs text-slate-400">{label}</span>
      {subtext && (
        <span className="text-[10px] text-slate-500">{subtext}</span>
      )}
    </div>
  );
}

export function StatsCard() {
  const stats = useUserStore((s) => s.profile.stats);

  const difficulties: Difficulty[] = [
    'beginner',
    'easy',
    'medium',
    'hard',
    'expert',
    'master',
  ];

  const totalHours = Math.floor(stats.totalTimePlayed / 3600);
  const totalMinutes = Math.floor((stats.totalTimePlayed % 3600) / 60);
  const totalTimeStr =
    totalHours > 0 ? `${totalHours}시간 ${totalMinutes}분` : `${totalMinutes}분`;

  return (
    <Card className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        통계
      </h3>

      {/* Main stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatItem label="플레이" value={formatNumber(stats.totalGamesPlayed)} />
        <StatItem label="승리" value={formatNumber(stats.totalGamesWon)} />
        <StatItem
          label="승률"
          value={`${Math.round(stats.winRate)}%`}
        />
        <StatItem label="퍼펙트" value={formatNumber(stats.perfectGames)} />
        <StatItem label="최대 콤보" value={formatNumber(stats.maxCombo)} />
        <StatItem label="총 플레이" value={totalTimeStr} />
      </div>

      {/* Best times per difficulty */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-slate-400">
          난이도별 최고 기록
        </h4>
        <div className="space-y-1.5">
          {difficulties.map((diff) => {
            const config = DIFFICULTY_CONFIGS[diff];
            const best = stats.bestTimes[diff];
            return (
              <div
                key={diff}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-xs text-slate-300">
                    {config.nameKo}
                  </span>
                </div>
                <span className="text-xs font-bold font-number text-white">
                  {best > 0 ? formatTime(best) : '--:--'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
