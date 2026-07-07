import { Test, TestingModule } from '@nestjs/testing';
import { PokerGameService } from '../services/poker-game.service';
import { PokerStateService } from '../services/poker-state.service';
import { PokerLobbyService } from '../services/poker-lobby.service';
import { PokerShowdownManager } from './poker-showdown.manager';
import { PokerGameEngine } from './poker-game.engine';
import { createHash, randomBytes } from 'crypto';

// ── Mock Database Entities ──
jest.mock('../entities/poker_table.entity', () => ({
  PokerTable: {
    findOne: jest.fn().mockImplementation(({ where }) => {
      return Promise.resolve({
        id: where.id,
        status: 'waiting',
        max_players: 9,
        small_blind: '100',
        big_blind: '200',
        ante: '0',
        custom_settings: {
          allow_bomb_pot: true,
          allow_rit: true,
          allow_rabbit_hunt: true,
          allow_muck: true,
        },
        save: jest.fn().mockResolvedValue(true),
      });
    }),
  },
}));

jest.mock('../entities/game_hand.entity', () => {
  class MockGameHand {
    static findOne = jest.fn().mockResolvedValue(null);
    static create = jest.fn().mockImplementation(() => new MockGameHand());
    save = jest.fn().mockResolvedValue(this);
  }
  return { GameHand: MockGameHand };
});

jest.mock('../entities/hand_player.entity', () => {
  class MockHandPlayer {
    static findOne = jest.fn().mockResolvedValue(null);
    static create = jest.fn().mockImplementation(() => new MockHandPlayer());
    save = jest.fn().mockResolvedValue(this);
  }
  return { HandPlayer: MockHandPlayer };
});

jest.mock('../entities/hand_action.entity', () => {
  class MockHandAction {
    static findOne = jest.fn().mockResolvedValue(null);
    static create = jest.fn().mockImplementation(() => new MockHandAction());
    save = jest.fn().mockResolvedValue(this);
  }
  return { HandAction: MockHandAction };
});

jest.mock('../entities/system_revenue.entity', () => {
  class MockSystemRevenue {
    static findOne = jest.fn().mockResolvedValue(null);
    static create = jest.fn().mockImplementation(() => new MockSystemRevenue());
    save = jest.fn().mockResolvedValue(this);
  }
  return { SystemRevenue: MockSystemRevenue };
});

jest.mock('../entities/table_session.entity', () => ({
  TableSession: { findOne: jest.fn() },
}));

jest.mock('../entities/user.entity', () => ({
  User: { findOne: jest.fn() },
}));

// ── In-Memory state service mock to avoid Redis dependency ──
class MockPokerStateService {
  private tableStates = new Map<string, any>();
  private seats = new Map<string, any[]>();
  private playerCards = new Map<string, string[]>();
  private decks = new Map<string, string[]>();

  async getTableState(roomId: string) {
    return this.tableStates.get(roomId) || {};
  }

  async setTableState(roomId: string, state: any) {
    const current = this.tableStates.get(roomId) || {};
    this.tableStates.set(roomId, { ...current, ...state });
  }

  async getAllSeats(roomId: string) {
    return this.seats.get(roomId) || [];
  }

  async setAllSeats(roomId: string, seatList: any[]) {
    this.seats.set(roomId, seatList);
  }

  async setSeat(roomId: string, seatNumber: number, seatState: any) {
    const list = this.seats.get(roomId) || [];
    const idx = list.findIndex((s) => s.seat_number === seatNumber);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...seatState };
    } else {
      list.push({ seat_number: seatNumber, ...seatState });
    }
    this.seats.set(roomId, list);
  }

  async deleteSeat(roomId: string, seatNumber: number) {
    const list = this.seats.get(roomId) || [];
    const filtered = list.filter((s) => s.seat_number !== seatNumber);
    this.seats.set(roomId, filtered);
  }

  async getPlayerCards(roomId: string, userId: string) {
    return this.playerCards.get(`${roomId}:${userId}`) || [];
  }

  async setPlayerCards(roomId: string, userId: string, cards: string[]) {
    this.playerCards.set(`${roomId}:${userId}`, cards);
  }

  async deletePlayerCards(roomId: string, userId: string) {
    this.playerCards.delete(`${roomId}:${userId}`);
  }

  async setDeck(roomId: string, deck: string[]) {
    this.decks.set(roomId, deck);
  }

  async getDeck(roomId: string) {
    return this.decks.get(roomId) || [];
  }

  async deleteActionLogs(handId: string) {}

  async getActionLogs(handId: string) {
    return [];
  }

  async acquireLock() {
    return true;
  }

  async releaseLock() {}

  getRedisClient() {
    return {
      hincrby: jest.fn().mockResolvedValue(0),
      hset: jest.fn().mockResolvedValue(true),
    };
  }
}

import { PokerLobbyGateway } from '../gateways/poker-lobby.gateway';
import { JwtService } from '@nestjs/jwt';

describe('Poker Integrated Advanced Features', () => {
  let gameService: PokerGameService;
  let showdownManager: PokerShowdownManager;
  let stateService: MockPokerStateService;
  let gateway: PokerLobbyGateway;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokerGameService,
        PokerLobbyGateway,
        { provide: PokerStateService, useClass: MockPokerStateService },
        { provide: PokerLobbyService, useValue: { leaveRoom: jest.fn() } },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    gameService = module.get<PokerGameService>(PokerGameService);
    stateService = module.get<PokerStateService>(PokerStateService) as any;
    gateway = module.get<PokerLobbyGateway>(PokerLobbyGateway);

    gameService.server = {
      to: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      fetchSockets: jest.fn().mockResolvedValue([]),
    } as any;

    gateway.server = gameService.server;
    gateway['logger'] = { log: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;

    // Direct assignment to sub-manager
    showdownManager = new PokerShowdownManager(gameService);
  });

  // ── 1. TEST BOMB POT ──
  it('[BOMB-POT] Tạo phòng allow_bomb_pot = true -> ván bài bỏ qua Preflop, thu 5x BB Ante của mỗi player, chia thẳng Flop', async () => {
    const roomId = 'room_bomb_pot';

    // Mock seats: 3 active players, initial stack 2000
    await stateService.setAllSeats(roomId, [
      { seat_number: 1, user_id: 'u1', username: 'Player1', status: 'active', stack: '2000', total_contributed: '0' },
      { seat_number: 2, user_id: 'u2', username: 'Player2', status: 'active', stack: '2000', total_contributed: '0' },
      { seat_number: 3, user_id: 'u3', username: 'Player3', status: 'active', stack: '2000', total_contributed: '0' },
    ]);

    // Force next hand to be a Bomb Pot
    await stateService.setTableState(roomId, {
      game_stage: 'ended',
      next_hand_bomb_pot: '1',
      dealer_seat: '3',
    });

    await gameService.startNewHand(roomId);

    // Verify 5x BB Ante deduction. BB = 200, so ante = 1000
    const seatsAfter = await stateService.getAllSeats(roomId);
    for (const seat of seatsAfter) {
      expect(parseInt(seat.stack)).toBe(1000); // 2000 - 5 * 200 = 1000
      expect(parseInt(seat.total_contributed)).toBe(1000);
    }

    // Verify state transitioned directly to flop stage
    const tableState = await stateService.getTableState(roomId);
    expect(tableState.game_stage).toBe('flop');
    expect(tableState.is_bomb_pot).toBe('1');
    expect(parseInt(tableState.total_pot)).toBe(3000); // 1000 * 3 = 3000

    // Verify Flop community cards (3 cards)
    const commCards = tableState.community_cards.split(',');
    expect(commCards.length).toBe(3);

    // Verify turn seat is small blind (seat 2, next seat after dealer seat 1)
    expect(tableState.current_turn_seat).toBe(2);
  });

  // ── 2. TEST RUN IT TWICE (RIT) ──
  it('[RIT] Giả lập 2 player All-in ở Flop -> RIT vote YES -> Chia 2 boards độc lập -> Pot chia đôi 50/50', async () => {
    const roomId = 'room_rit';

    // Mock game state at showdown with RIT enabled
    await stateService.setTableState(roomId, {
      game_stage: 'showdown',
      total_pot: '1000',
      community_cards: 'As,Ks,Qs,2d,3c',
      is_rit_active: '1',
      rit_board2_cards: 'Ah,Kh,Qh,4d,5c',
    });

    await stateService.setAllSeats(roomId, [
      { seat_number: 1, user_id: 'u1', username: 'A', status: 'active', stack: '0', total_contributed: '500' },
      { seat_number: 2, user_id: 'u2', username: 'B', status: 'active', stack: '0', total_contributed: '500' },
    ]);

    // Give players pocket cards
    // u1: Royal flush on Board 1 (Js, Ts), Royal flush on Board 2 (Jh, Th)
    // u2: High card on Board 1 (7h, 2c), High card on Board 2 (7h, 2c)
    await stateService.setPlayerCards(roomId, 'u1', ['Js', 'Ts']);
    await stateService.setPlayerCards(roomId, 'u2', ['7h', '2c']);

    // Mock splitPot and evaluate7CardHand to trigger standard payout
    jest.spyOn(PokerGameEngine, 'splitPot').mockReturnValue([
      { amount: 1000, eligibleSeats: [1, 2], isUncalled: false },
    ]);

    // Spy on finalizeAndBroadcastHand
    const finalizeSpy = jest.spyOn(showdownManager, 'finalizeAndBroadcastHand').mockImplementation(async () => {});

    await showdownManager.processShowdown(roomId);

    expect(finalizeSpy).toHaveBeenCalled();
    const winnersLog = finalizeSpy.mock.calls[0][1];

    // Pot of 1000 should be split 50/50: 500 for Board 1 and 500 for Board 2
    // Since player A (u1) wins both Board 1 and Board 2, they get 500 + 500 = 1000 total.
    // Let's verify player A wins.
    expect(winnersLog.length).toBe(1);
    expect(winnersLog[0].user_id).toBe('u1');
    expect(winnersLog[0].win_amount).toBe(1000);
  });

  // ── 3. TEST RABBIT HUNTING ──
  it('[RABBIT-HUNT] Giả lập ván đấu kết thúc ở Flop do Fold -> Request Rabbit Hunting -> nhận đúng Turn & River', async () => {
    const roomId = 'room_rabbit_hunting';

    // Deck remaining cards: Turn is 'Ac', River is 'Kc'
    await stateService.setDeck(roomId, ['Ac', 'Kc', 'Qc', 'Jc']);

    // Table state has 3 community cards (Flop)
    await stateService.setTableState(roomId, {
      game_stage: 'ended',
      community_cards: '2d,3d,4d',
    });

    const mockClient = {
      id: 'socket_1',
      data: { user: { id: 'u1' } },
      emit: jest.fn(),
    };

    // Invoke rabbit hunt action
    await gateway.handleRabbitHunt(mockClient as any, { room_id: roomId });

    // Verify event is broadcast to the table
    expect(gateway.server.to).toHaveBeenCalledWith(`table_${roomId}`);
    expect(gateway.server.emit).toHaveBeenCalledWith('table:rabbit-cards', {
      user_id: 'u1',
      rabbit_cards: ['Ac', 'Kc'],
    });
  });

  // ── 4. TEST MUCK CARDS ──
  it('[MUCK-CARDS] Showdown -> player thua bật Auto Muck -> event table:hand-ended không tiết lộ bài tẩy player thua', async () => {
    const roomId = 'room_muck_cards';

    // Board community cards
    await stateService.setTableState(roomId, {
      game_stage: 'showdown',
      total_pot: '1000',
      community_cards: 'As,Ks,Qs,Js,2d',
    });

    // 2 players: seat 1 is winner, seat 2 is loser and has auto muck turned on (muck_cards = '1')
    await stateService.setAllSeats(roomId, [
      { seat_number: 1, user_id: 'winner_id', username: 'Winner', status: 'active', stack: '0', total_contributed: '500', muck_cards: '0' },
      { seat_number: 2, user_id: 'loser_id', username: 'Loser', status: 'active', stack: '0', total_contributed: '500', muck_cards: '1' },
    ]);

    await stateService.setPlayerCards(roomId, 'winner_id', ['Ac', 'Ad']); // Two pairs
    await stateService.setPlayerCards(roomId, 'loser_id', ['3c', '4c']); // High card

    // Split pot
    jest.spyOn(PokerGameEngine, 'splitPot').mockReturnValue([
      { amount: 1000, eligibleSeats: [1, 2], isUncalled: false },
    ]);

    // Let the showdown run
    await showdownManager.processShowdown(roomId);

    // Verify broadcast event details
    expect(gameService.server.to).toHaveBeenCalledWith(`table_${roomId}`);
    
    // Find the hand-ended event emit call
    const handEndedCall = (gameService.server.emit as jest.Mock).mock.calls.find(
      (call) => call[0] === 'table:hand-ended'
    );
    expect(handEndedCall).toBeDefined();

    const payload = handEndedCall[1];
    expect(payload.all_hands).toBeDefined();

    const winnerHand = payload.all_hands.find((h: any) => h.user_id === 'winner_id');
    const loserHand = payload.all_hands.find((h: any) => h.user_id === 'loser_id');

    // Winner's card must be shown
    expect(winnerHand.pocket_cards).toEqual(['Ac', 'Ad']);

    // Loser's card must be hidden (mucked)
    expect(loserHand.pocket_cards).toEqual([]);
    expect(loserHand.is_mucked).toBe(true);
  });
});
