export interface TableStatePayload {
  table_id: string;
  table_name: string;
  room_name?: string;
  max_players?: number;
  remaining_time?: number;
  owner_id?: string;
  min_buyin?: number;
  max_buyin?: number;
  small_blind?: number | string;
  big_blind?: number | string;
  status: string;
  current_hand_id: string;
  game_stage: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown" | "ended";
  total_pot: number | string;
  current_highest_bet: number | string;
  current_turn_seat: number;
  dealer_seat: number;
  small_blind_seat: number;
  big_blind_seat: number;
  community_cards: string[];
  min_raise: number | string;
  last_full_raise_size?: number | string;
  is_bomb_pot?: boolean | string;
  rit_board2_cards?: string[] | string;
  expires_at?: number;
  seats: Array<{
    id: string;
    seatIndex: number;

    name: string;
    avatar: string;
    chips: number | string;
    status: string; // 'active' | 'folded' | 'waiting'
    current_bet: number | string;
    has_used_extra_time?: boolean;
    isBot?: boolean;
    pending_add_amount?: number | string;
    pending_remove_amount?: number | string;
    gamification_level?: string;
    gamification_xp?: number;
  }>;
}

export interface ActionRecordedPayload {
  seatIndex: number;
  seat_number?: number;
  new_stack?: number | string;
  user_id: string;
  action: string;
  action_type?: string;
  amount?: number | string;
  chipCount: number;
  new_highest_bet: number;
  total_pot: number;
}

export interface TurnChangePayload {
  current_turn_seat?: number;
  action_time_allowed?: number;
  seat_number?: number;
  time_limit?: number;
  expires_at?: number;
}

export interface StreetAdvancedPayload {
  stage?: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown" | "ended";
  game_stage?: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown" | "ended";
  community_cards: string[] | string;
  rit_board2_cards?: string[] | string;
  total_pot: number;
}

export interface HandEndedPayload {
  winners: Array<{
    seatIndex: number;
    seat_number?: number;
    user_id: string;
    win_amount: number;
    pots: Array<{ label: string | undefined; amount: number }>;
    username?: string;
    hand_name?: string;
    pocket_cards?: string[];
  }>;
  all_hands: Array<{
    seatIndex: number;
    seat_number?: number;
    pocket_cards: string[];
  }>;
  total_pot: number;
  rake_amount: string | number;
  rit_board2_cards?: string[] | string;
  provably_fair?: {
    server_seed_plain?: string;
    client_seed?: string;
  };
}

export interface HandStartedPayload {
  dealer_seat: number;
  small_blind_seat: number;
  big_blind_seat: number;
  game_stage: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown" | "ended";
  server_seed_hash?: string;
  client_seed?: string;
  hand_id?: string;
  is_bomb_pot?: boolean | string;
  community_cards?: string[];
}

export interface SitRequest {
  id: string;
  user_id: string;

  seatIndex: number;
  buy_in_amount: number;
  amount?: string | number;
  status: string;
  avatar?: string;
  username?: string;
  request_id?: string;
  seat_number?: number | string;
}

export interface SitRequestsListPayload {
  requests: SitRequest[];
}
