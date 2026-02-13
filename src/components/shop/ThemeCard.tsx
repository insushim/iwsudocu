'use client';

import { Lock, Check } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { GameTheme } from '@/types';
import toast from 'react-hot-toast';

interface ThemeCardProps {
  theme: GameTheme;
}

function MiniBoardPreview({ theme }: { theme: GameTheme }) {
  const cells = [
    [5, 0, 0, 3],
    [0, 7, 0, 0],
    [0, 0, 2, 0],
    [1, 0, 0, 8],
  ];

  return (
    <div
      className="grid grid-cols-4 gap-0.5 rounded-lg p-1.5"
      style={{ backgroundColor: theme.boardBg }}
    >
      {cells.flat().map((val, i) => (
        <div
          key={i}
          className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold"
          style={{
            backgroundColor: theme.cellBg,
            color: val > 0 ? theme.givenColor : 'transparent',
            border: `1px solid ${theme.borderColor}`,
          }}
        >
          {val > 0 ? val : '.'}
        </div>
      ))}
    </div>
  );
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const profile = useUserStore((s) => s.profile);
  const unlockTheme = useUserStore((s) => s.unlockTheme);
  const setActiveTheme = useUserStore((s) => s.setActiveTheme);

  const isUnlocked = profile.unlockedThemes.includes(theme.id);
  const isActive = profile.activeTheme === theme.id;
  const canAfford = profile.coins >= theme.cost;

  const handleBuy = () => {
    if (isUnlocked) {
      setActiveTheme(theme.id);
      toast.success(`${theme.nameKo} 테마가 적용되었습니다!`);
      return;
    }

    if (!canAfford) {
      toast.error('코인이 부족합니다!');
      return;
    }

    const success = unlockTheme(theme.id, theme.cost);
    if (success) {
      setActiveTheme(theme.id);
      toast.success(`${theme.nameKo} 테마를 구매했습니다!`);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 bg-white/5 p-3 transition-all duration-300',
        isActive
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
          : isUnlocked
            ? 'border-white/10 hover:border-white/20'
            : 'border-white/5 opacity-80'
      )}
    >
      {/* Active badge */}
      {isActive && (
        <div className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Lock overlay */}
      {!isUnlocked && (
        <div className="absolute right-2 top-2 z-10">
          <Lock className="h-4 w-4 text-slate-400" />
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        {/* Preview emoji */}
        <span className="text-2xl">{theme.preview}</span>

        {/* Mini board preview */}
        <MiniBoardPreview theme={theme} />

        {/* Name */}
        <span className="text-sm font-semibold text-white">
          {theme.nameKo}
        </span>

        {/* Action button */}
        {isActive ? (
          <span className="text-xs font-medium text-indigo-400">
            사용 중
          </span>
        ) : isUnlocked ? (
          <Button size="sm" variant="secondary" onClick={handleBuy}>
            적용하기
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={handleBuy}
            disabled={!canAfford}
          >
            {theme.cost} 코인
          </Button>
        )}
      </div>
    </div>
  );
}
