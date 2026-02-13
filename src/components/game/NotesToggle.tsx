'use client';

import { Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useGameStore } from '@/lib/store/gameStore';

export default function NotesToggle() {
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);
  const isNotesMode = useGameStore((s) => s.isNotesMode);

  return (
    <motion.button
      type="button"
      onClick={toggleNotesMode}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'flex flex-col items-center justify-center gap-1',
        'py-2.5 px-4 rounded-xl',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        isNotesMode
          ? 'bg-blue-500/30 text-blue-400 border border-blue-500/40'
          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
      )}
    >
      <Pencil className="w-5 h-5" />
      <span className="text-[10px] font-medium leading-none">메모</span>
    </motion.button>
  );
}
