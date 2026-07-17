/**
 * Centralized type definitions for the blogs feature.
 * Colocated with the feature as per frontend-dev-guidelines.
 */

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  content: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  author_id: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  excerpt: string | null;
  category: string;
  tags: string[];
  views_count: number;
  created_at: string;
}

export interface BlogListPage {
  data: BlogListItem[];
  meta: {
    limit: number;
    has_next_page: boolean;
    next_cursor: string | null;
  };
}

export interface BlogListParams {
  cursor?: string;
  category?: string;
  limit?: number;
}

export interface HandItem {
  id: string;
  table_id: string;
  table_name: string | null;
  total_pot: string;
  hand_stage: string;
  started_at: string;
  players_count?: number;
}

export interface HandListResponse {
  data: HandItem[];
  nextCursor: string | null;
}

export interface HandListParams {
  limit?: number;
  tableId?: string;
}

export interface HandData {
  hand: {
    id: string;
    table_name: string | null;
    dealer_seat: number | null;
    small_blind_seat: number;
    big_blind_seat: number;
    community_cards: string | null;
    total_pot: string;
    hand_stage: string;
    started_at: string;
    ended_at: string | null;
  };
  players: HandPlayer[];
  actions: HandAction[];
}

export interface HandPlayer {
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  seat_number: number;
  hole_cards: string | null;
  initial_stack: string;
  chips_won: string;
  net_gain_loss: string;
  is_winner: boolean;
}

export interface HandAction {
  id: string;
  user_id: string;
  user_name: string;
  seat_number: number;
  stage: "preflop" | "flop" | "turn" | "river";
  action_type: "fold" | "check" | "call" | "raise" | "bet" | "allin" | "timeout";
  amount: string;
  action_order: number;
  is_all_in: boolean;
}

export interface AiCoachResponse {
  analysis: string;
  generated_at: string;
}
