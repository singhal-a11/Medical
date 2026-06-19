from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.schemas.user import UserCreate, UserOut
from app.core.security import hash_password
from app.core.dependencies import require_role

router = APIRouter()


@router.get("/", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    result = await db.execute(select(User))
    return result.scalars().all()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    # Check if email already registered
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    
    if payload.role == "patient":
        # Check if patient already exists by email
        pat_result = await db.execute(select(Patient).where(Patient.email == payload.email))
        existing_pat = pat_result.scalar_one_or_none()
        if not existing_pat:
            patient = Patient(
                full_name=payload.full_name,
                email=payload.email,
            )
            db.add(patient)
            
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/{user_id}/toggle-active", response_model=UserOut)
async def toggle_active(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow admin to deactivate themselves
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account")
        
    user.is_active = not user.is_active
    await db.commit()
    await db.refresh(user)
    return user
