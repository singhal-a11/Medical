from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin | doctor | technician | patient
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_requests = relationship(
        "TestRequest", back_populates="doctor", foreign_keys="TestRequest.doctor_id"
    )
    processed_requests = relationship(
        "TestRequest",
        back_populates="technician",
        foreign_keys="TestRequest.technician_id",
    )
