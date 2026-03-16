FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim

# Install uv
RUN pip install uv

# Set work directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build /app/frontend/out ./backend/static/

# Copy .env
COPY .env ./

# Install dependencies
RUN cd backend && uv sync

# Expose port
EXPOSE 8000

# Run the app
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]