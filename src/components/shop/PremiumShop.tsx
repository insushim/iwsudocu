'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/lib/store/userStore';
import {
  isBillingAvailable,
  listProducts,
  purchaseProduct,
  restorePurchases,
  type BillingProduct,
} from '@/lib/monetization/bridge';
import toast from 'react-hot-toast';

/**
 * Store-billing surface. Products come from the native bridge (Play Billing),
 * never from a hardcoded list, so prices and availability are whatever Google
 * reports for the user's region. With no bridge — the web build, or an APK
 * built before billing was configured — nothing purchasable is shown.
 */
export function PremiumShop() {
  const grantEntitlements = useUserStore((s) => s.grantEntitlements);
  const entitlements = useUserStore((s) => s.profile.entitlements);
  const [available, setAvailable] = useState(false);
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const ok = isBillingAvailable();
    setAvailable(ok);
    if (ok) listProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const handleBuy = useCallback(
    async (sku: string) => {
      setBusy(sku);
      try {
        const granted = await purchaseProduct(sku);
        if (granted && granted.length > 0) {
          grantEntitlements(granted);
          toast.success('구매가 완료되었습니다!');
        } else {
          toast('구매가 완료되지 않았습니다.', { icon: '🛒' });
        }
      } finally {
        setBusy(null);
      }
    },
    [grantEntitlements],
  );

  const handleRestore = useCallback(async () => {
    const granted = await restorePurchases();
    if (granted.length > 0) {
      grantEntitlements(granted);
      toast.success('구매 내역을 복원했습니다.');
    } else {
      toast('복원할 구매 내역이 없습니다.', { icon: 'ℹ️' });
    }
  }, [grantEntitlements]);

  if (!available) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <p className="text-sm font-semibold text-white">스토어 준비 중</p>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          유료 상품은 안드로이드 앱 버전에서 순차적으로 제공될 예정입니다. 지금은
          코인으로 모든 테마와 아이템을 얻을 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((p) => {
        const owned = p.grants.every((g) =>
          g === 'seasonPass' ? !!entitlements?.seasonPass : entitlements?.[g] === true,
        );
        return (
          <div
            key={p.sku}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{p.titleKo}</p>
              <p className="text-xs text-slate-400">{p.descriptionKo}</p>
            </div>
            <Button
              size="sm"
              variant={owned ? 'ghost' : 'primary'}
              disabled={owned || busy === p.sku}
              onClick={() => handleBuy(p.sku)}
              className="shrink-0"
            >
              {owned ? '보유 중' : busy === p.sku ? '처리 중…' : p.price}
            </Button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleRestore}
        className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-white"
      >
        <RotateCcw className="h-3 w-3" />
        구매 내역 복원
      </button>
    </div>
  );
}
