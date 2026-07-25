'use client';

import { useMemo } from 'react';
import { Coins } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { getDailyDealIds, dealPrice, kstToday, DAILY_DEAL_DISCOUNT } from '@/lib/game/daily';
import toast from 'react-hot-toast';

export function PowerUpShop() {
  const profile = useUserStore((s) => s.profile);
  const purchasePowerUp = useUserStore((s) => s.purchasePowerUp);

  const dealIds = useMemo(
    () => getDailyDealIds(kstToday(), profile.powerUps.map((p) => p.id)),
    [profile.powerUps],
  );

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
      <p className="px-1 text-[11px] text-slate-500">
        오늘의 특가 2종 {Math.round(DAILY_DEAL_DISCOUNT * 100)}% 할인 · 매일 자정(KST) 교체
      </p>
      {profile.powerUps.map((powerUp) => {
        const onDeal = dealIds.includes(powerUp.id);
        const price = onDeal ? dealPrice(powerUp.cost) : powerUp.cost;
        const atMax = powerUp.count >= powerUp.maxCount;
        const canAfford = profile.coins >= price;
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
                {onDeal && (
                  <span className="rounded-md bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                    특가
                  </span>
                )}
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
              {onDeal && (
                <span className="font-number text-[10px] text-white/40 line-through">
                  {powerUp.cost}
                </span>
              )}
              <span className="font-number">{price}</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
