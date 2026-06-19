from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import engine, Base
from app.models import user, patient, test, test_request, report  # noqa: F401
from app.routers import auth, patients, tests, requests, reports, dashboard, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    os.makedirs("reports", exist_ok=True)
    yield


app = FastAPI(
    title="Medical Laboratory Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration - must be added FIRST before any routes
# CRITICAL: When allow_credentials=True, allow_origins CANNOT be ["*"]
# Must specify explicit origins or use a function to validate them
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",      # Vite dev server
        "http://localhost:5173",      # Vite alt port
        "http://127.0.0.1:5174",      # Alternative localhost
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",  # Allow all Render subdomains
    allow_credentials=True,           # Allow cookies/auth headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicit methods
    allow_headers=[                   # Explicit headers needed for auth
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
    ],
    max_age=600,                      # Cache preflight responses for 10 min
)

app.mount("/reports", StaticFiles(directory="reports"), name="reports")

app.include_router(auth.router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(patients.router,  prefix="/api/patients",  tags=["Patients"])
app.include_router(tests.router,     prefix="/api/tests",     tags=["Tests"])
app.include_router(requests.router,  prefix="/api/requests",  tags=["Test Requests"])
app.include_router(reports.router,   prefix="/api/reports",   tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(users.router,     prefix="/api/users",     tags=["User Management"])


@app.get("/")
async def root():
    return {"message": "Medical Lab Management System API"}
