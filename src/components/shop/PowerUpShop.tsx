'use client';

import { Coins } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

export function PowerUpShop() {
  const profile = useUserStore((s) => s.profile);
  const purchasePowerUp = useUserStore((s) => s.purchasePowerUp);

  const handleBuy = (powerUpId: string, nameKo: string) => {
    const success = purchasePowerUp(powerUpId);
    if (success) {
      toast.success(`${nameKo}을(를) 구매했습니다!`);
    } else {
      toast.error('코인이 부족하거나 최대 보유 수량입니다!');
    }
  };

  return (
    <div className="space-y-2">
      {profile.powerUps.map((powerUp) => {
        const atMax = powerUp.count >= powerUp.maxCount;
        const canAfford = profile.coins >= powerUp.cost;
        const disabled = atMax || !canAfford;

        return (
          <div
            key={powerUp.id}
            className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3"
          >
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl">
              {powerUp.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {powerUp.nameKo}
                </span>
                <span className="text-xs text-slate-500 font-number">
                  {powerUp.count}/{powerUp.maxCount}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {powerUp.descriptionKo}
              </p>
            </div>

            {/* Buy button */}
            <Button
              size="sm"
              variant={disabled ? 'ghost' : 'primary'}
              disabled={disabled}
              onClick={() => handleBuy(powerUp.id, powerUp.nameKo)}
              className={cn(
                'shrink-0',
                disabled && 'opacity-40'
              )}
            >
              <Coins className="h-3.5 w-3.5" />
              <span className="font-number">{powerUp.cost}</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
