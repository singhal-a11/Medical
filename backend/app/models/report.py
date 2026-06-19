from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    test_request_id = Column(
        Integer, ForeignKey("test_requests.id"), unique=True, nullable=False
    )
    file_path = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    test_request = relationship("TestRequest", back_populates="report")
