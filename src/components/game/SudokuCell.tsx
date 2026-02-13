'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useGameStore } from '@/lib/store/gameStore';

interface SudokuCellProps {
  row: number;
  col: number;
  value: number;
  isGiven: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameRow: boolean;
  isSameCol: boolean;
  isSameBox: boolean;
  isConflict: boolean;
  notes: number[];
}

const SudokuCell = memo(function SudokuCell({
  row,
  col,
  value,
  isGiven,
  isSelected,
  isHighlighted,
  isSameRow,
  isSameCol,
  isSameBox,
  isConflict,
  notes,
}: SudokuCellProps) {
  const selectCell = useGameStore((s) => s.selectCell);

  const handleClick = useCallback(() => {
    selectCell(row, col);
  }, [selectCell, row, col]);

  // Determine background color (priority: selected > conflict > highlighted > sameRow/Col/Box)
  const bgClass = isSelected
    ? 'bg-blue-500/40'
    : isConflict
      ? 'bg-red-500/30'
      : isHighlighted
        ? 'bg-blue-500/8'
        : isSameRow || isSameCol || isSameBox
          ? 'bg-white/5'
          : 'bg-transparent';

  // Border thicknesses for 3x3 box boundaries
  const borderRight =
    col === 2 || col === 5
      ? 'border-r-2 border-r-indigo-400/50'
      : 'border-r border-r-slate-700/50';
  const borderBottom =
    row === 2 || row === 5
      ? 'border-b-2 border-b-indigo-400/50'
      : 'border-b border-b-slate-700/50';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex items-center justify-center aspect-square w-full',
        'transition-colors duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400',
        bgClass,
        borderRight,
        borderBottom,
        isSelected && 'ring-2 ring-inset ring-blue-400',
      )}
      aria-label={`Cell row ${row + 1} column ${col + 1}${value ? `, value ${value}` : ', empty'}`}
    >
      <AnimatePresence mode="popLayout">
        {value !== 0 ? (
          <motion.span
            key={`val-${value}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={cn(
              'text-base sm:text-lg md:text-xl lg:text-2xl font-bold select-none leading-none',
              isGiven ? 'text-slate-400' : 'text-white',
              isConflict && !isGiven && 'text-red-400',
            )}
          >
            {value}
          </motion.span>
        ) : notes.length > 0 ? (
          <motion.div
            key="notes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 grid-rows-3 w-full h-full p-px"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <span
                key={n}
                className={cn(
                  'flex items-center justify-center text-[7px] sm:text-[8px] md:text-[9px] leading-none select-none',
                  notes.includes(n)
                    ? 'text-blue-300/80'
                    : 'text-transparent',
                )}
              >
                {n}
              </span>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </button>
  );
});

export default SudokuCell;
