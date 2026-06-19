from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class TestRequest(Base):
    __tablename__ = "test_requests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="pending")  # pending | in_progress | completed
    result_value = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    requested_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="test_requests")
    test = relationship("Test", back_populates="test_requests")
    doctor = relationship(
        "User", back_populates="test_requests", foreign_keys=[doctor_id]
    )
    technician = relationship(
        "User", back_populates="processed_requests", foreign_keys=[technician_id]
    )
    report = relationship("Report", back_populates="test_request", uselist=False)
