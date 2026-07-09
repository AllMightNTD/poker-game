import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../entities/user.entity';
import { RefreshToken } from '../../../entities/refresh_token.entity';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { MailService } from 'src/mail/services/mail.service';
import { PokerStateService } from '../../../services/poker-state.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let refreshTokenRepository: any;
  let jwtService: any;
  let dataSource: any;
  let mailService: any;
  let pokerStateService: any;
  let configService: any;
  let mockRedis: any;
  let mockQueryRunner: any;

  beforeEach(async () => {
    // Mock Redis client methods
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
    };

    pokerStateService = {
      getRedisClient: jest.fn().mockReturnValue(mockRedis),
    };

    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    refreshTokenRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token'),
      verify: jest.fn(),
    };

    mailService = {
      queueRegisterMail: jest.fn().mockResolvedValue(undefined),
      enqueueResetPasswordMail: jest.fn().mockResolvedValue(undefined),
    };

    configService = {
      get: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        create: jest.fn().mockImplementation((entity, data) => data),
        save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: PokerStateService,
          useValue: pokerStateService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAndSendOtp', () => {
    it('should generate OTP and save in Redis if not blocked or on cooldown', async () => {
      mockRedis.get.mockResolvedValue(null); // not blocked, no cooldown
      const mockUser = {
        email: 'test@example.com',
        user_name: 'testuser',
      } as User;

      await service.generateAndSendOtp(mockUser);

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('otp:code:'),
        expect.any(String),
        'EX',
        900,
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('otp:token:'),
        expect.any(String),
        'EX',
        900,
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('otp:cooldown:'),
        '1',
        'EX',
        60,
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        expect.stringContaining('otp:attempts:'),
      );
      expect(mailService.queueRegisterMail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user email is blocked', async () => {
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes('otp:block:')) return Promise.resolve('1');
        return Promise.resolve(null);
      });

      const mockUser = { email: 'blocked@example.com' } as User;
      await expect(service.generateAndSendOtp(mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if cooldown is active', async () => {
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes('otp:cooldown:')) return Promise.resolve('1');
        return Promise.resolve(null);
      });

      const mockUser = { email: 'cooldown@example.com' } as User;
      await expect(service.generateAndSendOtp(mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('register', () => {
    it('should register a new INACTIVE user and call generateAndSendOtp', async () => {
      userRepository.findOne.mockResolvedValue(null); // User does not exist
      mockRedis.get.mockResolvedValue(null);

      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        user_name: 'newplayer',
      };

      const result = await service.register(registerDto);

      expect(result.message).toContain('Đăng ký tài khoản thành công');
      expect(mailService.queueRegisterMail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user exists and is active', async () => {
      userRepository.findOne.mockResolvedValue({
        status: 'ACTIVE',
        email: 'active@example.com',
      });

      const registerDto = {
        email: 'active@example.com',
        password: 'password123',
        user_name: 'activeplayer',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update credentials and resend OTP if user exists but is INACTIVE', async () => {
      const mockInactiveUser = {
        status: 'INACTIVE',
        email: 'inactive@example.com',
        user_name: 'oldusername',
        password: 'oldpasswordhash',
      };
      userRepository.findOne.mockResolvedValue(mockInactiveUser);
      userRepository.save.mockResolvedValue(mockInactiveUser);
      mockRedis.get.mockResolvedValue(null);

      const registerDto = {
        email: 'inactive@example.com',
        password: 'newpassword123',
        user_name: 'newusername',
      };

      const result = await service.register(registerDto);

      expect(result.message).toContain('Tài khoản chưa được kích hoạt');
      expect(userRepository.save).toHaveBeenCalled();
      expect(mailService.queueRegisterMail).toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('should throw BadRequestException if JWT verification fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.verifyOtp({ token: 'bad-token', otp: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify OTP and activate user if credentials are correct', async () => {
      jwtService.verify.mockReturnValue({ email: 'verify@example.com' });
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes('otp:token:')) return Promise.resolve('valid-token');
        if (key.includes('otp:code:')) return Promise.resolve('123456');
        return Promise.resolve(null);
      });

      const mockUser = {
        email: 'verify@example.com',
        status: 'INACTIVE',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, status: 'ACTIVE' });

      const result = await service.verifyOtp({
        token: 'valid-token',
        otp: '123456',
      });

      expect(result.message).toContain('Xác thực tài khoản thành công');
      expect(mockUser.status).toBe('ACTIVE');
      expect(mockRedis.del).toHaveBeenCalledWith('otp:code:verify@example.com');
      expect(mockRedis.del).toHaveBeenCalledWith(
        'otp:token:verify@example.com',
      );
    });

    it('should return alreadyVerified if user is already active', async () => {
      jwtService.verify.mockReturnValue({ email: 'active@example.com' });
      mockRedis.get.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue({ status: 'ACTIVE' });

      const result = await service.verifyOtp({
        token: 'token',
        otp: '123456',
      });

      expect(result.alreadyVerified).toBe(true);
    });

    it('should increment attempts and block user on the 5th incorrect attempt', async () => {
      jwtService.verify.mockReturnValue({ email: 'fail@example.com' });
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes('otp:token:')) return Promise.resolve('valid-token');
        if (key.includes('otp:code:')) return Promise.resolve('123456');
        return Promise.resolve(null);
      });
      userRepository.findOne.mockResolvedValue({ status: 'INACTIVE' });
      mockRedis.incr.mockResolvedValue(5); // 5th attempt

      await expect(
        service.verifyOtp({ token: 'valid-token', otp: '000000' }), // wrong otp
      ).rejects.toThrow(BadRequestException);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'otp:block:fail@example.com',
        '1',
        'EX',
        900,
      );
      expect(mockRedis.del).toHaveBeenCalledWith('otp:code:fail@example.com');
    });
  });

  describe('resendOtp', () => {
    it('should resend OTP if cooldown is inactive', async () => {
      userRepository.findOne.mockResolvedValue({
        email: 'resend@example.com',
        status: 'INACTIVE',
      });
      mockRedis.get.mockResolvedValue(null); // no block, no cooldown

      const result = await service.resendOtp({ email: 'resend@example.com' });

      expect(result.message).toContain('Mã OTP mới đã được gửi');
      expect(mailService.queueRegisterMail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if cooldown is active', async () => {
      userRepository.findOne.mockResolvedValue({
        email: 'resend@example.com',
        status: 'INACTIVE',
      });
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes('otp:cooldown:')) return Promise.resolve('1');
        return Promise.resolve(null);
      });

      await expect(
        service.resendOtp({ email: 'resend@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user status is INACTIVE', async () => {
      userRepository.findOne.mockResolvedValue({
        email: 'inactive@example.com',
        status: 'INACTIVE',
      });

      await expect(
        service.login({ email: 'inactive@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if user status is ACTIVE and password is correct', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'active@example.com',
        user_name: 'activeuser',
        password: 'hashedpassword',
        status: 'ACTIVE',
      };
      userRepository.findOne.mockResolvedValue(mockUser);

      const mockTokenEntity = { id: 'token-uuid' };
      refreshTokenRepository.create.mockReturnValue(mockTokenEntity);
      refreshTokenRepository.save.mockResolvedValue(mockTokenEntity);

      const result = await service.login({
        email: 'active@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });

  describe('forgotPassword', () => {
    it('should set cooldown and return success if user exists and cooldown is inactive', async () => {
      userRepository.findOne.mockResolvedValue({
        email: 'forgot@example.com',
        user_name: 'forgotuser',
      });
      mockRedis.get.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'forgot@example.com',
      });

      expect(result.message).toContain(
        'hướng dẫn đặt lại mật khẩu đã được gửi',
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        'reset:cooldown:forgot@example.com',
        '1',
        'EX',
        60,
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('reset:token:'),
        expect.any(String),
        'EX',
        900,
      );
      expect(mailService.enqueueResetPasswordMail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if cooldown is active', async () => {
      mockRedis.get.mockImplementation((key: string) => {
        if (key.includes('reset:cooldown:')) return Promise.resolve('1');
        return Promise.resolve(null);
      });

      await expect(
        service.forgotPassword({ email: 'forgot@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return success even if user does not exist (prevention of email enumeration)', async () => {
      userRepository.findOne.mockResolvedValue(null);
      mockRedis.get.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'nonexistent@example.com',
      });

      expect(result.message).toContain(
        'hướng dẫn đặt lại mật khẩu đã được gửi',
      );
      expect(mailService.enqueueResetPasswordMail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password, invalidate tokens, and delete redis key if token is valid', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'reset@example.com',
        password: 'oldpassword',
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      mockRedis.get.mockResolvedValue(
        JSON.stringify({ email: 'reset@example.com', userId: 'user-uuid' }),
      );

      const result = await service.resetPassword({
        token: 'valid-reset-token',
        password: 'newpassword123',
      });

      expect(result.message).toContain('đặt lại thành công');
      expect(userRepository.save).toHaveBeenCalled();
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { user_id: 'user-uuid', revoked_at: null },
        { revoked_at: expect.any(Date) },
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        'reset:token:valid-reset-token',
      );
    });

    it('should throw BadRequestException if token does not exist in Redis', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'invalid-token',
          password: 'newpassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
