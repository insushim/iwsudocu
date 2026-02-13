'use client';

import { Undo2, Redo2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useGameStore } from '@/lib/store/gameStore';

export default function UndoRedoButtons() {
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const historyIndex = useGameStore((s) => s.historyIndex);
  const history = useGameStore((s) => s.history);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10 rounded-xl',
          'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
          !canUndo && 'opacity-30 pointer-events-none',
        )}
        aria-label="Undo"
      >
        <Undo2 className="w-5 h-5" />
      </motion.button>

      <motion.button
        type="button"
        onClick={redo}
        disabled={!canRedo}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'flex items-center justify-center',
          'w-10 h-10 rounded-xl',
          'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
          !canRedo && 'opacity-30 pointer-events-none',
        )}
        aria-label="Redo"
      >
        <Redo2 className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
