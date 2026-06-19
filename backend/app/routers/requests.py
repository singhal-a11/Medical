from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.test_request import TestRequest
from app.schemas.test_request import TestRequestCreate, TestRequestUpdate, TestRequestOut
from app.core.dependencies import get_current_user, require_role
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[TestRequestOut])
async def get_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(TestRequest)
        .options(
            selectinload(TestRequest.patient),
            selectinload(TestRequest.test),
        )
    )
    if current_user.role == "doctor":
        query = query.where(TestRequest.doctor_id == current_user.id)
    elif current_user.role == "technician":
        query = query.where(TestRequest.status.in_(["pending", "in_progress"]))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=TestRequestOut, status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: TestRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "doctor")),
):
    req = TestRequest(
        patient_id=payload.patient_id,
        test_id=payload.test_id,
        doctor_id=current_user.id,
        notes=payload.notes,
        status="pending",
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    result = await db.execute(
        select(TestRequest)
        .options(
            selectinload(TestRequest.patient),
            selectinload(TestRequest.test),
        )
        .where(TestRequest.id == req.id)
    )
    return result.scalar_one()


@router.get("/{request_id}", response_model=TestRequestOut)
async def get_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(TestRequest)
        .options(
            selectinload(TestRequest.patient),
            selectinload(TestRequest.test),
        )
        .where(TestRequest.id == request_id)
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


@router.patch("/{request_id}", response_model=TestRequestOut)
async def update_request(
    request_id: int,
    payload: TestRequestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "technician")),
):
    result = await db.execute(select(TestRequest).where(TestRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(req, field, value)

    if payload.status == "in_progress" and req.technician_id is None:
        req.technician_id = current_user.id
    if payload.status == "completed":
        req.completed_at = datetime.utcnow()

    await db.commit()

    refreshed = await db.execute(
        select(TestRequest)
        .options(
            selectinload(TestRequest.patient),
            selectinload(TestRequest.test),
        )
        .where(TestRequest.id == request_id)
    )
    return refreshed.scalar_one()
