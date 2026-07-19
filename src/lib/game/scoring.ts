import { Difficulty } from "@/types";

const BASE_SCORES: Record<Difficulty, number> = {
  beginner: 50,
  easy: 100,
  medium: 200,
  hard: 400,
  expert: 800,
  master: 1500,
};

export function calculateTimeBonus(
  difficulty: Difficulty,
  timeInSeconds: number,
): number {
  const targetTimes: Record<Difficulty, number> = {
    beginner: 180,
    easy: 300,
    medium: 600,
    hard: 900,
    expert: 1200,
    master: 1800,
  };

  const target = targetTimes[difficulty];
  const maxTime = target * 2;
  // Guard against a tampered / rewound clock producing a negative elapsed time,
  // which would otherwise inflate the time bonus above its intended ceiling.
  const safeTime = Math.max(0, timeInSeconds);
  if (safeTime >= maxTime) return 0;

  const ratio = Math.max(0, 1 - safeTime / maxTime);
  return Math.round(BASE_SCORES[difficulty] * ratio * 1.5);
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

export function calculatePerfectBonus(
  mistakes: number,
  hintsUsed: number,
  difficulty: Difficulty,
): number {
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

  const totalScore = Math.max(
    0,
    baseScore +
      timeBonus +
      comboBonus +
      perfectBonus -
      mistakePenalty -
      hintPenalty,
  );

  return {
    baseScore,
    timeBonus,
    comboBonus,
    perfectBonus,
    mistakePenalty,
    hintPenalty,
    totalScore,
  };
}

/**
 * Theoretical maximum score per difficulty = base + max time bonus (base*1.5)
 * + max combo bonus (1000) + max perfect bonus (base*0.5), no penalties.
 * Used to clamp client-supplied scores both locally (reward calc) and on the
 * leaderboard server, so a tampered localStorage / forged POST cannot mint
 * unbounded XP, coins, or ranking points.
 */
export const MAX_SCORE_BY_DIFFICULTY: Record<Difficulty, number> = {
  beginner: 1150,
  easy: 1300,
  medium: 1600,
  hard: 2200,
  expert: 3400,
  master: 5500,
};

/** Clamp a (possibly untrusted) score into the valid range for its difficulty. */
export function clampScore(totalScore: number, difficulty: Difficulty): number {
  const max = MAX_SCORE_BY_DIFFICULTY[difficulty] ?? MAX_SCORE_BY_DIFFICULTY.medium;
  if (!Number.isFinite(totalScore)) return 0;
  return Math.max(0, Math.min(Math.round(totalScore), max));
}

/**
 * Single source of truth for converting a game score into XP/coin rewards.
 * The store recomputes rewards from the clamped score rather than trusting any
 * externally-supplied figure, and the completion modal previews the exact same
 * numbers (streak multiplier included) so display == actual payout.
 */
export function calculateRewards(params: {
  totalScore: number;
  difficulty: Difficulty;
  streakMultiplier: number;
}): { xp: number; coins: number } {
  const clamped = clampScore(params.totalScore, params.difficulty);
  const baseXP = Math.round(clamped * 0.5);
  const baseCoins = Math.round(clamped * 0.1);
  return {
    xp: Math.round(baseXP * params.streakMultiplier),
    coins: Math.round(baseCoins * params.streakMultiplier),
  };
}
