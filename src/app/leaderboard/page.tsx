'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardEntry, LeaderboardPeriod, PlayerTier } from '@/types';

const DIFFICULTY_TABS = [
  { key: 'all', label: '전체' },
  { key: 'beginner', label: '입문' },
  { key: 'easy', label: '쉬움' },
  { key: 'medium', label: '보통' },
  { key: 'hard', label: '어려움' },
  { key: 'expert', label: '전문가' },
  { key: 'master', label: '마스터' },
];

function tierFromScore(score: number): PlayerTier {
  if (score >= 10000) return 'grandmaster';
  if (score >= 7000) return 'master';
  if (score >= 5000) return 'diamond';
  if (score >= 3000) return 'platinum';
  if (score >= 2000) return 'gold';
  if (score >= 1000) return 'silver';
  return 'bronze';
}

export default function LeaderboardPage() {
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (activeDifficulty !== 'all') {
        params.set('difficulty', activeDifficulty);
      }
      const res = await fetch(`/api/leaderboard?${params}`);
      if (res.ok) {
        const data = await res.json();
        const mapped: LeaderboardEntry[] = (data.entries || []).map(
          (e: { player_name: string; score: number; time_seconds: number; id: number }, i: number) => ({
            rank: i + 1,
            userId: `db-${e.id}`,
            displayName: e.player_name,
            score: e.score,
            time: e.time_seconds,
            level: Math.max(1, Math.floor(e.score / 200)),
            tier: tierFromScore(e.score) as PlayerTier,
          })
        );
        setEntries(mapped);
      }
    } catch {
      // Fallback to empty
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [activeDifficulty]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen pb-24 pt-16">
      <Header />

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <h2 className="text-lg font-bold text-white">리더보드</h2>

        {/* Difficulty tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-white/5 p-1 no-scrollbar">
          {DIFFICULTY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveDifficulty(tab.key)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                activeDifficulty === tab.key
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <LeaderboardTable entries={entries} period={'alltime' as LeaderboardPeriod} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
