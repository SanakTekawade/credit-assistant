from typing import Dict, Any, Tuple

def calculate_dti(monthly_debt_payments: float, monthly_gross_income: float) -> Tuple[float, str]:
    if monthly_gross_income <= 0:
        return 0.0, "High" if monthly_debt_payments > 0 else "Low"
    
    dti = (monthly_debt_payments / monthly_gross_income) * 100
    dti_rounded = round(dti, 2)
    
    if dti_rounded < 30.0:
        category = "Low"
    elif dti_rounded <= 43.0:
        category = "Moderate"
    else:
        category = "High"
        
    return dti_rounded, category

def calculate_credit_utilization(credit_used: float, total_credit_limit: float) -> Tuple[float, float, str]:
    if total_credit_limit <= 0:
        return 0.0, 0.0, "Low"
    
    utilization = (credit_used / total_credit_limit) * 100
    utilization_rounded = round(utilization, 2)
    available_credit = max(0.0, total_credit_limit - credit_used)
    
    if utilization_rounded < 30.0:
        category = "Excellent"
    elif utilization_rounded <= 50.0:
        category = "Moderate"
    elif utilization_rounded <= 75.0:
        category = "High"
    else:
        category = "Critical"
        
    return utilization_rounded, round(available_credit, 2), category

def get_credit_score_category(score: int) -> Tuple[str, str]:
    if score >= 800:
        return "Excellent", "#10B981" # Green
    elif score >= 740:
        return "Very Good", "#3B82F6" # Blue
    elif score >= 670:
        return "Good", "#EAB308" # Yellow / Gold
    elif score >= 580:
        return "Fair", "#F97316" # Orange
    else:
        return "Poor", "#EF4444" # Red

def calculate_delta(current_val: float, previous_val: float, is_lower_better: bool = False) -> Tuple[float, str]:
    delta = current_val - previous_val
    delta_rounded = round(delta, 2)
    
    if delta_rounded == 0:
        return 0.0, "No change"
    
    if is_lower_better:
        status = "Improved" if delta_rounded < 0 else "Declined"
    else:
        status = "Improved" if delta_rounded > 0 else "Declined"
        
    return delta_rounded, status
