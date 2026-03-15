# Database Design Document

## Overview

This document describes the database design for the Project Management Kanban application. The application uses SQLite as the database engine for simplicity and ease of deployment.

## Database Technology Choice

**SQLite** was chosen for the following reasons:
- **Simplicity**: No separate database server required, single file database
- **Reliability**: ACID compliant, widely used and tested
- **Performance**: Excellent for read-heavy applications like Kanban boards
- **Deployment**: Easy to containerize and deploy with the application
- **Development**: No complex setup required for development environment

## Schema Design

The database follows a normalized relational design with the following entities:

### Users Table
- Stores user account information
- Supports future multi-user functionality
- Currently seeded with dummy user ("user", "password")

### Boards Table
- Represents Kanban boards
- Each user can have multiple boards (future extensibility)
- MVP supports 1 board per user as specified

### Columns Table
- Represents columns within a board (Backlog, In Progress, Done, etc.)
- Ordered by position for consistent display
- Can be renamed by users

### Cards Table
- Represents individual tasks/cards
- Contains title and details
- Ordered by position within columns
- Supports drag-and-drop reordering

## Relationships

```
Users (1) ──── (N) Boards (1) ──── (N) Columns (1) ──── (N) Cards
```

- **Users → Boards**: One-to-many (user can have multiple boards)
- **Boards → Columns**: One-to-many (board contains multiple columns)
- **Columns → Cards**: One-to-many (column contains multiple cards)

## Key Design Decisions

### Position-based Ordering
- Columns and cards use integer `position` fields for ordering
- Allows efficient reordering operations
- Supports drag-and-drop functionality

### Timestamps
- All tables include `created_at` and `updated_at` timestamps
- Enables audit trails and future features like activity feeds

### String Length Limits
- Reasonable limits on text fields (username: 50, title: 100/200, details: unlimited)
- Prevents abuse while supporting typical use cases

## Indexes

Strategic indexes are defined for:
- Username uniqueness and login performance
- Foreign key relationships for JOIN operations
- Position-based ordering within boards and columns
- Efficient querying of user's boards and board contents

## Migration Strategy

For future schema changes:
1. Versioned migration scripts in `/backend/migrations/`
2. Automatic migration on application startup
3. Backward compatibility where possible
4. Data preservation during upgrades

## Performance Considerations

- SQLite performs well for typical Kanban board sizes (< 1000 cards)
- Indexes optimize common query patterns
- Connection pooling not needed (single-writer model)
- Read operations are fast due to normalized design

## Future Extensibility

The schema supports future features:
- Multiple boards per user
- Card attachments, comments, due dates
- Team collaboration features
- Advanced filtering and search
- Board templates and sharing

## Data Integrity

- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate usernames
- NOT NULL constraints on required fields
- Transaction support for multi-table operations

## Backup and Recovery

- SQLite database file can be easily backed up
- Point-in-time recovery possible with WAL mode
- Export/import functionality for data migration