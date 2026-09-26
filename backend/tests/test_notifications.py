def get_auth_header(client, email="notif_test@example.com"):
    reg = client.post(
        "/api/auth/register",
        json={
            "name": "Ananya Roy",
            "email": email,
            "password": "Password123",
            "confirm_password": "Password123"
        }
    )
    token = reg.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_notifications_flow(client):
    headers = get_auth_header(client)

    # 1. Fetch initial welcome notification
    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["unread_count"] >= 1
    notif_id = data["notifications"][0]["id"]

    # 2. Mark single notification as read
    read_res = client.put(f"/api/notifications/{notif_id}/read", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # 3. Mark all as read
    all_read_res = client.put("/api/notifications/read-all", headers=headers)
    assert all_read_res.status_code == 200

    # Verify unread count is 0
    res_after = client.get("/api/notifications", headers=headers)
    assert res_after.json()["unread_count"] == 0
