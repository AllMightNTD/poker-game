import httpClient from "@/lib/axios";


export interface PlayerStats {
  user_id: string;
  hands_played: number;
  hands_won: number;
  total_chips_won: string;
  total_rake_paid: string;
  biggest_pot: string;
  current_xp: number;
  level: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  unlocked_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
  rank: number;
  chips_won: string;
  hands_played: number;
}

export const gamificationApi = {
  getMyStats: () => {
    return httpClient<PlayerStats>("/gamification/me/stats");
  },
  getMyAchievements: () => {
    return httpClient<Achievement[]>("/gamification/me/achievements");
  },
  getLeaderboard: (type: 'weekly' | 'monthly') => {
    return httpClient<LeaderboardEntry[]>(`/gamification/leaderboard?type=${type}`);
  }
};
