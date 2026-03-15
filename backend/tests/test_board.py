import pytest

from database import seed_database


class TestBoard:
    """Test board endpoints"""

    def test_get_board_success(self, client, db_session):
        """Test getting the user's board"""
        seed_database(db_session)

        response = client.get("/api/board?user_id=1")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "board" in data

        board = data["board"]
        assert board["name"] == "My Project"
        assert "columns" in board
        assert len(board["columns"]) == 5  # Default columns

        # Check that columns have cards
        total_cards = sum(len(col["cards"]) for col in board["columns"])
        assert total_cards == 8  # Default cards

    def test_get_board_not_found(self, client, db_session):
        """Test getting board for non-existent user"""
        response = client.get("/api/board?user_id=999")

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Board not found"