'use client';

import { formatTime } from '@/lib/utils/format';
import { RankBadge } from './RankBadge';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  period: string;
  currentUserId?: string;
}

export function LeaderboardTable({
  entries,
  period,
  currentUserId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <span className="text-4xl mb-2">🏆</span>
        <p className="text-sm">아직 기록이 없습니다</p>
        <p className="text-xs">첫 번째 기록을 남겨보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[44px_1fr_70px_60px] items-center gap-2 px-2 text-[10px] text-slate-500 uppercase">
        <span>순위</span>
        <span>플레이어</span>
        <span className="text-right">점수</span>
        <span className="text-right">시간</span>
      </div>

      {/* Entries */}
      {entries.map((entry) => {
        const isCurrentUser = currentUserId
          ? entry.userId === currentUserId
          : false;

        return (
          <div
            key={`${entry.rank}-${entry.userId}`}
            className={cn(
              'grid grid-cols-[44px_1fr_70px_60px] items-center gap-2 rounded-xl px-2 py-2 transition-colors',
              isCurrentUser
                ? 'bg-indigo-500/10 border border-indigo-500/20'
                : 'hover:bg-white/5',
              entry.rank <= 3 && 'bg-white/[0.03]'
            )}
          >
            {/* Rank */}
            <RankBadge rank={entry.rank} />

            {/* Player info */}
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  'truncate text-sm font-medium',
                  isCurrentUser ? 'text-indigo-300' : 'text-slate-200'
                )}
              >
                {entry.displayName}
              </span>
              <Badge variant={entry.tier} className="shrink-0">
                Lv.{entry.level}
              </Badge>
            </div>

            {/* Score */}
            <span
              className={cn(
                'text-right text-sm font-bold font-number',
                entry.rank === 1
                  ? 'text-amber-300'
                  : entry.rank === 2
                    ? 'text-gray-300'
                    : entry.rank === 3
                      ? 'text-orange-400'
                      : 'text-white'
              )}
            >
              {entry.score.toLocaleString()}
            </span>

            {/* Time */}
            <span className="text-right text-xs text-slate-400 font-number">
              {formatTime(entry.time)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
