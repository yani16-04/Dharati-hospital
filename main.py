from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
import crud
from database import engine, get_db

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="yourphysio dr dharati",
    description="API for Physiotherapy Clinic — Dharti's HMS",
    version="1.0.0",
)

# Allow frontend (opened as file:// or localhost) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── ROOT ─────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Dharti's Hospital Management System API",
        "docs": "/docs",
        "version": "1.0.0"
    }


# ─── PATIENT ROUTES ───────────────────────────────────────────────────────────

@app.post("/patients", response_model=schemas.PatientResponse, tags=["Patients"], status_code=201)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    return crud.create_patient(db, patient)


@app.get("/patients", response_model=List[schemas.PatientResponse], tags=["Patients"])
def get_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Search by name, phone, or condition"),
    db: Session = Depends(get_db)
):
    return crud.get_patients(db, skip=skip, limit=limit, search=search)


@app.get("/patients/{patient_id}", response_model=schemas.PatientResponse, tags=["Patients"])
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.put("/patients/{patient_id}", response_model=schemas.PatientResponse, tags=["Patients"])
def update_patient(patient_id: int, patient: schemas.PatientUpdate, db: Session = Depends(get_db)):
    updated = crud.update_patient(db, patient_id, patient)
    if not updated:
        raise HTTPException(status_code=404, detail="Patient not found")
    return updated


@app.delete("/patients/{patient_id}", tags=["Patients"])
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_patient(db, patient_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": f"Patient {deleted.full_name} deleted successfully"}


# ─── DOCTOR ROUTES ────────────────────────────────────────────────────────────

@app.post("/doctors", response_model=schemas.DoctorResponse, tags=["Doctors"], status_code=201)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    return crud.create_doctor(db, doctor)


@app.get("/doctors", response_model=List[schemas.DoctorResponse], tags=["Doctors"])
def get_doctors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_doctors(db, skip=skip, limit=limit)


@app.get("/doctors/{doctor_id}", response_model=schemas.DoctorResponse, tags=["Doctors"])
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = crud.get_doctor(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


@app.put("/doctors/{doctor_id}", response_model=schemas.DoctorResponse, tags=["Doctors"])
def update_doctor(doctor_id: int, doctor: schemas.DoctorUpdate, db: Session = Depends(get_db)):
    updated = crud.update_doctor(db, doctor_id, doctor)
    if not updated:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return updated


@app.delete("/doctors/{doctor_id}", tags=["Doctors"])
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_doctor(db, doctor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": f"Doctor {deleted.doctor_name} deleted successfully"}


# ─── APPOINTMENT ROUTES ───────────────────────────────────────────────────────

@app.post("/appointments", response_model=schemas.AppointmentResponse, tags=["Appointments"], status_code=201)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    return crud.create_appointment(db, appointment)


@app.get("/appointments", response_model=List[schemas.AppointmentResponse], tags=["Appointments"])
def get_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_appointments(db, skip=skip, limit=limit)


@app.get("/appointments/{appointment_id}", response_model=schemas.AppointmentResponse, tags=["Appointments"])
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appt = crud.get_appointment(db, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt


@app.put("/appointments/{appointment_id}", response_model=schemas.AppointmentResponse, tags=["Appointments"])
def update_appointment(appointment_id: int, appointment: schemas.AppointmentUpdate, db: Session = Depends(get_db)):
    updated = crud.update_appointment(db, appointment_id, appointment)
    if not updated:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated


@app.delete("/appointments/{appointment_id}", tags=["Appointments"])
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_appointment(db, appointment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": f"Appointment #{appointment_id} deleted successfully"}


# ─── PUBLIC BOOKING ───────────────────────────────────────────────────────────

@app.post("/book", tags=["Public Booking"], status_code=201)
def public_book_appointment(booking: schemas.PublicBooking, db: Session = Depends(get_db)):
    """Public-facing endpoint — no login required."""
    appt = crud.create_public_booking(db, booking)
    return {
        "success": True,
        "message": "Appointment Request Submitted Successfully",
        "appointment_id": appt.appointment_id,
        "call_now": "tel:+916353300605"
    }
