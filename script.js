/* ═══════════════════════════════════════════════════════════════
   Dharti's Hospital Management System — Global JS
   ═══════════════════════════════════════════════════════════════ */

const API = "http://127.0.0.1:8000";
const INSTAGRAM_URL = "https://www.instagram.com/yourphysio_drdharati?igsh=YWVib2UwZGtpN212"; // ← Update this

/* ─── TOAST ──────────────────────────────────────────────────── */
function toast(msg, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === "success" ? "✅" : "❌"}</span> ${msg}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

/* ─── MODAL HELPERS ──────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}
// Close modal when clicking overlay
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

/* ─── NAV HAMBURGER ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
  }
  // Mark active nav link
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
  // Set instagram links
  document.querySelectorAll(".instagram-link").forEach((el) => {
    el.href = INSTAGRAM_URL;
  });
});

/* ─── API FETCH WRAPPER ──────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : await res.json();
  } catch (e) {
    toast(e.message, "error");
    throw e;
  }
}

/* ─── CONFIRM DELETE MODAL ───────────────────────────────────── */
let _deleteCallback = null;

function confirmDelete(message, callback) {
  let modal = document.getElementById("confirm-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "confirm-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>⚠️ Confirm Delete</h3>
          <button class="modal-close" onclick="closeModal('confirm-modal')">✕</button>
        </div>
        <div class="modal-body">
          <p id="confirm-message" style="color:var(--text-muted);"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" style="border-color:var(--border);color:var(--text-muted);" onclick="closeModal('confirm-modal')">Cancel</button>
          <button class="btn btn-danger" id="confirm-delete-btn">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  document.getElementById("confirm-message").textContent = message;
  _deleteCallback = callback;
  document.getElementById("confirm-delete-btn").onclick = () => {
    if (_deleteCallback) _deleteCallback();
    closeModal("confirm-modal");
  };
  openModal("confirm-modal");
}

/* ─── PATIENTS PAGE ──────────────────────────────────────────── */
async function loadPatients(search = "") {
  const tbody = document.getElementById("patients-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr class="loading-row"><td colspan="7"><span class="spinner spinner-dark"></span> Loading patients…</td></tr>`;
  const patients = await apiFetch(`/patients?search=${encodeURIComponent(search)}`).catch(() => []);
  // Update count
  const countEl = document.getElementById("patient-count");
  if (countEl) countEl.textContent = patients.length;

  if (!patients.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">🏥</div><h3>No patients found</h3><p>Add your first patient using the button above.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = patients.map((p) => `
    <tr>
      <td><strong>#${p.patient_id}</strong></td>
      <td>${p.full_name}</td>
      <td>${p.age} yrs</td>
      <td>${p.gender}</td>
      <td>${p.phone_number}</td>
      <td>${p.medical_condition || "—"}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-primary" onclick="editPatient(${p.patient_id})">✏️ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePatient(${p.patient_id},'${p.full_name.replace(/'/g,"\\'")}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>`).join("");
}

async function savePatient() {
  const id = document.getElementById("patient-id-hidden").value;
  const payload = {
    full_name: document.getElementById("p-name").value.trim(),
    age: parseInt(document.getElementById("p-age").value),
    gender: document.getElementById("p-gender").value,
    phone_number: document.getElementById("p-phone").value.trim(),
    address: document.getElementById("p-address").value.trim(),
    medical_condition: document.getElementById("p-condition").value.trim(),
  };
  if (!payload.full_name || !payload.age || !payload.gender || !payload.phone_number) {
    toast("Please fill all required fields", "error"); return;
  }
  if (id) {
    await apiFetch(`/patients/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    toast("Patient updated successfully");
  } else {
    await apiFetch("/patients", { method: "POST", body: JSON.stringify(payload) });
    toast("Patient added successfully");
  }
  closeModal("patient-modal");
  loadPatients();
}

async function editPatient(id) {
  const p = await apiFetch(`/patients/${id}`).catch(() => null);
  if (!p) return;
  document.getElementById("patient-id-hidden").value = p.patient_id;
  document.getElementById("p-name").value = p.full_name;
  document.getElementById("p-age").value = p.age;
  document.getElementById("p-gender").value = p.gender;
  document.getElementById("p-phone").value = p.phone_number;
  document.getElementById("p-address").value = p.address || "";
  document.getElementById("p-condition").value = p.medical_condition || "";
  document.getElementById("patient-modal-title").textContent = "Edit Patient";
  openModal("patient-modal");
}

function openAddPatient() {
  document.getElementById("patient-form").reset();
  document.getElementById("patient-id-hidden").value = "";
  document.getElementById("patient-modal-title").textContent = "Add New Patient";
  openModal("patient-modal");
}

async function deletePatient(id, name) {
  confirmDelete(`Are you sure you want to delete patient "${name}"? All their appointments will also be removed.`, async () => {
    await apiFetch(`/patients/${id}`, { method: "DELETE" });
    toast(`Patient "${name}" deleted`);
    loadPatients();
  });
}

/* ─── DOCTORS PAGE ───────────────────────────────────────────── */
async function loadDoctors() {
  const tbody = document.getElementById("doctors-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr class="loading-row"><td colspan="6"><span class="spinner spinner-dark"></span> Loading…</td></tr>`;
  const doctors = await apiFetch("/doctors").catch(() => []);
  const countEl = document.getElementById("doctor-count");
  if (countEl) countEl.textContent = doctors.length;
  if (!doctors.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">👨‍⚕️</div><h3>No doctors found</h3><p>Add a doctor profile.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = doctors.map((d) => `
    <tr>
      <td><strong>#${d.doctor_id}</strong></td>
      <td>${d.doctor_name}</td>
      <td>${d.specialization}</td>
      <td>${d.qualification}</td>
      <td>${d.phone_number}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-primary" onclick="editDoctor(${d.doctor_id})">✏️ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDoctor(${d.doctor_id},'${d.doctor_name.replace(/'/g,"\\'")}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>`).join("");
}

async function saveDoctor() {
  const id = document.getElementById("doctor-id-hidden").value;
  const payload = {
    doctor_name: document.getElementById("d-name").value.trim(),
    specialization: document.getElementById("d-spec").value.trim(),
    qualification: document.getElementById("d-qual").value.trim(),
    phone_number: document.getElementById("d-phone").value.trim(),
    email: document.getElementById("d-email").value.trim(),
  };
  if (!payload.doctor_name || !payload.specialization || !payload.qualification || !payload.phone_number) {
    toast("Please fill all required fields", "error"); return;
  }
  if (id) {
    await apiFetch(`/doctors/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    toast("Doctor updated");
  } else {
    await apiFetch("/doctors", { method: "POST", body: JSON.stringify(payload) });
    toast("Doctor added");
  }
  closeModal("doctor-modal");
  loadDoctors();
}

async function editDoctor(id) {
  const d = await apiFetch(`/doctors/${id}`).catch(() => null);
  if (!d) return;
  document.getElementById("doctor-id-hidden").value = d.doctor_id;
  document.getElementById("d-name").value = d.doctor_name;
  document.getElementById("d-spec").value = d.specialization;
  document.getElementById("d-qual").value = d.qualification;
  document.getElementById("d-phone").value = d.phone_number;
  document.getElementById("d-email").value = d.email || "";
  document.getElementById("doctor-modal-title").textContent = "Edit Doctor";
  openModal("doctor-modal");
}

function openAddDoctor() {
  document.getElementById("doctor-form").reset();
  document.getElementById("doctor-id-hidden").value = "";
  document.getElementById("doctor-modal-title").textContent = "Add Doctor";
  openModal("doctor-modal");
}

async function deleteDoctor(id, name) {
  confirmDelete(`Delete doctor "${name}"?`, async () => {
    await apiFetch(`/doctors/${id}`, { method: "DELETE" });
    toast(`Doctor "${name}" deleted`);
    loadDoctors();
  });
}

/* ─── APPOINTMENTS PAGE ──────────────────────────────────────── */
async function loadAppointments() {
  const tbody = document.getElementById("appointments-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr class="loading-row"><td colspan="7"><span class="spinner spinner-dark"></span> Loading…</td></tr>`;
  const appts = await apiFetch("/appointments").catch(() => []);
  const countEl = document.getElementById("appt-count");
  if (countEl) countEl.textContent = appts.length;
  if (!appts.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📅</div><h3>No appointments yet</h3></div></td></tr>`;
    return;
  }
  tbody.innerHTML = appts.map((a) => `
    <tr>
      <td><strong>#${a.appointment_id}</strong></td>
      <td>${a.patient_name || (a.patient_id ? `Patient #${a.patient_id}` : "—")}</td>
      <td>${a.appointment_date}</td>
      <td>${a.appointment_time}</td>
      <td><span class="status status-${(a.status||"pending").toLowerCase()}">${a.status || "Pending"}</span></td>
      <td>${a.notes || "—"}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-primary" onclick="editAppointment(${a.appointment_id})">✏️ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${a.appointment_id})">🗑️ Delete</button>
        </div>
      </td>
    </tr>`).join("");
}

async function populateDoctorSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const doctors = await apiFetch("/doctors").catch(() => []);
  select.innerHTML = `<option value="">— Select Doctor (optional) —</option>` +
    doctors.map((d) => `<option value="${d.doctor_id}">${d.doctor_name}</option>`).join("");
}

async function populatePatientSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const patients = await apiFetch("/patients").catch(() => []);
  select.innerHTML = `<option value="">— Select Patient (optional) —</option>` +
    patients.map((p) => `<option value="${p.patient_id}">${p.full_name}</option>`).join("");
}

async function saveAppointment() {
  const id = document.getElementById("appt-id-hidden").value;
  const payload = {
    patient_id: document.getElementById("a-patient").value ? parseInt(document.getElementById("a-patient").value) : null,
    doctor_id: document.getElementById("a-doctor").value ? parseInt(document.getElementById("a-doctor").value) : null,
    patient_name: document.getElementById("a-pname").value.trim() || null,
    patient_phone: document.getElementById("a-pphone").value.trim() || null,
    appointment_date: document.getElementById("a-date").value,
    appointment_time: document.getElementById("a-time").value,
    notes: document.getElementById("a-notes").value.trim(),
    status: document.getElementById("a-status").value,
  };
  if (!payload.appointment_date || !payload.appointment_time) {
    toast("Date and time are required", "error"); return;
  }
  if (id) {
    await apiFetch(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    toast("Appointment updated");
  } else {
    await apiFetch("/appointments", { method: "POST", body: JSON.stringify(payload) });
    toast("Appointment created");
  }
  closeModal("appt-modal");
  loadAppointments();
}

async function editAppointment(id) {
  const a = await apiFetch(`/appointments/${id}`).catch(() => null);
  if (!a) return;
  await populatePatientSelect("a-patient");
  await populateDoctorSelect("a-doctor");
  document.getElementById("appt-id-hidden").value = a.appointment_id;
  document.getElementById("a-patient").value = a.patient_id || "";
  document.getElementById("a-doctor").value = a.doctor_id || "";
  document.getElementById("a-pname").value = a.patient_name || "";
  document.getElementById("a-pphone").value = a.patient_phone || "";
  document.getElementById("a-date").value = a.appointment_date;
  document.getElementById("a-time").value = a.appointment_time;
  document.getElementById("a-notes").value = a.notes || "";
  document.getElementById("a-status").value = a.status || "Pending";
  document.getElementById("appt-modal-title").textContent = "Edit Appointment";
  openModal("appt-modal");
}

async function openAddAppointment() {
  document.getElementById("appt-form").reset();
  document.getElementById("appt-id-hidden").value = "";
  document.getElementById("appt-modal-title").textContent = "New Appointment";
  await populatePatientSelect("a-patient");
  await populateDoctorSelect("a-doctor");
  openModal("appt-modal");
}

async function deleteAppointment(id) {
  confirmDelete(`Delete appointment #${id}?`, async () => {
    await apiFetch(`/appointments/${id}`, { method: "DELETE" });
    toast(`Appointment #${id} deleted`);
    loadAppointments();
  });
}

/* ─── PUBLIC BOOKING (Home page) ─────────────────────────────── */
async function submitPublicBooking(e) {
  e.preventDefault();
  const btn = document.getElementById("book-btn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Booking…`;

  const payload = {
    patient_name: document.getElementById("b-name").value.trim(),
    patient_phone: document.getElementById("b-phone").value.trim(),
    appointment_date: document.getElementById("b-date").value,
    notes: document.getElementById("b-notes").value.trim(),
  };

  if (!payload.patient_name || !payload.patient_phone || !payload.appointment_date) {
    toast("Please fill all required fields", "error");
    btn.disabled = false; btn.innerHTML = "Book Appointment →";
    return;
  }

  try {
    await apiFetch("/book", { method: "POST", body: JSON.stringify(payload) });
    // Show success state
    document.getElementById("booking-form-wrap").style.display = "none";
    document.getElementById("booking-success").style.display = "block";
  } catch {
    btn.disabled = false;
    btn.innerHTML = "Book Appointment →";
  }
}
