def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Priya Patel",
            "email": "priya.patel@example.com",
            "password": "Password123",
            "confirm_password": "Password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["name"] == "Priya Patel"
    assert data["user"]["email"] == "priya.patel@example.com"
    assert data["user"]["is_onboarded"] is False

def test_register_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={
            "name": "Priya Patel",
            "email": "priya.patel@example.com",
            "password": "Password123",
            "confirm_password": "Password123"
        }
    )
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Another Name",
            "email": "priya.patel@example.com",
            "password": "Password123",
            "confirm_password": "Password123"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_register_invalid_password_rules(client):
    # Missing uppercase
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
            "confirm_password": "password123"
        }
    )
    assert res.status_code == 422

    # Short password
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Pass1",
            "confirm_password": "Pass1"
        }
    )
    assert res.status_code == 422

def test_login_flow(client):
    client.post(
        "/api/auth/register",
        json={
            "name": "Arjun Mehta",
            "email": "arjun@example.com",
            "password": "SecurePass123",
            "confirm_password": "SecurePass123"
        }
    )
    # Successful login
    login_res = client.post(
        "/api/auth/login",
        json={
            "email": "arjun@example.com",
            "password": "SecurePass123"
        }
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token

    # Protected me endpoint
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "arjun@example.com"

def test_unauthorized_access(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
