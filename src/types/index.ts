// ===== 스도쿠 기본 타입 =====
export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Board = CellValue[][];
export type Notes = Set<number>[][];

export interface Cell {
  row: number;
  col: number;
  value: CellValue;
  isGiven: boolean;
  isCorrect: boolean;
  notes: Set<number>;
  isHighlighted: boolean;
  isSelected: boolean;
  isConflict: boolean;
  animation?: 'pop' | 'shake' | 'glow' | 'combo';
}

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';

export interface DifficultyConfig {
  name: string;
  nameKo: string;
  givens: number;
  xpMultiplier: number;
  coinReward: number;
  color: string;
  icon: string;
  description: string;
  /** Lives (heart count) for this difficulty. Game ends after this many mistakes. */
  maxMistakes: number;
}

export interface Puzzle {
  id: string;
  board: Board;
  solution: Board;
  difficulty: Difficulty;
  createdAt: string;
  seed?: number;
}

// ===== 게임 상태 =====
export type GameStatus = 'idle' | 'generating' | 'playing' | 'paused' | 'completed' | 'failed';

export interface GameState {
  puzzle: Puzzle | null;
  currentBoard: Board;
  notes: Notes;
  selectedCell: { row: number; col: number } | null;
  history: GameAction[];
  historyIndex: number;
  status: GameStatus;
  startTime: number;
  elapsedTime: number;
  mistakes: number;
  maxMistakes: number;
  hintsUsed: number;
  maxHints: number;
  combo: number;
  maxCombo: number;
  score: number;
  isNotesMode: boolean;
  highlightedNumber: CellValue;
  difficulty: Difficulty;
}

export interface GameAction {
  type: 'place' | 'erase' | 'note' | 'hint';
  row: number;
  col: number;
  prevValue: CellValue;
  newValue: CellValue;
  prevNotes?: number[];
  newNotes?: number[];
  timestamp: number;
  // Progression snapshot BEFORE this action — restored on undo so that
  // undo→re-place cannot farm combo / erase mistakes / refund hints.
  prevCombo?: ComboState;
  prevMaxCombo?: number;
  prevMistakes?: number;
  prevHintsUsed?: number;
}

// ===== 콤보 시스템 =====
export interface ComboState {
  current: number;
  timer: number;
  maxTime: number;
  multiplier: number;
  lastCorrectTime: number;
}

// ===== 스트릭 시스템 =====
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string;
  streakHistory: string[];
  streakFreezeCount: number;
  isStreakActive: boolean;
  /** Streak lengths whose milestone reward has already been paid (dedup guard). */
  claimedMilestones?: number[];
}

// ===== 레벨링 시스템 =====
export interface LevelData {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  title: string;
  titleKo: string;
  tier: PlayerTier;
}

export type PlayerTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

export interface TierConfig {
  name: string;
  nameKo: string;
  minLevel: number;
  color: string;
  gradient: string;
  icon: string;
}

// ===== 업적 시스템 =====
export interface Achievement {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  coinReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type AchievementCategory =
  | 'puzzle'
  | 'streak'
  | 'speed'
  | 'combo'
  | 'perfect'
  | 'daily'
  | 'collection'
  | 'mastery';

// ===== 파워업 =====
export interface PowerUp {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
  cost: number;
  count: number;
  maxCount: number;
  effect: PowerUpEffect;
}

export type PowerUpEffect =
  | 'reveal_cell'
  | 'reveal_row'
  | 'check_board'
  | 'freeze_timer'
  | 'combo_boost'
  | 'streak_freeze'
  | 'undo_mistake'
  | 'hint_pack'
  | 'revive_ticket';

// ===== 테마/커스터마이징 =====
export interface GameTheme {
  id: string;
  name: string;
  nameKo: string;
  boardBg: string;
  cellBg: string;
  selectedBg: string;
  highlightBg: string;
  conflictBg: string;
  givenColor: string;
  inputColor: string;
  borderColor: string;
  accentColor: string;
  isUnlocked: boolean;
  cost: number;
  preview: string;
}

// ===== 데일리 챌린지 =====
export interface DailyChallenge {
  date: string;
  puzzle: Puzzle;
  bonusObjective: BonusObjective;
  completedBy: number;
  myResult?: DailyResult;
}

export interface BonusObjective {
  type: 'no_mistakes' | 'under_time' | 'no_hints' | 'combo_target';
  target: number;
  description: string;
  descriptionKo: string;
  bonusXP: number;
  bonusCoins: number;
}

export interface DailyResult {
  time: number;
  mistakes: number;
  hintsUsed: number;
  maxCombo: number;
  score: number;
  rank: number;
  bonusCompleted: boolean;
}

// ===== 리더보드 =====
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  time: number;
  level: number;
  tier: PlayerTier;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';

// ===== 유저 프로필 =====
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  coins: number;
  gems: number;
  streak: StreakData;
  stats: UserStats;
  achievements: Achievement[];
  unlockedThemes: string[];
  activeTheme: string;
  powerUps: PowerUp[];
  settings: UserSettings;
  createdAt: string;
  /** Dates (YYYY-MM-DD) on which the daily challenge was actually completed. */
  dailyCompletedDates?: string[];
  /** Weekly mission progress, keyed by ISO week id (e.g. "2026-W29"). */
  weeklyMissions?: WeeklyMissionState;
  /** KST date (YYYY-MM-DD) on which the once-a-day free continue was used. */
  lastFreeReviveDate?: string;
  /** Owned non-consumable purchases. Empty on the ad-supported free tier. */
  entitlements?: {
    removeAds?: boolean;
    allThemes?: boolean;
    /** ISO week id the season pass is active for, e.g. "2026-W30". */
    seasonPass?: string;
  };
}

// ===== 주간 미션 =====
export interface WeeklyMission {
  id: string;
  descriptionKo: string;
  type: 'win_hard' | 'perfect_games' | 'daily_streak' | 'combo_reach' | 'total_wins';
  target: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  claimed: boolean;
}

export interface WeeklyMissionState {
  weekId: string;
  missions: WeeklyMission[];
}

export interface UserStats {
  totalGamesPlayed: number;
  totalGamesWon: number;
  totalTimePlayed: number;
  bestTimes: Record<Difficulty, number>;
  perfectGames: number;
  totalMistakes: number;
  totalHintsUsed: number;
  maxCombo: number;
  /**
   * Best combo reached on hard/expert/master only. Combo achievements read this
   * so an easy board — where an uninterrupted fill is trivial — can't unlock the
   * whole combo track in a single first session.
   */
  maxComboHardPlus: number;
  dailyChallengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  puzzlesByDifficulty: Record<Difficulty, number>;
  averageTimes: Record<Difficulty, number>;
  perfectGamesByDifficulty: Record<Difficulty, number>;
  winRate: number;
  brainScore: number;
  /** Number of daily bonus objectives actually achieved (for daily_bonus_all achievement). */
  dailyBonusCompleted: number;
  /** Rolling log of finished games (newest last, capped) powering the weekly report. */
  recentSessions?: GameSession[];
}

/** One completed game, kept only for the local weekly report. */
export interface GameSession {
  /** KST date, YYYY-MM-DD. */
  date: string;
  difficulty: Difficulty;
  timeInSeconds: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  autoRemoveNotes: boolean;
  highlightSameNumbers: boolean;
  highlightConflicts: boolean;
  showTimer: boolean;
  showMistakeCount: boolean;
  darkMode: boolean;
  language: 'ko' | 'en';
  /** Larger board/number-pad type for younger and older players. */
  largeText: boolean;
  numberFirst: boolean;
}

// ===== 사운드 =====
export type SoundType =
  | 'tap'
  | 'place'
  | 'correct'
  | 'wrong'
  | 'combo1'
  | 'combo2'
  | 'combo3'
  | 'comboMax'
  | 'comboBreak'
  | 'hint'
  | 'undo'
  | 'complete'
  | 'levelUp'
  | 'achievement'
  | 'streak'
  | 'dailyComplete'
  | 'powerup';
