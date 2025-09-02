import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Mock do AuthService
const mockAuthService = {
  validateToken: jest.fn(),
  refreshToken: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
};

// Mock do Reflector
const mockReflector = {
  getAllAndOverride: jest.fn(),
  get: jest.fn(),
};

// Mock do JwtService
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

// Mock do ConfigService
const mockConfigService = {
  get: jest.fn(),
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let reflector: Reflector;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authService = module.get<AuthService>(AuthService);
    reflector = module.get<Reflector>(Reflector);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should have access to dependencies', () => {
    expect(authService).toBeDefined();
    expect(reflector).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
  });
});
