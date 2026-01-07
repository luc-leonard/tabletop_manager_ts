import {
  User as PrismaUser,
  ProfileVisibility as PrismaProfileVisibility,
} from '@prisma/client';
import { Mapper } from '../../../../shared/infrastructure/mapper.base';
import { User } from '../../domain/user.entity';
import { ProfileVisibility } from '../../domain/profile-visibility.enum';

export class UserMapper extends Mapper<User, PrismaUser> {
  toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      username: prismaUser.username,
      passwordHash: prismaUser.passwordHash,
      displayName: prismaUser.displayName,
      avatarUrl: prismaUser.avatarUrl,
      timezone: prismaUser.timezone,
      bio: prismaUser.bio,
      isActiveGm: prismaUser.isActiveGm,
      isAdmin: prismaUser.isAdmin,
      profileVisibility:
        ProfileVisibility[
          prismaUser.profileVisibility as keyof typeof ProfileVisibility
        ],
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt,
    });
  }

  toAggregate(user: User): PrismaUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      bio: user.bio,
      isActiveGm: user.isActiveGm,
      isAdmin: user.isAdmin,
      profileVisibility:
        user.profileVisibility as unknown as PrismaProfileVisibility,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
