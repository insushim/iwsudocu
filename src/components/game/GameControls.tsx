'use client';

import { Undo2, Redo2, Eraser, Pencil, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useGameStore } from '@/lib/store/gameStore';

export default function GameControls() {
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const eraseNumber = useGameStore((s) => s.eraseNumber);
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);
  const useHint = useGameStore((s) => s.useHint);
  const isNotesMode = useGameStore((s) => s.isNotesMode);
  const historyIndex = useGameStore((s) => s.historyIndex);
  const history = useGameStore((s) => s.history);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const maxHints = useGameStore((s) => s.maxHints);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;
  const hintsRemaining = maxHints - hintsUsed;

  const controls = [
    {
      id: 'undo',
      label: '되돌리기',
      icon: Undo2,
      onClick: undo,
      disabled: !canUndo,
      active: false,
      badge: null as string | null,
    },
    {
      id: 'redo',
      label: '다시하기',
      icon: Redo2,
      onClick: redo,
      disabled: !canRedo,
      active: false,
      badge: null,
    },
    {
      id: 'erase',
      label: '지우기',
      icon: Eraser,
      onClick: eraseNumber,
      disabled: false,
      active: false,
      badge: null,
    },
    {
      id: 'notes',
      label: '메모',
      icon: Pencil,
      onClick: toggleNotesMode,
      disabled: false,
      active: isNotesMode,
      badge: null,
    },
    {
      id: 'hint',
      label: '힌트',
      icon: Lightbulb,
      onClick: useHint,
      disabled: hintsRemaining <= 0,
      active: false,
      badge: `${hintsRemaining}`,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 w-full max-w-2xl mx-auto px-2">
      {controls.map((ctrl) => {
        const Icon = ctrl.icon;
        return (
          <motion.button
            key={ctrl.id}
            type="button"
            onClick={ctrl.onClick}
            disabled={ctrl.disabled}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1',
              'py-2.5 rounded-xl',
              'transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              ctrl.active
                ? 'bg-blue-500/30 text-blue-400 border border-blue-500/40'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
              ctrl.disabled && 'opacity-30 pointer-events-none',
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {ctrl.badge !== null && (
                <span
                  className={cn(
                    'absolute -top-1.5 -right-2.5 text-[9px] font-bold',
                    'min-w-[14px] h-[14px] flex items-center justify-center',
                    'rounded-full bg-indigo-500 text-white leading-none px-0.5',
                  )}
                >
                  {ctrl.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">
              {ctrl.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
