'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardEntry, LeaderboardPeriod, PlayerTier } from '@/types';

const PERIOD_TABS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'daily', label: '일간' },
  { key: 'weekly', label: '주간' },
  { key: 'monthly', label: '월간' },
  { key: 'alltime', label: '전체' },
];

// Sample leaderboard data
function generateSampleData(period: LeaderboardPeriod): LeaderboardEntry[] {
  const names = [
    '스도쿠마스터',
    '논리왕',
    '퍼즐천재',
    '두뇌전사',
    '넘버킹',
    '집중의달인',
    '수학천재',
    '도전자',
    '빠른손가락',
    '열정가득',
    '퍼즐러',
    '브레인',
    '숫자왕',
    '전략가',
    '분석마스터',
  ];

  const tiers: PlayerTier[] = [
    'grandmaster',
    'master',
    'diamond',
    'diamond',
    'platinum',
    'platinum',
    'gold',
    'gold',
    'gold',
    'silver',
    'silver',
    'silver',
    'bronze',
    'bronze',
    'bronze',
  ];

  const baseScores: Record<LeaderboardPeriod, number> = {
    daily: 3000,
    weekly: 15000,
    monthly: 50000,
    alltime: 200000,
  };

  return names.map((name, i) => ({
    rank: i + 1,
    userId: `user-${i}`,
    displayName: name,
    score: Math.max(
      100,
      baseScores[period] - i * Math.floor(baseScores[period] * 0.06)
    ),
    time: 180 + i * 35,
    level: Math.max(1, 50 - i * 3),
    tier: tiers[i],
  }));
}

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>('daily');
  const entries = generateSampleData(activePeriod);

  return (
    <div className="min-h-screen pb-24 pt-16">
      <Header />

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <h2 className="text-lg font-bold text-white">리더보드</h2>

        {/* Period tabs */}
        <div className="flex gap-1.5 rounded-xl bg-white/5 p-1">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActivePeriod(tab.key)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                activePeriod === tab.key
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <LeaderboardTable entries={entries} period={activePeriod} />
      </main>

      <BottomNav />
    </div>
  );
}
