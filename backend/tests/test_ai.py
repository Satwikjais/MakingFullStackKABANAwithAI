import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from main import app
from database import get_db, init_database
from schemas import AIChatRequest, ChatMessage

# Initialize test database
init_database()

client = TestClient(app)

def test_ai_chat_endpoint():
    """Test the AI chat endpoint structure"""
    # Test with valid request structure
    request_data = {
        "user_id": 1,
        "prompt": "Create a new card called 'Test Task'",
        "history": []
    }
    
    response = client.post("/api/ai/chat", json=request_data)
    
    # Should return 200 even if AI fails (due to empty API key)
    assert response.status_code == 200
    
    data = response.json()
    assert "message" in data
    assert "actions" in data
    assert data["status"] == "success"
    assert isinstance(data["actions"], list)

def test_ai_chat_with_history():
    """Test AI chat with conversation history"""
    request_data = {
        "user_id": 1,
        "prompt": "Move that card to Done",
        "history": [
            {"role": "user", "content": "Create a card"},
            {"role": "assistant", "content": "Created a card for you."}
        ]
    }
    
    response = client.post("/api/ai/chat", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "message" in data
    assert "actions" in data

def test_ai_chat_invalid_user():
    """Test AI chat with non-existent user"""
    request_data = {
        "user_id": 999,
        "prompt": "Hello",
        "history": []
    }
    
    response = client.post("/api/ai/chat", json=request_data)
    assert response.status_code == 404
    assert "Board not found" in response.json()["detail"]