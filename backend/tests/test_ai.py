def get_auth_header(client, email="ai_test@example.com"):
    reg = client.post(
        "/api/auth/register",
        json={
            "name": "Dev User",
            "email": email,
            "password": "Password123",
            "confirm_password": "Password123"
        }
    )
    token = reg.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_ai_analysis_generation_and_history(client):
    headers = get_auth_header(client)

    # Complete onboarding
    client.post("/api/profile/financial", json={
        "monthly_income": 85000.0,
        "credit_score": 680,
        "total_credit_limit": 100000.0,
        "credit_used": 55000.0,
        "monthly_emi": 20000.0,
        "missed_payments": 1
    }, headers=headers)

    # Run AI Analysis
    ai_res = client.post("/api/ai/analyze", json={}, headers=headers)
    assert ai_res.status_code == 200
    data = ai_res.json()

    assert "summary" in data
    assert data["health_status"] in ["Fair", "Needs Attention", "Critical", "Good", "Excellent"]
    assert len(data["action_plan"]) == 5
    assert len(data["key_issues"]) > 0
    assert "disclaimer" in data

    # Verify each step has required attributes
    for step in data["action_plan"]:
        assert "step" in step
        assert "title" in step
        assert "description" in step
        assert "priority" in step
        assert "timeframe" in step

    # Fetch History
    hist_res = client.get("/api/ai/history", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert history[0]["health_status"] == data["health_status"]

def test_demo_account_seeding(client):
    seed_res = client.post("/api/demo/seed")
    assert seed_res.status_code == 200
    token_data = seed_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["name"] == "Rahul Sharma"
    assert token_data["user"]["email"] == "rahul.sharma@creditassistant.in"

    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify dashboard returns Rahul's data
    dash_res = client.get("/api/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["user_name"] == "Rahul Sharma"
    assert dash_data["credit_summary"]["current_score"] == 698
    assert dash_data["debt_summary"]["debts_count"] >= 3
    assert dash_data["latest_ai_analysis"] is not None
