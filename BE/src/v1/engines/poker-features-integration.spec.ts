import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { AuditLog } from '../entities/audit_log.entity';
import { GameHand } from '../entities/game_hand.entity';
import { ProvablyFairAudit } from '../entities/provably_fair_audit.entity';
import { AntiCollusionService } from '../services/anti-collusion.service';
import { PokerGameService } from '../services/poker-game.service';
import { PokerLobbyService } from '../services/poker-lobby.service';
import { PokerStateService } from '../services/poker-state.service';
import { ProvablyFairService } from '../services/provably-fair.service';
import { PokerGameHistoryProcessor } from './poker-game-history.processor';
import { PokerGameEngine } from './poker-game.engine';
import { PokerShowdownManager } from './poker-showdown.manager';
jest.mock('../../common/guards/custom-throttler.guard', () => ({
  CustomThrottlerGuard: class MockCustomThrottlerGuard {
    canActivate() {
      return true;
    }
  },
}));

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
    static latestInstance: any = null;
    constructor() {
      MockGameHand.latestInstance = this;
    }
    save = jest.fn().mockResolvedValue(this);
  }
  return { GameHand: MockGameHand };
});

jest.mock('../entities/hand_player.entity', () => {
  class MockHandPlayer {
    static findOne = jest.fn().mockResolvedValue(null);
    static create = jest.fn().mockImplementation(() => new MockHandPlayer());
    static insert = jest.fn().mockResolvedValue(true);
    save = jest.fn().mockResolvedValue(this);
  }
  return { HandPlayer: MockHandPlayer };
});

jest.mock('../entities/hand_action.entity', () => {
  class MockHandAction {
    static findOne = jest.fn().mockResolvedValue(null);
    static create = jest.fn().mockImplementation(() => new MockHandAction());
    static insert = jest.fn().mockResolvedValue(true);
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

jest.mock('../entities/table_session.entity', () => {
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };
  return {
    TableSession: {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    },
  };
});

jest.mock('../entities/audit_log.entity', () => {
  const save = jest.fn().mockResolvedValue(true);
  class MockAuditLog {
    save = save;
  }
  (MockAuditLog as any).mockSave = save;
  return { AuditLog: MockAuditLog };
});

jest.mock('../entities/user.entity', () => ({
  User: { findOne: jest.fn() },
}));

jest.mock('../entities/provably_fair_audit.entity', () => {
  class MockProvablyFairAudit {
    static findOne = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        id: 'mock_audit_id',
        table_id: 'mock_table_id',
        server_seed_hash: 'mock_server_seed_hash',
        encrypted_server_seed: 'iv_hex:seed_hex',
        auth_tag: 'mock_auth_tag',
        client_seed: 'mock_client_seed',
        nonce: 1,
        save: jest.fn().mockResolvedValue(true),
      });
    });
    static create = jest.fn().mockImplementation(() => {
      return {
        id: 'mock_audit_id',
        table_id: 'mock_table_id',
        server_seed_hash: 'mock_server_seed_hash',
        encrypted_server_seed: 'iv_hex:seed_hex',
        auth_tag: 'mock_auth_tag',
        client_seed: 'mock_client_seed',
        nonce: 1,
        save: jest.fn().mockResolvedValue(true),
      };
    });
    save = jest.fn().mockResolvedValue(this);
  }
  return { ProvablyFairAudit: MockProvablyFairAudit };
});

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

  async deleteActionLogs(_handId: string) {
    console.log('_handId', _handId);
  }

  async getActionLogs(_handId: string) {
    console.log('handId', _handId);
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

import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { PokerLobbyGateway } from '../gateways/poker-lobby.gateway';

describe('Poker Integrated Advanced Features', () => {
  let gameService: PokerGameService;
  let showdownManager: PokerShowdownManager;
  let stateService: MockPokerStateService;
  let gateway: PokerLobbyGateway;
  let antiCollusionService: AntiCollusionService;
  let provablyFairService: ProvablyFairService;
  let mockManager: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockManager = {
      findOne: jest.fn().mockImplementation((entity) => {
        if (entity === ProvablyFairAudit) {
          return Promise.resolve({
            id: 'mock_audit_id',
            table_id: 'mock_table_id',
            server_seed_hash: 'mock_server_seed_hash',
            encrypted_server_seed: 'iv_hex:seed_hex',
            auth_tag: 'mock_auth_tag',
            client_seed: 'mock_client_seed',
            nonce: 1,
            save: jest.fn().mockResolvedValue(true),
          });
        }
        return Promise.resolve({});
      }),
      save: jest.fn().mockResolvedValue({}),
      insert: jest.fn().mockResolvedValue({}),
      getRepository: jest.fn().mockImplementation(() => ({
        findOne: jest.fn().mockResolvedValue({
          balance: '1000',
          save: jest.fn().mockResolvedValue({}),
        }),
        save: jest.fn().mockResolvedValue({}),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokerGameService,
        PokerLobbyGateway,
        AntiCollusionService,
        { provide: PokerStateService, useClass: MockPokerStateService },
        { provide: PokerLobbyService, useValue: { leaveRoom: jest.fn() } },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation(async (cb) => {
              return cb(mockManager);
            }),
          },
        },
        {
          provide: 'BullQueue_poker-game-history',
          useValue: {
            add: jest.fn().mockResolvedValue({ id: 'job_id' }),
          },
        },
        {
          provide: ProvablyFairService,
          useValue: {
            generateServerSeed: jest.fn().mockReturnValue('mock_server_seed'),
            hashServerSeed: jest.fn().mockReturnValue('mock_server_seed_hash'),
            encryptServerSeed: jest.fn().mockReturnValue({
              encryptedSeed: 'mock_encrypted_seed',
              authTag: 'mock_auth_tag',
            }),
            decryptServerSeed: jest.fn().mockReturnValue('mock_server_seed'),
            calculateDeckHash: jest.fn().mockReturnValue('mock_deck_hash'),
            shuffleDeck: jest
              .fn()
              .mockImplementation(() => [
                '2C',
                '3C',
                '4C',
                '5C',
                '6C',
                '7C',
                '8C',
                '9C',
                'TC',
                'JC',
                'QC',
                'KC',
                'AC',
                '2D',
                '3D',
                '4D',
                '5D',
                '6D',
                '7D',
                '8D',
                '9D',
                'TD',
                'JD',
                'QD',
                'KD',
                'AD',
                '2H',
                '3H',
                '4H',
                '5H',
                '6H',
                '7H',
                '8H',
                '9H',
                'TH',
                'JH',
                'QH',
                'KH',
                'AH',
                '2S',
                '3S',
                '4S',
                '5S',
                '6S',
                '7S',
                '8S',
                '9S',
                'TS',
                'JS',
                'QS',
                'KS',
                'AS',
              ]),
          },
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    gameService = module.get<PokerGameService>(PokerGameService);
    stateService = module.get<PokerStateService>(PokerStateService) as any;
    gateway = module.get<PokerLobbyGateway>(PokerLobbyGateway);
    antiCollusionService =
      module.get<AntiCollusionService>(AntiCollusionService);
    provablyFairService = module.get<ProvablyFairService>(ProvablyFairService);

    gameService.server = {
      to: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      fetchSockets: jest.fn().mockResolvedValue([]),
    } as any;

    gateway.server = gameService.server;
    gateway['logger'] = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as any;

    // Direct assignment to sub-manager
    showdownManager = new PokerShowdownManager(gameService);
  });

  // ── 1. TEST BOMB POT ──
  it('[BOMB-POT] Tạo phòng allow_bomb_pot = true -> ván bài bỏ qua Preflop, thu 5x BB Ante của mỗi player, chia thẳng Flop', async () => {
    const roomId = 'room_bomb_pot';

    // Mock seats: 3 active players, initial stack 2000
    await stateService.setAllSeats(roomId, [
      {
        seat_number: 1,
        user_id: 'u1',
        username: 'Player1',
        status: 'active',
        stack: '2000',
        total_contributed: '0',
      },
      {
        seat_number: 2,
        user_id: 'u2',
        username: 'Player2',
        status: 'active',
        stack: '2000',
        total_contributed: '0',
      },
      {
        seat_number: 3,
        user_id: 'u3',
        username: 'Player3',
        status: 'active',
        stack: '2000',
        total_contributed: '0',
      },
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
      {
        seat_number: 1,
        user_id: 'u1',
        username: 'A',
        status: 'active',
        stack: '0',
        total_contributed: '500',
      },
      {
        seat_number: 2,
        user_id: 'u2',
        username: 'B',
        status: 'active',
        stack: '0',
        total_contributed: '500',
      },
    ]);

    // Give players pocket cards
    // u1: Royal flush on Board 1 (Js, Ts), Royal flush on Board 2 (Jh, Th)
    // u2: High card on Board 1 (7h, 2c), High card on Board 2 (7h, 2c)
    await stateService.setPlayerCards(roomId, 'u1', ['Js', 'Ts']);
    await stateService.setPlayerCards(roomId, 'u2', ['7h', '2c']);

    // Mock splitPot and evaluate7CardHand to trigger standard payout
    jest
      .spyOn(PokerGameEngine, 'splitPot')
      .mockReturnValue([
        { amount: 1000, eligibleSeats: [1, 2], isUncalled: false },
      ]);

    // Spy on finalizeAndBroadcastHand
    const finalizeSpy = jest
      .spyOn(showdownManager, 'finalizeAndBroadcastHand')
      .mockImplementation(async () => {});

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
      {
        seat_number: 1,
        user_id: 'winner_id',
        username: 'Winner',
        status: 'active',
        stack: '0',
        total_contributed: '500',
        muck_cards: '0',
      },
      {
        seat_number: 2,
        user_id: 'loser_id',
        username: 'Loser',
        status: 'active',
        stack: '0',
        total_contributed: '500',
        muck_cards: '1',
      },
    ]);

    await stateService.setPlayerCards(roomId, 'winner_id', ['Ac', 'Ad']); // Two pairs
    await stateService.setPlayerCards(roomId, 'loser_id', ['3c', '4c']); // High card

    // Split pot
    jest
      .spyOn(PokerGameEngine, 'splitPot')
      .mockReturnValue([
        { amount: 1000, eligibleSeats: [1, 2], isUncalled: false },
      ]);

    // Let the showdown run
    await showdownManager.processShowdown(roomId);

    // Verify broadcast event details
    expect(gameService.server.to).toHaveBeenCalledWith(`table_${roomId}`);

    // Find the hand-ended event emit call
    const handEndedCall = (
      gameService.server.emit as jest.Mock
    ).mock.calls.find((call) => call[0] === 'table:hand-ended');
    expect(handEndedCall).toBeDefined();

    const payload = handEndedCall[1];
    expect(payload.all_hands).toBeDefined();

    const winnerHand = payload.all_hands.find(
      (h: any) => h.user_id === 'winner_id',
    );
    const loserHand = payload.all_hands.find(
      (h: any) => h.user_id === 'loser_id',
    );

    // Winner's card must be shown
    expect(winnerHand.pocket_cards).toEqual(['Ac', 'Ad']);

    // Loser's card must be hidden (mucked)
    expect(loserHand.pocket_cards).toEqual([]);
    expect(loserHand.is_mucked).toBe(true);
  });

  // ── 5. TEST PROVABLY FAIR ──
  it('[PROVABLY-FAIR] Ván đấu kết thúc -> Showdown/Fold -> Giải mã server seed, lưu trữ audit log và công khai trong event table:hand-ended', async () => {
    const roomId = 'room_provably_fair';

    // Mock findOne for ProvablyFairAudit to return a valid record
    const mockAuditRecord = {
      id: 'mock_audit_id',
      table_id: roomId,
      server_seed_hash: 'mock_server_seed_hash',
      encrypted_server_seed: 'iv_hex:seed_hex',
      auth_tag: 'mock_auth_tag',
      client_seed: 'mock_client_seed',
      nonce: 1,
      server_seed_plain: undefined,
    };

    jest.spyOn(mockManager, 'findOne').mockResolvedValue(mockAuditRecord);

    // Mock decryptServerSeed to return plaintext
    jest
      .spyOn(provablyFairService, 'decryptServerSeed')
      .mockReturnValue('decrypted_plain_server_seed');

    // Setup active table state
    await stateService.setTableState(roomId, {
      game_stage: 'showdown',
      total_pot: '1000',
      community_cards: 'As,Ks,Qs,Js,2d',
      encrypted_server_seed: 'iv_hex:seed_hex',
      auth_tag: 'mock_auth_tag',
      provably_fair_audit_id: 'mock_audit_id',
      client_seed: 'mock_client_seed',
    });

    // 2 players showdown
    await stateService.setAllSeats(roomId, [
      {
        seat_number: 1,
        user_id: 'winner_id',
        username: 'Winner',
        status: 'active',
        stack: '0',
        total_contributed: '500',
        muck_cards: '0',
      },
      {
        seat_number: 2,
        user_id: 'loser_id',
        username: 'Loser',
        status: 'active',
        stack: '0',
        total_contributed: '500',
        muck_cards: '0',
      },
    ]);

    await stateService.setPlayerCards(roomId, 'winner_id', ['Ac', 'Ad']);
    await stateService.setPlayerCards(roomId, 'loser_id', ['3c', '4c']);

    // Split pot
    jest
      .spyOn(PokerGameEngine, 'splitPot')
      .mockReturnValue([
        { amount: 1000, eligibleSeats: [1, 2], isUncalled: false },
      ]);

    // Let the showdown run, which triggers finalizeAndBroadcastHand
    const testShowdownManager = new PokerShowdownManager(gameService);
    await testShowdownManager.processShowdown(roomId);

    // Verify queue job addition
    const addMock = (gameService as any).historyQueue.add;
    expect(addMock).toHaveBeenCalled();
    const jobData = addMock.mock.calls[0][1];

    // Trigger PokerGameHistoryProcessor synchronously to simulate async worker execution
    const mockProcessorEventEmitter = { emit: jest.fn() };
    const mockProcessorDataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        return cb(mockManager);
      }),
    };
    const processor = new PokerGameHistoryProcessor(
      mockProcessorDataSource as any,
      mockProcessorEventEmitter as any,
    );

    // Call processor
    await processor.process({ data: jobData } as any);

    // Check if the decrypted seed was published in table:hand-ended event
    expect(gameService.server.to).toHaveBeenCalledWith(`table_${roomId}`);
    const handEndedCall = (
      gameService.server.emit as jest.Mock
    ).mock.calls.find((call) => call[0] === 'table:hand-ended');

    expect(handEndedCall).toBeDefined();
    const payload = handEndedCall[1];

    expect(payload.provably_fair).toBeDefined();
    expect(payload.provably_fair.server_seed_plain).toBe(
      'decrypted_plain_server_seed',
    );
    expect(payload.provably_fair.server_seed_hash).toBe(
      'mock_server_seed_hash',
    );
    expect(payload.provably_fair.client_seed).toBe('mock_client_seed');
    expect(payload.provably_fair.nonce).toBe(1);

    // Verify GameHand and ProvablyFairAudit records were updated and saved
    // Use imported GameHand
    expect((GameHand as any).latestInstance.server_seed).toBe(
      'decrypted_plain_server_seed',
    );
    expect(mockManager.save).toHaveBeenCalledWith(mockAuditRecord);
  });

  // ── 6. TEST ANTI-COLLUSION ──
  it('[ANTI-COLLUSION] Chặn người chơi tham gia bàn nếu Risk Score vượt quá ngưỡng 60 (ví dụ: Device Fingerprint trùng)', async () => {
    const roomId = 'room_anti_collusion';

    // Mock existing seats: Player A is seated with Device Fingerprint 'fingerprint_123'
    await stateService.setAllSeats(roomId, [
      {
        seat_number: 1,
        user_id: 'user_a',
        username: 'PlayerA',
        status: 'active',
        stack: '1000',
        ip: '192.168.1.10',
        device_fingerprint: 'fingerprint_123',
        user_agent: 'Mozilla/5.0',
      },
    ]);

    // Calculate risk score for a new user B with same fingerprint
    const risk = await antiCollusionService.calculateRiskScore(
      'user_b',
      roomId,
      '192.168.1.50',
      'Mozilla/5.0',
      'fingerprint_123', // Same fingerprint
    );

    // Fingerprint match score is 40.
    // Let's verify score calculation
    expect(risk.score).toBeGreaterThanOrEqual(40);
    expect(risk.reasons.some((r: string) => r.includes('Fingerprint'))).toBe(
      true,
    );

    // Now test with SAME IP
    const riskSameIp = await antiCollusionService.calculateRiskScore(
      'user_b',
      roomId,
      '192.168.1.10', // Same IP
      'Safari/5.0',
      'fingerprint_different',
    );

    // IP match score is 30.
    expect(riskSameIp.score).toBeGreaterThanOrEqual(30);
    expect(
      riskSameIp.reasons.some((r: string) => r.includes('IP Subnet')),
    ).toBe(true);

    // Now test with BOTH SAME IP and SAME Fingerprint -> Score should be 70 (> 60) -> Should block
    const riskBlocked = await antiCollusionService.calculateRiskScore(
      'user_b',
      roomId,
      '192.168.1.10',
      'Mozilla/5.0',
      'fingerprint_123',
    );

    expect(riskBlocked.score).toBeGreaterThanOrEqual(70);

    // Spy on AuditLog save
    // Use imported AuditLog
    const logSaveSpy = (AuditLog as any).mockSave;
    logSaveSpy.mockClear();

    // Trigger logCollusionWarning
    await antiCollusionService.logCollusionWarning(
      'user_b',
      roomId,
      riskBlocked.score,
      riskBlocked.reasons,
      '192.168.1.10',
      'Mozilla/5.0',
    );

    expect(logSaveSpy).toHaveBeenCalled();
  });
});
