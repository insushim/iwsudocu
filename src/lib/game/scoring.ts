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

/**
 * Combo bonus as a fraction of the difficulty's base score.
 *
 * A flat bonus made combo the dominant term at low difficulty (a Beginner board
 * has ~20 blanks, so an uninterrupted fill trivially reached the top tier and
 * paid 20x the base score). Scaling by base score keeps combo a meaningful but
 * proportionate reward at every difficulty.
 */
const COMBO_BONUS_RATIO: { min: number; ratio: number }[] = [
  { min: 20, ratio: 1.0 },
  { min: 15, ratio: 0.75 },
  { min: 10, ratio: 0.5 },
  { min: 5, ratio: 0.3 },
  { min: 3, ratio: 0.15 },
];

export function calculateComboBonus(
  maxCombo: number,
  difficulty: Difficulty = 'medium',
): number {
  const tier = COMBO_BONUS_RATIO.find((t) => maxCombo >= t.min);
  if (!tier) return 0;
  return Math.round(BASE_SCORES[difficulty] * tier.ratio);
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
  const comboBonus = calculateComboBonus(maxCombo, difficulty);
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
 * Theoretical maximum score per difficulty = base * 4, i.e. base + max time
 * bonus (base*1.5) + max combo bonus (base*1.0) + max perfect bonus (base*0.5),
 * no penalties. Used to clamp client-supplied scores both locally (reward calc)
 * and on the leaderboard server, so a tampered localStorage / forged POST
 * cannot mint unbounded XP, coins, or ranking points.
 *
 * Keep in sync with MAX_SCORE in functions/api/leaderboard.ts.
 */
export const MAX_SCORE_BY_DIFFICULTY: Record<Difficulty, number> = {
  beginner: 200,
  easy: 400,
  medium: 800,
  hard: 1600,
  expert: 3200,
  master: 6000,
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
