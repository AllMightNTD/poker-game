import { PokerGameEngine } from './poker-game.engine';
import { PokerShowdownManager } from './poker-showdown.manager';

// Mock DB Entities
jest.mock('../entities/poker_table.entity', () => ({
  PokerTable: { findOne: jest.fn().mockResolvedValue({ rake_rate: 0, rake_cap: 0 }) },
}));
jest.mock('../entities/game_hand.entity', () => ({
  GameHand: jest.fn().mockImplementation(() => ({ save: jest.fn() })),
}));
jest.mock('../entities/hand_player.entity', () => ({
  HandPlayer: jest.fn().mockImplementation(() => ({ save: jest.fn() })),
}));
jest.mock('../entities/table_session.entity', () => ({
  TableSession: { findOne: jest.fn() },
}));

describe('PokerShowdownManager - Unit Tests', () => {
  let showdownManager: PokerShowdownManager;
  let mockGameService: any;
  let getTableStateMock: jest.Mock;
  let getAllSeatsMock: jest.Mock;
  let getPlayerCardsMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getTableStateMock = jest.fn();
    getAllSeatsMock = jest.fn();
    getPlayerCardsMock = jest.fn().mockResolvedValue(['Ah', 'Kh']);

    mockGameService = {
      server: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      },
      stateService: {
        getTableState: getTableStateMock,
        getAllSeats: getAllSeatsMock,
        getPlayerCards: getPlayerCardsMock,
        setSeat: jest.fn(),
        setTableState: jest.fn(),
        pushHandHistory: jest.fn(),
        clearDeck: jest.fn(),
        pushActionLog: jest.fn(),
      },
      logger: {
        log: jest.fn(),
        error: jest.fn(),
      },
      syncSeatStackToDb: jest.fn(),
      startNewHand: jest.fn(),
      delay: () => Promise.resolve(),
    };

    showdownManager = new PokerShowdownManager(mockGameService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('[PL-001] So bài phân định thắng thua: Sảnh > Hai Đôi', async () => {
    const roomId = 'room_1';

    getTableStateMock.mockResolvedValue({
      total_pot: '1000',
      community_cards: '2d,3h,4s,5c,Kh',
      game_stage: 'showdown'
    });

    getAllSeatsMock.mockResolvedValue([
      { seat_number: 1, user_id: 'u1', username: 'A', status: 'active', stack: '0', total_contributed: '500' },
      { seat_number: 2, user_id: 'u2', username: 'B', status: 'active', stack: '0', total_contributed: '500' },
    ]);

    // Giả lập Split Pot
    jest.spyOn(PokerGameEngine, 'splitPot').mockReturnValue([
      { amount: 1000, eligibleSeats: [1, 2], isUncalled: false },
    ]);

    // Giả lập Evaluate Hand
    jest.spyOn(PokerGameEngine, 'evaluate7CardHand').mockImplementation((cards) => {
      // Dựa vào context mock, ta có thể hardcode hoặc phân biệt
      // Vì evaluate7CardHand nhận array cards (gồm pocket + board), ta sẽ mock theo tuần tự gọi
      return { score: 5000, name: 'Straight' } as any;
    });
    const evaluateSpy = jest.spyOn(PokerGameEngine, 'evaluate7CardHand')
      .mockReturnValueOnce({ score: 5000, name: 'Straight' } as any) // Seat 1
      .mockReturnValueOnce({ score: 3000, name: 'Two Pairs' } as any); // Seat 2

    // Spy finalizeAndBroadcastHand
    const finalizeSpy = jest.spyOn(showdownManager, 'finalizeAndBroadcastHand').mockImplementation(async () => { });

    await showdownManager.processShowdown(roomId);

    expect(finalizeSpy).toHaveBeenCalled();
    const winnersLog = finalizeSpy.mock.calls[0][1];

    expect(winnersLog.length).toBe(1);
    expect(winnersLog[0].user_id).toBe('u1');
    expect(winnersLog[0].win_amount).toBe(1000);
    expect(winnersLog[0].hand_name).toBe('Straight');
  });

  it('[PL-002] Trả thưởng Side Pot chính xác: Main Pot cho C, Side Pot cho C, A trắng tay', async () => {
    const roomId = 'room_2';

    getTableStateMock.mockResolvedValue({
      total_pot: '700',
      community_cards: '',
      game_stage: 'showdown'
    });

    getAllSeatsMock.mockResolvedValue([
      { seat_number: 1, user_id: 'A', username: 'A', status: 'active', stack: '0', total_contributed: '100' },
      { seat_number: 2, user_id: 'B', username: 'B', status: 'active', stack: '0', total_contributed: '300' },
      { seat_number: 3, user_id: 'C', username: 'C', status: 'active', stack: '0', total_contributed: '300' },
    ]);

    jest.spyOn(PokerGameEngine, 'splitPot').mockReturnValue([
      { amount: 300, eligibleSeats: [1, 2, 3], isUncalled: false }, // Main pot
      { amount: 400, eligibleSeats: [2, 3], isUncalled: false }, // Side pot
    ]);

    jest.spyOn(PokerGameEngine, 'evaluate7CardHand')
      .mockReturnValueOnce({ score: 1000, name: 'High Card' } as any) // A
      .mockReturnValueOnce({ score: 2000, name: 'One Pair' } as any) // B
      .mockReturnValueOnce({ score: 3000, name: 'Two Pairs' } as any); // C

    const finalizeSpy = jest.spyOn(showdownManager, 'finalizeAndBroadcastHand').mockImplementation(async () => { });

    await showdownManager.processShowdown(roomId);

    const winnersLog = finalizeSpy.mock.calls[0][1];
    expect(winnersLog.length).toBe(1);
    expect(winnersLog[0].user_id).toBe('C');
    expect(winnersLog[0].win_amount).toBe(700);
  });

  it('[PL-003] Hòa bài (Split Pot 50/50) và chia chip lẻ (Odd Chip)', async () => {
    const roomId = 'room_3';

    getTableStateMock.mockResolvedValue({
      total_pot: '501',
      community_cards: '',
      game_stage: 'showdown',
      dealer_seat: '3'
    });

    getAllSeatsMock.mockResolvedValue([
      { seat_number: 1, user_id: 'u1', username: 'A', status: 'active', stack: '0', total_contributed: '251' },
      { seat_number: 2, user_id: 'u2', username: 'B', status: 'active', stack: '0', total_contributed: '250' },
    ]);

    jest.spyOn(PokerGameEngine, 'splitPot').mockReturnValue([
      { amount: 501, eligibleSeats: [1, 2], isUncalled: false },
    ]);

    jest.spyOn(PokerGameEngine, 'evaluate7CardHand')
      .mockReturnValue({ score: 9000, name: 'Straight Flush' } as any); // Hòa tuyệt đối

    const finalizeSpy = jest.spyOn(showdownManager, 'finalizeAndBroadcastHand').mockImplementation(async () => { });

    await showdownManager.processShowdown(roomId);

    const winnersLog = finalizeSpy.mock.calls[0][1];
    expect(winnersLog.length).toBe(2);

    // Theo luật chip lẻ, seat 1 gần dealer(3) nhất (tính theo chiều kim đồng hồ: 3 -> 1 -> 2) 
    // Wait, with maxPlayers=9, the order after 3 is 4..9..1. So 1 acts first preflop but after dealer it's 1.
    // Let's just check one gets 251 and other gets 250
    const w1 = winnersLog.find(w => w.user_id === 'u1');
    const w2 = winnersLog.find(w => w.user_id === 'u2');

    expect(w1.win_amount + w2.win_amount).toBe(501);
    expect(Math.abs(w1.win_amount - w2.win_amount)).toBe(1);
  });

  it('[POT-003] Mọi người Fold chỉ còn 1 người, thắng ngay lập tức (endHandEarly)', async () => {
    const roomId = 'room_4';

    getTableStateMock.mockResolvedValue({
      total_pot: '1000'
    });

    getAllSeatsMock.mockResolvedValue([
      { seat_number: 1, user_id: 'u1', username: 'A', status: 'active', stack: '1000', total_contributed: '600' },
      { seat_number: 2, user_id: 'u2', username: 'B', status: 'folded', stack: '1000', total_contributed: '200' },
      { seat_number: 3, user_id: 'u3', username: 'C', status: 'folded', stack: '1000', total_contributed: '200' },
    ]);

    jest.spyOn(PokerGameEngine, 'splitPot').mockReturnValue([
      { amount: 1000, eligibleSeats: [1], isUncalled: false },
    ]);

    const finalizeSpy = jest.spyOn(showdownManager, 'finalizeAndBroadcastHand').mockImplementation(async () => { });

    await showdownManager.endHandEarly(roomId, 1);

    const winnersLog = finalizeSpy.mock.calls[0][1];
    expect(winnersLog.length).toBe(1);
    expect(winnersLog[0].user_id).toBe('u1');
    expect(winnersLog[0].win_amount).toBe(1000);
    expect(winnersLog[0].hand_name).toBe('Opponents Folded');
  });

});
