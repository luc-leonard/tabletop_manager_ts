import { User } from './user.entity';
import { ProfileVisibility } from './profile-visibility.enum';
import { createUserProps } from '../../../../test/utils/factories';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user with all properties', () => {
      const props = createUserProps({
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'A test bio',
        isActiveGm: true,
        isAdmin: false,
        profileVisibility: ProfileVisibility.PRIVATE,
      });

      const user = new User(props);

      expect(user.id).toBe('test-id');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.displayName).toBe('Test User');
      expect(user.bio).toBe('A test bio');
      expect(user.isActiveGm).toBe(true);
      expect(user.isAdmin).toBe(false);
      expect(user.profileVisibility).toBe(ProfileVisibility.PRIVATE);
    });

    it('should create a user with null optional fields', () => {
      const props = createUserProps({
        displayName: null,
        avatarUrl: null,
        timezone: null,
        bio: null,
      });

      const user = new User(props);

      expect(user.displayName).toBeNull();
      expect(user.avatarUrl).toBeNull();
      expect(user.timezone).toBeNull();
      expect(user.bio).toBeNull();
    });

    it('should inherit timestamp properties from BaseEntity', () => {
      const now = new Date();
      const props = createUserProps({
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      const user = new User(props);

      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
      expect(user.deletedAt).toBeNull();
    });
  });

  describe('isDeleted', () => {
    it('should return false when deletedAt is null', () => {
      const user = new User(createUserProps({ deletedAt: null }));

      expect(user.isDeleted).toBe(false);
    });

    it('should return true when deletedAt is set', () => {
      const user = new User(createUserProps({ deletedAt: new Date() }));

      expect(user.isDeleted).toBe(true);
    });
  });
});
