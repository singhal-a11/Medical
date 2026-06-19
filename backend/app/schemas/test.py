from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TestCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: float
    normal_range: Optional[str] = None
    unit: Optional[str] = None


class TestUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    normal_range: Optional[str] = None
    unit: Optional[str] = None
    is_active: Optional[bool] = None


class TestOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    price: float
    normal_range: Optional[str]
    unit: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
