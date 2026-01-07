import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { setupTestDatabase, cleanupTestDatabase, teardownTestDatabase } from '../utils/test-database';
import { UserModule } from '../../src/modules/user/user.module';
import { PrismaClientModule, PrismaClientService } from '../../src/shared/prisma-client';
import { ProfileVisibility } from '../../src/modules/user/domain/profile-visibility.enum';

describe('User Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const { prisma: testPrisma } = await setupTestDatabase();
    prisma = testPrisma;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, PrismaClientModule],
    })
      .overrideProvider(PrismaClientService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestDatabase(prisma);
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toMatchObject({
        email: createUserDto.email,
        username: createUserDto.username,
        displayName: createUserDto.displayName,
        isActiveGm: false,
        isAdmin: false,
        profileVisibility: ProfileVisibility.PUBLIC,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should return 409 when email already exists', async () => {
      const createUserDto = {
        email: 'duplicate@example.com',
        username: 'user1',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .send({ ...createUserDto, username: 'user2' })
        .expect(409);
    });

    it('should return 409 when username already exists', async () => {
      const createUserDto = {
        email: 'user1@example.com',
        username: 'duplicateuser',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .send({ ...createUserDto, email: 'user2@example.com' })
        .expect(409);
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          username: 'testuser',
          password: 'password123',
        })
        .expect(400);
    });

    it('should validate username format', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          username: 'ab',
          password: 'password123',
        })
        .expect(400);
    });

    it('should validate password minimum length', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'short',
        })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return paginated users', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/users')
          .send({
            email: `user${i}@example.com`,
            username: `user${i}`,
            password: 'password123',
          });
      }

      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, limit: 3 })
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta).toEqual({
        total: 5,
        page: 1,
        limit: 3,
        totalPages: 2,
      });
    });

    it('should return second page of users', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/users')
          .send({
            email: `user${i}@example.com`,
            username: `user${i}`,
            password: 'password123',
          });
      }

      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ page: 2, limit: 3 })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.page).toBe(2);
    });

    it('should use default pagination values', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(20);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          displayName: 'Test User',
        });

      const userId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.username).toBe('testuser');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user fields', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          displayName: 'Updated Name',
          bio: 'Updated bio',
        })
        .expect(200);

      expect(response.body.displayName).toBe('Updated Name');
      expect(response.body.bio).toBe('Updated bio');
    });

    it('should update email when unique', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'original@example.com',
          username: 'testuser',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ email: 'new@example.com' })
        .expect(200);

      expect(response.body.email).toBe('new@example.com');
    });

    it('should return 409 when updating to existing email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'existing@example.com',
          username: 'user1',
          password: 'password123',
        });

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'user2@example.com',
          username: 'user2',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ email: 'existing@example.com' })
        .expect(409);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .patch('/users/00000000-0000-0000-0000-000000000000')
        .send({ displayName: 'New Name' })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should not return soft-deleted users in list', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);

      const listResponse = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(listResponse.body.data).toHaveLength(0);
      expect(listResponse.body.meta.total).toBe(0);
    });
  });

  describe('Data Persistence', () => {
    it('should persist user data correctly', async () => {
      const createUserDto = {
        email: 'persist@example.com',
        username: 'persistuser',
        password: 'password123',
        displayName: 'Persist User',
        timezone: 'America/New_York',
        bio: 'A persistent user',
        isActiveGm: true,
        isAdmin: false,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const userId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        email: createUserDto.email,
        username: createUserDto.username,
        displayName: createUserDto.displayName,
        timezone: createUserDto.timezone,
        bio: createUserDto.bio,
        isActiveGm: true,
        isAdmin: false,
      });
    });

    it('should hash passwords', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'hash@example.com',
          username: 'hashuser',
          password: 'plaintext123',
        })
        .expect(201);

      const userId = createResponse.body.id;

      const dbUser = await prisma.user.findUnique({ where: { id: userId } });

      expect(dbUser?.passwordHash).not.toBe('plaintext123');
      expect(dbUser?.passwordHash).toMatch(/^\$2[ab]\$/);
    });
  });
});
