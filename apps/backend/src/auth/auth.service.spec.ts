import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { DatabaseService } from '@/database/database.service';
import { ConfigService } from '@/config/config.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let db: DatabaseService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: '$2b$10$hashedpassword',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConfig = {
    jwtExpiration: '24h',
    jwtRefreshExpiration: '7d',
    jwtSecret: 'test-secret',
    jwtRefreshSecret: 'test-refresh-secret',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => mockConfig[key as keyof typeof mockConfig]),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('register', () => {
    it('should create new user with hashed password', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const hashedPassword = '$2b$10$hashedpassword';
      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = {
        ...mockUser,
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      };

      jest.spyOn(db.user, 'create' as any).mockResolvedValue(createdUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token' as any);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 86400 } as any);

      const result = await service.register(createUserDto);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          passwordHash: hashedPassword,
          role: 'ADMIN',
        },
      });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(mockUser as any);

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.register(createUserDto)).rejects.toThrow('Email already registered');
    });

    it('should hash password with bcrypt', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      jest.spyOn(db.user, 'create' as any).mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token' as any);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 86400 } as any);

      await service.register(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });
  });

  describe('login', () => {
    it('should return auth response for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token' as any);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 86400 } as any);

      const result = await service.login(loginDto);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(result.accessToken).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(inactiveUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('User account is inactive');
    });
  });

  describe('refresh', () => {
    it('should generate new tokens for active user', async () => {
      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new-token' as any);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 86400 } as any);

      const result = await service.refresh(mockUser.id);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result.accessToken).toBe('new-token');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(null);

      await expect(service.refresh('invalid-id')).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh('invalid-id')).rejects.toThrow('User not found or inactive');
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(inactiveUser as any);

      await expect(service.refresh(mockUser.id)).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh(mockUser.id)).rejects.toThrow('User not found or inactive');
    });
  });

  describe('validateUser', () => {
    it('should return user if active and found', async () => {
      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(mockUser as any);

      const result = await service.validateUser(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(null);

      const result = await service.validateUser('invalid-id');

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(db.user, 'findUnique' as any).mockResolvedValue(inactiveUser as any);

      const result = await service.validateUser(mockUser.id);

      expect(result).toBeNull();
    });
  });

  describe('generateAuthResponse', () => {
    it('should create both access and refresh tokens', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('token' as any);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 86400 } as any);

      const response = await service['generateAuthResponse'](mockUser);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(response.accessToken).toBe('token');
      expect(response.refreshToken).toBe('token');
    });

    it('should store refresh token in database', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      jest.spyOn(jwtService, 'sign').mockReturnValue('refresh-token' as any);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: futureDate.getTime() / 1000 } as any);

      await service['generateAuthResponse'](mockUser);

      expect(db.refreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          token: 'refresh-token',
          expiresAt: expect.any(Date),
        },
      });
    });

    it('should include correct JWT payload', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('token' as any);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 86400 } as any);

      await service['generateAuthResponse'](mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        expect.objectContaining({
          expiresIn: mockConfig.jwtExpiration,
          secret: mockConfig.jwtSecret,
        })
      );
    });

    it('should return user profile with correct fields', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('token' as any);
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 86400 } as any);

      const response = await service['generateAuthResponse'](mockUser);

      expect(response.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      });
    });
  });
});
