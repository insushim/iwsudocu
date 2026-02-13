'use client';

import { useRouter } from 'next/navigation';
import { Calendar, Trophy, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/lib/store/userStore';
import { useGameStore } from '@/lib/store/gameStore';

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAILY_BONUSES = [
  {
    type: 'no_mistakes' as const,
    descriptionKo: '실수 없이 클리어하세요',
    bonusXP: 200,
    bonusCoins: 100,
  },
  {
    type: 'under_time' as const,
    descriptionKo: '10분 이내에 클리어하세요',
    bonusXP: 150,
    bonusCoins: 75,
  },
  {
    type: 'no_hints' as const,
    descriptionKo: '힌트 없이 클리어하세요',
    bonusXP: 180,
    bonusCoins: 90,
  },
  {
    type: 'combo_target' as const,
    descriptionKo: '10 콤보 이상 달성하세요',
    bonusXP: 250,
    bonusCoins: 120,
  },
];

function getDailyBonus() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return DAILY_BONUSES[seed % DAILY_BONUSES.length];
}

export function DailyPuzzle() {
  const router = useRouter();
  const streak = useUserStore((s) => s.profile.streak);
  const startDailyChallenge = useGameStore((s) => s.startDailyChallenge);

  const todayStr = getTodayStr();
  const alreadyPlayed = streak.streakHistory.includes(todayStr);
  const bonus = getDailyBonus();

  const handlePlay = () => {
    startDailyChallenge();
    router.push('/play');
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10" />
      <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-purple-500/10" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">오늘의 도전</h2>
          <span className="text-xs text-slate-400">{todayStr}</span>
        </div>

        {/* Bonus objective */}
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-indigo-300">
              보너스 목표
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-300">{bonus.descriptionKo}</p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
            <span>+{bonus.bonusXP} XP</span>
            <span>+{bonus.bonusCoins} 코인</span>
          </div>
        </div>

        {/* Result or Play button */}
        {alreadyPlayed ? (
          <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-3">
            <Trophy className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-semibold text-green-300">
                오늘의 도전 완료!
              </p>
              <p className="text-xs text-slate-400">
                내일 새로운 도전이 기다리고 있습니다
              </p>
            </div>
          </div>
        ) : (
          <Button onClick={handlePlay} className="w-full" size="lg">
            도전하기
          </Button>
        )}
      </div>
    </Card>
  );
}
