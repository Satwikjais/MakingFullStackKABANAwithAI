import pytest
from sqlalchemy.orm import Session
import hashlib

from models import User
from database import seed_database


class TestAuthentication:
    """Test authentication endpoints"""

    def test_login_success(self, client, db_session):
        """Test successful login"""
        # Seed the database
        seed_database(db_session)

        response = client.post("/api/login", json={
            "username": "user",
            "password": "password"
        })

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["message"] == "Login successful"
        assert "user_id" in data

    def test_login_invalid_username(self, client, db_session):
        """Test login with invalid username"""
        seed_database(db_session)

        response = client.post("/api/login", json={
            "username": "invalid",
            "password": "password"
        })

        assert response.status_code == 401
        data = response.json()
        assert data["detail"] == "Invalid username or password"

    def test_login_invalid_password(self, client, db_session):
        """Test login with invalid password"""
        seed_database(db_session)

        response = client.post("/api/login", json={
            "username": "user",
            "password": "wrongpassword"
        })

        assert response.status_code == 401
        data = response.json()
        assert data["detail"] == "Invalid username or password"

    def test_logout(self, client):
        """Test logout endpoint"""
        response = client.post("/api/logout")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["message"] == "Logout successful"