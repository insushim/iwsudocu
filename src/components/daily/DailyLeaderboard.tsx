'use client';

import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatTime } from '@/lib/utils/format';
import { RankBadge } from '@/components/leaderboard/RankBadge';

interface DailyLeaderEntry {
  rank: number;
  name: string;
  score: number;
  time: number;
}

// Placeholder data for now (will connect to Cloudflare D1 later)
const SAMPLE_ENTRIES: DailyLeaderEntry[] = [
  { rank: 1, name: '스도쿠마스터', score: 2850, time: 312 },
  { rank: 2, name: '논리왕', score: 2640, time: 358 },
  { rank: 3, name: '퍼즐러', score: 2510, time: 402 },
  { rank: 4, name: '두뇌전사', score: 2380, time: 425 },
  { rank: 5, name: '넘버킹', score: 2200, time: 467 },
  { rank: 6, name: '집중의달인', score: 2100, time: 498 },
  { rank: 7, name: '수학천재', score: 1980, time: 534 },
  { rank: 8, name: '도전자', score: 1850, time: 562 },
  { rank: 9, name: '초보탈출', score: 1720, time: 601 },
  { rank: 10, name: '열정가득', score: 1600, time: 645 },
];

export function DailyLeaderboard() {
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          오늘의 랭킹
        </h3>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_60px_60px] gap-2 px-2 text-[10px] text-slate-500 uppercase">
          <span>순위</span>
          <span>이름</span>
          <span className="text-right">점수</span>
          <span className="text-right">시간</span>
        </div>

        {/* Entries */}
        {SAMPLE_ENTRIES.map((entry) => (
          <div
            key={entry.rank}
            className="grid grid-cols-[40px_1fr_60px_60px] items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
          >
            <RankBadge rank={entry.rank} />
            <span className="truncate text-sm text-slate-200">
              {entry.name}
            </span>
            <span className="text-right text-sm font-bold text-white font-number">
              {entry.score.toLocaleString()}
            </span>
            <span className="text-right text-xs text-slate-400 font-number">
              {formatTime(entry.time)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
