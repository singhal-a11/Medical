from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.patient import PatientOut
from app.schemas.test import TestOut


class TestRequestCreate(BaseModel):
    patient_id: int
    test_id: int
    notes: Optional[str] = None


class TestRequestUpdate(BaseModel):
    status: Optional[str] = None
    result_value: Optional[str] = None
    notes: Optional[str] = None
    technician_id: Optional[int] = None


class TestRequestOut(BaseModel):
    id: int
    patient_id: int
    test_id: int
    doctor_id: int
    technician_id: Optional[int]
    status: str
    result_value: Optional[str]
    notes: Optional[str]
    requested_at: datetime
    completed_at: Optional[datetime]
    patient: PatientOut
    test: TestOut

    model_config = {"from_attributes": True}
