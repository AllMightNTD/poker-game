-- player_stats (update realtime sau moi hand)
CREATE TABLE player_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  hands_played INT DEFAULT 0,
  hands_won INT DEFAULT 0,
  total_chips_won BIGINT DEFAULT 0,
  total_rake_paid BIGINT DEFAULT 0,
  biggest_pot BIGINT DEFAULT 0,
  current_xp INT DEFAULT 0,
  level VARCHAR(20) DEFAULT 'bronze',   -- bronze|silver|gold|platinum|diamond
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,             -- FIRST_WIN | BLUFF_MASTER | ALL_IN_HERO | ...
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, type)
);

-- leaderboard_entries (snapshot tuan/thang — cron job)
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type VARCHAR(10),              -- 'weekly' | 'monthly'
  period VARCHAR(7),                    -- '2026-07'
  user_id UUID REFERENCES users(id),
  rank INT,
  chips_won BIGINT,
  hands_played INT,
  rake_paid BIGINT,
  snapshot_at TIMESTAMPTZ DEFAULT now()
);
