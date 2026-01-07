import {
  PaginationOptions,
  Paginated,
} from '../../../shared/application/dto/pagination.dto';
import { User } from './user.entity';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  timezone?: string | null;
  bio?: string | null;
  isActiveGm?: boolean;
  isAdmin?: boolean;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  passwordHash?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  timezone?: string | null;
  bio?: string | null;
  isActiveGm?: boolean;
  isAdmin?: boolean;
  profileVisibility?: string;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(pagination: PaginationOptions): Promise<Paginated<User>>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  softDelete(id: string): Promise<void>;
}
