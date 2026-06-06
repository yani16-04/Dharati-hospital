from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Patient(Base):
    """
    Patient model - core entity of the system.
    One Patient can have Many Appointments (One-to-Many relationship).
    """
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    phone_number = Column(String(20), nullable=False)
    address = Column(Text, nullable=True)
    medical_condition = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: One Patient -> Many Appointments
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")


class Doctor(Base):
    """
    Doctor model.
    One Doctor can have Many Appointments (One-to-Many relationship).
    """
    __tablename__ = "doctors"

    doctor_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doctor_name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=False)
    qualification = Column(String(200), nullable=False)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)

    # Relationship: One Doctor -> Many Appointments
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete-orphan")


class Appointment(Base):
    """
    Appointment model - junction between Patient and Doctor.
    Many-side of both One-to-Many relationships.
    Each appointment belongs to exactly ONE patient and ONE doctor.
    """
    __tablename__ = "appointments"

    appointment_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=True)
    appointment_date = Column(String(20), nullable=False)
    appointment_time = Column(String(10), nullable=False)
    notes = Column(Text, nullable=True)
    patient_name = Column(String(100), nullable=True)   # for public bookings
    patient_phone = Column(String(20), nullable=True)   # for public bookings
    status = Column(String(20), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Back-references to Patient and Doctor
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
