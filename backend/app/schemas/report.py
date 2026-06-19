from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.test_request import TestRequestOut


class ReportOut(BaseModel):
    id: int
    test_request_id: int
    file_path: str
    generated_at: datetime
    generated_by: int
    test_request: Optional[TestRequestOut] = None

    model_config = {"from_attributes": True}
