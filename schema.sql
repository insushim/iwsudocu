-- Leaderboard table for NumeroQuest
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  time_seconds INTEGER NOT NULL,
  mistakes INTEGER NOT NULL DEFAULT 0,
  max_combo INTEGER NOT NULL DEFAULT 0,
  is_perfect INTEGER NOT NULL DEFAULT 0,
  is_daily INTEGER NOT NULL DEFAULT 0,
  daily_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty ON leaderboard(difficulty, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_daily ON leaderboard(is_daily, daily_date, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON leaderboard(created_at DESC);

-- Rate-limit log: hashed IP + unix timestamp, used to throttle POST submissions.
CREATE TABLE IF NOT EXISTS submission_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submission_log ON submission_log(ip_hash, created_at);

-- One-time play-session token nonces (replay prevention). A token may be
-- redeemed for exactly one score submission.
CREATE TABLE IF NOT EXISTS used_tokens (
  nonce TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);
