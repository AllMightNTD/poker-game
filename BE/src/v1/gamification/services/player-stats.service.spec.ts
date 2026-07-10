import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStatsService } from './player-stats.service';
import { PlayerStats } from '../entities/player-stats.entity';
import { Achievement } from '../entities/achievement.entity';
import { PokerHandCompletedEvent } from '../../services/audit.service';

const mockStatsRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockAchRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('PlayerStatsService', () => {
  let service: PlayerStatsService;
  let statsRepo: ReturnType<typeof mockStatsRepository>;
  let achRepo: ReturnType<typeof mockAchRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerStatsService,
        {
          provide: getRepositoryToken(PlayerStats),
          useFactory: mockStatsRepository,
        },
        {
          provide: getRepositoryToken(Achievement),
          useFactory: mockAchRepository,
        },
      ],
    }).compile();

    service = module.get<PlayerStatsService>(PlayerStatsService);
    statsRepo = module.get(getRepositoryToken(PlayerStats));
    achRepo = module.get(getRepositoryToken(Achievement));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return existing stats if they exist', async () => {
      const mockStats = { user_id: 'user1', current_xp: 100 };
      statsRepo.findOne.mockResolvedValue(mockStats);

      const result = await service.getStats('user1');
      expect(result).toEqual(mockStats);
      expect(statsRepo.create).not.toHaveBeenCalled();
    });

    it('should create and return new stats if they do not exist', async () => {
      statsRepo.findOne.mockResolvedValue(null);
      const newStats = { user_id: 'user2' };
      statsRepo.create.mockReturnValue(newStats);
      statsRepo.save.mockResolvedValue(newStats);

      const result = await service.getStats('user2');
      expect(statsRepo.create).toHaveBeenCalledWith({ user_id: 'user2' });
      expect(statsRepo.save).toHaveBeenCalledWith(newStats);
      expect(result).toEqual(newStats);
    });
  });

  describe('getLeaderboard', () => {
    it('should return mapped leaderboard entries', async () => {
      const mockTopStats = [
        {
          user_id: 'user1',
          total_chips_won: '1000',
          hands_played: 10,
          user: { id: 'user1', user_name: 'Player 1', avatar_url: 'avatar1.png' },
        },
        {
          user_id: 'user2',
          total_chips_won: '500',
          hands_played: 5,
          user: { id: 'user2', user_name: 'Player 2', avatar_url: 'avatar2.png' },
        },
      ];
      statsRepo.find.mockResolvedValue(mockTopStats);

      const result = await service.getLeaderboard();
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        id: 'user1',
        user_id: 'user1',
        user: { id: 'user1', username: 'Player 1', avatar: 'avatar1.png' },
        rank: 1,
        chips_won: '1000',
        hands_played: 10,
      });
      expect(result[1].rank).toBe(2);
    });
  });

  describe('handleHandCompleted', () => {
    it('should process a loss correctly', async () => {
      const mockStats = {
        user_id: 'loser1',
        hands_played: 0,
        hands_won: 0,
        total_chips_won: '0',
        total_rake_paid: '0',
        biggest_pot: '0',
        current_xp: 0,
        level: 'bronze',
      };
      statsRepo.findOne.mockResolvedValue(mockStats);
      statsRepo.save.mockResolvedValue(mockStats);

      const payload = {
        handId: 'hand1',
        winners: [],
        userRakeShares: [{ userId: 'loser1', rakePaid: 10 }],
      } as unknown as PokerHandCompletedEvent;

      await service.handleHandCompleted(payload);

      expect(statsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          hands_played: 1,
          hands_won: 0,
          total_chips_won: '0',
          total_rake_paid: '10',
          current_xp: 10, // 10 XP for playing
        }),
      );
    });

    it('should process a win, unlock FIRST_WIN, and level up to silver', async () => {
      const mockStats = {
        user_id: 'winner1',
        hands_played: 0,
        hands_won: 0,
        total_chips_won: '0',
        total_rake_paid: '0',
        biggest_pot: '0',
        current_xp: 2950, // Needs 50 to reach 3000 (silver)
        level: 'bronze',
      };
      statsRepo.findOne.mockResolvedValue(mockStats);
      achRepo.findOne.mockResolvedValue(null); // FIRST_WIN not unlocked yet

      const payload = {
        handId: 'hand2',
        winners: [{ user_id: 'winner1', win_amount: 5000 }],
        userRakeShares: [{ userId: 'winner1', rakePaid: 50 }],
      } as unknown as PokerHandCompletedEvent;

      await service.handleHandCompleted(payload);

      expect(achRepo.create).toHaveBeenCalledWith({
        user_id: 'winner1',
        type: 'FIRST_WIN',
      });
      expect(achRepo.save).toHaveBeenCalled();

      expect(statsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          hands_played: 1,
          hands_won: 1,
          total_chips_won: '5000',
          biggest_pot: '5000',
          total_rake_paid: '50',
          current_xp: 3010, // 2950 + 10 (play) + 50 (win)
          level: 'silver', // Leveled up
        }),
      );
    });
  });
});
