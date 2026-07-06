import { Test, TestingModule } from '@nestjs/testing';
import { PokerLobbyGateway } from '../gateways/poker-lobby.gateway';
import { PokerStateService } from '../services/poker-state.service';
import { PokerGameService } from '../services/poker-game.service';
import { PokerLobbyService } from './poker-lobby.service';
import { JwtService } from '@nestjs/jwt';

// Mock Services
class MockPokerStateService {
  private locks = new Map<string, boolean>();

  async acquireLock(tableId: string): Promise<boolean> {
    if (this.locks.get(tableId)) {
      return false; // Đã bị khóa
    }
    this.locks.set(tableId, true);
    // Tự động nhả khóa sau 100ms để test (giống TTL)
    setTimeout(() => this.locks.delete(tableId), 100);
    return true;
  }

  async releaseLock(tableId: string): Promise<void> {
    this.locks.delete(tableId);
  }

  async getTableState(tableId: string) {
    return { current_turn_seat: '1' };
  }

  async getAllSeats(tableId: string) {
    return [
      { seat_number: 1, user_id: 'user_1' }, // Turn của user 1
      { seat_number: 2, user_id: 'user_2' },
      // ... 9 users
    ];
  }
  
  getRedisClient() {
    return { hset: jest.fn() };
  }
}

class MockPokerGameService {
  async processPlayerAction(roomId: string, seat: number, action: string, amount: number) {
    return new Promise(resolve => setTimeout(resolve, 50)); // Giả lập xử lý mất 50ms
  }
  async broadcastTableState() {}
}

describe('Concurrency / Race Condition Test (PokerLobbyGateway)', () => {
  let gateway: PokerLobbyGateway;
  let gameService: PokerGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokerLobbyGateway,
        { provide: PokerLobbyService, useValue: {} },
        { provide: PokerStateService, useClass: MockPokerStateService },
        { provide: PokerGameService, useClass: MockPokerGameService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    gateway = module.get<PokerLobbyGateway>(PokerLobbyGateway);
    gameService = module.get<PokerGameService>(PokerGameService);
    
    // Mock logger
    gateway['logger'] = { log: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
  });

  it('ACT-001: 9 Users gửi hành động đồng thời -> Chỉ 1 request được xử lý', async () => {
    const roomId = 'room_concurrency';
    
    // Tạo 9 giả lập clients (Sockets)
    const createMockClient = (userId: string) => ({
      id: `socket_${userId}`,
      data: { user: { id: userId } },
      emit: jest.fn(), // Để catch error "Hệ thống đang bận"
    });

    const clients = Array.from({ length: 9 }, (_, i) => createMockClient(`user_${i + 1}`));

    // Bắn đồng thời 9 requests bằng Promise.all
    const promises = clients.map(client => 
      gateway.handleTableAction(client as any, { room_id: roomId, action_type: 'call' })
    );

    await Promise.all(promises);

    // Kiểm tra kết quả
    let successCount = 0;
    let lockRejectCount = 0;
    let wrongTurnRejectCount = 0;

    clients.forEach(c => {
      const emitCalls = c.emit.mock.calls;
      if (emitCalls.length === 0) {
        successCount++; // Không có lỗi emit -> Thành công (User 1)
      } else {
        const errorMsg = emitCalls[0][1].message;
        if (errorMsg === 'Hệ thống đang xử lý cược, vui lòng thử lại.') lockRejectCount++;
        if (errorMsg === 'Chưa tới lượt hành động của bạn.') wrongTurnRejectCount++;
      }
    });

    // 1 user (user_1) acquire lock thành công và đúng turn
    expect(successCount).toBe(1);
    
    // Tổng số requests bị reject phải là 8
    expect(lockRejectCount + wrongTurnRejectCount).toBe(8);
    
    console.log(`Concurrency Result: Success: ${successCount}, Lock Rejects: ${lockRejectCount}, Turn Rejects: ${wrongTurnRejectCount}`);
  });
});
