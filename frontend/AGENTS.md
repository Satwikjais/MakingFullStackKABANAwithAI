# Frontend Code Description

## Overview
The frontend is a NextJS-based demo application for a Kanban board. It provides a visual interface for managing tasks across five fixed columns: Backlog, Discovery, In Progress, Review, and Done. The app supports drag-and-drop functionality for moving cards between columns, renaming columns, adding new cards, and deleting existing cards.

## Architecture
- **Framework**: NextJS 16.1.6 with React 19.2.3
- **Styling**: Tailwind CSS v4 for responsive design and custom color scheme (accent yellow #ecad0a, blue primary #209dd7, purple secondary #753991, dark navy #032147, gray text #888888)
- **Drag and Drop**: @dnd-kit/core, @dnd-kit/sortable, and @dnd-kit/utilities for smooth card movement
- **State Management**: React useState for local board state (no persistence yet)
- **Build Tool**: Vite for development and testing

## Key Components
- **KanbanBoard**: Main component that renders the entire board, handles drag events, and manages state updates
- **KanbanColumn**: Represents each column, displays cards, and provides UI for renaming and adding cards
- **KanbanCard**: Individual card component with title and details
- **KanbanCardPreview**: Drag overlay preview during card movement
- **NewCardForm**: Form for adding new cards to a column

## Data Structure
- **BoardData**: Contains columns array and cards record
- **Column**: id, title, cardIds array
- **Card**: id, title, details
- Initial data includes sample cards across the five columns

## Functionality
- Drag cards between columns or reorder within columns
- Rename columns inline
- Add new cards with title and details
- Delete cards
- Responsive grid layout (5 columns on large screens)

## Testing
- Unit tests: Vitest with @testing-library/react for component testing
- E2E tests: Playwright for full browser automation
- Test files: kanban.test.ts, KanbanBoard.test.tsx, kanban.spec.ts

## Current Limitations
- No backend integration (all data is in-memory)
- No user authentication
- No persistence (data resets on refresh)
- No AI chat feature yet
- Demo-only, not production-ready</content>
<parameter name="filePath">c:\Users\satwi\OneDrive\Desktop\LearningCodingAgents\pm\frontend\AGENTS.md