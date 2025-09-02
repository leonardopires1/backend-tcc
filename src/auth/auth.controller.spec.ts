import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

// Mock do AuthService
const mockAuthService = {
  validateToken: jest.fn(),
  refreshToken: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 10,
        }]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have access to dependencies', () => {
    expect(authService).toBeDefined();
  });
});
