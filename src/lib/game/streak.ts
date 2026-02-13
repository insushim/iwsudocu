import { StreakData } from '@/types';

export function createInitialStreakData(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: '',
    streakHistory: [],
    streakFreezeCount: 0,
    isStreakActive: false,
  };
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function updateStreak(data: StreakData, todayStr?: string): StreakData {
  const today = todayStr || formatDate(new Date());

  if (data.lastPlayDate === today) {
    return data;
  }

  let newStreak = data.currentStreak;

  if (!data.lastPlayDate) {
    newStreak = 1;
  } else {
    const diff = daysDiff(data.lastPlayDate, today);
    if (diff === 1) {
      newStreak = data.currentStreak + 1;
    } else if (diff === 2 && data.streakFreezeCount > 0) {
      newStreak = data.currentStreak + 1;
      return {
        ...data,
        currentStreak: newStreak,
        longestStreak: Math.max(data.longestStreak, newStreak),
        lastPlayDate: today,
        streakHistory: [...data.streakHistory, today],
        streakFreezeCount: data.streakFreezeCount - 1,
        isStreakActive: true,
      };
    } else {
      newStreak = 1;
    }
  }

  return {
    ...data,
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastPlayDate: today,
    streakHistory: [...data.streakHistory, today],
    isStreakActive: true,
  };
}

export function getStreakMultiplier(streak: number): number {
  if (streak < 3) return 1.0;
  if (streak < 7) return 1.2;
  if (streak < 14) return 1.5;
  if (streak < 30) return 1.8;
  if (streak < 60) return 2.0;
  if (streak < 100) return 2.5;
  return 3.0;
}

export function getStreakMilestoneReward(streak: number): { coins: number; xp: number; message: string } | null {
  const milestones: Record<number, { coins: number; xp: number; message: string }> = {
    3: { coins: 50, xp: 100, message: '3일 연속!' },
    7: { coins: 150, xp: 300, message: '1주일 연속 달성!' },
    14: { coins: 300, xp: 600, message: '2주 연속! 대단해요!' },
    30: { coins: 500, xp: 1000, message: '30일 연속! 놀라워요!' },
    60: { coins: 1000, xp: 2000, message: '60일 연속! 전설이에요!' },
    100: { coins: 2000, xp: 5000, message: '100일 연속! 마스터!' },
    365: { coins: 10000, xp: 20000, message: '1년 연속! 그랜드마스터!' },
  };

  return milestones[streak] || null;
}
