import { Test, TestingModule } from '@nestjs/testing';
import { AdminHandsController } from './admin-hands.controller';
import { AdminHandsService } from '../services/admin-hands.service';
import { JwtService } from '@nestjs/jwt';

describe('AdminHandsController', () => {
  let controller: AdminHandsController;

  beforeEach(async () => {
    const mockHandsService = {
      getHands: jest.fn(),
      getHandDetail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminHandsController],
      providers: [
        {
          provide: AdminHandsService,
          useValue: mockHandsService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AdminHandsController>(AdminHandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
