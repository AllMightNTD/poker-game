import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PokerGameService } from '../services/poker-game.service';
import { PokerLobbyService } from '../services/poker-lobby.service';
import { PokerStateService } from '../services/poker-state.service';
import { PokerLobbyGateway } from './poker-lobby.gateway';

// Mock DB Entities
jest.mock('../entities/poker_table.entity', () => ({
  PokerTable: {
    findOne: jest.fn().mockImplementation(({ where }) => {
      if (where.id === 'allow-chat-room') {
        return Promise.resolve({
          id: 'allow-chat-room',
          is_active: true,
          custom_settings: { allow_chat: true },
        });
      }
      if (where.id === 'no-chat-room') {
        return Promise.resolve({
          id: 'no-chat-room',
          is_active: true,
          custom_settings: { allow_chat: false },
        });
      }
      return Promise.resolve(null);
    }),
  },
}));

jest.mock('../entities/user.entity', () => ({
  User: {
    findOne: jest.fn().mockImplementation(({ where }) => {
      return Promise.resolve({
        id: where.id,
        user_name: `user_${where.id}`,
        avatar_url: `avatar_${where.id}`,
      });
    }),
  },
}));

class MockPokerStateService {
  private chats: Map<string, string[]> = new Map();

  async getAllSeats(_roomId: string) {
    console.log('_roomId', _roomId);

    return [
      { seat_number: 1, user_id: 'user_1' },
      { seat_number: 2, user_id: 'user_2' },
    ];
  }

  async pushChatMessage(tableId: string, chatJson: string): Promise<void> {
    if (!this.chats.has(tableId)) {
      this.chats.set(tableId, []);
    }
    this.chats.get(tableId).push(chatJson);
  }

  async getChatHistory(
    tableId: string,
    offset: number,
    limit: number,
  ): Promise<string[]> {
    const list = this.chats.get(tableId) || [];
    const start = -limit - offset;
    const end = -1 - offset;
    const len = list.length;
    const startIdx = Math.max(0, len + start);
    const endIdx = Math.max(0, len + end + 1);
    return list.slice(startIdx, endIdx);
  }
}

describe('PokerLobbyGateway - Chat Realtime & History', () => {
  let gateway: PokerLobbyGateway;
  let stateService: MockPokerStateService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokerLobbyGateway,
        { provide: PokerLobbyService, useValue: {} },
        { provide: PokerStateService, useClass: MockPokerStateService },
        { provide: PokerGameService, useValue: { setServer: jest.fn() } },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    gateway = module.get<PokerLobbyGateway>(PokerLobbyGateway);
    stateService = module.get<PokerStateService>(PokerStateService) as any;

    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    gateway['logger'] = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as any;
  });

  it('CHAT-001: Player gửi tin nhắn -> lưu vào Redis và broadcast tức thì đến cả phòng', async () => {
    const mockClient = {
      id: 'socket_1',
      data: { user: { id: 'user_1' } },
      emit: jest.fn(),
    };

    const roomId = 'allow-chat-room';
    const message = 'Hello, world!';

    await gateway.handleChatMessage(mockClient as any, {
      room_id: roomId,
      message,
    });

    // Check if saved to Redis
    const history = await stateService.getChatHistory(roomId, 0, 10);
    expect(history.length).toBe(1);

    const savedMsg = JSON.parse(history[0]);
    expect(savedMsg.message).toBe('Hello, world!');
    expect(savedMsg.user_id).toBe('user_1');
    expect(savedMsg.username).toBe('user_user_1');
    expect(savedMsg.seat_number).toBe(1);

    // Check if broadcasted
    expect(gateway.server.to).toHaveBeenCalledWith(`table_${roomId}`);
    expect(gateway.server.emit).toHaveBeenCalledWith(
      'table:chat-message-received',
      expect.objectContaining({
        user_id: 'user_1',
        message: 'Hello, world!',
        seat_number: 1,
      }),
    );
  });

  it('CHAT-002: Không cho phép chat nếu custom_settings.allow_chat = false', async () => {
    const mockClient = {
      id: 'socket_1',
      data: { user: { id: 'user_1' } },
      emit: jest.fn(),
    };

    const roomId = 'no-chat-room';
    const message = 'Hello, anyone there?';

    await gateway.handleChatMessage(mockClient as any, {
      room_id: roomId,
      message,
    });

    // Check error was emitted to sender only
    expect(mockClient.emit).toHaveBeenCalledWith('error', {
      message: 'Chủ phòng đã tắt tính năng chat.',
    });
    expect(gateway.server.to).not.toHaveBeenCalled();
  });

  it('CHAT-003: Lấy lịch sử chat (Pagination)', async () => {
    const mockClient = {
      id: 'socket_1',
      data: { user: { id: 'user_1' } },
      emit: jest.fn(),
    };

    const roomId = 'allow-chat-room';

    // Inject 5 messages
    for (let i = 1; i <= 5; i++) {
      await stateService.pushChatMessage(
        roomId,
        JSON.stringify({ message: `Msg ${i}`, timestamp: Date.now() + i }),
      );
    }

    // Fetch offset 0 limit 2 (newest 2 messages)
    await gateway.handleGetChatHistory(mockClient as any, {
      room_id: roomId,
      offset: 0,
      limit: 2,
    });
    expect(mockClient.emit).toHaveBeenCalledWith(
      'table:chat-history-loaded',
      expect.objectContaining({
        room_id: roomId,
        offset: 0,
        limit: 2,
        hasMore: true,
      }),
    );
    const payload1 = mockClient.emit.mock.calls[0][1];
    expect(payload1.history.length).toBe(2);
    expect(payload1.history[0].message).toBe('Msg 4');
    expect(payload1.history[1].message).toBe('Msg 5');

    // Fetch offset 2 limit 2
    mockClient.emit.mockClear();
    await gateway.handleGetChatHistory(mockClient as any, {
      room_id: roomId,
      offset: 2,
      limit: 2,
    });
    const payload2 = mockClient.emit.mock.calls[0][1];
    expect(payload2.history.length).toBe(2);
    expect(payload2.history[0].message).toBe('Msg 2');
    expect(payload2.history[1].message).toBe('Msg 3');
  });
});
