'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Pencil, Flame } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useHydrated } from '@/hooks/useHydrated';

const STORAGE_KEY = 'nq-onboarded-v1';

// Read once and remember: localStorage is only written by finish() below, so a
// module-level cache keeps this stable across renders and lets the component
// derive `open` while rendering instead of setting state from an effect.
let seenBefore: boolean | null = null;

function hasSeenOnboarding(): boolean {
  if (seenBefore === null) {
    try {
      seenBefore = localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      // Storage unavailable (private mode, blocked cookies) — don't nag.
      seenBefore = true;
    }
  }
  return seenBefore;
}

const STEPS = [
  {
    icon: Grid3x3,
    title: '스도쿠 채우기',
    body: '가로줄·세로줄·3×3 박스에 1부터 9까지 겹치지 않게 채우면 완성! 빈 칸을 누르고 숫자를 입력하세요.',
  },
  {
    icon: Pencil,
    title: '메모로 정복하기',
    body: '헷갈릴 땐 메모 모드로 후보 숫자를 작게 적어두세요. 정답을 채우면 관련 메모가 자동으로 정리됩니다.',
  },
  {
    icon: Flame,
    title: '매일 플레이하고 성장',
    body: '매일 한 판씩 완료하면 연속 기록과 두뇌 점수가 쌓입니다. 콤보를 이어 더 높은 점수에 도전하세요!',
  },
];

export function OnboardingModal() {
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);

  const open = hydrated && !dismissed && !hasSeenOnboarding();

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    seenBefore = true;
    setDismissed(true);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish();
  };

  if (!open) return null;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Icon className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-center text-lg font-bold text-white">{current.title}</h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-300">{current.body}</p>

          <div className="my-5 flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === step ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/20',
                )}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={finish}
              className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/10"
            >
              건너뛰기
            </button>
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
            >
              {step < STEPS.length - 1 ? '다음' : '시작하기'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
