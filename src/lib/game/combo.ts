import { ComboState } from '@/types';

export function getComboMultiplier(combo: number): number {
  if (combo < 3) return 1.0;
  if (combo < 5) return 1.5;
  if (combo < 10) return 2.0;
  if (combo < 15) return 2.5;
  if (combo < 20) return 3.0;
  return 4.0;
}

export function getComboTier(combo: number): {
  name: string;
  nameKo: string;
  color: string;
  sound: string;
} {
  if (combo < 3) return { name: 'None', nameKo: '', color: '', sound: '' };
  if (combo < 5) return { name: 'Nice', nameKo: '좋아요!', color: '#4CAF50', sound: 'combo1' };
  if (combo < 10) return { name: 'Great', nameKo: '훌륭해요!', color: '#2196F3', sound: 'combo2' };
  if (combo < 15) return { name: 'Amazing', nameKo: '놀라워요!', color: '#9C27B0', sound: 'combo3' };
  if (combo < 20) return { name: 'Incredible', nameKo: '대단해요!', color: '#FF9800', sound: 'combo3' };
  return { name: 'UNSTOPPABLE', nameKo: '멈출 수 없어!', color: '#F44336', sound: 'comboMax' };
}

export function getComboTimeLimit(combo: number): number {
  const baseTime = 15000;
  const minTime = 5000;
  const decay = Math.min(combo * 500, baseTime - minTime);
  return baseTime - decay;
}

export function createInitialComboState(): ComboState {
  return {
    current: 0,
    timer: 0,
    maxTime: 15000,
    multiplier: 1.0,
    lastCorrectTime: 0,
  };
}

export function updateComboOnCorrect(state: ComboState, currentTime: number): ComboState {
  const newCombo = state.current + 1;
  const timeLimit = getComboTimeLimit(newCombo);

  return {
    current: newCombo,
    timer: timeLimit,
    maxTime: timeLimit,
    multiplier: getComboMultiplier(newCombo),
    lastCorrectTime: currentTime,
  };
}

export function resetCombo(): ComboState {
  return createInitialComboState();
}

/**
 * Whether the combo has expired, judged by real elapsed time since the last
 * correct entry rather than by counting timer ticks. This closes the exploit
 * where backgrounding the tab throttles the tick interval and freezes the
 * combo window indefinitely.
 */
export function isComboExpired(state: ComboState, now: number): boolean {
  if (state.current <= 0) return false;
  if (state.lastCorrectTime <= 0) return false;
  return now - state.lastCorrectTime >= state.maxTime;
}

/** Remaining combo time in ms, for UI display, based on real elapsed time. */
export function comboTimeRemaining(state: ComboState, now: number): number {
  if (state.current <= 0 || state.lastCorrectTime <= 0) return 0;
  return Math.max(0, state.maxTime - (now - state.lastCorrectTime));
}
