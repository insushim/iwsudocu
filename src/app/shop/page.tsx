'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { CoinDisplay } from '@/components/shop/CoinDisplay';
import { ThemeCard } from '@/components/shop/ThemeCard';
import { PowerUpShop } from '@/components/shop/PowerUpShop';
import { GAME_THEMES } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';

type ShopTab = 'themes' | 'powerups';

const TABS: { key: ShopTab; label: string }[] = [
  { key: 'themes', label: '테마' },
  { key: 'powerups', label: '파워업' },
];

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<ShopTab>('themes');

  return (
    <div className="min-h-screen pb-24 pt-16">
      <Header />

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <h2 className="text-lg font-bold text-white">상점</h2>

        {/* Coin display */}
        <CoinDisplay />

        {/* Tabs */}
        <div className="flex gap-1.5 rounded-xl bg-white/5 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'themes' ? (
          <div className="grid grid-cols-2 gap-3">
            {GAME_THEMES.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        ) : (
          <PowerUpShop />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
