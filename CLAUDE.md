# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tabletop Manager is a web application for tabletop RPG enthusiasts to schedule gaming sessions, manage campaigns, and create profile pages. Built with TypeScript, NestJS (backend), and React (frontend - not yet implemented).

## Repository Structure

```
├── backend/          # NestJS API server
├── frontend/         # React app (not yet implemented)
└── docs/             # Technical specifications
```

## Backend Commands

All backend commands run from the `backend/` directory:

```bash
cd backend

# Install dependencies
pnpm install

# Development
pnpm run start:dev     # Watch mode with hot reload
pnpm run start:debug   # Debug mode with watch

# Build & Production
pnpm run build         # Compile TypeScript
pnpm run start:prod    # Run production build

# Testing
pnpm run test          # Run unit tests
pnpm run test:watch    # Watch mode for tests
pnpm run test:cov      # Test coverage
pnpm run test:e2e      # End-to-end tests
pnpm run test -- --testPathPattern="users" # Run specific test file

# Code Quality
pnpm run lint          # ESLint with auto-fix
pnpm run format        # Prettier formatting
```

## Architecture

The planned architecture from `docs/technical_specifications.md`:

**Core Modules (to be implemented):**
- **Users** - Registration, authentication, dual-role support (Player/Game Master)
- **Campaigns** - Creation, management, discovery, application/invitation system
- **Sessions** - Scheduling, RSVP system, recurring sessions, calendar integration
- **Profiles** - Block-based WYSIWYG editor with drag-and-drop
- **Notifications** - Session reminders, campaign invites, messages

**Data Models:** User, Campaign, CampaignMembership, Session, SessionRSVP, ProfileBlock, Message, Notification

**Key Enums:**
- Profile visibility: `public`, `private`, `friends_only`
- Campaign status: `recruiting`, `ongoing`, `completed`, `on_hold`
- Experience level: `beginner`, `intermediate`, `advanced`, `mixed`
- Session status: `scheduled`, `completed`, `cancelled`
- RSVP response: `attending`, `maybe`, `declined`

## NestJS Conventions

- Use `nest generate` (or `nest g`) for scaffolding: `nest g module users`, `nest g service users`, `nest g controller users`
- Test files use `.spec.ts` suffix and live alongside source files
- E2E tests go in `backend/test` directory with `.e2e-spec.ts` suffix
