import pytest

from database import seed_database


class TestCards:
    """Test card endpoints"""

    def test_create_card_success(self, client, db_session):
        """Test creating a new card"""
        seed_database(db_session)

        response = client.post("/api/cards", json={
            "column_id": 1,
            "title": "New Test Card",
            "details": "This is a test card",
            "position": 0
        })

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "card" in data

        card = data["card"]
        assert card["title"] == "New Test Card"
        assert card["details"] == "This is a test card"
        assert card["position"] == 0
        assert card["column_id"] == 1

    def test_create_card_invalid_column(self, client, db_session):
        """Test creating card with invalid column ID"""
        response = client.post("/api/cards", json={
            "column_id": 999,
            "title": "New Card",
            "details": "Test details",
            "position": 0
        })

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Column not found"

    def test_update_card_success(self, client, db_session):
        """Test updating a card"""
        seed_database(db_session)

        response = client.put("/api/cards/1", json={
            "title": "Updated Card Title",
            "details": "Updated card details",
            "position": 5
        })

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

        card = data["card"]
        assert card["title"] == "Updated Card Title"
        assert card["details"] == "Updated card details"
        assert card["position"] == 5

    def test_update_card_not_found(self, client, db_session):
        """Test updating non-existent card"""
        response = client.put("/api/cards/999", json={
            "title": "Updated Title"
        })

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Card not found"

    def test_move_card_success(self, client, db_session):
        """Test moving a card to different column/position"""
        seed_database(db_session)

        response = client.put("/api/cards/1/move?new_column_id=2&new_position=3")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

        card = data["card"]
        assert card["column_id"] == 2
        assert card["position"] == 3

    def test_move_card_invalid_card(self, client, db_session):
        """Test moving non-existent card"""
        response = client.put("/api/cards/999/move?new_column_id=1&new_position=0")

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Card not found"

    def test_move_card_invalid_column(self, client, db_session):
        """Test moving card to invalid column"""
        seed_database(db_session)

        response = client.put("/api/cards/1/move?new_column_id=999&new_position=0")

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Target column not found"

    def test_delete_card_success(self, client, db_session):
        """Test deleting a card"""
        seed_database(db_session)

        # Create a card first
        create_response = client.post("/api/cards", json={
            "column_id": 1,
            "title": "Card to Delete",
            "details": "Will be deleted",
            "position": 99
        })
        card_id = create_response.json()["card"]["id"]

        # Delete the card
        delete_response = client.delete(f"/api/cards/{card_id}")

        assert delete_response.status_code == 200
        data = delete_response.json()
        assert data["status"] == "success"
        assert data["message"] == "Card deleted successfully"

    def test_delete_card_not_found(self, client, db_session):
        """Test deleting non-existent card"""
        response = client.delete("/api/cards/999")

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Card not found"