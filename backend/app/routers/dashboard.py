from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.patient import Patient
from app.models.test_request import TestRequest
from app.models.user import User
from app.models.report import Report
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Total patients
    total_patients = (await db.execute(select(func.count(Patient.id)))).scalar()

    # Requests by status
    pending = (await db.execute(
        select(func.count(TestRequest.id)).where(TestRequest.status == "pending")
    )).scalar()
    in_progress = (await db.execute(
        select(func.count(TestRequest.id)).where(TestRequest.status == "in_progress")
    )).scalar()
    completed = (await db.execute(
        select(func.count(TestRequest.id)).where(TestRequest.status == "completed")
    )).scalar()

    # Total reports generated
    total_reports = (await db.execute(select(func.count(Report.id)))).scalar()

    data = {
        "total_patients": total_patients,
        "total_reports": total_reports,
        "requests": {
            "pending": pending,
            "in_progress": in_progress,
            "completed": completed,
            "total": pending + in_progress + completed,
        },
    }

    # Admin-only: user counts by role
    if current_user.role == "admin":
        for role in ["admin", "doctor", "technician", "patient"]:
            count = (await db.execute(
                select(func.count(User.id)).where(User.role == role)
            )).scalar()
            data[f"total_{role}s"] = count

    return data
