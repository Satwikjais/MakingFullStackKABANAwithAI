# High level steps for project

Part 1: Plan

Enrich this document to plan out each of these parts in detail, with substeps listed out as a checklist to be checked off by the agent, and with tests and success critieria for each. Also create an AGENTS.md file inside the frontend directory that describes the existing code there. Ensure the user checks and approves the plan.

Part 2: Scaffolding

Set up the Docker infrastructure, the backend in backend/ with FastAPI, and write the start and stop scripts in the scripts/ directory. This should serve example static HTML to confirm that a 'hello world' example works running locally and also make an API call.

Part 3: Add in Frontend

Now update so that the frontend is statically built and served, so that the app has the demo Kanban board displayed at /. Comprehensive unit and integration tests.

Part 4: Add in a fake user sign in experience

Now update so that on first hitting /, you need to log in with dummy credentials ("user", "password") in order to see the Kanban, and you can log out. Comprehensive tests.

Part 5: Database modeling

Now propose a database schema for the Kanban, saving it as JSON. Document the database approach in docs/ and get user sign off.

### Substeps:
- [x] Analyze the current Kanban data structure from the frontend components
- [x] Design database schema with tables for users, boards, columns, and cards
- [x] Define relationships between entities (user has many boards, board has many columns, column has many cards)
- [x] Create JSON schema file documenting the database structure
- [x] Document the SQLite database approach and migration strategy
- [x] Create database documentation in docs/DATABASE.md

### Tests:
- [x] Validate JSON schema is valid JSON
- [x] Ensure schema covers all current Kanban functionality
- [x] Verify relationships are properly defined

### Success Criteria:
- [x] JSON schema file exists and is well-documented
- [x] Database documentation explains the approach clearly
- [x] Schema supports current features and future extensibility
- [x] User approves the database design

Part 6: Backend

Now add API routes to allow the backend to read and change the Kanban for a given user; test this thoroughly with backend unit tests. The database should be created if it doesn't exist.

### Substeps:
- [x] Set up SQLite database connection and initialization in backend
- [x] Create database models/tables based on the schema (users, boards, columns, cards)
- [x] Implement user authentication API endpoints (login/logout with database)
- [x] Create Kanban board API endpoints (GET board, create/update columns, create/update/move cards)
- [x] Add database seeding with initial data for the dummy user
- [x] Implement proper error handling and validation
- [x] Write comprehensive backend unit tests for all API endpoints
- [x] Test database creation and migration on startup

### Tests:
- [x] Unit tests for database operations (CRUD for all entities)
- [x] API endpoint tests for authentication
- [x] API endpoint tests for Kanban operations (get board, modify columns/cards)
- [x] Database initialization and seeding tests
- [x] Error handling and validation tests
- [x] Integration tests for full user workflows

### Success Criteria:
- [x] All API endpoints return correct data structures
- [x] Database is created automatically on first run
- [x] Authentication works with database-backed users
- [x] Kanban operations persist data correctly
- [x] All backend unit tests pass
- [x] API responses match frontend expectations

### Substeps:
- [ ] Set up SQLite database connection and initialization in backend
- [ ] Create database models/tables based on the schema (users, boards, columns, cards)
- [ ] Implement user authentication API endpoints (login/logout with database)
- [ ] Create Kanban board API endpoints (GET board, create/update columns, create/update/move cards)
- [ ] Add database seeding with initial data for the dummy user
- [ ] Implement proper error handling and validation
- [ ] Write comprehensive backend unit tests for all API endpoints
- [ ] Test database creation and migration on startup

### Tests:
- [ ] Unit tests for database operations (CRUD for all entities)
- [ ] API endpoint tests for authentication
- [ ] API endpoint tests for Kanban operations (get board, modify columns/cards)
- [ ] Database initialization and seeding tests
- [ ] Error handling and validation tests
- [ ] Integration tests for full user workflows

### Success Criteria:
- [ ] All API endpoints return correct data structures
- [ ] Database is created automatically on first run
- [ ] Authentication works with database-backed users
- [ ] Kanban operations persist data correctly
- [ ] All backend unit tests pass
- [ ] API responses match frontend expectations

Part 7: Frontend + Backend

Now have the frontend actually use the backend API, so that the app is a proper persistent Kanban board. Test very throughly.

Part 8: AI connectivity

Now allow the backend to make an AI call via OpenRouter. Test connectivity with a simple "2+2" test and ensure the AI call is working.

Part 9: Now extend the backend call so that it always calls the AI with the JSON of the Kanban board, plus the user's question (and conversation history). The AI should respond with Structured Outputs that includes the response to the user and optionaly an update to the Kanban. Test thoroughly.

Part 10: Now add a beautiful sidebar widget to the UI supporting full AI chat, and allowing the LLM (as it determines) to update the Kanban based on its Structured Outputs. If the AI updates the Kanban, then the UI should refresh automatically.