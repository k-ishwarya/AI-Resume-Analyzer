import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.database.database import engine, Base
import app.database.models  # Ensures all models are registered

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

# Import routers
from app.routes.auth import router as auth_router
from app.routes.resume import router as resume_router
from app.routes.analysis import router as analysis_router
from app.routes.job import router as job_router
from app.routes.chatbot import router as chatbot_router
from app.routes.admin import router as admin_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info(f"{settings.APP_NAME} backend started successfully on port {settings.PORT}.")
    yield
    # Shutdown
    logger.info("Shutting down application...")

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Backend API for AI Resume Analyzer platform with ATS scoring, job matching, and Gemini AI insights.",
    version="1.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Error Handlers - clean and user friendly
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err["loc"] if loc != "body"])
        errors.append(f"{field}: {err['msg']}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error: " + "; ".join(errors)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again or contact support."}
    )

# Include API Routers
app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(analysis_router)
app.include_router(job_router)
app.include_router(chatbot_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }
