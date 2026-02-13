'use client';

import Link from 'next/link';
import { Flame, Brain, Gamepad2, Calendar } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/lib/store/userStore';
import { calculateBrainScore, getBrainScoreGrade } from '@/lib/game/brainScore';

export default function HomePage() {
  const profile = useUserStore((s) => s.profile);
  const brainScore = calculateBrainScore(profile.stats);
  const grade = getBrainScoreGrade(brainScore);

  return (
    <div className="min-h-screen pb-24 pt-16">
      <Header />

      <main className="mx-auto max-w-lg space-y-6 px-4 pt-4">
        {/* Hero */}
        <div className="flex flex-col items-center space-y-3 py-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              NumeroQuest
            </span>
          </h1>
          <p className="text-center text-sm text-slate-400">
            매일 새로운 도전, 매일 더 강해지는 두뇌
          </p>
        </div>

        {/* Daily challenge banner */}
        <Link href="/daily">
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-500/40 transition-all">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-indigo-500/10" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20">
                <Calendar className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">오늘의 도전</p>
                <p className="text-xs text-slate-400">
                  매일 새로운 퍼즐에 도전하세요
                </p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Quick start button */}
        <Link href="/play">
          <Button className="w-full" size="lg">
            <Gamepad2 className="h-5 w-5" />
            게임 시작
          </Button>
        </Link>

        {/* Current streak and brain score row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak banner */}
          <Card className="flex flex-col items-center py-4">
            <Flame className="h-6 w-6 text-orange-400" />
            <span className="mt-1 text-2xl font-extrabold text-orange-400 font-number">
              {profile.streak.currentStreak}
            </span>
            <span className="text-xs text-slate-400">일 연속</span>
            {profile.streak.currentStreak > 0 && (
              <span className="mt-1 text-[10px] text-slate-500">
                최장: {profile.streak.longestStreak}일
              </span>
            )}
          </Card>

          {/* Brain score mini widget */}
          <Card className="flex flex-col items-center py-4">
            <Brain className="h-6 w-6" style={{ color: grade.color }} />
            <span
              className="mt-1 text-2xl font-extrabold font-number"
              style={{ color: grade.color }}
            >
              {brainScore}
            </span>
            <span className="text-xs text-slate-400">두뇌 점수</span>
            <span
              className="mt-1 text-[10px] font-bold"
              style={{ color: grade.color }}
            >
              {grade.grade} - {grade.labelKo}
            </span>
          </Card>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="flex flex-col items-center py-3">
            <span className="text-lg font-bold text-white font-number">
              {profile.stats.totalGamesWon}
            </span>
            <span className="text-[10px] text-slate-400">승리</span>
          </Card>
          <Card className="flex flex-col items-center py-3">
            <span className="text-lg font-bold text-white font-number">
              {Math.round(profile.stats.winRate)}%
            </span>
            <span className="text-[10px] text-slate-400">승률</span>
          </Card>
          <Card className="flex flex-col items-center py-3">
            <span className="text-lg font-bold text-white font-number">
              {profile.stats.maxCombo}
            </span>
            <span className="text-[10px] text-slate-400">최대 콤보</span>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
