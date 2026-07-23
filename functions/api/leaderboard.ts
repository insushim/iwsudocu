interface Env {
  DB: D1Database;
  // Optional: set as a Pages secret to enable signed play-session verification.
  LEADERBOARD_SECRET?: string;
  // Optional: comma-separated allowed origins. Falls back to same-origin only.
  ALLOWED_ORIGINS?: string;
}

interface LeaderboardEntry {
  player_name: string;
  score: number;
  difficulty: string;
  time_seconds: number;
  mistakes: number;
  max_combo: number;
  is_perfect: number;
  is_daily: number;
  daily_date?: string;
  session_token?: string;
}

const DIFFICULTIES = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master'];

// Baseline nickname profanity guard (mirrors src/lib/game/profanity.ts).
const BANNED = [
  '시발', '씨발', '씨빨', '병신', '븅신', '지랄', '개새', '새끼', '좆', '존나', '섹스', '보지', '자지', '느금', '엠창', '개년', '창녀', '강간',
  'fuck', 'shit', 'bitch', 'asshole', 'nigger', 'faggot', 'cunt', 'dick', 'pussy', 'rape', 'sex', 'nazi',
];
function hasProfanity(name: string): boolean {
  const n = name.toLowerCase().replace(/[\s._\-*]/g, '');
  return BANNED.some((w) => n.includes(w));
}

// Mirror of MAX_SCORE_BY_DIFFICULTY in src/lib/game/scoring.ts. Server-side
// ceiling so a forged POST cannot register an impossible score.
const MAX_SCORE: Record<string, number> = {
  beginner: 1150,
  easy: 1300,
  medium: 1600,
  hard: 2200,
  expert: 3400,
  master: 5500,
};

// Minimum plausible solve time (seconds) per difficulty — anything faster is
// physically impossible and rejected.
const MIN_TIME: Record<string, number> = {
  beginner: 8,
  easy: 12,
  medium: 20,
  hard: 30,
  expert: 40,
  master: 50,
};

const RATE_LIMIT_WINDOW_SEC = 60;
const RATE_LIMIT_MAX = 10;

function baseCors(origin: string | null, env: Env): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  // Reflect the origin ONLY when it's explicitly allow-listed. When
  // ALLOWED_ORIGINS is unset we emit no ACAO header at all, so cross-origin
  // reads are blocked and same-origin requests (which don't need CORS) still
  // work — never a wildcard reflection.
  let allowOrigin = '';
  if (origin && allowed.length > 0 && allowed.includes(origin)) {
    allowOrigin = origin;
  }
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin;
  return headers;
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin');
  const cors = baseCors(origin, context.env);

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const url = new URL(context.request.url);
    if (context.request.method === 'GET') {
      return handleGet(context, cors);
    } else if (context.request.method === 'POST') {
      // Issue a signed play-session token: POST /api/leaderboard?action=session
      if (url.searchParams.get('action') === 'session') {
        return handleSession(context, cors);
      }
      return handlePost(context, cors);
    }
    return new Response('Method not allowed', { status: 405, headers: cors });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
};

async function handleGet(
  context: EventContext<Env, string, unknown>,
  cors: Record<string, string>,
) {
  const url = new URL(context.request.url);
  const type = url.searchParams.get('type') || 'all';
  const difficulty = url.searchParams.get('difficulty');
  const dailyDate = url.searchParams.get('date');

  const rawLimit = parseInt(url.searchParams.get('limit') || '50', 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;

  let query = '';
  const params: unknown[] = [];

  if (type === 'daily' && dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate)) {
    query = 'SELECT * FROM leaderboard WHERE is_daily = 1 AND daily_date = ? ORDER BY score DESC LIMIT ?';
    params.push(dailyDate, limit);
  } else if (difficulty && DIFFICULTIES.includes(difficulty)) {
    query = 'SELECT * FROM leaderboard WHERE difficulty = ? ORDER BY score DESC LIMIT ?';
    params.push(difficulty, limit);
  } else {
    query = 'SELECT * FROM leaderboard ORDER BY score DESC LIMIT ?';
    params.push(limit);
  }

  const result = await context.env.DB.prepare(query).bind(...params).all();

  return new Response(JSON.stringify({ entries: result.results }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

async function handleSession(
  context: EventContext<Env, string, unknown>,
  cors: Record<string, string>,
) {
  const secret = context.env.LEADERBOARD_SECRET;
  const body = (await context.request.json().catch(() => ({}))) as { difficulty?: string };
  const difficulty = body.difficulty && DIFFICULTIES.includes(body.difficulty) ? body.difficulty : 'medium';
  const issuedAt = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomUUID();

  // Without a secret configured we still return a token (unsigned) so the
  // client flow works; signature verification is simply skipped server-side.
  const payload = `${difficulty}.${issuedAt}.${nonce}`;
  const sig = secret ? await hmac(secret, payload) : 'unsigned';
  return new Response(JSON.stringify({ token: `${payload}.${sig}`, issuedAt }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

async function verifySession(
  env: Env,
  token: string | undefined,
  difficulty: string,
): Promise<boolean> {
  const secret = env.LEADERBOARD_SECRET;
  if (!secret) return true; // verification disabled unless a secret is set
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 4) return false;
  const [tDiff, tIssued, tNonce, tSig] = parts;
  if (tDiff !== difficulty) return false;
  const expected = await hmac(secret, `${tDiff}.${tIssued}.${tNonce}`);
  if (expected !== tSig) return false;
  const issued = parseInt(tIssued, 10);
  if (!Number.isFinite(issued)) return false;
  const age = Math.floor(Date.now() / 1000) - issued;
  // Session must be at least the minimum solve time old and not stale (>6h).
  if (age < (MIN_TIME[difficulty] ?? 20)) return false;
  if (age > 6 * 3600) return false;
  // Consume the nonce exactly once — a replayed token is rejected.
  try {
    await env.DB.prepare('INSERT INTO used_tokens (nonce, created_at) VALUES (?, ?)')
      .bind(tNonce, Math.floor(Date.now() / 1000))
      .run();
  } catch {
    return false; // duplicate nonce → replay attempt
  }
  return true;
}

// Opportunistic retention sweep: purge rows that are well past their useful
// life so submission_log and used_tokens don't grow unbounded. Bounds are far
// wider than the operational windows (rate limit = 60s, token validity = 6h),
// so a still-needed row can never be removed. Best-effort and non-fatal.
async function cleanupOldLogs(env: Env): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  try {
    await env.DB.prepare('DELETE FROM submission_log WHERE created_at < ?')
      .bind(now - 3600) // keep 1h (rate-limit window is only 60s)
      .run();
  } catch {
    // ignore — table may not exist yet
  }
  try {
    await env.DB.prepare('DELETE FROM used_tokens WHERE created_at < ?')
      .bind(now - 24 * 3600) // keep 24h (token validity is only 6h)
      .run();
  } catch {
    // ignore — table may not exist yet
  }
}

async function checkRateLimit(env: Env, ipHash: string): Promise<boolean> {
  try {
    const since = Math.floor(Date.now() / 1000) - RATE_LIMIT_WINDOW_SEC;
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM submission_log WHERE ip_hash = ? AND created_at > ?",
    )
      .bind(ipHash, since)
      .first<{ n: number }>();
    if (row && row.n >= RATE_LIMIT_MAX) return false;
    await env.DB.prepare(
      'INSERT INTO submission_log (ip_hash, created_at) VALUES (?, ?)',
    )
      .bind(ipHash, Math.floor(Date.now() / 1000))
      .run();
    return true;
  } catch {
    // If the log table doesn't exist yet, don't block submissions.
    return true;
  }
}

async function handlePost(
  context: EventContext<Env, string, unknown>,
  cors: Record<string, string>,
) {
  const body = (await context.request.json().catch(() => null)) as LeaderboardEntry | null;
  const json = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

  if (!body || typeof body !== 'object') return json({ error: 'Invalid body' }, 400);

  // --- Type & presence validation (0 is a valid score/time, so check types) ---
  if (typeof body.player_name !== 'string') return json({ error: 'Invalid name' }, 400);
  if (typeof body.score !== 'number' || !Number.isFinite(body.score)) return json({ error: 'Invalid score' }, 400);
  if (typeof body.difficulty !== 'string' || !DIFFICULTIES.includes(body.difficulty))
    return json({ error: 'Invalid difficulty' }, 400);
  if (typeof body.time_seconds !== 'number' || !Number.isFinite(body.time_seconds))
    return json({ error: 'Invalid time' }, 400);

  const difficulty = body.difficulty;
  const score = Math.round(body.score);
  const time = Math.round(body.time_seconds);
  const mistakes = Number.isFinite(body.mistakes) ? Math.max(0, Math.round(body.mistakes)) : 0;
  const maxCombo = Number.isFinite(body.max_combo) ? Math.max(0, Math.round(body.max_combo)) : 0;

  // --- Range / plausibility validation ---
  if (score < 0 || score > (MAX_SCORE[difficulty] ?? 5500)) return json({ error: 'Score out of range' }, 400);
  if (time < (MIN_TIME[difficulty] ?? 20) || time > 24 * 3600) return json({ error: 'Time implausible' }, 400);
  if (mistakes > 3) return json({ error: 'Invalid mistakes' }, 400);
  if (maxCombo > 200) return json({ error: 'Invalid combo' }, 400);

  const isDaily = body.is_daily ? 1 : 0;
  let dailyDate: string | null = null;
  if (isDaily) {
    if (typeof body.daily_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.daily_date))
      return json({ error: 'Invalid daily date' }, 400);
    // Daily puzzles are keyed to KST (the app's home timezone). Accept today or
    // yesterday in KST so users near midnight aren't wrongly rejected.
    const kstNow = new Date(Date.now() + 9 * 3600 * 1000);
    const ok = [0, 1].some((back) => {
      const d = new Date(kstNow.getTime() - back * 86400000);
      const s = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      return s === body.daily_date;
    });
    if (!ok) return json({ error: 'Daily date out of range' }, 400);
    dailyDate = body.daily_date;
  }

  // --- Signed session verification (no-op unless LEADERBOARD_SECRET is set) ---
  const sessionOk = await verifySession(context.env, body.session_token, difficulty);
  if (!sessionOk) return json({ error: 'Invalid or expired session' }, 403);

  // --- Rate limit by hashed IP ---
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipHash = await sha256Hex(ip + '|numeroquest');
  const underLimit = await checkRateLimit(context.env, ipHash);
  if (!underLimit) return json({ error: 'Too many submissions, slow down' }, 429);

  // Housekeeping on ~1/16 of writes, after the response — keeps the ephemeral
  // rate-limit / nonce tables from growing unbounded without added latency.
  if (ipHash.endsWith('0')) {
    context.waitUntil(cleanupOldLogs(context.env));
  }

  // --- Sanitize name: strip markup, control + bidi/zero-width chars, fallback ---
  let sanitizedName = body.player_name
    .replace(/[<>&"']/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .trim()
    .slice(0, 20);
  if (!sanitizedName || hasProfanity(sanitizedName)) sanitizedName = '익명';

  const result = await context.env.DB.prepare(
    'INSERT INTO leaderboard (player_name, score, difficulty, time_seconds, mistakes, max_combo, is_perfect, is_daily, daily_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      sanitizedName,
      score,
      difficulty,
      time,
      mistakes,
      maxCombo,
      // Derive perfect from mistakes rather than trusting the client flag, so a
      // forged is_perfect can't coexist with a nonzero mistake count.
      mistakes === 0 ? 1 : 0,
      isDaily,
      dailyDate,
    )
    .run();

  return json({ success: true, id: result.meta.last_row_id }, 201);
}
