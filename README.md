# Project Management MVP

A Kanban board application with AI chat feature.

## Features

- User authentication (username: "user", password: "password")
- Kanban board with drag-and-drop cards
- AI chat sidebar for creating/editing/moving cards
- Persistent data with SQLite database

## Running Locally

### Prerequisites

- Docker and Docker Compose
- Node.js (for building frontend, if not using Docker)

### Using Docker (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and set your `OPENROUTER_API_KEY` (required for AI chat)
3. Run the start script:
   - Windows: `scripts\start.bat`
   - Mac/Linux: `scripts/start.sh`
4. Open http://localhost:8000
5. Log in with username "user" and password "password"
6. The Kanban board with AI chat sidebar will appear

### Manual Setup

1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. Copy frontend build to backend:
   ```bash
   xcopy frontend\out backend\static /e /y
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   uv sync
   ```

4. Run the backend:
   ```bash
   uv run uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Testing

Run tests:
```bash
cd frontend
npm run test:all
```

## Architecture

- Frontend: Next.js with React, Tailwind CSS
- Backend: FastAPI with SQLAlchemy, SQLite
- AI: OpenRouter API
- Container: Docker