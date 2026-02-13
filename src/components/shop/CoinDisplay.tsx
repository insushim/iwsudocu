'use client';

import { Coins } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Card } from '@/components/ui/Card';

export function CoinDisplay() {
  const coins = useUserStore((s) => s.profile.coins);

  return (
    <Card className="flex items-center justify-center gap-3 py-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
        <Coins className="h-6 w-6 text-amber-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-slate-400">보유 코인</span>
        <AnimatedCounter
          value={coins}
          className="text-2xl font-extrabold text-amber-300"
        />
      </div>
    </Card>
  );
}
