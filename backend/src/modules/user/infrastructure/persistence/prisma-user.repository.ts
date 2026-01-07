import { Injectable } from '@nestjs/common';
import { ProfileVisibility as PrismaProfileVisibility } from '@prisma/client';
import {
  PaginationOptions,
  Paginated,
} from '../../../../shared/application/dto/pagination.dto';
import { PrismaClientService } from '../../../../shared/prisma-client';
import { User } from '../../domain/user.entity';
import {
  UserRepository,
  CreateUserData,
  UpdateUserData,
} from '../../domain/user.repository';
import { UserMapper } from './user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  private readonly mapper = new UserMapper();

  constructor(private readonly prisma: PrismaClientService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
    return user ? this.mapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
    return user ? this.mapper.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username, deletedAt: null },
    });
    return user ? this.mapper.toDomain(user) : null;
  }

  async findAll(pagination: PaginationOptions): Promise<Paginated<User>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { deletedAt: null },
      }),
    ]);

    return {
      data: users.map((user) => this.mapper.toDomain(user)),
      total,
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        displayName: data.displayName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        timezone: data.timezone ?? null,
        bio: data.bio ?? null,
        isActiveGm: data.isActiveGm ?? false,
        isAdmin: data.isAdmin ?? false,
      },
    });
    return this.mapper.toDomain(user);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.username !== undefined && { username: data.username }),
        ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.isActiveGm !== undefined && { isActiveGm: data.isActiveGm }),
        ...(data.isAdmin !== undefined && { isAdmin: data.isAdmin }),
        ...(data.profileVisibility !== undefined && {
          profileVisibility: data.profileVisibility as PrismaProfileVisibility,
        }),
      },
    });
    return this.mapper.toDomain(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
