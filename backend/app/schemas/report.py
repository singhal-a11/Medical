from pydantic import BaseModel
from datetime import datetime


class ReportOut(BaseModel):
    id: int
    test_request_id: int
    file_path: str
    generated_at: datetime
    generated_by: int

    model_config = {"from_attributes": True}
