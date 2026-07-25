/**
 * Today's date (YYYY-MM-DD) in KST — the app's canonical timezone for daily
 * puzzles, so every client worldwide gets the same daily seed and the server
 * (also KST) accepts the submission.
 */
export function kstToday(): string {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** KST date (YYYY-MM-DD) n days before today. */
export function kstDaysAgo(n: number): string {
  const d = new Date(Date.now() + 9 * 3600 * 1000 - n * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** Milliseconds remaining until the next KST midnight (daily/streak reset). */
export function msUntilKstMidnight(): number {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  const nextMidnight = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + 1);
  return nextMidnight - kst.getTime();
}

export interface DailyBonus {
  type: 'no_mistakes' | 'under_time' | 'no_hints' | 'combo_target';
  descriptionKo: string;
  target: number;
  bonusXP: number;
  bonusCoins: number;
}

/**
 * Fixed daily bonus objectives. The one shown/awarded for a given day is chosen
 * deterministically from its date, so the UI promise and the payout agree.
 */
export const DAILY_BONUSES: DailyBonus[] = [
  { type: 'no_mistakes', descriptionKo: '실수 없이 클리어하세요', target: 0, bonusXP: 200, bonusCoins: 100 },
  { type: 'under_time', descriptionKo: '10분 이내에 클리어하세요', target: 600, bonusXP: 150, bonusCoins: 75 },
  { type: 'no_hints', descriptionKo: '힌트 없이 클리어하세요', target: 0, bonusXP: 180, bonusCoins: 90 },
  { type: 'combo_target', descriptionKo: '10 콤보 이상 달성하세요', target: 10, bonusXP: 250, bonusCoins: 120 },
];

/** Deterministic daily bonus for a YYYY-MM-DD date string. */
export function getDailyBonus(dateStr: string): DailyBonus {
  const digits = dateStr.replace(/-/g, '');
  const seed = parseInt(digits, 10) || 0;
  return DAILY_BONUSES[seed % DAILY_BONUSES.length];
}

/** Whether a completed game satisfied the given daily bonus objective. */
export function checkDailyBonus(
  bonus: DailyBonus,
  result: { timeInSeconds: number; mistakes: number; hintsUsed: number; maxCombo: number },
): boolean {
  switch (bonus.type) {
    case 'no_mistakes':
      return result.mistakes === 0;
    case 'under_time':
      return result.timeInSeconds <= bonus.target;
    case 'no_hints':
      return result.hintsUsed === 0;
    case 'combo_target':
      return result.maxCombo >= bonus.target;
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Daily shop rotation (coin sink — gives coins somewhere to go every day)
// ---------------------------------------------------------------------------

/** Discount applied to the items on rotation, as a fraction off the list price. */
export const DAILY_DEAL_DISCOUNT = 0.3;

/**
 * Two deterministic item ids on sale for the given KST date. Deterministic so
 * every client shows the same rotation without a server round-trip.
 */
export function getDailyDealIds(dateStr: string, ids: string[]): string[] {
  if (ids.length <= 2) return [...ids];
  const seed = parseInt(dateStr.replace(/-/g, ''), 10) || 0;
  const pool = [...ids];
  const picked: string[] = [];
  let s = seed;
  for (let i = 0; i < 2 && pool.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    picked.push(pool.splice(s % pool.length, 1)[0]);
  }
  return picked;
}

/** List price after the daily-deal discount, rounded to a whole coin. */
export function dealPrice(cost: number): number {
  return Math.max(1, Math.round(cost * (1 - DAILY_DEAL_DISCOUNT)));
}

// ---------------------------------------------------------------------------
// Weekly missions (mid-term engagement loop between daily and season)
// ---------------------------------------------------------------------------

export interface WeeklyMissionTemplate {
  id: string;
  descriptionKo: string;
  type: 'win_hard' | 'perfect_games' | 'daily_streak' | 'combo_reach' | 'total_wins';
  target: number;
  xpReward: number;
  coinReward: number;
}

const WEEKLY_POOL: WeeklyMissionTemplate[] = [
  { id: 'win_hard', descriptionKo: '어려움 이상 난이도 3판 클리어', type: 'win_hard', target: 3, xpReward: 400, coinReward: 200 },
  { id: 'perfect_games', descriptionKo: '실수 없이 2판 클리어', type: 'perfect_games', target: 2, xpReward: 350, coinReward: 180 },
  { id: 'daily_streak', descriptionKo: '데일리 챌린지 3일 완료', type: 'daily_streak', target: 3, xpReward: 500, coinReward: 250 },
  { id: 'combo_reach', descriptionKo: '한 판에서 12 콤보 달성', type: 'combo_reach', target: 12, xpReward: 300, coinReward: 150 },
  { id: 'total_wins', descriptionKo: '아무 퍼즐이나 10판 클리어', type: 'total_wins', target: 10, xpReward: 300, coinReward: 150 },
];

/** ISO week id like "2026-W29" from a Date. */
export function getWeekId(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7,
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Pick 3 deterministic missions for a week id. */
export function getWeeklyMissionTemplates(weekId: string): WeeklyMissionTemplate[] {
  const seed = weekId.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) >>> 0;
  const pool = [...WEEKLY_POOL];
  const chosen: WeeklyMissionTemplate[] = [];
  let s = seed;
  for (let i = 0; i < 3 && pool.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % pool.length;
    chosen.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return chosen;
}
