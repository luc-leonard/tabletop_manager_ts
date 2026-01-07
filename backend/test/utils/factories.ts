import { ProfileVisibility } from '../../src/modules/user/domain/profile-visibility.enum';
import { User, UserProps } from '../../src/modules/user/domain/user.entity';
import { CreateUserData } from '../../src/modules/user/domain/user.repository';

let counter = 0;

function uniqueId(): string {
  return `${Date.now()}-${++counter}`;
}

export function createUserProps(overrides: Partial<UserProps> = {}): UserProps {
  const id = uniqueId();
  return {
    id: overrides.id ?? `uuid-${id}`,
    email: overrides.email ?? `user-${id}@example.com`,
    username: overrides.username ?? `user${id}`,
    passwordHash: overrides.passwordHash ?? 'hashed_password',
    displayName: overrides.displayName ?? null,
    avatarUrl: overrides.avatarUrl ?? null,
    timezone: overrides.timezone ?? null,
    bio: overrides.bio ?? null,
    isActiveGm: overrides.isActiveGm ?? false,
    isAdmin: overrides.isAdmin ?? false,
    profileVisibility: overrides.profileVisibility ?? ProfileVisibility.PUBLIC,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
    deletedAt: overrides.deletedAt ?? null,
  };
}

export function createUser(overrides: Partial<UserProps> = {}): User {
  return new User(createUserProps(overrides));
}

export function createUserData(overrides: Partial<CreateUserData> = {}): CreateUserData {
  const id = uniqueId();
  return {
    email: overrides.email ?? `user-${id}@example.com`,
    username: overrides.username ?? `user${id}`,
    passwordHash: overrides.passwordHash ?? 'hashed_password',
    displayName: overrides.displayName,
    avatarUrl: overrides.avatarUrl,
    timezone: overrides.timezone,
    bio: overrides.bio,
    isActiveGm: overrides.isActiveGm,
    isAdmin: overrides.isAdmin,
  };
}
