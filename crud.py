from sqlalchemy.orm import Session
from sqlalchemy import or_
import models
import schemas


# ─── PATIENT CRUD ─────────────────────────────────────────────────────────────

def create_patient(db: Session, patient: schemas.PatientCreate):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


def get_patients(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.Patient)
    if search:
        query = query.filter(
            or_(
                models.Patient.full_name.ilike(f"%{search}%"),
                models.Patient.phone_number.ilike(f"%{search}%"),
                models.Patient.medical_condition.ilike(f"%{search}%"),
            )
        )
    return query.offset(skip).limit(limit).all()


def get_patient(db: Session, patient_id: int):
    return db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()


def update_patient(db: Session, patient_id: int, patient: schemas.PatientUpdate):
    db_patient = get_patient(db, patient_id)
    if not db_patient:
        return None
    update_data = patient.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_patient, key, value)
    db.commit()
    db.refresh(db_patient)
    return db_patient


def delete_patient(db: Session, patient_id: int):
    db_patient = get_patient(db, patient_id)
    if not db_patient:
        return None
    db.delete(db_patient)
    db.commit()
    return db_patient


# ─── DOCTOR CRUD ──────────────────────────────────────────────────────────────

def create_doctor(db: Session, doctor: schemas.DoctorCreate):
    db_doctor = models.Doctor(**doctor.model_dump())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


def get_doctors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Doctor).offset(skip).limit(limit).all()


def get_doctor(db: Session, doctor_id: int):
    return db.query(models.Doctor).filter(models.Doctor.doctor_id == doctor_id).first()


def update_doctor(db: Session, doctor_id: int, doctor: schemas.DoctorUpdate):
    db_doctor = get_doctor(db, doctor_id)
    if not db_doctor:
        return None
    update_data = doctor.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_doctor, key, value)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


def delete_doctor(db: Session, doctor_id: int):
    db_doctor = get_doctor(db, doctor_id)
    if not db_doctor:
        return None
    db.delete(db_doctor)
    db.commit()
    return db_doctor


# ─── APPOINTMENT CRUD ─────────────────────────────────────────────────────────

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    db_appt = models.Appointment(**appointment.model_dump())
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt


def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).offset(skip).limit(limit).all()


def get_appointment(db: Session, appointment_id: int):
    return db.query(models.Appointment).filter(
        models.Appointment.appointment_id == appointment_id
    ).first()


def update_appointment(db: Session, appointment_id: int, appointment: schemas.AppointmentUpdate):
    db_appt = get_appointment(db, appointment_id)
    if not db_appt:
        return None
    update_data = appointment.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_appt, key, value)
    db.commit()
    db.refresh(db_appt)
    return db_appt


def delete_appointment(db: Session, appointment_id: int):
    db_appt = get_appointment(db, appointment_id)
    if not db_appt:
        return None
    db.delete(db_appt)
    db.commit()
    return db_appt


def create_public_booking(db: Session, booking: schemas.PublicBooking):
    """Public booking — no patient_id required, stores name+phone directly."""
    db_appt = models.Appointment(
        patient_name=booking.patient_name,
        patient_phone=booking.patient_phone,
        appointment_date=booking.appointment_date,
        appointment_time="To be confirmed",
        notes=booking.notes,
        status="Pending",
    )
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt
