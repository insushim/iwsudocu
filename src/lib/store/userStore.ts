import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserProfile,
  UserStats,
  UserSettings,
  Achievement,
  PowerUp,
  StreakData,
  Difficulty,
  GameTheme,
} from '@/types';
import { calculateLevel } from '@/lib/game/leveling';
import { updateStreak, getStreakMultiplier, getStreakMilestoneReward } from '@/lib/game/streak';
import { ALL_ACHIEVEMENTS, checkAchievements } from '@/lib/game/achievements';
import { calculateBrainScore } from '@/lib/game/brainScore';
import { soundManager } from '@/lib/audio/soundManager';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_STATS: UserStats = {
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  totalTimePlayed: 0,
  bestTimes: {
    beginner: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
    master: 0,
  },
  perfectGames: 0,
  totalMistakes: 0,
  totalHintsUsed: 0,
  maxCombo: 0,
  dailyChallengesCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  puzzlesByDifficulty: {
    beginner: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
    master: 0,
  },
  averageTimes: {
    beginner: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
    master: 0,
  },
  winRate: 0,
  brainScore: 0,
};

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  musicEnabled: false,
  vibrationEnabled: true,
  autoRemoveNotes: true,
  highlightSameNumbers: true,
  highlightConflicts: true,
  showTimer: true,
  showMistakeCount: true,
  darkMode: false,
  language: 'ko',
  numberFirst: false,
};

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastPlayDate: '',
  streakHistory: [],
  streakFreezeCount: 0,
  isStreakActive: false,
};

function createDefaultPowerUps(): PowerUp[] {
  return [
    {
      id: 'reveal_cell',
      name: 'Reveal Cell',
      nameKo: '셀 공개',
      description: 'Reveals a single cell',
      descriptionKo: '하나의 셀을 공개합니다',
      icon: '🔍',
      cost: 100,
      count: 3,
      maxCount: 10,
      effect: 'reveal_cell',
    },
    {
      id: 'check_board',
      name: 'Check Board',
      nameKo: '보드 검사',
      description: 'Highlights all incorrect cells',
      descriptionKo: '잘못된 셀을 표시합니다',
      icon: '✅',
      cost: 150,
      count: 3,
      maxCount: 10,
      effect: 'check_board',
    },
    {
      id: 'freeze_timer',
      name: 'Freeze Timer',
      nameKo: '타이머 정지',
      description: 'Freezes the timer for 30 seconds',
      descriptionKo: '30초 동안 타이머를 정지합니다',
      icon: '❄️',
      cost: 200,
      count: 2,
      maxCount: 5,
      effect: 'freeze_timer',
    },
    {
      id: 'combo_boost',
      name: 'Combo Boost',
      nameKo: '콤보 부스트',
      description: 'Doubles combo multiplier for 60 seconds',
      descriptionKo: '60초 동안 콤보 배율 2배',
      icon: '🚀',
      cost: 300,
      count: 1,
      maxCount: 3,
      effect: 'combo_boost',
    },
    {
      id: 'streak_freeze',
      name: 'Streak Freeze',
      nameKo: '스트릭 보호',
      description: 'Protects your streak for one day',
      descriptionKo: '하루 동안 스트릭을 보호합니다',
      icon: '🛡️',
      cost: 250,
      count: 1,
      maxCount: 3,
      effect: 'streak_freeze',
    },
    {
      id: 'undo_mistake',
      name: 'Undo Mistake',
      nameKo: '실수 취소',
      description: 'Removes one mistake from your count',
      descriptionKo: '실수 횟수를 하나 줄입니다',
      icon: '⏪',
      cost: 150,
      count: 2,
      maxCount: 5,
      effect: 'undo_mistake',
    },
  ];
}

function createDefaultAchievements(): Achievement[] {
  return ALL_ACHIEVEMENTS.map((a) => ({
    ...a,
    progress: 0,
    isUnlocked: false,
  }));
}

function createDefaultProfile(): UserProfile {
  return {
    id: `user-${Date.now()}`,
    displayName: 'Player',
    level: 1,
    totalXP: 0,
    coins: 100,
    gems: 0,
    streak: { ...DEFAULT_STREAK },
    stats: { ...DEFAULT_STATS },
    achievements: createDefaultAchievements(),
    unlockedThemes: ['default'],
    activeTheme: 'default',
    powerUps: createDefaultPowerUps(),
    settings: { ...DEFAULT_SETTINGS },
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface UserStore {
  profile: UserProfile;

  // XP & coins
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;

  // Streak
  recordStreak: () => void;

  // Game result
  recordGameResult: (result: {
    difficulty: Difficulty;
    timeInSeconds: number;
    mistakes: number;
    hintsUsed: number;
    maxCombo: number;
    totalScore: number;
    isDaily?: boolean;
  }) => Achievement[];

  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Themes
  unlockTheme: (themeId: string, cost: number) => boolean;
  setActiveTheme: (themeId: string) => void;

  // Power-ups
  usePowerUp: (powerUpId: string) => boolean;
  addPowerUp: (powerUpId: string, count: number) => void;
  purchasePowerUp: (powerUpId: string) => boolean;

  // Display name
  setDisplayName: (name: string) => void;

  // Reset
  resetProfile: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: createDefaultProfile(),

      // -------------------------------------------------------------------
      // XP & Coins
      // -------------------------------------------------------------------

      addXP: (amount: number) => {
        set((state) => {
          const newTotalXP = state.profile.totalXP + amount;
          const levelData = calculateLevel(newTotalXP);
          const didLevelUp = levelData.level > state.profile.level;

          if (didLevelUp) {
            soundManager.play('levelUp');
          }

          return {
            profile: {
              ...state.profile,
              totalXP: newTotalXP,
              level: levelData.level,
            },
          };
        });
      },

      addCoins: (amount: number) => {
        set((state) => ({
          profile: {
            ...state.profile,
            coins: state.profile.coins + amount,
          },
        }));
      },

      spendCoins: (amount: number) => {
        const { profile } = get();
        if (profile.coins < amount) return false;

        set((state) => ({
          profile: {
            ...state.profile,
            coins: state.profile.coins - amount,
          },
        }));
        return true;
      },

      // -------------------------------------------------------------------
      // Streak
      // -------------------------------------------------------------------

      recordStreak: () => {
        set((state) => {
          const newStreak = updateStreak(state.profile.streak);
          const milestone = getStreakMilestoneReward(newStreak.currentStreak);

          let bonusXP = 0;
          let bonusCoins = 0;

          if (milestone) {
            bonusXP = milestone.xp;
            bonusCoins = milestone.coins;
            soundManager.play('streak');
          }

          const newTotalXP = state.profile.totalXP + bonusXP;
          const levelData = calculateLevel(newTotalXP);

          return {
            profile: {
              ...state.profile,
              streak: newStreak,
              totalXP: newTotalXP,
              coins: state.profile.coins + bonusCoins,
              level: levelData.level,
              stats: {
                ...state.profile.stats,
                currentStreak: newStreak.currentStreak,
                longestStreak: newStreak.longestStreak,
              },
            },
          };
        });
      },

      // -------------------------------------------------------------------
      // Record game result
      // -------------------------------------------------------------------

      recordGameResult: (result) => {
        const { profile } = get();

        // 1. Calculate XP and coins with streak multiplier
        const streakMult = getStreakMultiplier(profile.streak.currentStreak);
        const baseXP = Math.round(result.totalScore * 0.5);
        const baseCoins = Math.round(result.totalScore * 0.1);
        let earnedXP = Math.round(baseXP * streakMult);
        let earnedCoins = Math.round(baseCoins * streakMult);

        // 2. Update stats
        const stats = { ...profile.stats };
        stats.totalGamesPlayed += 1;
        stats.totalGamesWon += 1;
        stats.totalTimePlayed += result.timeInSeconds;
        stats.totalMistakes += result.mistakes;
        stats.totalHintsUsed += result.hintsUsed;
        stats.maxCombo = Math.max(stats.maxCombo, result.maxCombo);
        stats.puzzlesByDifficulty = {
          ...stats.puzzlesByDifficulty,
          [result.difficulty]: stats.puzzlesByDifficulty[result.difficulty] + 1,
        };

        // Best time
        const currentBest = stats.bestTimes[result.difficulty];
        if (currentBest === 0 || result.timeInSeconds < currentBest) {
          stats.bestTimes = {
            ...stats.bestTimes,
            [result.difficulty]: result.timeInSeconds,
          };
        }

        // Average time
        const playCount = stats.puzzlesByDifficulty[result.difficulty];
        const prevAvg = stats.averageTimes[result.difficulty];
        const newAvg =
          playCount === 1
            ? result.timeInSeconds
            : Math.round((prevAvg * (playCount - 1) + result.timeInSeconds) / playCount);
        stats.averageTimes = {
          ...stats.averageTimes,
          [result.difficulty]: newAvg,
        };

        // Perfect game
        if (result.mistakes === 0 && result.hintsUsed === 0) {
          stats.perfectGames += 1;
        }

        // Daily challenge
        if (result.isDaily) {
          stats.dailyChallengesCompleted += 1;
        }

        // Win rate
        stats.winRate =
          stats.totalGamesPlayed > 0
            ? Math.round((stats.totalGamesWon / stats.totalGamesPlayed) * 100)
            : 0;

        // Streak stats
        stats.currentStreak = profile.streak.currentStreak;
        stats.longestStreak = profile.streak.longestStreak;

        // 3. Recalculate brain score
        stats.brainScore = calculateBrainScore(stats);

        // 4. Check achievements
        const prevAchievements = profile.achievements;
        const updatedAchievements = checkAchievements(stats, prevAchievements);

        // 5. Find newly unlocked achievements and award bonuses
        const newlyUnlocked: Achievement[] = [];
        for (const ach of updatedAchievements) {
          if (ach.isUnlocked) {
            const prev = prevAchievements.find((a) => a.id === ach.id);
            if (prev && !prev.isUnlocked) {
              newlyUnlocked.push(ach);
              earnedXP += ach.xpReward;
              earnedCoins += ach.coinReward;
            }
          }
        }

        if (newlyUnlocked.length > 0) {
          soundManager.play('achievement');
        }

        // Calculate new level
        const newTotalXP = profile.totalXP + earnedXP;
        const levelData = calculateLevel(newTotalXP);
        const didLevelUp = levelData.level > profile.level;

        if (didLevelUp) {
          soundManager.play('levelUp');
        }

        // 6. Commit state
        set({
          profile: {
            ...profile,
            totalXP: newTotalXP,
            level: levelData.level,
            coins: profile.coins + earnedCoins,
            stats,
            achievements: updatedAchievements,
          },
        });

        return newlyUnlocked;
      },

      // -------------------------------------------------------------------
      // Settings
      // -------------------------------------------------------------------

      updateSettings: (settings: Partial<UserSettings>) => {
        set((state) => {
          const newSettings = { ...state.profile.settings, ...settings };

          // Sync sound setting with sound manager
          if (settings.soundEnabled !== undefined) {
            soundManager.setEnabled(settings.soundEnabled);
          }

          return {
            profile: {
              ...state.profile,
              settings: newSettings,
            },
          };
        });
      },

      // -------------------------------------------------------------------
      // Themes
      // -------------------------------------------------------------------

      unlockTheme: (themeId: string, cost: number) => {
        const { profile } = get();
        if (profile.coins < cost) return false;
        if (profile.unlockedThemes.includes(themeId)) return false;

        set((state) => ({
          profile: {
            ...state.profile,
            coins: state.profile.coins - cost,
            unlockedThemes: [...state.profile.unlockedThemes, themeId],
          },
        }));

        soundManager.play('powerup');
        return true;
      },

      setActiveTheme: (themeId: string) => {
        const { profile } = get();
        if (!profile.unlockedThemes.includes(themeId)) return;

        set((state) => ({
          profile: {
            ...state.profile,
            activeTheme: themeId,
          },
        }));
      },

      // -------------------------------------------------------------------
      // Power-ups
      // -------------------------------------------------------------------

      usePowerUp: (powerUpId: string) => {
        const { profile } = get();
        const powerUp = profile.powerUps.find((p) => p.id === powerUpId);
        if (!powerUp || powerUp.count <= 0) return false;

        set((state) => ({
          profile: {
            ...state.profile,
            powerUps: state.profile.powerUps.map((p) =>
              p.id === powerUpId ? { ...p, count: p.count - 1 } : p,
            ),
          },
        }));

        soundManager.play('powerup');
        return true;
      },

      addPowerUp: (powerUpId: string, count: number) => {
        set((state) => ({
          profile: {
            ...state.profile,
            powerUps: state.profile.powerUps.map((p) =>
              p.id === powerUpId
                ? { ...p, count: Math.min(p.count + count, p.maxCount) }
                : p,
            ),
          },
        }));
      },

      purchasePowerUp: (powerUpId: string) => {
        const { profile } = get();
        const powerUp = profile.powerUps.find((p) => p.id === powerUpId);
        if (!powerUp) return false;
        if (powerUp.count >= powerUp.maxCount) return false;
        if (profile.coins < powerUp.cost) return false;

        set((state) => ({
          profile: {
            ...state.profile,
            coins: state.profile.coins - powerUp.cost,
            powerUps: state.profile.powerUps.map((p) =>
              p.id === powerUpId ? { ...p, count: p.count + 1 } : p,
            ),
          },
        }));

        soundManager.play('powerup');
        return true;
      },

      // -------------------------------------------------------------------
      // Display name
      // -------------------------------------------------------------------

      setDisplayName: (name: string) => {
        set((state) => ({
          profile: {
            ...state.profile,
            displayName: name,
          },
        }));
      },

      // -------------------------------------------------------------------
      // Reset
      // -------------------------------------------------------------------

      resetProfile: () => {
        set({ profile: createDefaultProfile() });
      },
    }),
    {
      name: 'numero-quest-user',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
