'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useGameStore } from '@/lib/store/gameStore';
import { getComboTier, getComboMultiplier, comboTimeRemaining } from '@/lib/game/combo';

export default function ComboIndicator() {
  const combo = useGameStore((s) => s.combo);
  const isVisible = combo.current >= 3;
  const tier = getComboTier(combo.current);
  const multiplier = getComboMultiplier(combo.current);

  // Combo expiry is now judged by real elapsed time (performance.now), so the
  // countdown bar must animate from a rAF loop rather than a per-tick timer.
  const [timerProgress, setTimerProgress] = useState(1);
  useEffect(() => {
    if (combo.current < 3) return;
    let raf = 0;
    const update = () => {
      const remain = comboTimeRemaining(combo, performance.now());
      setTimerProgress(combo.maxTime > 0 ? Math.max(0, remain / combo.maxTime) : 0);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [combo]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex flex-col items-end gap-1"
        >
          <div className="flex items-center gap-2">
            {/* Combo count */}
            <motion.span
              key={combo.current}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="text-2xl font-black tabular-nums leading-none"
              style={{ color: tier.color }}
            >
              {combo.current}
            </motion.span>

            {/* Tier name and multiplier */}
            <div className="flex flex-col items-start">
              <motion.span
                key={tier.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold uppercase tracking-wider leading-none"
                style={{ color: tier.color }}
              >
                {tier.name}
              </motion.span>
              <span
                className={cn(
                  'text-[10px] font-semibold leading-none mt-0.5',
                  'text-white/60',
                )}
              >
                x{multiplier.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: tier.color,
                width: `${timerProgress * 100}%`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
