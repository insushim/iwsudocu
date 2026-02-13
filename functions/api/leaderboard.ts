interface Env {
  DB: D1Database;
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
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (context.request.method === 'GET') {
      return handleGet(context);
    } else if (context.request.method === 'POST') {
      return handlePost(context);
    }
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

async function handleGet(context: EventContext<Env, string, unknown>) {
  const url = new URL(context.request.url);
  const type = url.searchParams.get('type') || 'all';
  const difficulty = url.searchParams.get('difficulty');
  const dailyDate = url.searchParams.get('date');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  let query = '';
  const params: unknown[] = [];

  if (type === 'daily' && dailyDate) {
    query = 'SELECT * FROM leaderboard WHERE is_daily = 1 AND daily_date = ? ORDER BY score DESC LIMIT ?';
    params.push(dailyDate, limit);
  } else if (difficulty) {
    query = 'SELECT * FROM leaderboard WHERE difficulty = ? ORDER BY score DESC LIMIT ?';
    params.push(difficulty, limit);
  } else {
    query = 'SELECT * FROM leaderboard ORDER BY score DESC LIMIT ?';
    params.push(limit);
  }

  const result = await context.env.DB.prepare(query).bind(...params).all();

  return new Response(JSON.stringify({ entries: result.results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handlePost(context: EventContext<Env, string, unknown>) {
  const body = await context.request.json() as LeaderboardEntry;

  if (!body.player_name || !body.score || !body.difficulty || !body.time_seconds) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const sanitizedName = body.player_name.slice(0, 20).replace(/[<>&"']/g, '');

  const result = await context.env.DB.prepare(
    'INSERT INTO leaderboard (player_name, score, difficulty, time_seconds, mistakes, max_combo, is_perfect, is_daily, daily_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    sanitizedName,
    body.score,
    body.difficulty,
    body.time_seconds,
    body.mistakes || 0,
    body.max_combo || 0,
    body.is_perfect ? 1 : 0,
    body.is_daily ? 1 : 0,
    body.daily_date || null
  ).run();

  return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
