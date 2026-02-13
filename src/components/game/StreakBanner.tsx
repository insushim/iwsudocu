'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useUserStore } from '@/lib/store/userStore';

// Milestones to show progress toward
const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

function getNextMilestone(currentStreak: number): number | null {
  for (const m of MILESTONES) {
    if (currentStreak < m) return m;
  }
  return null;
}

export default function StreakBanner() {
  const streak = useUserStore((s) => s.profile.streak);
  const currentStreak = streak.currentStreak;

  if (currentStreak <= 0) return null;

  const nextMilestone = getNextMilestone(currentStreak);
  const progress = nextMilestone
    ? Math.min(1, currentStreak / nextMilestone)
    : 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg',
          'bg-orange-500/10 border border-orange-500/20',
        )}
      >
        {/* Fire + streak count */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm" role="img" aria-label="fire">
            🔥
          </span>
          <span className="text-sm font-bold text-orange-400 tabular-nums">
            {currentStreak}
          </span>
          <span className="text-xs text-orange-300/70">
            일 연속
          </span>
        </div>

        {/* Next milestone progress */}
        {nextMilestone && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-orange-300/50 tabular-nums">
              {currentStreak}/{nextMilestone}
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
