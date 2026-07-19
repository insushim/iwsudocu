// Lightweight profanity guard for user-supplied nicknames (leaderboard UGC).
// Not exhaustive — a baseline filter to satisfy store UGC policy alongside the
// server-side sanitizer. Extend the lists as needed.

const BANNED_SUBSTRINGS = [
  // Korean
  '시발', '씨발', '씨빨', '병신', '븅신', '지랄', '개새', '새끼', '좆', '존나', '섹스', '보지', '자지', '느금', '엠창', '개년', '창녀', '강간',
  // English
  'fuck', 'shit', 'bitch', 'asshole', 'nigger', 'faggot', 'cunt', 'dick', 'pussy', 'rape', 'sex', 'nazi',
];

/** Normalize for matching: lowercase, strip spaces and common separators. */
function normalize(name: string): string {
  return name.toLowerCase().replace(/[\s._\-*]/g, '');
}

export function containsProfanity(name: string): boolean {
  const n = normalize(name);
  return BANNED_SUBSTRINGS.some((w) => n.includes(w));
}

/** Returns a cleaned name, or null if it should be rejected entirely. */
export function validateNickname(name: string): { ok: boolean; reason?: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { ok: true }; // empty → server assigns 익명
  if (trimmed.length > 20) return { ok: false, reason: '닉네임은 20자 이하여야 합니다.' };
  if (containsProfanity(trimmed)) return { ok: false, reason: '부적절한 표현이 포함되어 있습니다.' };
  return { ok: true };
}
