import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PaginationDto,
  PaginatedResult,
} from '../../../shared/application/dto/pagination.dto';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userRepository.findByEmail(dto.email),
      this.userRepository.findByUsername(dto.username),
    ]);

    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    return this.userRepository.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
      displayName: dto.displayName,
      timezone: dto.timezone,
      bio: dto.bio,
      isActiveGm: dto.isActiveGm,
      isAdmin: dto.isAdmin,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<User>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const { data, total } = await this.userRepository.findAll({ page, limit });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(dto.email);
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.username && dto.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(
        dto.username,
      );
      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    return this.userRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    await this.userRepository.softDelete(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
