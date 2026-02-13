'use client';

import { cn } from '@/lib/utils/cn';

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const isTop3 = rank <= 3;

  const rankStyles: Record<number, string> = {
    1: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    2: 'bg-gray-400/20 text-gray-300 border-gray-400/40',
    3: 'bg-orange-700/20 text-orange-400 border-orange-700/40',
  };

  const rankIcons: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };

  if (isTop3) {
    return (
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold',
          rankStyles[rank]
        )}
      >
        {rankIcons[rank]}
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-400 font-number">
      {rank}
    </div>
  );
}
