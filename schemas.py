from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── PATIENT SCHEMAS ─────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    full_name: str
    age: int
    gender: str
    phone_number: str
    address: Optional[str] = None
    medical_condition: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    medical_condition: Optional[str] = None


class PatientResponse(PatientBase):
    patient_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── DOCTOR SCHEMAS ───────────────────────────────────────────────────────────

class DoctorBase(BaseModel):
    doctor_name: str
    specialization: str
    qualification: str
    phone_number: str
    email: Optional[str] = None


class DoctorCreate(DoctorBase):
    pass


class DoctorUpdate(BaseModel):
    doctor_name: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None


class DoctorResponse(DoctorBase):
    doctor_id: int

    class Config:
        from_attributes = True


# ─── APPOINTMENT SCHEMAS ──────────────────────────────────────────────────────

class AppointmentBase(BaseModel):
    appointment_date: str
    appointment_time: str
    notes: Optional[str] = None
    status: Optional[str] = "Pending"


class AppointmentCreate(AppointmentBase):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None


class AppointmentUpdate(BaseModel):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    appointment_id: int
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── PUBLIC BOOKING SCHEMA ────────────────────────────────────────────────────

class PublicBooking(BaseModel):
    patient_name: str
    patient_phone: str
    appointment_date: str
    notes: Optional[str] = None
