import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

const mockUserRepository = () => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'mock_token'),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<any>, jest.Mock>>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const googleUser = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      picture: 'pic.jpg',
      googleId: '123',
    };

    it('should create a new user if user does not exist', async () => {
      userRepository.findOneBy!.mockResolvedValue(null);
      userRepository.create!.mockReturnValue(googleUser);
      userRepository.save!.mockResolvedValue({ id: 1, ...googleUser });

      const result = await service.validateUser(googleUser);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: googleUser.email });
      expect(userRepository.create).toHaveBeenCalledWith(googleUser);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...googleUser });
    });

    it('should update existing user if found', async () => {
      const existingUser = { id: 1, ...googleUser, firstName: 'Old' };
      userRepository.findOneBy!.mockResolvedValue(existingUser);
      userRepository.save!.mockResolvedValue({ ...existingUser, firstName: 'Test' });

      const result = await service.validateUser(googleUser);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: googleUser.email });
      expect(existingUser.firstName).toBe('Test'); // Should be updated
      expect(userRepository.save).toHaveBeenCalledWith(existingUser);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { email: 'test@example.com', id: 1 };
      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
      expect(result).toEqual({ access_token: 'mock_token' });
    });
  });

  describe('updateLanguage', () => {
    it('should update user language', async () => {
      userRepository.update!.mockResolvedValue({ affected: 1 });

      await service.updateLanguage(1, 'de');

      expect(userRepository.update).toHaveBeenCalledWith(1, { language: 'de' });
    });
  });
});
