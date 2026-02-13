'use client';

import { useState, useEffect } from 'react';
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

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DailyLeaderboard() {
  const [entries, setEntries] = useState<DailyLeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const today = getTodayStr();
        // Try daily entries first
        let res = await fetch(`/api/leaderboard?type=daily&date=${today}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          if (data.entries && data.entries.length > 0) {
            setEntries(
              data.entries.map(
                (e: { player_name: string; score: number; time_seconds: number }, i: number) => ({
                  rank: i + 1,
                  name: e.player_name,
                  score: e.score,
                  time: e.time_seconds,
                })
              )
            );
            setLoading(false);
            return;
          }
        }
        // Fallback to overall top scores
        res = await fetch('/api/leaderboard?limit=10');
        if (res.ok) {
          const data = await res.json();
          setEntries(
            (data.entries || []).map(
              (e: { player_name: string; score: number; time_seconds: number }, i: number) => ({
                rank: i + 1,
                name: e.player_name,
                score: e.score,
                time: e.time_seconds,
              })
            )
          );
        }
      } catch {
        // Offline - show empty
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

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

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">
            아직 기록이 없습니다. 첫 번째 도전자가 되어보세요!
          </div>
        ) : (
          entries.map((entry) => (
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
          ))
        )}
      </div>
    </Card>
  );
}
