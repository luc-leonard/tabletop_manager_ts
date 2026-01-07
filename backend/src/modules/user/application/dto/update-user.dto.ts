import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProfileVisibility } from '../../domain/profile-visibility.enum';

export const UpdateUserSchema = z.object({
  email: z.email().optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        'Username can only contain letters, numbers, underscores, and hyphens',
    })
    .optional(),
  displayName: z.string().max(100).nullable().optional(),
  avatarUrl: z.url().nullable().optional(),
  timezone: z.string().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  isActiveGm: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  profileVisibility: z.nativeEnum(ProfileVisibility).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
