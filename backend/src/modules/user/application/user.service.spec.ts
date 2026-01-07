import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { createUser, createUserProps } from '../../../../test/utils/factories';
import { ProfileVisibility } from '../domain/profile-visibility.enum';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  const mockRepository: jest.Mocked<UserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = mockRepository;
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      displayName: 'Test User',
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    });

    it('should create a user successfully', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(null);

      const expectedUser = createUser({
        email: createUserDto.email,
        username: createUserDto.username,
        displayName: createUserDto.displayName,
      });
      repository.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.findByUsername).toHaveBeenCalledWith(
        createUserDto.username,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(repository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        username: createUserDto.username,
        passwordHash: 'hashed_password',
        displayName: createUserDto.displayName,
        timezone: undefined,
        bio: undefined,
        isActiveGm: undefined,
        isAdmin: undefined,
      });
      expect(result).toBe(expectedUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      repository.findByEmail.mockResolvedValue(createUser());
      repository.findByUsername.mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Email already in use'),
      );

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(createUser());

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Username already taken'),
      );

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should pass optional fields to repository', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(null);
      repository.create.mockResolvedValue(createUser());

      const dtoWithOptionals = {
        ...createUserDto,
        timezone: 'America/New_York',
        bio: 'A test bio',
        isActiveGm: true,
        isAdmin: false,
      };

      await service.create(dtoWithOptionals);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timezone: 'America/New_York',
          bio: 'A test bio',
          isActiveGm: true,
          isAdmin: false,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [createUser(), createUser()];
      repository.findAll.mockResolvedValue({ data: users, total: 25 });

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(repository.findAll).toHaveBeenCalledWith({ page: 2, limit: 10 });
      expect(result).toEqual({
        data: users,
        meta: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
        },
      });
    });

    it('should use default pagination values when not provided', async () => {
      repository.findAll.mockResolvedValue({ data: [], total: 0 });

      // Simulating what Zod would produce with defaults
      const result = await service.findAll({ page: undefined, limit: undefined } as any);

      expect(repository.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
    });

    it('should calculate totalPages correctly', async () => {
      repository.findAll.mockResolvedValue({ data: [], total: 101 });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(11);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = createUser({ id: 'test-id' });
      repository.findById.mockResolvedValue(user);

      const result = await service.findById('test-id');

      expect(repository.findById).toHaveBeenCalledWith('test-id');
      expect(result).toBe(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        new NotFoundException('User with ID "nonexistent-id" not found'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const user = createUser({ email: 'test@example.com' });
      repository.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toBe(user);
    });

    it('should return null when user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      const user = createUser({ username: 'testuser' });
      repository.findByUsername.mockResolvedValue(user);

      const result = await service.findByUsername('testuser');

      expect(repository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toBe(user);
    });

    it('should return null when user not found', async () => {
      repository.findByUsername.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const existingUser = createUser({
      id: 'test-id',
      email: 'old@example.com',
      username: 'oldusername',
    });

    it('should update user successfully', async () => {
      repository.findById.mockResolvedValue(existingUser);
      const updatedUser = createUser({
        ...createUserProps(),
        id: 'test-id',
        displayName: 'New Name',
      });
      repository.update.mockResolvedValue(updatedUser);

      const result = await service.update('test-id', { displayName: 'New Name' });

      expect(repository.findById).toHaveBeenCalledWith('test-id');
      expect(repository.update).toHaveBeenCalledWith('test-id', {
        displayName: 'New Name',
      });
      expect(result).toBe(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { displayName: 'New Name' }),
      ).rejects.toThrow(
        new NotFoundException('User with ID "nonexistent-id" not found'),
      );

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should check email uniqueness when updating email', async () => {
      repository.findById.mockResolvedValue(existingUser);
      repository.findByEmail.mockResolvedValue(createUser({ email: 'taken@example.com' }));

      await expect(
        service.update('test-id', { email: 'taken@example.com' }),
      ).rejects.toThrow(new ConflictException('Email already in use'));

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same email', async () => {
      repository.findById.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue(existingUser);

      await service.update('test-id', { email: 'old@example.com' });

      expect(repository.findByEmail).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalled();
    });

    it('should check username uniqueness when updating username', async () => {
      repository.findById.mockResolvedValue(existingUser);
      repository.findByUsername.mockResolvedValue(
        createUser({ username: 'takenusername' }),
      );

      await expect(
        service.update('test-id', { username: 'takenusername' }),
      ).rejects.toThrow(new ConflictException('Username already taken'));

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same username', async () => {
      repository.findById.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue(existingUser);

      await service.update('test-id', { username: 'oldusername' });

      expect(repository.findByUsername).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      const user = createUser({ id: 'test-id' });
      repository.findById.mockResolvedValue(user);
      repository.softDelete.mockResolvedValue();

      await service.remove('test-id');

      expect(repository.findById).toHaveBeenCalledWith('test-id');
      expect(repository.softDelete).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        new NotFoundException('User with ID "nonexistent-id" not found'),
      );

      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const user = createUser({ passwordHash: 'hashed_password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(user, 'correct_password');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correct_password',
        'hashed_password',
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const user = createUser({ passwordHash: 'hashed_password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(user, 'wrong_password');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong_password',
        'hashed_password',
      );
      expect(result).toBe(false);
    });
  });
});
