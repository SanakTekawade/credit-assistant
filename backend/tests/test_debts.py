def get_auth_header(client, email="vikram@example.com"):
    reg = client.post(
        "/api/auth/register",
        json={
            "name": "Vikram Singh",
            "email": email,
            "password": "Password123",
            "confirm_password": "Password123"
        }
    )
    token = reg.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_debt_crud_lifecycle(client):
    headers = get_auth_header(client, "debt_user@example.com")

    # 1. Add debt
    add_res = client.post(
        "/api/debts",
        json={
            "name": "SBI Home Loan",
            "type": "Home Loan",
            "principal": 2500000.0,
            "outstanding": 2200000.0,
            "interest_rate": 8.5,
            "emi": 21500.0,
            "due_date": 5,
            "remaining_months": 180
        },
        headers=headers
    )
    assert add_res.status_code == 201
    debt = add_res.json()
    debt_id = debt["id"]
    assert debt["name"] == "SBI Home Loan"
    assert debt["outstanding"] == 2200000.0

    # 2. Get list of debts
    list_res = client.get("/api/debts", headers=headers)
    assert list_res.status_code == 200
    summary = list_res.json()
    assert summary["debts_count"] == 1
    assert summary["total_outstanding"] == 2200000.0
    assert summary["total_monthly_emi"] == 21500.0

    # 3. Update debt
    update_res = client.put(
        f"/api/debts/{debt_id}",
        json={
            "outstanding": 2150000.0,
            "emi": 21000.0
        },
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["outstanding"] == 2150000.0

    # 4. Delete debt
    del_res = client.delete(f"/api/debts/{debt_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify empty
    list_res_after = client.get("/api/debts", headers=headers)
    assert list_res_after.json()["debts_count"] == 0
