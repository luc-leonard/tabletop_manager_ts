# Tabletop Manager Backend

A NestJS backend for managing tabletop RPG sessions.

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 16+
- Docker (for running tests)

## Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate
```

## Development

```bash
# Start development server
pnpm start:dev

# Run unit tests
pnpm test

# Run integration tests (requires Docker)
pnpm test:integration
```

## Project Structure

```
src/
├── modules/                    # Feature modules
│   └── user/
│       ├── application/        # Use cases & DTOs
│       ├── domain/             # Entities & repository interfaces
│       ├── infrastructure/     # Repository implementations
│       └── presentation/       # Controllers
└── shared/
    ├── prisma-client/          # Prisma configuration & service
    ├── application/            # Shared DTOs
    ├── domain/                 # Base entities
    └── infrastructure/         # Base mappers
```
