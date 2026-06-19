from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import engine, Base
from app.models import user, patient, test, test_request, report  # noqa: F401
from app.routers import auth, patients, tests, requests, reports, dashboard


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/reports", StaticFiles(directory="reports"), name="reports")

app.include_router(auth.router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(patients.router,  prefix="/api/patients",  tags=["Patients"])
app.include_router(tests.router,     prefix="/api/tests",     tags=["Tests"])
app.include_router(requests.router,  prefix="/api/requests",  tags=["Test Requests"])
app.include_router(reports.router,   prefix="/api/reports",   tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


@app.get("/")
async def root():
    return {"message": "Medical Lab Management System API"}
