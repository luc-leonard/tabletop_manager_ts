import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        'Username can only contain letters, numbers, underscores, and hyphens',
    }),
  password: z.string().min(8).max(100),
  displayName: z.string().max(100).optional(),
  timezone: z.string().optional(),
  bio: z.string().max(500).optional(),
  isActiveGm: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
