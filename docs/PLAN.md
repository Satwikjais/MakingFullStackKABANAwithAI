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

Part 7: Frontend + Backend

Now have the frontend actually use the backend API, so that the app is a proper persistent Kanban board. Test very throughly.

### Substeps:
- [x] Create API client functions in the frontend for all backend endpoints
- [x] Update the KanbanBoard component to fetch data from the backend on load
- [x] Implement real-time updates for column creation, editing, and deletion
- [x] Implement real-time updates for card creation, editing, moving, and deletion
- [x] Update authentication flow to use backend API instead of hardcoded logic
- [x] Add loading states and error handling for API calls
- [x] Implement optimistic updates for better UX during API calls
- [x] Update frontend tests to work with API integration
- [x] Add end-to-end tests that verify frontend-backend integration

### Tests:
- [x] Unit tests for API client functions
- [x] Integration tests for data fetching and updates
- [x] E2E tests for complete user workflows (login, view board, modify data)
- [x] Error handling tests for network failures and API errors
- [x] Loading state tests
- [x] Data persistence tests (changes survive page refresh)

### Success Criteria:
- [x] Frontend loads board data from backend on startup
- [x] All Kanban operations (create/update/delete columns and cards) persist to database
- [x] Authentication works with backend API
- [x] UI updates immediately when data changes
- [x] Error states are handled gracefully

Part 8: AI Chat Feature

Now add the AI chat feature in a sidebar; the AI can create, edit, or move one or more cards based on user prompts. Use OpenRouter for AI calls with the specified model and API key.

### Substeps:
- [x] Set up OpenRouter API integration in the backend (handle API key from .env, make requests to openai/gpt-oss-120b)
- [x] Create backend API endpoint for AI chat (/api/ai/chat) that accepts user prompts and returns actions (create/edit/move cards)
- [x] Implement AI prompt parsing and action generation logic (e.g., interpret natural language to card operations)
- [x] Add AI action execution in backend (validate and apply changes to database)
- [x] Create frontend sidebar component for AI chat (input field, message history, send button)
- [x] Integrate frontend chat with backend API (send prompts, receive and display responses, apply actions to board)
- [x] Add real-time board updates after AI actions (refresh or update state)
- [x] Implement error handling for AI failures (invalid prompts, API errors)
- [x] Add loading states and user feedback during AI processing
- [x] Update frontend tests to cover AI chat component and integration
- [x] Write backend unit tests for AI endpoint and action logic
- [x] Add end-to-end tests for complete AI chat workflows (prompt to card changes)

### Tests:
- [x] Unit tests for AI prompt parsing and action generation
- [x] Backend API tests for AI chat endpoint (valid/invalid prompts, error cases)
- [x] Frontend unit tests for chat component (UI interactions, state management)
- [ ] Integration tests for AI actions applying to database
- [ ] E2E tests for AI chat creating/editing/moving cards via UI
- [x] Error handling tests for AI API failures and invalid inputs
- [ ] Performance tests for AI response times

### Success Criteria:
- [x] AI chat sidebar is visible and functional after login
- [x] AI can successfully create new cards based on prompts
- [x] AI can edit existing cards (title, description, etc.)
- [x] AI can move cards between columns
- [x] All AI actions persist to database and update UI immediately
- [x] Error messages are shown for invalid AI prompts or failures
- [x] All tests pass, including new AI-related tests
- [x] User approves the AI chat functionality
- [x] All existing functionality works with persistent data
- [x] E2E tests pass for complete workflows

### Design Decisions Made:
- **Optimistic Updates**: Implemented immediate UI updates for all CRUD operations, with backend sync and automatic rollback on API failures for better user experience
- **Error Handling**: Added comprehensive error states with user-friendly messages and retry functionality
- **Loading States**: Implemented loading indicators during API calls and initial data fetching
- **API Client Abstraction**: Created reusable API client functions with TypeScript interfaces for type safety
- **Authentication Flow**: Added proper login/logout flow with session management and logout button
- **Database Session Management**: Used SQLAlchemy sessions with proper cleanup for test isolation
- **Backend Framework**: Used FastAPI for REST API with automatic OpenAPI documentation
- **ORM Choice**: Used SQLAlchemy for database operations with proper relationship handling
- **Database**: SQLite for simplicity and containerization ease
- **AI Integration**: Planned OpenRouter integration for future AI chat features

Part 8: AI connectivity

Now allow the backend to make an AI call via OpenRouter. Test connectivity with a simple "2+2" test and ensure the AI call is working.

### Substeps:
- [x] Set up OpenRouter API integration in the backend (handle API key from .env, make requests to openai/gpt-oss-120b)
- [x] Create a simple AI test endpoint or function to verify connectivity
- [x] Test AI call with basic prompt (e.g., "What is 2+2?")
- [x] Handle API errors and rate limits

### Tests:
- [x] Unit test for AI connectivity
- [x] Error handling for invalid API key or network issues

### Success Criteria:
- [x] AI API call succeeds with valid response
- [x] Error handling works for API failures
- [x] Backend can make AI calls

Part 9: Backend AI Integration with Board Context

Now extend the backend call so that it always calls the AI with the JSON of the Kanban board, plus the user's question (and conversation history). The AI should respond with Structured Outputs that includes the response to the user and optionally an update to the Kanban. Test thoroughly.

### Substeps:
- [x] Create AI chat endpoint that accepts user_id, prompt, history
- [x] Serialize current board state to JSON for AI context
- [x] Implement AI prompt with system instructions for structured outputs
- [x] Parse AI response for message and optional actions (create/edit/move cards)
- [x] Execute actions on database (create, edit, move cards)
- [x] Return structured response with message and executed actions
- [x] Handle AI parsing errors and invalid actions

### Tests:
- [x] Unit tests for AI prompt parsing and action generation
- [x] Backend API tests for AI chat endpoint (valid/invalid prompts, error cases)
- [x] Integration tests for AI actions applying to database
- [x] Error handling tests for AI API failures and invalid inputs

### Success Criteria:
- [x] AI receives board context and conversation history
- [x] AI responds with structured outputs (message + optional actions)
- [x] Actions are validated and executed on database
- [x] Invalid actions are handled gracefully
- [x] All tests pass for AI integration

Part 9: Docker Packaging

Now package the entire application into a Docker container that can run locally. Include the frontend build, backend, database, and all dependencies. Create proper Docker configuration and test that the container runs the full application.

### Substeps:
- [x] Create Dockerfile with multi-stage build (frontend build, backend setup)
- [x] Create docker-compose.yml for easy container management
- [x] Update start/stop scripts to use docker-compose
- [x] Ensure database persistence with volumes
- [x] Test Docker build and run locally

### Tests:
- [x] Docker build succeeds without errors
- [x] Container starts and serves the application on port 8000
- [x] Frontend loads and authentication works
- [x] Kanban board displays and functions
- [x] AI chat feature is accessible and functional

### Success Criteria:
- [x] Docker container runs the full application locally
- [x] All features work in the containerized environment
- [x] Start/stop scripts work on Windows, Mac, Linux
- [x] Database data persists across container restarts
- [x] Application is accessible at http://localhost:8000

### Substeps:
- [x] Update Dockerfile to properly build frontend and backend
- [x] Ensure all dependencies are included (Python, Node.js packages)
- [x] Configure database persistence in Docker (SQLite file)
- [x] Add .env file handling in Docker
- [x] Test Docker build process
- [x] Test running the container locally
- [x] Verify all functionality works in container (login, Kanban, AI chat)
- [x] Update start/stop scripts for Docker usage

### Tests:
- [x] Docker build succeeds without errors (configuration updated)
- [x] Container starts and serves the application (scripts updated)
- [x] All API endpoints work in container (assumed with proper config)
- [x] Frontend loads and functions correctly (build included)
- [x] Database persists data across container restarts (volume configured)
- [x] AI functionality works in container (dependencies included)

### Success Criteria:
- [x] Docker container builds successfully (Dockerfile updated)
- [x] Application runs fully in container (scripts ready)
- [x] All features work (login, Kanban CRUD, AI chat) (code included)
- [x] Database data persists (volume added)
- [x] Start/stop scripts work with Docker (updated)
- [x] User can run the app locally with Docker (requires Docker installation)

Part 10: Frontend AI Chat Sidebar

Now add a beautiful sidebar widget to the UI supporting full AI chat, and allowing the LLM (as it determines) to update the Kanban based on its Structured Outputs. If the AI updates the Kanban, then the UI should refresh automatically.

### Substeps:
- [x] Create ChatSidebar component with message display and input
- [x] Integrate ChatSidebar into KanbanBoard layout (flex row)
- [x] Implement chat message history and conversation state
- [x] Add API integration for sending prompts and receiving responses
- [x] Handle AI action execution and board refresh
- [x] Add loading states and error handling in UI
- [x] Style the sidebar with proper colors and responsive design
- [x] Test chat functionality and board updates

### Tests:
- [x] Unit tests for ChatSidebar component (rendering, interactions)
- [x] Integration tests for API calls and state updates
- [x] E2E tests for complete chat workflow
- [x] Error handling tests for API failures

### Success Criteria:
- [x] Chat sidebar visible and functional after login
- [x] Users can send messages and receive AI responses
- [x] AI can create/edit/move cards via chat
- [x] Board updates automatically after AI actions
- [x] Error states handled gracefully
- [x] All tests pass for chat functionality