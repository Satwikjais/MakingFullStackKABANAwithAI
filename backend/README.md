# PM Backend

FastAPI backend for the Project Management Kanban application.

## Features

- User authentication
- Kanban board management
- Column and card CRUD operations
- SQLite database with SQLAlchemy ORM
- RESTful API endpoints

## Development

Install dependencies:
```bash
uv pip install -e .
```

Run tests:
```bash
python -m pytest
```

Run the server:
```bash
uvicorn main:app --reload
```