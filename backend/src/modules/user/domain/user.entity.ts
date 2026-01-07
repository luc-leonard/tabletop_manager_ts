import { BaseEntity } from '../../../shared/domain/base.entity';
import { ProfileVisibility } from './profile-visibility.enum';

export interface UserProps {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  displayName: string | null;
  avatarUrl: string | null;
  timezone: string | null;
  bio: string | null;
  isActiveGm: boolean;
  isAdmin: boolean;
  profileVisibility: ProfileVisibility;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class User extends BaseEntity {
  readonly email: string;
  readonly username: string;
  readonly passwordHash: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly timezone: string | null;
  readonly bio: string | null;
  readonly isActiveGm: boolean;
  readonly isAdmin: boolean;
  readonly profileVisibility: ProfileVisibility;

  constructor(props: UserProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
    this.email = props.email;
    this.username = props.username;
    this.passwordHash = props.passwordHash;
    this.displayName = props.displayName;
    this.avatarUrl = props.avatarUrl;
    this.timezone = props.timezone;
    this.bio = props.bio;
    this.isActiveGm = props.isActiveGm;
    this.isAdmin = props.isAdmin;
    this.profileVisibility = props.profileVisibility;
  }
}
