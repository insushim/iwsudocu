'use client';

import { useUserStore } from '@/lib/store/userStore';
import { calculateLevel, TIER_CONFIGS } from '@/lib/game/leveling';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatNumber } from '@/lib/utils/format';

export function LevelProgress() {
  const profile = useUserStore((s) => s.profile);
  const levelData = calculateLevel(profile.totalXP);
  const tierConfig = TIER_CONFIGS[levelData.tier];
  const xpPercent =
    levelData.xpToNextLevel > 0
      ? (levelData.currentXP / levelData.xpToNextLevel) * 100
      : 0;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Level number */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tierConfig.gradient} shadow-lg`}
          >
            <span className="text-2xl font-extrabold text-white">
              {levelData.level}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-400">레벨</p>
            <p className="text-lg font-bold text-white">
              {levelData.titleKo}
            </p>
          </div>
        </div>

        {/* Tier badge */}
        <Badge variant={levelData.tier}>
          <span>{tierConfig.icon}</span>
          <span>{tierConfig.nameKo}</span>
        </Badge>
      </div>

      {/* XP progress bar */}
      <div className="space-y-1.5">
        <ProgressBar
          value={xpPercent}
          color={`bg-gradient-to-r ${tierConfig.gradient}`}
          className="h-3"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {formatNumber(levelData.currentXP)} /{' '}
            {formatNumber(levelData.xpToNextLevel)} XP
          </span>
          <span className="text-slate-500">
            총 {formatNumber(levelData.totalXP)} XP
          </span>
        </div>
      </div>
    </Card>
  );
}
