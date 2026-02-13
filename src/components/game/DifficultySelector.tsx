'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { DIFFICULTY_CONFIGS } from '@/lib/utils/constants';
import { formatTime } from '@/lib/utils/format';
import { useUserStore } from '@/lib/store/userStore';
import type { Difficulty } from '@/types';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: Difficulty[] = [
  'beginner',
  'easy',
  'medium',
  'hard',
  'expert',
  'master',
];

export default function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  const stats = useUserStore((s) => s.profile.stats);

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto px-4">
      {DIFFICULTIES.map((diff, index) => {
        const config = DIFFICULTY_CONFIGS[diff];
        const bestTime = stats.bestTimes[diff];
        const gamesCompleted = stats.puzzlesByDifficulty[diff];

        return (
          <motion.button
            key={diff}
            type="button"
            onClick={() => onSelect(diff)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'relative flex flex-col items-start gap-1.5 p-4 rounded-2xl text-left',
              'bg-white/5 backdrop-blur-xl border border-white/10',
              'hover:bg-white/10 transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              'shadow-lg',
            )}
            style={{
              borderColor: `${config.color}25`,
            }}
          >
            {/* Accent glow on top */}
            <div
              className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl"
              style={{ backgroundColor: config.color }}
            />

            {/* Icon + Name */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <span
                className="text-base font-bold"
                style={{ color: config.color }}
              >
                {config.nameKo}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-white/50 leading-relaxed">
              {config.description}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-1 w-full">
              {bestTime > 0 && (
                <span className="text-[10px] text-white/30 tabular-nums">
                  최고 {formatTime(bestTime)}
                </span>
              )}
              {gamesCompleted > 0 && (
                <span className="text-[10px] text-white/30 tabular-nums">
                  {gamesCompleted}판 완료
                </span>
              )}
              {bestTime === 0 && gamesCompleted === 0 && (
                <span className="text-[10px] text-white/20">
                  도전해보세요!
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
