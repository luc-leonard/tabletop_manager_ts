import { User as PrismaUser, ProfileVisibility as PrismaProfileVisibility } from '@prisma/client';
import { UserMapper } from './user.mapper';
import { User } from '../../domain/user.entity';
import { ProfileVisibility } from '../../domain/profile-visibility.enum';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  const createPrismaUser = (overrides: Partial<PrismaUser> = {}): PrismaUser => {
    const now = new Date();
    return {
      id: 'uuid-123',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed_password',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
      timezone: 'America/New_York',
      bio: 'A test bio',
      isActiveGm: true,
      isAdmin: false,
      profileVisibility: PrismaProfileVisibility.PUBLIC,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      ...overrides,
    };
  };

  describe('toDomain', () => {
    it('should convert PrismaUser to User domain entity', () => {
      const prismaUser = createPrismaUser();

      const user = mapper.toDomain(prismaUser);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(prismaUser.id);
      expect(user.email).toBe(prismaUser.email);
      expect(user.username).toBe(prismaUser.username);
      expect(user.passwordHash).toBe(prismaUser.passwordHash);
      expect(user.displayName).toBe(prismaUser.displayName);
      expect(user.avatarUrl).toBe(prismaUser.avatarUrl);
      expect(user.timezone).toBe(prismaUser.timezone);
      expect(user.bio).toBe(prismaUser.bio);
      expect(user.isActiveGm).toBe(prismaUser.isActiveGm);
      expect(user.isAdmin).toBe(prismaUser.isAdmin);
      expect(user.profileVisibility).toBe(ProfileVisibility.PUBLIC);
      expect(user.createdAt).toBe(prismaUser.createdAt);
      expect(user.updatedAt).toBe(prismaUser.updatedAt);
      expect(user.deletedAt).toBe(prismaUser.deletedAt);
    });

    it('should convert ProfileVisibility.PRIVATE correctly', () => {
      const prismaUser = createPrismaUser({
        profileVisibility: PrismaProfileVisibility.PRIVATE,
      });

      const user = mapper.toDomain(prismaUser);

      expect(user.profileVisibility).toBe(ProfileVisibility.PRIVATE);
    });

    it('should convert ProfileVisibility.FRIENDS_ONLY correctly', () => {
      const prismaUser = createPrismaUser({
        profileVisibility: PrismaProfileVisibility.FRIENDS_ONLY,
      });

      const user = mapper.toDomain(prismaUser);

      expect(user.profileVisibility).toBe(ProfileVisibility.FRIENDS_ONLY);
    });

    it('should handle null optional fields', () => {
      const prismaUser = createPrismaUser({
        displayName: null,
        avatarUrl: null,
        timezone: null,
        bio: null,
      });

      const user = mapper.toDomain(prismaUser);

      expect(user.displayName).toBeNull();
      expect(user.avatarUrl).toBeNull();
      expect(user.timezone).toBeNull();
      expect(user.bio).toBeNull();
    });

    it('should handle deletedAt timestamp', () => {
      const deletedAt = new Date();
      const prismaUser = createPrismaUser({ deletedAt });

      const user = mapper.toDomain(prismaUser);

      expect(user.deletedAt).toBe(deletedAt);
      expect(user.isDeleted).toBe(true);
    });
  });

  describe('toAggregate', () => {
    it('should convert User domain entity to PrismaUser', () => {
      const now = new Date();
      const user = new User({
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        timezone: 'America/New_York',
        bio: 'A test bio',
        isActiveGm: true,
        isAdmin: false,
        profileVisibility: ProfileVisibility.PUBLIC,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      const prismaUser = mapper.toAggregate(user);

      expect(prismaUser.id).toBe(user.id);
      expect(prismaUser.email).toBe(user.email);
      expect(prismaUser.username).toBe(user.username);
      expect(prismaUser.passwordHash).toBe(user.passwordHash);
      expect(prismaUser.displayName).toBe(user.displayName);
      expect(prismaUser.avatarUrl).toBe(user.avatarUrl);
      expect(prismaUser.timezone).toBe(user.timezone);
      expect(prismaUser.bio).toBe(user.bio);
      expect(prismaUser.isActiveGm).toBe(user.isActiveGm);
      expect(prismaUser.isAdmin).toBe(user.isAdmin);
      expect(prismaUser.profileVisibility).toBe(PrismaProfileVisibility.PUBLIC);
      expect(prismaUser.createdAt).toBe(user.createdAt);
      expect(prismaUser.updatedAt).toBe(user.updatedAt);
      expect(prismaUser.deletedAt).toBe(user.deletedAt);
    });

    it('should handle different profile visibility values', () => {
      const now = new Date();
      const user = new User({
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
        displayName: null,
        avatarUrl: null,
        timezone: null,
        bio: null,
        isActiveGm: false,
        isAdmin: false,
        profileVisibility: ProfileVisibility.FRIENDS_ONLY,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      const prismaUser = mapper.toAggregate(user);

      expect(prismaUser.profileVisibility).toBe(PrismaProfileVisibility.FRIENDS_ONLY);
    });
  });
});
