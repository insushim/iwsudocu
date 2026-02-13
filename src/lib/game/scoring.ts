import { Difficulty } from '@/types';

const BASE_SCORES: Record<Difficulty, number> = {
  beginner: 50,
  easy: 100,
  medium: 200,
  hard: 400,
  expert: 800,
  master: 1500,
};

export function calculateTimeBonus(difficulty: Difficulty, timeInSeconds: number): number {
  const targetTimes: Record<Difficulty, number> = {
    beginner: 180,
    easy: 300,
    medium: 600,
    hard: 900,
    expert: 1200,
    master: 1800,
  };

  const target = targetTimes[difficulty];
  if (timeInSeconds >= target * 2) return 0;

  const ratio = Math.max(0, 1 - (timeInSeconds / (target * 2)));
  return Math.round(BASE_SCORES[difficulty] * ratio * 0.5);
}

export function calculateMistakePenalty(mistakes: number): number {
  return mistakes * 50;
}

export function calculateHintPenalty(hintsUsed: number): number {
  return hintsUsed * 100;
}

export function calculateComboBonus(maxCombo: number): number {
  if (maxCombo < 3) return 0;
  if (maxCombo < 5) return 50;
  if (maxCombo < 10) return 150;
  if (maxCombo < 15) return 300;
  if (maxCombo < 20) return 500;
  return 1000;
}

export function calculatePerfectBonus(mistakes: number, hintsUsed: number, difficulty: Difficulty): number {
  if (mistakes === 0 && hintsUsed === 0) {
    return Math.round(BASE_SCORES[difficulty] * 0.5);
  }
  if (mistakes === 0) {
    return Math.round(BASE_SCORES[difficulty] * 0.25);
  }
  return 0;
}

export function calculateFinalScore(params: {
  difficulty: Difficulty;
  timeInSeconds: number;
  mistakes: number;
  hintsUsed: number;
  maxCombo: number;
}): {
  baseScore: number;
  timeBonus: number;
  comboBonus: number;
  perfectBonus: number;
  mistakePenalty: number;
  hintPenalty: number;
  totalScore: number;
} {
  const { difficulty, timeInSeconds, mistakes, hintsUsed, maxCombo } = params;

  const baseScore = BASE_SCORES[difficulty];
  const timeBonus = calculateTimeBonus(difficulty, timeInSeconds);
  const comboBonus = calculateComboBonus(maxCombo);
  const perfectBonus = calculatePerfectBonus(mistakes, hintsUsed, difficulty);
  const mistakePenalty = calculateMistakePenalty(mistakes);
  const hintPenalty = calculateHintPenalty(hintsUsed);

  const totalScore = Math.max(0, baseScore + timeBonus + comboBonus + perfectBonus - mistakePenalty - hintPenalty);

  return { baseScore, timeBonus, comboBonus, perfectBonus, mistakePenalty, hintPenalty, totalScore };
}
