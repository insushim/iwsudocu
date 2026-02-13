'use client';

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AchievementGrid } from '@/components/profile/AchievementGrid';
import { useUserStore } from '@/lib/store/userStore';

export default function AchievementsPage() {
  const achievements = useUserStore((s) => s.profile.achievements);
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="min-h-screen pb-24 pt-16">
      <Header />

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">업적</h2>
          <span className="text-sm text-slate-400">
            {unlockedCount} / {achievements.length} 달성
          </span>
        </div>

        <AchievementGrid />
      </main>

      <BottomNav />
    </div>
  );
}
