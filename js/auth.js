// Client (Patient) and Doctor Authentication & Portal Management

let currentLoggedInPatient = null;
let currentLoggedInDoctor = null;

// Modal Controls
function openClientPortalModal() {
  const modal = document.getElementById("client-portal-modal");
  if (!modal) return;
  modal.classList.add("active");
  
  // If already logged in, show dashboard directly, else show login form
  if (currentLoggedInPatient) {
    showPatientDashboard(currentLoggedInPatient);
  } else {
    showPatientLoginForm();
  }
}

function closeClientPortalModal() {
  const modal = document.getElementById("client-portal-modal");
  if (modal) modal.classList.remove("active");
}

function openDoctorPortalModal() {
  const modal = document.getElementById("doctor-portal-modal");
  if (!modal) return;
  modal.classList.add("active");
  
  if (currentLoggedInDoctor) {
    if (window.DoctorEngine && window.DoctorEngine.renderWorkbench) {
      window.DoctorEngine.renderWorkbench(currentLoggedInDoctor);
    }
  } else {
    showDoctorLoginForm();
  }
}

function closeDoctorPortalModal() {
  const modal = document.getElementById("doctor-portal-modal");
  if (modal) modal.classList.remove("active");
}

// -----------------------------------------------------------------------------
// CLIENT / PATIENT PORTAL FLOW
// -----------------------------------------------------------------------------
function showPatientLoginForm() {
  const body = document.getElementById("client-modal-body");
  body.innerHTML = `
    <div class="modal-tabs">
      <button class="modal-tab-btn active" onclick="switchPatientLoginTab('abha', this)">Login via ABHA Number</button>
      <button class="modal-tab-btn" onclick="switchPatientLoginTab('mobile', this)">Mobile OTP Login</button>
    </div>

    <form id="patient-login-form" onsubmit="handlePatientLogin(event)">
      <div id="patient-input-container">
        <div class="form-group">
          <label class="form-label">ABHA ID (Ayushman Bharat Health Account) / Receipt ID</label>
          <input type="text" id="patient-auth-input" class="form-control" placeholder="Enter 14-digit ABHA ID or Receipt ID" required>
          <div class="form-hint">Enter your 14-digit ABHA ID or hospital receipt number</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Security PIN / Password</label>
        <input type="password" id="patient-auth-pin" class="form-control" placeholder="Enter 4-digit PIN" required>
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 6px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
        </svg>
        Access Patient Health Locker
      </button>
    </form>
  `;
}

function switchPatientLoginTab(tabType, btn) {
  document.querySelectorAll(".modal-tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const input = document.getElementById("patient-auth-input");
  const label = document.querySelector("#patient-input-container .form-label");
  if (tabType === 'mobile') {
    label.innerText = "Registered Mobile Number";
    input.placeholder = "Enter 10-digit Mobile Number";
  } else {
    label.innerText = "ABHA ID / Receipt ID";
    input.placeholder = "Enter 14-digit ABHA ID or Receipt ID";
  }
}

function autofillPatient(id) {
  const input = document.getElementById("patient-auth-input");
  if (input) input.value = id;
}

function handlePatientLogin(e) {
  e.preventDefault();
  const val = document.getElementById("patient-auth-input").value.trim();
  const patient = window.HospitalData.findPatientRecord(val);

  if (!patient) {
    showToast("Invalid ABHA ID, Receipt ID, or Mobile number", "error");
    return;
  }

  currentLoggedInPatient = patient;
  showToast(`Welcome back, ${patient.name}!`);
  showPatientDashboard(patient);
}

function showPatientDashboard(p) {
  const body = document.getElementById("client-modal-body");
  body.innerHTML = `
    <div class="client-profile-header">
      <div>
        <div style="font-size: 11px; font-weight: 700; color: #006A4E; text-transform: uppercase;">PATIENT HEALTH DASHBOARD</div>
        <h3 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 2px 0;">${escapeHtml(p.name)}</h3>
        <p style="font-size: 12.5px; color: #64748B;">ABHA: <strong>${p.abhaId}</strong> | Blood Group: <strong style="color: #DC2626;">${p.bloodGroup}</strong> | Age: ${p.age} Yrs</p>
      </div>
      <div>
        <button class="btn btn-outline" style="font-size: 12px; padding: 6px 12px;" onclick="handlePatientLogout()">Sign Out</button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; text-align: center;">
        <div style="font-size: 11px; color: #64748B; font-weight: 600;">ACTIVE VISITS</div>
        <div style="font-size: 22px; font-weight: 800; color: #006A4E;">01</div>
        <div style="font-size: 11px; color: #475569;">${escapeHtml(p.department)}</div>
      </div>
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; text-align: center;">
        <div style="font-size: 11px; color: #64748B; font-weight: 600;">LAB REPORTS</div>
        <div style="font-size: 22px; font-weight: 800; color: #0F172A;">${p.labReports.length}</div>
        <div style="font-size: 11px; color: #475569;">Diagnostic Tests</div>
      </div>
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; text-align: center;">
        <div style="font-size: 11px; color: #64748B; font-weight: 600;">PRESCRIPTIONS</div>
        <div style="font-size: 22px; font-weight: 800; color: #D97706;">${p.prescriptions.length}</div>
        <div style="font-size: 11px; color: #475569;">Active Regimen</div>
      </div>
    </div>

    <h4 style="font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 12px;">Recent Health Records & Consultations</h4>
    <div class="records-list-grid">
      <div class="client-record-card">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="status-badge status-normal">Receipt: ${p.receiptId}</span>
            <span style="font-size: 12px; color: #64748B;">Date: ${p.admissionDate}</span>
          </div>
          <h5 style="font-size: 15px; font-weight: 700; color: #0F172A;">${escapeHtml(p.clinicalSummary.diagnosis)}</h5>
          <p style="font-size: 12.5px; color: #475569;">Hospital: ${escapeHtml(p.centerName)}</p>
          <p style="font-size: 12px; color: #006A4E; font-weight: 600; margin-top: 4px;">Doctor: ${escapeHtml(p.consultingDoctor)}</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-primary" style="font-size: 12.5px;" onclick="viewRecordFromClient('${p.receiptId}')">
            View Complete Record
          </button>
          <button class="btn btn-outline" style="font-size: 12px;" onclick="window.RecordEngine.download('${p.receiptId}')">
            Download Slip
          </button>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px; padding: 14px; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px;">
      <strong style="color: #92400E; font-size: 13px;">Upcoming Follow-Up Appointment:</strong>
      <p style="font-size: 12.5px; color: #78350F; margin-top: 2px;">${escapeHtml(p.followUp)}</p>
    </div>
  `;
}

function viewRecordFromClient(receiptId) {
  closeClientPortalModal();
  window.RecordEngine.search(receiptId);
}

function handlePatientLogout() {
  currentLoggedInPatient = null;
  showPatientLoginForm();
  showToast("You have signed out of Patient Health Locker.");
}

// -----------------------------------------------------------------------------
// DOCTOR / STAFF PORTAL FLOW
// -----------------------------------------------------------------------------
function showDoctorLoginForm() {
  const body = document.getElementById("doctor-modal-body");
  body.innerHTML = `
    <form id="doctor-login-form" onsubmit="handleDoctorLogin(event)">
      <div class="form-group">
        <label class="form-label">Medical Council Registration No (TMC / NMC)</label>
        <input type="text" id="doctor-reg-input" class="form-control" placeholder="e.g. TMC-XXXXX" required>
        <div class="form-hint">Tamil Nadu Medical Council or National Medical Commission ID</div>
      </div>

      <div class="form-group">
        <label class="form-label">Doctor Access Security PIN / Password</label>
        <input type="password" id="doctor-pin-input" class="form-control" placeholder="Enter Security PIN" required>
      </div>

      <button type="submit" class="btn btn-doctor" style="width: 100%; padding: 12px; margin-top: 6px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        Sign In to Doctor Clinical Workbench
      </button>
    </form>
  `;
}

function autofillDoctor(reg, pin) {
  const regInput = document.getElementById("doctor-reg-input");
  const pinInput = document.getElementById("doctor-pin-input");
  if (regInput) regInput.value = reg;
  if (pinInput) pinInput.value = pin;
}

function handleDoctorLogin(e) {
  e.preventDefault();
  const reg = document.getElementById("doctor-reg-input").value.trim().toUpperCase();
  const pin = document.getElementById("doctor-pin-input").value.trim();

  const doctors = window.HospitalData.getDoctors();
  const doc = doctors.find(d => d.regNo.toUpperCase() === reg && d.pin === pin);

  if (!doc) {
    showToast("Invalid Doctor Registration Number or PIN", "error");
    return;
  }

  currentLoggedInDoctor = doc;
  showToast(`Welcome Dr. ${doc.name}`);
  if (window.DoctorEngine && window.DoctorEngine.renderWorkbench) {
    window.DoctorEngine.renderWorkbench(doc);
  }
}

function handleDoctorLogout() {
  currentLoggedInDoctor = null;
  showDoctorLoginForm();
  showToast("Doctor session signed out.");
}

window.AuthEngine = {
  openClientPortal: openClientPortalModal,
  closeClientPortal: closeClientPortalModal,
  openDoctorPortal: openDoctorPortalModal,
  closeDoctorPortal: closeDoctorPortalModal,
  autofillPatient,
  autofillDoctor,
  switchPatientLoginTab,
  handlePatientLogin,
  handleDoctorLogin,
  handlePatientLogout,
  handleDoctorLogout
};
