import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../application/user.service';
import { createUser } from '../../../../test/utils/factories';
import { ProfileVisibility } from '../domain/profile-visibility.enum';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    validatePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = mockUserService as unknown as jest.Mocked<UserService>;
  });

  describe('create', () => {
    it('should create a user and return response without passwordHash', async () => {
      const createDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User',
      };

      const createdUser = createUser({
        id: 'uuid-123',
        email: createDto.email,
        username: createDto.username,
        displayName: createDto.displayName,
      });
      service.create.mockResolvedValue(createdUser);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
        displayName: createdUser.displayName,
        avatarUrl: createdUser.avatarUrl,
        timezone: createdUser.timezone,
        bio: createdUser.bio,
        isActiveGm: createdUser.isActiveGm,
        isAdmin: createdUser.isAdmin,
        profileVisibility: createdUser.profileVisibility,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [
        createUser({ id: 'uuid-1' }),
        createUser({ id: 'uuid-2' }),
      ];
      const paginatedResult = {
        data: users,
        meta: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual(paginatedResult.meta);
      expect(result.data[0]).not.toHaveProperty('passwordHash');
    });

    it('should map all users through toResponse', async () => {
      const users = [
        createUser({ id: 'uuid-1', displayName: 'User 1' }),
        createUser({ id: 'uuid-2', displayName: 'User 2' }),
      ];
      service.findAll.mockResolvedValue({
        data: users,
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      });

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(result.data[0].displayName).toBe('User 1');
      expect(result.data[1].displayName).toBe('User 2');
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = createUser({ id: 'uuid-123' });
      service.findById.mockResolvedValue(user);

      const result = await controller.findOne('uuid-123');

      expect(service.findById).toHaveBeenCalledWith('uuid-123');
      expect(result.id).toBe('uuid-123');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should propagate NotFoundException from service', async () => {
      service.findById.mockRejectedValue(
        new NotFoundException('User with ID "nonexistent" not found'),
      );

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user and return response', async () => {
      const updateDto = { displayName: 'Updated Name' };
      const updatedUser = createUser({
        id: 'uuid-123',
        displayName: 'Updated Name',
      });
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('uuid-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('uuid-123', updateDto);
      expect(result.displayName).toBe('Updated Name');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should propagate NotFoundException from service', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('User with ID "nonexistent" not found'),
      );

      await expect(
        controller.update('nonexistent', { displayName: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call service.remove with correct id', async () => {
      service.remove.mockResolvedValue();

      await controller.remove('uuid-123');

      expect(service.remove).toHaveBeenCalledWith('uuid-123');
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('User with ID "nonexistent" not found'),
      );

      await expect(controller.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('response transformation', () => {
    it('should never expose passwordHash in any response', async () => {
      const user = createUser({
        passwordHash: 'super_secret_hash',
      });
      service.findById.mockResolvedValue(user);

      const result = await controller.findOne(user.id);

      expect(result).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(result)).not.toContain('super_secret_hash');
    });

    it('should include all public fields in response', async () => {
      const now = new Date();
      const user = createUser({
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        timezone: 'America/New_York',
        bio: 'A test bio',
        isActiveGm: true,
        isAdmin: false,
        profileVisibility: ProfileVisibility.FRIENDS_ONLY,
        createdAt: now,
        updatedAt: now,
      });
      service.findById.mockResolvedValue(user);

      const result = await controller.findOne('uuid-123');

      expect(result).toEqual({
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        timezone: 'America/New_York',
        bio: 'A test bio',
        isActiveGm: true,
        isAdmin: false,
        profileVisibility: ProfileVisibility.FRIENDS_ONLY,
        createdAt: now,
        updatedAt: now,
      });
    });
  });
});
