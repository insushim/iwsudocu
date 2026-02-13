'use client';

import { Coins } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { calculateLevel } from '@/lib/game/leveling';
import { TIER_CONFIGS } from '@/lib/game/leveling';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function Header() {
  const profile = useUserStore((s) => s.profile);
  const levelData = calculateLevel(profile.totalXP);
  const tierConfig = TIER_CONFIGS[levelData.tier];
  const xpPercent =
    levelData.xpToNextLevel > 0
      ? (levelData.currentXP / levelData.xpToNextLevel) * 100
      : 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-4 py-2 safe-top">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {/* App name */}
        <h1 className="text-lg font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            칸채움
          </span>
        </h1>

        {/* Right side: coins, level, xp */}
        <div className="flex items-center gap-3">
          {/* Coin count */}
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1">
            <Coins className="h-4 w-4 text-amber-400" />
            <AnimatedCounter
              value={profile.coins}
              className="text-sm font-bold text-amber-300"
            />
          </div>

          {/* Level badge + XP bar */}
          <div className="flex items-center gap-2">
            <Badge variant={levelData.tier}>
              <span className="text-xs">{tierConfig.icon}</span>
              <span className="font-bold">Lv.{levelData.level}</span>
            </Badge>
            <div className="w-16">
              <ProgressBar
                value={xpPercent}
                color={`bg-gradient-to-r ${tierConfig.gradient}`}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
