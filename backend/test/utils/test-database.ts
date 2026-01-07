import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { execSync } from 'child_process';

let container: StartedPostgreSqlContainer | null = null;
let connectionPool: pg.Pool | null = null;

export async function setupTestDatabase(): Promise<{
  prisma: PrismaClient;
  connectionString: string;
}> {
  if (!container) {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withReuse()
      .start();
  }

  const connectionString = container.getConnectionUri();

  // Run migrations
  execSync('pnpm prisma:preprocess', {
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  execSync(`npx prisma db push --url "${connectionString}"`, {
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  connectionPool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(connectionPool);
  const prisma = new PrismaClient({ adapter });

  return { prisma, connectionString };
}

export async function cleanupTestDatabase(prisma: PrismaClient): Promise<void> {
  // Delete all data in reverse order of dependencies
  await prisma.user.deleteMany();
}

export async function teardownTestDatabase(): Promise<void> {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
  }
  if (container) {
    await container.stop();
    container = null;
  }
}

export function createTestSchema(): string {
  // Generate a unique schema name for parallel test isolation
  const workerId = process.env.JEST_WORKER_ID || '1';
  const timestamp = Date.now();
  return `test_${workerId}_${timestamp}`;
}
