import pytest

from database import seed_database


class TestColumns:
    """Test column endpoints"""

    def test_create_column_success(self, client, db_session):
        """Test creating a new column"""
        seed_database(db_session)

        response = client.post("/api/columns", json={
            "board_id": 1,
            "title": "New Column",
            "position": 5
        })

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "column" in data

        column = data["column"]
        assert column["title"] == "New Column"
        assert column["position"] == 5
        assert column["board_id"] == 1

    def test_create_column_invalid_board(self, client, db_session):
        """Test creating column with invalid board ID"""
        response = client.post("/api/columns", json={
            "board_id": 999,
            "title": "New Column",
            "position": 5
        })

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Board not found"

    def test_update_column_success(self, client, db_session):
        """Test updating a column"""
        seed_database(db_session)

        response = client.put("/api/columns/1", json={
            "title": "Updated Backlog",
            "position": 10
        })

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

        column = data["column"]
        assert column["title"] == "Updated Backlog"
        assert column["position"] == 10

    def test_update_column_not_found(self, client, db_session):
        """Test updating non-existent column"""
        response = client.put("/api/columns/999", json={
            "title": "Updated Column"
        })

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Column not found"

    def test_delete_column_success(self, client, db_session):
        """Test deleting a column"""
        seed_database(db_session)

        # First create a new column to delete
        create_response = client.post("/api/columns", json={
            "board_id": 1,
            "title": "Column to Delete",
            "position": 99
        })
        column_id = create_response.json()["column"]["id"]

        # Now delete it
        delete_response = client.delete(f"/api/columns/{column_id}")

        assert delete_response.status_code == 200
        data = delete_response.json()
        assert data["status"] == "success"
        assert data["message"] == "Column deleted successfully"

    def test_delete_column_not_found(self, client, db_session):
        """Test deleting non-existent column"""
        response = client.delete("/api/columns/999")

        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Column not found"