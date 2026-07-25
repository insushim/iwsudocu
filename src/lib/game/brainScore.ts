import { UserStats, Difficulty } from '@/types';

export function calculateBrainScore(stats: UserStats): number {
  if (stats.totalGamesPlayed === 0) return 0;

  const difficultyWeights: Record<Difficulty, number> = {
    beginner: 10, easy: 30, medium: 60, hard: 100, expert: 150, master: 200,
  };
  let diffScore = 0;
  for (const [diff, count] of Object.entries(stats.puzzlesByDifficulty)) {
    if (count > 0) {
      diffScore = Math.max(diffScore, difficultyWeights[diff as Difficulty] || 0);
    }
  }
  diffScore = Math.min(300, diffScore + stats.totalGamesWon * 0.5);

  // Speed, accuracy and combo are all trivially maxed on an easy board, so each
  // is weighted by the hardest difficulty actually cleared. Without this a
  // single fast, perfect Beginner run scored ~577 (grade A) in 17 seconds.
  const difficultyFactor: Record<Difficulty, number> = {
    beginner: 0.2, easy: 0.35, medium: 0.55, hard: 0.75, expert: 0.9, master: 1,
  };
  let diffFactor = 0;
  for (const [diff, count] of Object.entries(stats.puzzlesByDifficulty)) {
    if (count > 0) {
      diffFactor = Math.max(diffFactor, difficultyFactor[diff as Difficulty] || 0);
    }
  }

  // One perfect game is not evidence of 100% accuracy — ramp the accuracy term
  // in over the first ten wins instead of paying it out in full immediately.
  const confidence = Math.min(1, stats.totalGamesWon / 10);

  let speedScore = 0;
  const targetTime: Record<string, number> = {
    beginner: 120, easy: 240, medium: 480, hard: 720, expert: 960, master: 1440,
  };
  for (const [diff, time] of Object.entries(stats.averageTimes)) {
    if (time > 0) {
      const ratio = Math.max(0, 1 - time / (targetTime[diff] || 600));
      speedScore = Math.max(speedScore, ratio * 250 * diffFactor);
    }
  }

  const accuracy = stats.totalGamesPlayed > 0
    ? (stats.perfectGames / stats.totalGamesPlayed)
    : 0;
  const accuracyScore = accuracy * 200 * diffFactor * confidence;

  // Hard+ only, matching the combo achievements.
  const comboScore = Math.min(150, (stats.maxComboHardPlus ?? 0) * 7.5);

  const consistencyScore = Math.min(99, stats.longestStreak * 2);

  const total = Math.round(diffScore + speedScore + accuracyScore + comboScore + consistencyScore);
  return Math.min(999, total);
}

export function getBrainScoreGrade(score: number): { grade: string; label: string; labelKo: string; color: string } {
  if (score < 100) return { grade: 'F', label: 'Beginner', labelKo: '입문', color: '#9E9E9E' };
  if (score < 200) return { grade: 'D', label: 'Learning', labelKo: '학습 중', color: '#8BC34A' };
  if (score < 300) return { grade: 'C', label: 'Developing', labelKo: '발전 중', color: '#4CAF50' };
  if (score < 400) return { grade: 'B', label: 'Competent', labelKo: '유능한', color: '#2196F3' };
  if (score < 500) return { grade: 'B+', label: 'Skilled', labelKo: '숙련된', color: '#1976D2' };
  if (score < 600) return { grade: 'A', label: 'Advanced', labelKo: '고급', color: '#9C27B0' };
  if (score < 700) return { grade: 'A+', label: 'Expert', labelKo: '전문가', color: '#7B1FA2' };
  if (score < 800) return { grade: 'S', label: 'Master', labelKo: '마스터', color: '#FF9800' };
  if (score < 900) return { grade: 'S+', label: 'Grandmaster', labelKo: '그랜드마스터', color: '#F44336' };
  return { grade: 'SS', label: 'Legendary', labelKo: '전설', color: '#FFD700' };
}
