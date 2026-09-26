from typing import List
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.financial_profile import FinancialProfile
from ..models.debt import Debt
from ..models.ai_consultation import AIConsultation
from ..schemas.dashboard import RoadmapStage, RoadmapTask, RoadmapResponse

def calculate_roadmap_status(user: User, db: Session) -> RoadmapResponse:
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
    debts = db.query(Debt).filter(Debt.user_id == user.id).all()
    ai_consultations = db.query(AIConsultation).filter(AIConsultation.user_id == user.id).all()

    # Stage 1: Understand
    task_1_1 = RoadmapTask(
        id="s1_t1",
        title="Complete Full Financial Profile",
        description="Provide accurate details of your income, city, and employment status.",
        is_completed=bool(user.is_onboarded and profile and profile.monthly_income > 0)
    )
    task_1_2 = RoadmapTask(
        id="s1_t2",
        title="Log Baseline Credit Score",
        description="Input your current credit score to establish a baseline.",
        is_completed=bool(profile and profile.credit_score > 0)
    )
    task_1_3 = RoadmapTask(
        id="s1_t3",
        title="Map Monthly Living Expenses",
        description="Break down rent, utilities, food, and miscellaneous costs.",
        is_completed=bool(profile and profile.monthly_expenses > 0)
    )
    stage_1_tasks = [task_1_1, task_1_2, task_1_3]
    stage_1_completed_count = sum(1 for t in stage_1_tasks if t.is_completed)
    stage_1_pct = int((stage_1_completed_count / len(stage_1_tasks)) * 100)
    stage_1_status = "completed" if stage_1_pct == 100 else "in_progress"

    # Stage 2: Stabilize
    task_2_1 = RoadmapTask(
        id="s2_t1",
        title="Calculate Debt-to-Income (DTI)",
        description="Verify your DTI ratio is within the healthy threshold (< 43%).",
        is_completed=bool(profile and profile.dti <= 43.0 and profile.monthly_income > 0)
    )
    task_2_2 = RoadmapTask(
        id="s2_t2",
        title="Itemize All Active Debts & Loans",
        description="Add all current loans or credit cards to the debt tracker.",
        is_completed=bool(len(debts) > 0 or (profile and profile.outstanding_debt == 0))
    )
    task_2_3 = RoadmapTask(
        id="s2_t3",
        title="Audit Due Dates & Payment Schedules",
        description="Review EMI payment dates to avoid accidental delayed payments.",
        is_completed=bool(profile and profile.missed_payments == 0)
    )
    stage_2_tasks = [task_2_1, task_2_2, task_2_3]
    stage_2_completed_count = sum(1 for t in stage_2_tasks if t.is_completed)
    stage_2_pct = int((stage_2_completed_count / len(stage_2_tasks)) * 100)
    if stage_1_status != "completed":
        stage_2_status = "locked"
    elif stage_2_pct == 100:
        stage_2_status = "completed"
    else:
        stage_2_status = "in_progress"

    # Stage 3: Reduce Debt
    task_3_1 = RoadmapTask(
        id="s3_t1",
        title="Optimize Credit Utilization Below 30%",
        description="Keep credit card revolving balance below 30% of your total credit limit.",
        is_completed=bool(profile and profile.credit_utilization <= 30.0)
    )
    task_3_2 = RoadmapTask(
        id="s3_t2",
        title="Clear High-Interest Revolving Dues",
        description="Prioritize paying down credit card rolls and high-rate personal loans.",
        is_completed=bool(profile and profile.credit_used == 0 or profile.credit_utilization <= 20.0)
    )
    task_3_3 = RoadmapTask(
        id="s3_t3",
        title="Lower Overall DTI to Below 30%",
        description="Reduce monthly EMI burden relative to gross income for top-tier credit rating.",
        is_completed=bool(profile and profile.dti < 30.0)
    )
    stage_3_tasks = [task_3_1, task_3_2, task_3_3]
    stage_3_completed_count = sum(1 for t in stage_3_tasks if t.is_completed)
    stage_3_pct = int((stage_3_completed_count / len(stage_3_tasks)) * 100)
    if stage_2_status != "completed":
        stage_3_status = "locked"
    elif stage_3_pct == 100:
        stage_3_status = "completed"
    else:
        stage_3_status = "in_progress"

    # Stage 4: Build Healthy Credit Habits
    task_4_1 = RoadmapTask(
        id="s4_t1",
        title="Zero Missed Payments Record",
        description="Maintain a clean 100% on-time payment track record across all accounts.",
        is_completed=bool(profile and profile.missed_payments == 0)
    )
    task_4_2 = RoadmapTask(
        id="s4_t2",
        title="Run AI Financial Analysis",
        description="Generate personalized AI health diagnostics and recommendations.",
        is_completed=bool(len(ai_consultations) > 0)
    )
    task_4_3 = RoadmapTask(
        id="s4_t3",
        title="Limit Hard Inquiries",
        description="Avoid applying for unnecessary short-term consumer credit.",
        is_completed=bool(profile and profile.active_credit_cards <= 4)
    )
    stage_4_tasks = [task_4_1, task_4_2, task_4_3]
    stage_4_completed_count = sum(1 for t in stage_4_tasks if t.is_completed)
    stage_4_pct = int((stage_4_completed_count / len(stage_4_tasks)) * 100)
    if stage_3_status != "completed":
        stage_4_status = "locked"
    elif stage_4_pct == 100:
        stage_4_status = "completed"
    else:
        stage_4_status = "in_progress"

    # Stage 5: Maintain
    task_5_1 = RoadmapTask(
        id="s5_t1",
        title="Achieve 750+ Prime Credit Score",
        description="Reach or surpass the benchmark prime score for prime Indian banking terms.",
        is_completed=bool(profile and profile.credit_score >= 750)
    )
    task_5_2 = RoadmapTask(
        id="s5_t2",
        title="Regular Score Tracking",
        description="Log score updates monthly to track your ongoing credit momentum.",
        is_completed=bool(len(user.credit_histories) >= 2)
    )
    task_5_3 = RoadmapTask(
        id="s5_t3",
        title="Balanced Credit Mix",
        description="Maintain a healthy blend of secured and unsecured credit facilities.",
        is_completed=bool(profile and profile.credit_score >= 740 and profile.dti < 35.0)
    )
    stage_5_tasks = [task_5_1, task_5_2, task_5_3]
    stage_5_completed_count = sum(1 for t in stage_5_tasks if t.is_completed)
    stage_5_pct = int((stage_5_completed_count / len(stage_5_tasks)) * 100)
    if stage_4_status != "completed":
        stage_5_status = "locked"
    elif stage_5_pct == 100:
        stage_5_status = "completed"
    else:
        stage_5_status = "in_progress"

    stages = [
        RoadmapStage(
            stage_number=1,
            title="Understand",
            subtitle="Foundation & Baselining",
            description="Establish a clear, complete picture of your financial profile and credit score.",
            status=stage_1_status,
            completion_percentage=stage_1_pct,
            tasks=stage_1_tasks
        ),
        RoadmapStage(
            stage_number=2,
            title="Stabilize",
            subtitle="Cash Flow & Debt Control",
            description="Ensure debt-to-income balance and eliminate immediate payment risks.",
            status=stage_2_status,
            completion_percentage=stage_2_pct,
            tasks=stage_2_tasks
        ),
        RoadmapStage(
            stage_number=3,
            title="Reduce Debt",
            subtitle="Utilization & Paydown",
            description="Bring revolving credit card balances below 30% and aggressively reduce high-cost debt.",
            status=stage_3_status,
            completion_percentage=stage_3_pct,
            tasks=stage_3_tasks
        ),
        RoadmapStage(
            stage_number=4,
            title="Build Healthy Habits",
            subtitle="Discipline & Optimization",
            description="Establish an unbroken record of on-time payments and follow AI-guided steps.",
            status=stage_4_status,
            completion_percentage=stage_4_pct,
            tasks=stage_4_tasks
        ),
        RoadmapStage(
            stage_number=5,
            title="Maintain",
            subtitle="Long-Term Financial Freedom",
            description="Sustain prime credit ratings (750+) and review reports periodically.",
            status=stage_5_status,
            completion_percentage=stage_5_pct,
            tasks=stage_5_tasks
        )
    ]

    total_tasks = sum(len(s.tasks) for s in stages)
    total_completed = (
        stage_1_completed_count +
        stage_2_completed_count +
        stage_3_completed_count +
        stage_4_completed_count +
        stage_5_completed_count
    )
    overall_progress = int((total_completed / total_tasks) * 100)

    # Determine current active stage number
    current_stage_num = 1
    for s in stages:
        if s.status == "in_progress":
            current_stage_num = s.stage_number
            break
        elif s.status == "completed":
            current_stage_num = min(5, s.stage_number + 1)

    return RoadmapResponse(
        stages=stages,
        overall_progress=overall_progress,
        current_stage=current_stage_num
    )
