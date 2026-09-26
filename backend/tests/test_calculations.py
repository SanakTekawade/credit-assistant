from app.services.calculations import (
    calculate_dti,
    calculate_credit_utilization,
    get_credit_score_category,
    calculate_delta
)

def test_dti_calculation_low():
    dti, category = calculate_dti(monthly_debt_payments=15000, monthly_gross_income=75000)
    assert dti == 20.0
    assert category == "Low"

def test_dti_calculation_moderate():
    dti, category = calculate_dti(monthly_debt_payments=35000, monthly_gross_income=100000)
    assert dti == 35.0
    assert category == "Moderate"

def test_dti_calculation_high():
    dti, category = calculate_dti(monthly_debt_payments=50000, monthly_gross_income=100000)
    assert dti == 50.0
    assert category == "High"

def test_credit_utilization_optimal():
    util, avail, cat = calculate_credit_utilization(credit_used=25000, total_credit_limit=100000)
    assert util == 25.0
    assert avail == 75000.0
    assert cat == "Excellent"

def test_credit_utilization_critical():
    util, avail, cat = calculate_credit_utilization(credit_used=85000, total_credit_limit=100000)
    assert util == 85.0
    assert avail == 15000.0
    assert cat == "Critical"

def test_credit_score_category():
    cat, color = get_credit_score_category(820)
    assert cat == "Excellent"
    cat, color = get_credit_score_category(760)
    assert cat == "Very Good"
    cat, color = get_credit_score_category(700)
    assert cat == "Good"
    cat, color = get_credit_score_category(620)
    assert cat == "Fair"
    cat, color = get_credit_score_category(520)
    assert cat == "Poor"

def test_delta_calculation():
    delta, status = calculate_delta(750, 720)
    assert delta == 30.0
    assert status == "Improved"

    delta, status = calculate_delta(680, 700)
    assert delta == -20.0
    assert status == "Declined"

    # Lower is better for DTI
    delta, status = calculate_delta(25.0, 35.0, is_lower_better=True)
    assert delta == -10.0
    assert status == "Improved"
