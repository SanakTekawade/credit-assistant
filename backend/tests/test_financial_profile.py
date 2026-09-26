def get_auth_header(client):
    reg = client.post(
        "/api/auth/register",
        json={
            "name": "Kavita Rao",
            "email": "kavita.rao@example.com",
            "password": "Password123",
            "confirm_password": "Password123"
        }
    )
    token = reg.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_financial_onboarding_and_calculations(client):
    headers = get_auth_header(client)

    onboard_payload = {
        "age": 30,
        "city": "Bengaluru",
        "employment_status": "Salaried",
        "monthly_income": 80000.0,
        "other_income": 10000.0,
        "rent": 20000.0,
        "utilities": 4000.0,
        "food": 8000.0,
        "transport": 3000.0,
        "other_expenses": 2000.0,
        "credit_score": 725,
        "total_credit_limit": 150000.0,
        "credit_used": 30000.0,
        "active_credit_cards": 2,
        "active_loans": 1,
        "outstanding_debt": 250000.0,
        "monthly_emi": 12000.0,
        "missed_payments": 0
    }

    res = client.post("/api/profile/financial", json=onboard_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["credit_score"] == 725
    assert data["total_credit_limit"] == 150000.0
    assert data["credit_used"] == 30000.0
    # 30000 / 150000 = 20%
    assert data["credit_utilization"] == 20.0
    assert data["utilization_category"] == "Excellent"
    # DTI = 12000 / 90000 = 13.33%
    assert data["dti"] == 13.33
    assert data["dti_category"] == "Low"

def test_profile_update_and_delta(client):
    headers = get_auth_header(client)

    # Initial onboarding
    client.post("/api/profile/financial", json={
        "monthly_income": 60000.0,
        "credit_score": 700,
        "total_credit_limit": 100000.0,
        "credit_used": 40000.0,
        "monthly_emi": 15000.0
    }, headers=headers)

    # Update credit score to 735
    update_res = client.put("/api/profile/financial", json={
        "credit_score": 735
    }, headers=headers)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["credit_score"] == 735
    assert updated_data["previous_credit_score"] == 700

    # Test improvement delta
    delta_res = client.get("/api/profile/improvement-delta", headers=headers)
    assert delta_res.status_code == 200
    delta_data = delta_res.json()
    assert delta_data["score_delta"] == 35
    assert delta_data["score_status"] == "Improved"
