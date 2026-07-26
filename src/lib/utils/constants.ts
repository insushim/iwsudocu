import { DifficultyConfig, Difficulty, GameTheme } from '@/types';

// `givens` is the generator's target clue count, not a decoration:
// lib/sudoku/generator reads it directly and retries until it is reached.
// Master sits at 22 rather than 21 because 21-clue grids were only reachable
// ~40% of the time even when the retry loop was given 1.5 s to hunt for one
// (measured; the shipped retry budget is 800 ms). Asking for 21 would trade a
// stable difficulty ladder for a visible freeze.
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  beginner: { name: 'Beginner', nameKo: '입문', givens: 61, xpMultiplier: 0.5, coinReward: 10, color: '#4CAF50', icon: '🌱', description: '스도쿠를 처음 시작하는 분께 추천', maxMistakes: 7 },
  easy: { name: 'Easy', nameKo: '쉬움', givens: 46, xpMultiplier: 1.0, coinReward: 20, color: '#8BC34A', icon: '🍀', description: '기본 전략으로 풀 수 있어요', maxMistakes: 6 },
  medium: { name: 'Medium', nameKo: '보통', givens: 36, xpMultiplier: 1.5, coinReward: 35, color: '#FF9800', icon: '🔥', description: '중급 전략이 필요해요', maxMistakes: 6 },
  hard: { name: 'Hard', nameKo: '어려움', givens: 29, xpMultiplier: 2.0, coinReward: 60, color: '#F44336', icon: '💪', description: '고급 전략이 필요해요', maxMistakes: 5 },
  expert: { name: 'Expert', nameKo: '전문가', givens: 25, xpMultiplier: 3.0, coinReward: 100, color: '#9C27B0', icon: '🧠', description: '전문가 수준의 논리가 필요해요', maxMistakes: 5 },
  master: { name: 'Master', nameKo: '마스터', givens: 22, xpMultiplier: 5.0, coinReward: 200, color: '#FFD700', icon: '👑', description: '최고 난이도! 도전하세요', maxMistakes: 5 },
};

export const GAME_THEMES: GameTheme[] = [
  { id: 'default', name: 'Midnight', nameKo: '미드나이트', boardBg: '#1E293B', cellBg: '#0F172A', selectedBg: '#3B82F6', highlightBg: '#1E3A5F', conflictBg: '#7F1D1D', givenColor: '#CBD5E1', inputColor: '#FFFFFF', borderColor: '#334155', accentColor: '#6366F1', isUnlocked: true, cost: 0, preview: '🌙' },
  { id: 'ocean', name: 'Deep Ocean', nameKo: '심해', boardBg: '#0C4A6E', cellBg: '#082F49', selectedBg: '#0EA5E9', highlightBg: '#0C4A6E', conflictBg: '#7F1D1D', givenColor: '#7DD3FC', inputColor: '#E0F2FE', borderColor: '#0369A1', accentColor: '#38BDF8', isUnlocked: false, cost: 200, preview: '🌊' },
  { id: 'forest', name: 'Enchanted Forest', nameKo: '마법의 숲', boardBg: '#14532D', cellBg: '#052E16', selectedBg: '#22C55E', highlightBg: '#166534', conflictBg: '#7F1D1D', givenColor: '#86EFAC', inputColor: '#DCFCE7', borderColor: '#15803D', accentColor: '#4ADE80', isUnlocked: false, cost: 200, preview: '🌲' },
  { id: 'sunset', name: 'Golden Sunset', nameKo: '황금 석양', boardBg: '#431407', cellBg: '#27150A', selectedBg: '#F97316', highlightBg: '#7C2D12', conflictBg: '#7F1D1D', givenColor: '#FDBA74', inputColor: '#FFF7ED', borderColor: '#9A3412', accentColor: '#FB923C', isUnlocked: false, cost: 300, preview: '🌅' },
  { id: 'sakura', name: 'Cherry Blossom', nameKo: '벚꽃', boardBg: '#500724', cellBg: '#3B0519', selectedBg: '#EC4899', highlightBg: '#831843', conflictBg: '#7F1D1D', givenColor: '#F9A8D4', inputColor: '#FDF2F8', borderColor: '#9D174D', accentColor: '#F472B6', isUnlocked: false, cost: 300, preview: '🌸' },
  { id: 'aurora', name: 'Northern Lights', nameKo: '오로라', boardBg: '#0F172A', cellBg: '#020617', selectedBg: '#8B5CF6', highlightBg: '#1E1B4B', conflictBg: '#7F1D1D', givenColor: '#C4B5FD', inputColor: '#EDE9FE', borderColor: '#4C1D95', accentColor: '#A78BFA', isUnlocked: false, cost: 500, preview: '🌌' },
  { id: 'minimal_light', name: 'Clean White', nameKo: '클린 화이트', boardBg: '#FFFFFF', cellBg: '#F8FAFC', selectedBg: '#DBEAFE', highlightBg: '#EFF6FF', conflictBg: '#FEE2E2', givenColor: '#1E293B', inputColor: '#3B82F6', borderColor: '#CBD5E1', accentColor: '#2563EB', isUnlocked: false, cost: 150, preview: '☀️' },
  { id: 'neon', name: 'Neon City', nameKo: '네온 시티', boardBg: '#0A0A0A', cellBg: '#111111', selectedBg: '#7C3AED', highlightBg: '#1A1A2E', conflictBg: '#450A0A', givenColor: '#22D3EE', inputColor: '#F0ABFC', borderColor: '#2D2D44', accentColor: '#E879F9', isUnlocked: false, cost: 400, preview: '💜' },
];

export const MAX_MISTAKES = 3;
export const MAX_HINTS = 3;
