# Technical Specifications - Tabletop RPG Session Manager

## 1. Project Overview

**Project Name:** Tabletop Manager

**Description:** A web application built with Typescript, nestJS and React that enables tabletop RPG enthusiasts to schedule gaming sessions, manage campaigns, and create personalized profile pages.

**Target Users:**
- Players seeking campaigns and gaming sessions
- Game Masters organizing and running campaigns
- Hybrid users who both play and run games

---

## 2. Core Features

### 2.1 User Management
- User registration and authentication
- Dual-role support (Player and Game Master roles are not mutually exclusive)
- User profile with customizable block-based WYSIWYG editor (MySpace-style)
- Profile visibility settings (public/private/friends-only)

### 2.2 Campaign Management
- Game Masters can create and manage campaigns
- Campaign details:
  - Title and description
  - Game system (D&D 5e, Pathfinder, Call of Cthulhu, etc.)
  - Setting/world information
  - Player capacity (min/max players)
  - Experience level required
  - Campaign status (recruiting, ongoing, completed, on-hold)
  - Tags for searchability
- Campaign discovery and search for players
- Application/invitation system for joining campaigns

### 2.3 Session Scheduling
- Game Masters can create sessions for their campaigns
- Session details:
  - Date and time
  - Duration
  - Location (physical address or virtual link)
  - Session notes/agenda
  - Recurring session support
- Player RSVP system (attending/maybe/declined)
- Calendar integration
- Notification system for upcoming sessions
- Session history and notes

### 2.4 Profile Pages (WYSIWYG Block System)
- Drag-and-drop block-based editor
- Block types:
  - Text blocks (rich text)
  - Image blocks
  - Character showcase blocks
  - Favorite games/systems blocks
  - Social links blocks
  - Custom HTML/embed blocks
  - Stats/achievements blocks
- Customizable themes and layouts
- Public profile URLs (e.g., /profile/username)

### 2.5 Discovery & Search
- Browse campaigns by:
  - Game system
  - Experience level
  - Location/virtual
  - Availability
  - Tags
- Search users/profiles
- Filtering and sorting options

### 2.6 Communication
- Campaign-specific messaging/chat
- Direct messaging between users
- Session announcements and updates
- Notification preferences

---

## 3. User Roles & Permissions

### 3.1 Guest (Unauthenticated)
- View public campaigns
- View public profiles
- Browse game systems and tags
- Access landing/marketing pages

### 3.2 Player
- All guest permissions
- Create and manage profile
- Search and apply for campaigns
- RSVP to sessions
- View campaign details they're part of
- Send and receive messages

### 3.3 Game Master
- All player permissions
- Create and manage campaigns
- Schedule sessions
- Manage campaign roster (accept/reject applications)
- Send campaign announcements
- View player profiles and availability

### 3.4 Admin (Future)
- User management
- Content moderation
- System configuration
- Analytics

---

## 4. Data Models

### 4.1 User
```
- id (UUID)
- email (unique)
- username (unique)
- password_hash
- display_name
- avatar_url
- timezone
- bio
- is_active_player (boolean)
- is_active_gm (boolean)
- profile_visibility (enum: public, private, friends_only)
- notification_preferences (jsonb)
- inserted_at
- updated_at
```

### 4.2 Campaign
```
- id (UUID)
- game_master_id (FK -> users)
- title
- description
- game_system
- setting_info
- min_players
- max_players
- current_player_count
- experience_level (enum: beginner, intermediate, advanced, mixed)
- status (enum: recruiting, ongoing, completed, on_hold)
- location_type (enum: in_person, virtual, hybrid)
- location_details
- tags (array)
- image_url
- is_public (boolean)
- inserted_at
- updated_at
```

### 4.3 CampaignMembership
```
- id (UUID)
- campaign_id (FK -> campaigns)
- user_id (FK -> users)
- role (enum: player, co_gm)
- status (enum: invited, applied, active, declined, removed)
- character_name
- character_info
- joined_at
- inserted_at
- updated_at
```

### 4.4 Session
```
- id (UUID)
- campaign_id (FK -> campaigns)
- title
- description
- scheduled_at
- duration_minutes
- location_type (enum: in_person, virtual, hybrid)
- location_details
- virtual_link
- max_attendees
- status (enum: scheduled, completed, cancelled)
- is_recurring (boolean)
- recurrence_pattern (jsonb)
- notes
- inserted_at
- updated_at
```

### 4.5 SessionRSVP
```
- id (UUID)
- session_id (FK -> sessions)
- user_id (FK -> users)
- response (enum: attending, maybe, declined)
- notes
- inserted_at
- updated_at
```

### 4.6 ProfileBlock
```
- id (UUID)
- user_id (FK -> users)
- block_type (enum: text, image, character, games, links, embed, stats)
- content (jsonb)
- position (integer)
- styling (jsonb)
- is_visible (boolean)
- inserted_at
- updated_at
```

### 4.7 Message (Future)
```
- id (UUID)
- sender_id (FK -> users)
- recipient_id (FK -> users) [nullable for campaign messages]
- campaign_id (FK -> campaigns) [nullable for DMs]
- content
- is_read (boolean)
- inserted_at
- updated_at
```

### 4.8 Notification
```
- id (UUID)
- user_id (FK -> users)
- type (enum: session_reminder, campaign_invite, new_application, message, etc.)
- title
- content
- link_url
- is_read (boolean)
- inserted_at
- updated_at
```

---

## 5. Technology Stack

### 5.1 Backend
- **Language:** Elixir 1.15+
- **Framework:** Phoenix 1.7+
- **Real-time:** Phoenix LiveView
- **Database:** PostgreSQL 15+
- **Authentication:** Phx.Gen.Auth or Pow
- **File Storage:** Local (dev) / S3-compatible (prod)

### 5.2 Frontend
- **Primary:** Phoenix LiveView
- **Styling:** TailwindCSS
- **Components:** Phoenix LiveView Components
- **WYSIWYG Editor:**
  - Tiptap or ProseMirror for rich text
  - Custom drag-and-drop with Phoenix LiveView hooks
- **Icons:** Heroicons
- **Drag & Drop:** SortableJS with LiveView hooks

### 5.3 Infrastructure
- **Deployment:** Fly.io / Gigalixir / Render
- **Database:** Managed PostgreSQL
- **File Storage:** S3 or compatible
- **Email:** SendGrid / Postmark
- **Monitoring:** AppSignal / Honeybadger

### 5.4 Development Tools
- **Testing:** ExUnit, Wallaby (E2E)
- **Code Quality:** Credo, Dialyzer
- **Formatting:** mix format
- **Database:** Ecto migrations

---

## 6. Key Technical Features

### 6.1 Real-time Updates
- LiveView for reactive UI
- PubSub for campaign/session updates
- Presence for online users
- Live notifications

### 6.2 Search & Discovery
- PostgreSQL full-text search
- Indexed queries for performance
- Faceted search with filters

### 6.3 Calendar & Scheduling
- Timezone-aware scheduling
- iCal export support
- Recurring event patterns
- Conflict detection

### 6.4 WYSIWYG Profile Builder
- Block-based architecture
- Drag-and-drop reordering
- Live preview
- JSON-based content storage
- Template system for quick setup

### 6.5 Security
- CSRF protection (Phoenix default)
- SQL injection prevention (Ecto parameterized queries)
- XSS prevention (Phoenix HTML escaping)
- Password hashing (bcrypt/argon2)
- Rate limiting
- Content Security Policy headers
- Input validation and sanitization

---

## 7. User Workflows

### 7.1 Player Journey
1. Register account and complete profile
2. Customize profile page with blocks
3. Browse available campaigns
4. Apply to join campaign
5. Wait for GM approval
6. RSVP to scheduled sessions
7. Receive notifications for updates

### 7.2 Game Master Journey
1. Register account and complete profile
2. Create new campaign with details
3. Publish campaign for recruitment
4. Review player applications
5. Accept players to fill roster
6. Schedule gaming sessions
7. Manage session details and send updates
8. Track attendance and session history

### 7.3 Profile Customization
1. Navigate to profile editor
2. Add/remove blocks via sidebar
3. Drag blocks to reorder
4. Configure block content and styling
5. Preview changes live
6. Publish profile

---

## 8. Phase 1 Implementation Priorities

### Phase 1 (MVP)
- User registration and authentication
- Basic profile pages (non-WYSIWYG initially)
- Campaign creation and management
- Simple session scheduling
- Campaign discovery and joining
- Basic notifications

### Phase 2
- WYSIWYG profile builder
- Advanced search and filters
- Calendar integration
- Messaging system
- Recurring sessions

### Phase 3
- Social features (friends, followers)
- Character management
- Session notes and wiki
- API for third-party integrations
- Mobile optimization

---

## 9. Database Indexes

Key indexes for performance:
- `campaigns.game_master_id`
- `campaigns.status, campaigns.is_public`
- `campaign_memberships.user_id, campaign_memberships.campaign_id`
- `sessions.campaign_id, sessions.scheduled_at`
- `session_rsvps.session_id, session_rsvps.user_id`
- `profile_blocks.user_id, profile_blocks.position`
- `notifications.user_id, notifications.is_read`
- Full-text search indexes on `campaigns.title, campaigns.description`

---

## 10. API Considerations (Future)

While Phase 1 is LiveView-only, consider:
- RESTful API for mobile apps
- GraphQL for flexible querying
- Webhook support for integrations
- OAuth for third-party apps

---

## 11. Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast requirements
- Focus indicators
- Semantic HTML

---

## 12. Performance Targets

- Page load: < 2s (P95)
- LiveView latency: < 100ms (P95)
- Database queries: < 50ms (P95)
- Support 10,000+ concurrent users
- 99.9% uptime SLA

---

## 13. Open Questions

1. Should campaigns support multiple GMs (co-GM feature)?
2. Do we need a built-in video chat integration or rely on external tools?
3. Should we support multiple character profiles per user per campaign?
4. What's the moderation strategy for user-generated content?
5. Do we need campaign/session privacy beyond public/private?
6. Should profiles have a "looking for group" status?
7. Integration with virtual tabletop platforms (Roll20, Foundry VTT)?

---

## 14. Success Metrics

- User registrations
- Active campaigns
- Sessions scheduled per week
- Player-to-GM ratio
- Session attendance rate
- User retention (30-day, 90-day)
- Profile customization adoption rate
- Campaign fill rate (how quickly campaigns reach capacity)
