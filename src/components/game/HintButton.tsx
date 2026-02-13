'use client';

import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useGameStore } from '@/lib/store/gameStore';

export default function HintButton() {
  const useHint = useGameStore((s) => s.useHint);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const maxHints = useGameStore((s) => s.maxHints);
  const status = useGameStore((s) => s.status);

  const remaining = maxHints - hintsUsed;
  const isDisabled = remaining <= 0 || status !== 'playing';

  return (
    <motion.button
      type="button"
      onClick={useHint}
      disabled={isDisabled}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1',
        'py-2.5 px-4 rounded-xl',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
        isDisabled && 'opacity-30 pointer-events-none',
      )}
    >
      <div className="relative">
        <Lightbulb className="w-5 h-5" />
        <span
          className={cn(
            'absolute -top-1.5 -right-3 text-[9px] font-bold',
            'min-w-[14px] h-[14px] flex items-center justify-center',
            'rounded-full bg-indigo-500 text-white leading-none px-0.5',
          )}
        >
          {remaining}
        </span>
      </div>
      <span className="text-[10px] font-medium leading-none whitespace-nowrap">
        {remaining}/{maxHints}
      </span>
    </motion.button>
  );
}
