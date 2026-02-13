'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { cn } from '@/lib/utils/cn';
import type { AchievementCategory, Achievement } from '@/types';

const CATEGORY_TABS: { key: AchievementCategory | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'puzzle', label: '퍼즐' },
  { key: 'streak', label: '스트릭' },
  { key: 'speed', label: '스피드' },
  { key: 'combo', label: '콤보' },
  { key: 'perfect', label: '퍼펙트' },
  { key: 'daily', label: '데일리' },
  { key: 'mastery', label: '마스터리' },
];

const RARITY_BORDER: Record<string, string> = {
  common: 'border-slate-500/30',
  rare: 'border-blue-500/40',
  epic: 'border-purple-500/50',
  legendary: 'border-amber-500/60',
};

const RARITY_GLOW: Record<string, string> = {
  common: '',
  rare: 'shadow-blue-500/10',
  epic: 'shadow-purple-500/20',
  legendary: 'shadow-amber-500/30',
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const progressPercent =
    achievement.requirement > 0
      ? Math.min(100, (achievement.progress / achievement.requirement) * 100)
      : 0;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center rounded-2xl border-2 bg-white/5 p-3 transition-all duration-300',
        achievement.isUnlocked
          ? cn(
              RARITY_BORDER[achievement.rarity],
              'shadow-lg',
              RARITY_GLOW[achievement.rarity]
            )
          : 'border-white/5 opacity-60'
      )}
    >
      {/* Lock overlay */}
      {!achievement.isUnlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-900/40">
          <Lock className="h-5 w-5 text-slate-500" />
        </div>
      )}

      {/* Icon */}
      <span className="text-2xl">{achievement.icon}</span>

      {/* Name */}
      <span className="mt-1.5 text-center text-xs font-semibold text-white leading-tight">
        {achievement.nameKo}
      </span>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            achievement.isUnlocked ? 'bg-green-400' : 'bg-indigo-500'
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Progress text */}
      <span className="mt-1 text-[10px] text-slate-400 font-number">
        {achievement.progress} / {achievement.requirement}
      </span>
    </div>
  );
}

export function AchievementGrid() {
  const achievements = useUserStore((s) => s.profile.achievements);
  const [activeCategory, setActiveCategory] = useState<
    AchievementCategory | 'all'
  >('all');

  const filtered =
    activeCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-4">
      {/* Category filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200',
              activeCategory === tab.key
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Unlock count */}
      <p className="text-xs text-slate-400">
        달성: {unlockedCount} / {achievements.length}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((ach) => (
          <AchievementCard key={ach.id} achievement={ach} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          이 카테고리에 업적이 없습니다.
        </p>
      )}
    </div>
  );
}
