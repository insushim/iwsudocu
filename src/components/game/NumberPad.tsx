'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eraser } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useGameStore } from '@/lib/store/gameStore';

export default function NumberPad() {
  const placeNumber = useGameStore((s) => s.placeNumber);
  const eraseNumber = useGameStore((s) => s.eraseNumber);
  const highlightedNumber = useGameStore((s) => s.highlightedNumber);
  const currentBoard = useGameStore((s) => s.currentBoard);

  // Count remaining instances of each number
  const remainingCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let n = 1; n <= 9; n++) {
      let placed = 0;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (currentBoard[r][c] === n) placed++;
        }
      }
      counts[n] = 9 - placed;
    }
    return counts;
  }, [currentBoard]);

  return (
    <div className="flex items-center gap-1 sm:gap-2 w-full max-w-2xl mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        const remaining = remainingCounts[num];
        const isDisabled = remaining <= 0;
        const isActive = highlightedNumber === num;

        return (
          <motion.button
            key={num}
            type="button"
            onClick={() => placeNumber(num)}
            disabled={isDisabled}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'flex flex-col items-center justify-center',
              'min-w-0 min-h-[44px] sm:min-h-[52px] lg:min-h-[56px]',
              'flex-1 rounded-lg sm:rounded-xl font-bold text-base sm:text-xl lg:text-2xl',
              'transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              isActive
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/10 text-white/90 hover:bg-white/20',
              isDisabled && 'opacity-30 pointer-events-none',
            )}
          >
            <span>{num}</span>
            <span
              className={cn(
                'text-[9px] sm:text-xs font-normal leading-none mt-0.5',
                isActive ? 'text-blue-100' : 'text-white/40',
              )}
            >
              {remaining}
            </span>
          </motion.button>
        );
      })}

      {/* Erase button */}
      <motion.button
        type="button"
        onClick={eraseNumber}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'flex flex-col items-center justify-center',
          'min-w-0 min-h-[44px] sm:min-h-[52px] lg:min-h-[56px]',
          'flex-1 rounded-lg sm:rounded-xl',
          'bg-white/10 text-white/70 hover:bg-white/20',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        )}
      >
        <Eraser className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>
    </div>
  );
}
