export interface PokerTableState {
  game_stage?: string;
  total_pot?: string;
  current_highest_bet?: string;
  current_turn_seat?: string;
  is_running_board?: string;
  dealer_seat?: string;
  small_blind_seat?: string;
  big_blind_seat?: string;
  community_cards?: string;
  server_seed?: string;
  client_seed?: string;
  shuffled_deck?: string;
  current_hand_id?: string;
  min_raise?: string;
  last_full_raise_size?: string;
  last_activity?: string;
  is_rit_active?: string; // '1' or '0'
  rit_board2_cards?: string; // e.g. "Ah,Kh,Qh"
  rit_voters?: string; // Comma separated user ids
  rit_votes_yes?: string; // Comma separated user ids
  rit_votes_no?: string; // Comma separated user ids
  is_bomb_pot?: string; // '1' or '0'
  [key: string]: string | undefined;
}

export interface PokerSeatState {
  seat_number: number;
  user_id: string;
  username?: string;
  stack: string;
  status: string;
  total_contributed?: string;
  start_stack?: string;
  has_used_extra_time?: string;
  last_activity_time?: string;
  disconnected_at?: string;
  display_name?: string;
  avatar_url?: string;
  rit_opt?: string; // 'always' | 'never' | 'ask'
  muck_cards?: string; // '1' or '0'
  [key: string]: string | number | undefined;
}

export interface WinnerLogPot {
  label: string | undefined;
  amount: number;
}

export interface WinnerLog {
  user_id: string;
  seat_number: number;
  username: string;
  win_amount: number;
  hand_name: string;
  pocket_cards: string[];
  pots: WinnerLogPot[];
}
