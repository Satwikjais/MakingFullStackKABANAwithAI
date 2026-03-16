import os
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
)

SYSTEM_PROMPT = """
You are an AI assistant for a Kanban board project management app. Help users manage their tasks by creating, editing, or moving cards on the board.

The board has columns and cards. You can perform these actions:
- create_card: Create a new card in a specified column
- edit_card: Edit an existing card's title or details
- move_card: Move a card to a different column or position

When responding, provide a JSON object with:
- "message": Your conversational response to the user
- "actions": Optional array of actions to perform (only if the user requests changes)

Action formats:
- {"type": "create_card", "column_id": int, "title": str, "details": str (optional), "position": int (optional, defaults to end)}
- {"type": "edit_card", "card_id": int, "title": str (optional), "details": str (optional)}
- {"type": "move_card", "card_id": int, "new_column_id": int, "new_position": int (optional, defaults to end of column)}

Only include actions if the user explicitly asks to create, edit, or move cards. Be helpful and confirm actions in your message.
"""

def call_ai(board_data: Dict[str, Any], prompt: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Call OpenRouter AI with board context and user prompt.
    
    Args:
        board_data: Current board state (columns and cards)
        prompt: User's current message
        history: Previous conversation history
    
    Returns:
        Dict with 'message' and optional 'actions'
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + f"\n\nCurrent board state: {json.dumps(board_data)}"},
    ]
    
    # Add history
    messages.extend(history)
    
    # Add current prompt
    messages.append({"role": "user", "content": prompt})
    
    if not OPENROUTER_API_KEY:
        return {
            "message": "AI chat is not available because OPENROUTER_API_KEY is not set. Please set it in your .env file or environment variables.",
            "actions": [],
        }

    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Try to parse as JSON
        try:
            result = json.loads(content)
            if "message" not in result:
                result = {"message": content, "actions": []}
        except json.JSONDecodeError:
            # If not JSON, treat as plain message
            result = {"message": content, "actions": []}
        
        return result
    except Exception as e:
        error_msg = str(e)
        if "connection" in error_msg.lower() or "timeout" in error_msg.lower():
            return {"message": "Sorry, I couldn't connect to the AI service. Please check your internet connection and try again.", "actions": []}
        elif "authentication" in error_msg.lower() or "unauthorized" in error_msg.lower():
            return {"message": "Sorry, there seems to be an issue with the API key. Please check that your OPENROUTER_API_KEY is valid.", "actions": []}
        else:
            return {"message": f"Sorry, I encountered an error: {error_msg}", "actions": []}