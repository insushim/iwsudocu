import { Achievement, UserStats } from '@/types';

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'progress' | 'isUnlocked' | 'unlockedAt'>[] = [
  { id: 'first_puzzle', name: 'First Steps', nameKo: '첫 걸음', description: 'Complete your first puzzle', descriptionKo: '첫 번째 퍼즐을 완료하세요', icon: '🎯', category: 'puzzle', requirement: 1, xpReward: 50, coinReward: 20, rarity: 'common' },
  { id: 'puzzle_10', name: 'Getting Warmed Up', nameKo: '워밍업', description: 'Complete 10 puzzles', descriptionKo: '퍼즐 10개를 완료하세요', icon: '🔥', category: 'puzzle', requirement: 10, xpReward: 100, coinReward: 50, rarity: 'common' },
  { id: 'puzzle_50', name: 'Dedicated Player', nameKo: '열정적인 플레이어', description: 'Complete 50 puzzles', descriptionKo: '퍼즐 50개를 완료하세요', icon: '⭐', category: 'puzzle', requirement: 50, xpReward: 300, coinReward: 150, rarity: 'rare' },
  { id: 'puzzle_100', name: 'Century Club', nameKo: '100 클럽', description: 'Complete 100 puzzles', descriptionKo: '퍼즐 100개를 완료하세요', icon: '💯', category: 'puzzle', requirement: 100, xpReward: 500, coinReward: 300, rarity: 'rare' },
  { id: 'puzzle_500', name: 'Puzzle Master', nameKo: '퍼즐 마스터', description: 'Complete 500 puzzles', descriptionKo: '퍼즐 500개를 완료하세요', icon: '🏅', category: 'puzzle', requirement: 500, xpReward: 1000, coinReward: 500, rarity: 'epic' },
  { id: 'puzzle_1000', name: 'Puzzle Legend', nameKo: '퍼즐 전설', description: 'Complete 1000 puzzles', descriptionKo: '퍼즐 1000개를 완료하세요', icon: '🏆', category: 'puzzle', requirement: 1000, xpReward: 3000, coinReward: 1500, rarity: 'legendary' },
  { id: 'all_difficulties', name: 'Well Rounded', nameKo: '만능인', description: 'Complete puzzle on every difficulty', descriptionKo: '모든 난이도에서 퍼즐을 완료하세요', icon: '🌈', category: 'puzzle', requirement: 6, xpReward: 500, coinReward: 250, rarity: 'epic' },
  { id: 'master_clear', name: 'Brain Supreme', nameKo: '최강 두뇌', description: 'Complete a Master difficulty puzzle', descriptionKo: '마스터 난이도 퍼즐을 완료하세요', icon: '🧠', category: 'puzzle', requirement: 1, xpReward: 500, coinReward: 300, rarity: 'epic' },
  { id: 'streak_3', name: 'Three Peat', nameKo: '3일 연속', description: '3-day streak', descriptionKo: '3일 연속 플레이하세요', icon: '🔥', category: 'streak', requirement: 3, xpReward: 100, coinReward: 50, rarity: 'common' },
  { id: 'streak_7', name: 'Weekly Warrior', nameKo: '주간 전사', description: '7-day streak', descriptionKo: '7일 연속 플레이하세요', icon: '🔥', category: 'streak', requirement: 7, xpReward: 300, coinReward: 150, rarity: 'rare' },
  { id: 'streak_30', name: 'Monthly Master', nameKo: '월간 마스터', description: '30-day streak', descriptionKo: '30일 연속 플레이하세요', icon: '🔥', category: 'streak', requirement: 30, xpReward: 1000, coinReward: 500, rarity: 'epic' },
  { id: 'streak_60', name: 'Unstoppable', nameKo: '멈출 수 없는', description: '60-day streak', descriptionKo: '60일 연속 플레이하세요', icon: '⚡', category: 'streak', requirement: 60, xpReward: 2000, coinReward: 1000, rarity: 'epic' },
  { id: 'streak_100', name: 'Centurion', nameKo: '백일장군', description: '100-day streak', descriptionKo: '100일 연속 플레이하세요', icon: '🎖️', category: 'streak', requirement: 100, xpReward: 5000, coinReward: 2500, rarity: 'legendary' },
  { id: 'streak_365', name: 'Year Round', nameKo: '365일의 기적', description: '365-day streak', descriptionKo: '365일 연속 플레이하세요', icon: '🌟', category: 'streak', requirement: 365, xpReward: 20000, coinReward: 10000, rarity: 'legendary' },
  { id: 'speed_easy_3m', name: 'Quick Thinker', nameKo: '빠른 사고', description: 'Complete Easy under 3 min', descriptionKo: '쉬움 난이도를 3분 안에 완료하세요', icon: '⚡', category: 'speed', requirement: 180, xpReward: 200, coinReward: 100, rarity: 'rare' },
  { id: 'speed_medium_5m', name: 'Speed Solver', nameKo: '스피드 솔버', description: 'Complete Medium under 5 min', descriptionKo: '보통 난이도를 5분 안에 완료하세요', icon: '⚡', category: 'speed', requirement: 300, xpReward: 400, coinReward: 200, rarity: 'rare' },
  { id: 'speed_hard_10m', name: 'Lightning Fast', nameKo: '번개', description: 'Complete Hard under 10 min', descriptionKo: '어려움 난이도를 10분 안에 완료하세요', icon: '⚡', category: 'speed', requirement: 600, xpReward: 800, coinReward: 400, rarity: 'epic' },
  { id: 'speed_expert_15m', name: 'Time Bender', nameKo: '시간을 지배하는 자', description: 'Complete Expert under 15 min', descriptionKo: '전문가 난이도를 15분 안에 완료하세요', icon: '⏱️', category: 'speed', requirement: 900, xpReward: 1500, coinReward: 750, rarity: 'epic' },
  { id: 'speed_master_20m', name: 'Chrono Master', nameKo: '시간의 마스터', description: 'Complete Master under 20 min', descriptionKo: '마스터 난이도를 20분 안에 완료하세요', icon: '🕐', category: 'speed', requirement: 1200, xpReward: 3000, coinReward: 1500, rarity: 'legendary' },
  { id: 'combo_5', name: 'Combo Starter', nameKo: '콤보 시작', description: 'Get a 5 combo', descriptionKo: '5 콤보를 달성하세요', icon: '🎵', category: 'combo', requirement: 5, xpReward: 100, coinReward: 50, rarity: 'common' },
  { id: 'combo_10', name: 'Combo King', nameKo: '콤보 킹', description: 'Get a 10 combo', descriptionKo: '10 콤보를 달성하세요', icon: '🎶', category: 'combo', requirement: 10, xpReward: 300, coinReward: 150, rarity: 'rare' },
  { id: 'combo_15', name: 'Combo Master', nameKo: '콤보 마스터', description: 'Get a 15 combo', descriptionKo: '15 콤보를 달성하세요', icon: '🎸', category: 'combo', requirement: 15, xpReward: 600, coinReward: 300, rarity: 'epic' },
  { id: 'combo_20', name: 'Unstoppable Combo', nameKo: '멈출 수 없는 콤보', description: 'Get a 20 combo', descriptionKo: '20 콤보를 달성하세요', icon: '💥', category: 'combo', requirement: 20, xpReward: 1000, coinReward: 500, rarity: 'epic' },
  { id: 'combo_30', name: 'Combo God', nameKo: '콤보의 신', description: 'Get a 30 combo', descriptionKo: '30 콤보를 달성하세요', icon: '🌟', category: 'combo', requirement: 30, xpReward: 3000, coinReward: 1500, rarity: 'legendary' },
  { id: 'perfect_1', name: 'Flawless', nameKo: '완벽', description: 'Complete puzzle with no mistakes', descriptionKo: '실수 없이 퍼즐을 완료하세요', icon: '✨', category: 'perfect', requirement: 1, xpReward: 150, coinReward: 75, rarity: 'common' },
  { id: 'perfect_10', name: 'Perfectionist', nameKo: '완벽주의자', description: '10 perfect games', descriptionKo: '퍼펙트 게임 10회 달성', icon: '💎', category: 'perfect', requirement: 10, xpReward: 500, coinReward: 250, rarity: 'rare' },
  { id: 'perfect_50', name: 'Immaculate', nameKo: '흠 없는', description: '50 perfect games', descriptionKo: '퍼펙트 게임 50회 달성', icon: '👑', category: 'perfect', requirement: 50, xpReward: 1500, coinReward: 750, rarity: 'epic' },
  { id: 'perfect_hard', name: 'Hard Perfection', nameKo: '어려운 완벽', description: 'Perfect game on Hard', descriptionKo: '어려움 난이도 퍼펙트 클리어', icon: '🎯', category: 'perfect', requirement: 1, xpReward: 800, coinReward: 400, rarity: 'epic' },
  { id: 'perfect_master', name: 'Master Perfection', nameKo: '마스터 퍼펙션', description: 'Perfect game on Master', descriptionKo: '마스터 난이도 퍼펙트 클리어', icon: '🏆', category: 'perfect', requirement: 1, xpReward: 5000, coinReward: 2500, rarity: 'legendary' },
  { id: 'daily_1', name: 'Daily Debut', nameKo: '데일리 데뷔', description: 'Complete first daily challenge', descriptionKo: '첫 데일리 챌린지를 완료하세요', icon: '📅', category: 'daily', requirement: 1, xpReward: 100, coinReward: 50, rarity: 'common' },
  { id: 'daily_7', name: 'Weekly Daily', nameKo: '일주일의 도전', description: 'Complete 7 daily challenges', descriptionKo: '데일리 챌린지 7회 완료', icon: '📆', category: 'daily', requirement: 7, xpReward: 300, coinReward: 150, rarity: 'rare' },
  { id: 'daily_30', name: 'Daily Devotee', nameKo: '데일리 신봉자', description: 'Complete 30 daily challenges', descriptionKo: '데일리 챌린지 30회 완료', icon: '🗓️', category: 'daily', requirement: 30, xpReward: 1000, coinReward: 500, rarity: 'epic' },
  { id: 'daily_100', name: 'Daily Legend', nameKo: '데일리 레전드', description: 'Complete 100 daily challenges', descriptionKo: '데일리 챌린지 100회 완료', icon: '🌟', category: 'daily', requirement: 100, xpReward: 3000, coinReward: 1500, rarity: 'legendary' },
  { id: 'daily_bonus_all', name: 'Bonus Hunter', nameKo: '보너스 헌터', description: 'Complete 10 daily bonus objectives', descriptionKo: '데일리 보너스 목표 10회 달성', icon: '🎁', category: 'daily', requirement: 10, xpReward: 500, coinReward: 250, rarity: 'rare' },
  { id: 'brain_300', name: 'Sharp Mind', nameKo: '날카로운 두뇌', description: 'Reach Brain Score 300', descriptionKo: '두뇌 점수 300 달성', icon: '🧠', category: 'mastery', requirement: 300, xpReward: 300, coinReward: 150, rarity: 'rare' },
  { id: 'brain_600', name: 'Big Brain', nameKo: '빅 브레인', description: 'Reach Brain Score 600', descriptionKo: '두뇌 점수 600 달성', icon: '🧠', category: 'mastery', requirement: 600, xpReward: 1000, coinReward: 500, rarity: 'epic' },
  { id: 'brain_900', name: 'Galaxy Brain', nameKo: '갤럭시 브레인', description: 'Reach Brain Score 900', descriptionKo: '두뇌 점수 900 달성', icon: '🧠', category: 'mastery', requirement: 900, xpReward: 5000, coinReward: 2500, rarity: 'legendary' },
  { id: 'level_10', name: 'Rising Star', nameKo: '떠오르는 별', description: 'Reach Level 10', descriptionKo: '레벨 10 달성', icon: '⭐', category: 'mastery', requirement: 10, xpReward: 300, coinReward: 150, rarity: 'rare' },
  { id: 'level_25', name: 'Veteran', nameKo: '베테랑', description: 'Reach Level 25', descriptionKo: '레벨 25 달성', icon: '🌟', category: 'mastery', requirement: 25, xpReward: 1000, coinReward: 500, rarity: 'epic' },
  { id: 'level_50', name: 'Elite', nameKo: '엘리트', description: 'Reach Level 50', descriptionKo: '레벨 50 달성', icon: '🏆', category: 'mastery', requirement: 50, xpReward: 5000, coinReward: 2500, rarity: 'legendary' },
];

export function checkAchievements(stats: UserStats, currentAchievements: Achievement[]): Achievement[] {
  return currentAchievements.map(ach => {
    if (ach.isUnlocked) return ach;

    let progress = 0;

    switch (ach.id) {
      case 'first_puzzle': case 'puzzle_10': case 'puzzle_50': case 'puzzle_100': case 'puzzle_500': case 'puzzle_1000':
        progress = stats.totalGamesWon;
        break;
      case 'all_difficulties':
        progress = Object.values(stats.puzzlesByDifficulty).filter(v => v > 0).length;
        break;
      case 'master_clear':
        progress = stats.puzzlesByDifficulty.master > 0 ? 1 : 0;
        break;
      case 'streak_3': case 'streak_7': case 'streak_30': case 'streak_60': case 'streak_100': case 'streak_365':
        progress = stats.longestStreak;
        break;
      case 'combo_5': case 'combo_10': case 'combo_15': case 'combo_20': case 'combo_30':
        progress = stats.maxCombo;
        break;
      case 'perfect_1': case 'perfect_10': case 'perfect_50':
        progress = stats.perfectGames;
        break;
      case 'perfect_hard':
        progress = stats.puzzlesByDifficulty.hard > 0 && stats.perfectGames > 0 ? 1 : 0;
        break;
      case 'perfect_master':
        progress = stats.puzzlesByDifficulty.master > 0 && stats.perfectGames > 0 ? 1 : 0;
        break;
      case 'daily_1': case 'daily_7': case 'daily_30': case 'daily_100': case 'daily_bonus_all':
        progress = stats.dailyChallengesCompleted;
        break;
      case 'brain_300': case 'brain_600': case 'brain_900':
        progress = stats.brainScore;
        break;
      case 'level_10': case 'level_25': case 'level_50':
        progress = 0; // checked externally
        break;
      default:
        break;
    }

    const isUnlocked = progress >= ach.requirement;
    return {
      ...ach,
      progress,
      isUnlocked,
      unlockedAt: isUnlocked && !ach.isUnlocked ? new Date().toISOString() : ach.unlockedAt,
    };
  });
}
