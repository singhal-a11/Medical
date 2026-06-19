from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
import os

from app.database import get_db
from app.models.report import Report
from app.models.test_request import TestRequest
from app.schemas.report import ReportOut
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.services.pdf_service import generate_report

router = APIRouter()


@router.post("/generate/{request_id}", response_model=ReportOut, status_code=201)
async def create_report(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "technician")),
):
    result = await db.execute(
        select(TestRequest)
        .options(
            selectinload(TestRequest.patient),
            selectinload(TestRequest.test),
            selectinload(TestRequest.doctor),
        )
        .where(TestRequest.id == request_id)
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Test request not found")
    if req.status != "completed":
        raise HTTPException(status_code=400, detail="Request must be completed before generating a report")

    existing = await db.execute(select(Report).where(Report.test_request_id == request_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Report already exists for this request")

    file_path = generate_report(req)

    report = Report(
        test_request_id=request_id,
        file_path=file_path,
        generated_by=current_user.id,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/", response_model=List[ReportOut])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Report))
    return result.scalars().all()


@router.get("/{report_id}/download")
async def download_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="PDF file not found on server")
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=os.path.basename(report.file_path),
    )
