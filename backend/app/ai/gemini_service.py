import json
import logging
from typing import Dict, Any, List
from ..config import settings
from ..schemas.ai import AIAnalysisResponse, ActionPlanStep

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an educational personal-finance assistant focused on the Indian financial ecosystem.
Analyze the user's provided financial metrics and provide clear, practical, conservative guidance.
Do not guarantee credit-score increases. Do not claim to be a bank, credit bureau, financial advisor, or lender.
Clearly identify uncertainty. Never encourage fraudulent, deceptive, or illegal financial activity.

Return ONLY a valid JSON object matching this schema:
{
  "summary": "Short 2-3 sentence overview of their financial and credit health in Indian context (INR)",
  "health_status": "One of: Excellent, Good, Fair, Needs Attention, Critical",
  "key_issues": ["Issue 1", "Issue 2", "Issue 3"],
  "action_plan": [
    {
      "step": 1,
      "title": "Action title",
      "description": "Specific actionable guidance tailored to Indian banking/credit practices",
      "priority": "High | Medium | Low",
      "timeframe": "e.g. 30 days | 60 days | 3-6 months"
    },
    ... (exactly 5 actionable steps)
  ],
  "warnings": ["Important caution or disclaimer points"]
}
"""

def generate_rule_based_fallback(metrics: Dict[str, Any]) -> AIAnalysisResponse:
    score = metrics.get("credit_score", 700)
    utilization = metrics.get("credit_utilization", 0.0)
    dti = metrics.get("dti", 0.0)
    missed_payments = metrics.get("missed_payments", 0)
    monthly_income = metrics.get("monthly_income", 50000)
    monthly_emi = metrics.get("monthly_emi", 0)
    outstanding_debt = metrics.get("outstanding_debt", 0)
    credit_used = metrics.get("credit_used", 0)
    total_credit_limit = metrics.get("total_credit_limit", 0)
    active_loans = metrics.get("active_loans", 0)

    # Health status determination
    if score >= 780 and utilization < 30 and dti < 30 and missed_payments == 0:
        health_status = "Excellent"
        summary = (
            f"Your credit profile is in robust standing with a strong score of {score} and a healthy DTI of {dti:.1f}%. "
            f"Your credit card utilization ({utilization:.1f}%) is well below the standard 30% guideline, putting you in an optimal position for favorable loan terms."
        )
    elif score >= 700 and utilization <= 45 and dti <= 40 and missed_payments == 0:
        health_status = "Good"
        summary = (
            f"Your credit health is in a good range with a score of {score}. Your DTI is manageable at {dti:.1f}%, "
            f"though fine-tuning your credit utilization ({utilization:.1f}%) and maintaining disciplined payments can elevate your rating further."
        )
    elif score >= 630 and missed_payments <= 1:
        health_status = "Fair"
        summary = (
            f"Your credit profile is in a moderate state with a score of {score} and credit utilization of {utilization:.1f}%. "
            f"Addressing revolving balances and keeping your monthly EMI burden ({dti:.1f}% DTI) under control will be crucial for steady recovery."
        )
    elif score >= 550 or missed_payments >= 2:
        health_status = "Needs Attention"
        summary = (
            f"Your credit health currently needs proactive attention. With a score of {score} and {missed_payments} missed payment(s) reported, "
            f"your profile reflects financial strain. Re-establishing payment consistency and curbing debt will be key priority areas."
        )
    else:
        health_status = "Critical"
        summary = (
            f"Your profile indicates significant credit stress with a score of {score} and an elevated DTI ratio ({dti:.1f}%). "
            f"Immediate focus should be placed on stopping missed payments, restructuring high-cost debt, and setting up strict budget controls."
        )

    # Key issues
    key_issues: List[str] = []
    if missed_payments > 0:
        key_issues.append(f"{missed_payments} missed payment(s) in the last 12 months impacting score stability")
    if utilization > 30.0:
        key_issues.append(f"Credit card utilization is at {utilization:.1f}% (above the recommended 30% threshold of ₹{total_credit_limit * 0.3:,.0f})")
    if dti > 40.0:
        key_issues.append(f"Debt-to-Income ratio is high at {dti:.1f}%, committing ₹{monthly_emi:,.0f} of your ₹{monthly_income:,.0f} monthly income to EMIs")
    if score < 700:
        key_issues.append(f"Credit score ({score}) is below the prime benchmark of 750 sought by most Indian scheduled commercial banks")
    if active_loans >= 3:
        key_issues.append(f"Multiple active credit accounts ({active_loans} loans) increase complexity and EMI pressure")
    if not key_issues:
        key_issues.append("Revolving balance management during peak festive/quarterly spending periods")
        key_issues.append("Ensuring adequate credit mix between secured and unsecured facilities")

    # 5-Step Action Plan
    action_plan = [
        ActionPlanStep(
            step=1,
            title="Maintain 100% On-Time Payment Record via Auto-Debit",
            description="Payment history is the most heavily weighted factor for Indian credit bureaus (CIBIL/Experian/CRIF). Enable NACH/e-mandate auto-debit on your primary bank account for all active EMIs at least 3 business days before due dates.",
            priority="High" if missed_payments > 0 else "Medium",
            timeframe="Immediate (15-30 days)"
        ),
        ActionPlanStep(
            step=2,
            title=f"Target Credit Card Utilization Below 30% (₹{max(1000.0, total_credit_limit * 0.3):,.0f})",
            description="Revolving debt on credit cards heavily penalizes credit scores. Pay down balances before the bill generation date or request a credit limit enhancement from your card issuer without increasing your spending.",
            priority="High" if utilization > 30 else "Medium",
            timeframe="30 to 60 days"
        ),
        ActionPlanStep(
            step=3,
            title="Implement Avalanche or Snowball Debt Payoff for High-Interest Loans",
            description=f"Prioritize extra principal repayments towards unsecured personal loans or high-interest credit card rollovers. Lowering your ₹{monthly_emi:,.0f} monthly EMI burden will steadily improve your DTI ratio.",
            priority="High" if dti > 35 else "Medium",
            timeframe="60 to 90 days"
        ),
        ActionPlanStep(
            step=4,
            title="Limit New Hard Inquiries & Avoid Multiple Loan Applications",
            description="Refrain from applying for multiple instant loan apps, BNPL schemes, or new credit cards simultaneously. Each application triggers a hard inquiry that temporarily dampens your score.",
            priority="Medium",
            timeframe="Ongoing (3-6 months)"
        ),
        ActionPlanStep(
            step=5,
            title="Audit Official Credit Reports Quarterly for Discrepancies",
            description="Check your credit report across CIBIL, Experian, and Equifax for administrative errors, incorrectly reported overdue amounts, or unauthorized loan accounts. Raise dispute grievances promptly through official bureau dispute portals.",
            priority="Low",
            timeframe="Every 90 days"
        )
    ]

    warnings = [
        "Never engage with unauthorized credit repair agencies guaranteeing overnight score jumps.",
        "AI recommendations are educational simulations and do not replace certified financial counseling or bank loan approvals.",
        "Loan approvals in India depend on complete underwriting criteria, including ITR filing, banking stability, and bureau algorithms."
    ]

    return AIAnalysisResponse(
        summary=summary,
        health_status=health_status,
        key_issues=key_issues,
        action_plan=action_plan,
        warnings=warnings
    )

def analyze_credit_health(metrics: Dict[str, Any]) -> AIAnalysisResponse:
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    if not api_key:
        logger.info("GEMINI_API_KEY not configured. Using rule-based financial analysis engine.")
        return generate_rule_based_fallback(metrics)

    # If GEMINI_API_KEY is available, invoke Gemini via official SDK
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt_data = f"""
Financial Profile Metrics (Indian Rupee Ecosystem):
- Credit Score: {metrics.get('credit_score', 'N/A')} (Educational Range: 300-900)
- Debt-to-Income (DTI): {metrics.get('dti', 0)}%
- Credit Utilization: {metrics.get('credit_utilization', 0)}%
- Monthly Gross Income: ₹{metrics.get('monthly_income', 0):,.2f}
- Other Monthly Income: ₹{metrics.get('other_income', 0):,.2f}
- Monthly Expenses: ₹{metrics.get('monthly_expenses', 0):,.2f}
- Monthly EMI Burden: ₹{metrics.get('monthly_emi', 0):,.2f}
- Total Outstanding Debt: ₹{metrics.get('outstanding_debt', 0):,.2f}
- Credit Card Used: ₹{metrics.get('credit_used', 0):,.2f}
- Total Credit Limit: ₹{metrics.get('total_credit_limit', 0):,.2f}
- Active Credit Cards: {metrics.get('active_credit_cards', 0)}
- Active Loans: {metrics.get('active_loans', 0)}
- Missed Payments (Last 12 Months): {metrics.get('missed_payments', 0)}
- Employment Status: {metrics.get('employment_status', 'Salaried')}
- City: {metrics.get('city', 'India')}

Please evaluate this profile and produce exactly 5 prioritized action steps and health diagnosis.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt_data,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.2
            )
        )

        content_text = response.text
        if not content_text:
            raise ValueError("Empty response from Gemini")

        parsed_json = json.loads(content_text)
        validated_response = AIAnalysisResponse(**parsed_json)
        return validated_response

    except Exception as exc:
        logger.warning(f"Error communicating with Gemini API ({str(exc)}). Falling back to rule-based engine.")
        return generate_rule_based_fallback(metrics)
