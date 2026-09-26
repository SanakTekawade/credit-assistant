from .auth import router as auth_router
from .financial_profile import router as profile_router
from .credit import router as credit_router
from .debts import router as debts_router
from .ai import router as ai_router
from .notifications import router as notifications_router
from .dashboard import router as dashboard_router
from .demo import router as demo_router

__all__ = [
    "auth_router",
    "profile_router",
    "credit_router",
    "debts_router",
    "ai_router",
    "notifications_router",
    "dashboard_router",
    "demo_router"
]
