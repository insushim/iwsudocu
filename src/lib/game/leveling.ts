import { LevelData, PlayerTier, TierConfig } from '@/types';

export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function calculateLevel(totalXP: number): LevelData {
  let level = 1;
  let xpRemaining = totalXP;

  while (xpRemaining >= getXPForLevel(level)) {
    xpRemaining -= getXPForLevel(level);
    level++;
  }

  const xpToNext = getXPForLevel(level);
  const tier = getTierForLevel(level);
  const titleInfo = getLevelTitle(level);

  return {
    level,
    currentXP: xpRemaining,
    totalXP,
    xpToNextLevel: xpToNext,
    title: titleInfo.title,
    titleKo: titleInfo.titleKo,
    tier,
  };
}

export function getTierForLevel(level: number): PlayerTier {
  if (level < 5) return 'bronze';
  if (level < 10) return 'silver';
  if (level < 20) return 'gold';
  if (level < 35) return 'platinum';
  if (level < 50) return 'diamond';
  if (level < 75) return 'master';
  return 'grandmaster';
}

export const TIER_CONFIGS: Record<PlayerTier, TierConfig> = {
  bronze: {
    name: 'Bronze', nameKo: '브론즈', minLevel: 1,
    color: '#CD7F32', gradient: 'from-amber-700 to-amber-500',
    icon: '🥉',
  },
  silver: {
    name: 'Silver', nameKo: '실버', minLevel: 5,
    color: '#C0C0C0', gradient: 'from-gray-400 to-gray-300',
    icon: '🥈',
  },
  gold: {
    name: 'Gold', nameKo: '골드', minLevel: 10,
    color: '#FFD700', gradient: 'from-yellow-500 to-yellow-400',
    icon: '🥇',
  },
  platinum: {
    name: 'Platinum', nameKo: '플래티넘', minLevel: 20,
    color: '#E5E4E2', gradient: 'from-cyan-300 to-blue-300',
    icon: '💎',
  },
  diamond: {
    name: 'Diamond', nameKo: '다이아몬드', minLevel: 35,
    color: '#B9F2FF', gradient: 'from-blue-400 to-purple-400',
    icon: '💠',
  },
  master: {
    name: 'Master', nameKo: '마스터', minLevel: 50,
    color: '#FF6B6B', gradient: 'from-red-500 to-orange-500',
    icon: '👑',
  },
  grandmaster: {
    name: 'Grandmaster', nameKo: '그랜드마스터', minLevel: 75,
    color: '#FFD700', gradient: 'from-yellow-400 via-red-500 to-purple-600',
    icon: '🏆',
  },
};

function getLevelTitle(level: number): { title: string; titleKo: string } {
  const titles: { maxLevel: number; title: string; titleKo: string }[] = [
    { maxLevel: 2, title: 'Novice', titleKo: '초보자' },
    { maxLevel: 5, title: 'Apprentice', titleKo: '견습생' },
    { maxLevel: 8, title: 'Puzzler', titleKo: '퍼즐러' },
    { maxLevel: 12, title: 'Thinker', titleKo: '사색가' },
    { maxLevel: 16, title: 'Strategist', titleKo: '전략가' },
    { maxLevel: 20, title: 'Analyst', titleKo: '분석가' },
    { maxLevel: 25, title: 'Logician', titleKo: '논리학자' },
    { maxLevel: 30, title: 'Scholar', titleKo: '학자' },
    { maxLevel: 40, title: 'Professor', titleKo: '교수' },
    { maxLevel: 50, title: 'Master', titleKo: '마스터' },
    { maxLevel: 60, title: 'Sage', titleKo: '현자' },
    { maxLevel: 75, title: 'Genius', titleKo: '천재' },
    { maxLevel: 100, title: 'Legend', titleKo: '전설' },
    { maxLevel: Infinity, title: 'Grandmaster', titleKo: '그랜드마스터' },
  ];

  return titles.find(t => level <= t.maxLevel) || titles[titles.length - 1];
}
