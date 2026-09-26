import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .database import engine, Base
from .routers import (
    auth_router,
    profile_router,
    credit_router,
    debts_router,
    ai_router,
    notifications_router,
    dashboard_router,
    demo_router
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("credit_assistant")

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Credit Assistant API",
    description="AI-powered financial health, credit tracking, and DTI guidance engine designed for the Indian financial ecosystem.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler to ensure clean user-facing error messages
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred while processing your request. Please try again shortly."
        }
    )

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(credit_router, prefix=settings.API_V1_STR)
app.include_router(debts_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "name": "Credit Assistant API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "disclaimer": "Credit Assistant provides educational personal-finance guidance. It is not an official credit bureau, bank, or registered financial advisor."
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": "gemini-ready" if settings.GEMINI_API_KEY else "rule-based-fallback-active"
    }
