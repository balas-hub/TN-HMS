// Doctor Clinical Workbench & OPD Consultation Engine

let selectedPatientForDoc = null;
let currentDoctorSession = null;

function renderDoctorWorkbench(doctor) {
  currentDoctorSession = doctor;
  const body = document.getElementById("doctor-modal-body");
  
  // Pick default first patient if available
  const patients = window.HospitalData.getPatients();
  const firstPatientReceipt = doctor.todayQueue[0] ? doctor.todayQueue[0].receiptId : null;
  selectedPatientForDoc = firstPatientReceipt ? window.HospitalData.findPatientRecord(firstPatientReceipt) : patients[0];

  body.innerHTML = `
    <!-- Doctor Profile Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 14px; margin-bottom: 16px;">
      <div>
        <span style="font-size: 11px; font-weight: 700; color: #006A4E; text-transform: uppercase;">TAMIL NADU MEDICAL COUNCIL</span>
        <h3 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 2px 0;">${escapeHtml(doctor.name)}</h3>
        <p style="font-size: 12.5px; color: #0D9488; font-weight: 600;">${escapeHtml(doctor.degrees || 'MD (Gen Med), DM (Cardiology), FACC')}</p>
      </div>
      <div>
        <button class="btn btn-outline" style="font-size: 12px; padding: 6px 12px;" onclick="window.AuthEngine.handleDoctorLogout()">Sign Out</button>
      </div>
    </div>

    <!-- Workbench Split Layout: Queue on Left, Patient Form on Right -->
    <div class="doctor-workbench-layout">
      <!-- Queue Sidebar -->
      <div class="queue-sidebar">
        <div class="queue-title">
          <span>Today's OPD Tokens</span>
          <span class="queue-badge-count">${doctor.todayQueue.length} Patients</span>
        </div>
        <div id="doctor-queue-list">
          ${renderQueueItems(doctor.todayQueue)}
        </div>
      </div>

      <!-- Clinical Consultation Form -->
      <div class="consultation-form-pane" id="consultation-form-pane">
        ${renderConsultationPane(selectedPatientForDoc)}
      </div>
    </div>
  `;
}

function renderQueueItems(queue) {
  return queue.map(item => {
    const isSelected = selectedPatientForDoc && selectedPatientForDoc.receiptId === item.receiptId;
    return `
      <div class="queue-item ${isSelected ? 'active' : ''}" onclick="selectQueuePatient('${item.receiptId}')">
        <div class="queue-item-header">
          <span>TOKEN #${item.token}</span>
          <span style="color: ${item.status.includes('Completed') ? '#006A4E' : '#D97706'}">${escapeHtml(item.status)}</span>
        </div>
        <div class="queue-patient-name">${escapeHtml(item.patientName)}</div>
        <div class="queue-type">${escapeHtml(item.type)} (Age: ${item.age})</div>
      </div>
    `;
  }).join("");
}

function selectQueuePatient(receiptId) {
  selectedPatientForDoc = window.HospitalData.findPatientRecord(receiptId);
  
  // Re-render queue to highlight active item
  const queueList = document.getElementById("doctor-queue-list");
  if (queueList && currentDoctorSession) {
    queueList.innerHTML = renderQueueItems(currentDoctorSession.todayQueue);
  }

  // Render patient consultation form
  const pane = document.getElementById("consultation-form-pane");
  if (pane && selectedPatientForDoc) {
    pane.innerHTML = renderConsultationPane(selectedPatientForDoc);
  }
}

function renderConsultationPane(patient) {
  if (!patient) {
    return `<div style="text-align: center; padding: 40px; color: #64748B;">No patient selected from OPD queue.</div>`;
  }

  return `
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 0;">${escapeHtml(patient.name)}</h4>
          <span style="font-size: 12px; color: #64748B;">Receipt: <strong>${patient.receiptId}</strong> | ABHA: <strong>${patient.abhaId}</strong> | Age: ${patient.age} | Blood: ${patient.bloodGroup}</span>
        </div>
        <button class="btn btn-outline" style="font-size: 11.5px; padding: 4px 10px;" onclick="window.RecordEngine.search('${patient.receiptId}'); window.AuthEngine.closeDoctorPortal();">
          Inspect Full History
        </button>
      </div>
    </div>

    <form onsubmit="handleSaveConsultation(event, '${patient.receiptId}')">
      <div class="form-group">
        <label class="form-label">Clinical Diagnosis & Findings</label>
        <textarea id="doc-diagnosis-input" class="form-control" rows="2" required>${escapeHtml(patient.clinicalSummary.diagnosis)}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Physician Clinical Progress Notes</label>
        <textarea id="doc-notes-input" class="form-control" rows="2" required>${escapeHtml(patient.clinicalSummary.clinicalNotes)}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
        <div>
          <label class="form-label">BP (mmHg)</label>
          <input type="text" id="doc-bp-input" class="form-control" value="${patient.vitals.bp}">
        </div>
        <div>
          <label class="form-label">Pulse (bpm)</label>
          <input type="text" id="doc-pulse-input" class="form-control" value="${patient.vitals.pulse}">
        </div>
      </div>

      <!-- Add New Medicine Section -->
      <div style="border-top: 1px dashed #CBD5E1; padding-top: 12px; margin-top: 12px;">
        <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Prescribe Additional Medication (Rx)</span>
          <span style="font-size: 11px; color: #006A4E; font-weight: 600;">Active Medicines: ${patient.prescriptions.length}</span>
        </label>
        <div class="rx-builder-row">
          <input type="text" id="rx-name" class="form-control" placeholder="Medicine (e.g. Tab. Azithromycin 500mg)">
          <input type="text" id="rx-freq" class="form-control" placeholder="Dosage (e.g. 1 - 0 - 0)">
          <input type="text" id="rx-timing" class="form-control" placeholder="Timing (e.g. After Food)">
          <button type="button" class="btn btn-outline" style="padding: 9px 12px;" onclick="addQuickMedicineToPatient()">+ Add</button>
        </div>
        <div id="quick-added-medicines" style="font-size: 12px; color: #006A4E; margin-top: 4px;"></div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-primary" style="padding: 10px 20px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save & Update Patient Record
        </button>
      </div>
    </form>
  `;
}

let tempPrescriptionsToAdd = [];

function addQuickMedicineToPatient() {
  const name = document.getElementById("rx-name").value.trim();
  const freq = document.getElementById("rx-freq").value.trim() || "1 - 0 - 1";
  const timing = document.getElementById("rx-timing").value.trim() || "After Food";

  if (!name) {
    showToast("Please enter a medicine name", "error");
    return;
  }

  tempPrescriptionsToAdd.push({
    medicine: name,
    dosage: "Standard",
    frequency: freq,
    timing: timing,
    duration: "7 Days",
    instructions: "Doctor prescribed via OPD"
  });

  document.getElementById("rx-name").value = "";
  document.getElementById("quick-added-medicines").innerText = `Added: ${tempPrescriptionsToAdd.map(m => m.medicine).join(", ")}`;
  showToast(`Added ${name} to prescription list`);
}

function handleSaveConsultation(e, receiptId) {
  e.preventDefault();
  const diagnosis = document.getElementById("doc-diagnosis-input").value.trim();
  const notes = document.getElementById("doc-notes-input").value.trim();
  const bp = document.getElementById("doc-bp-input").value.trim();
  const pulse = document.getElementById("doc-pulse-input").value.trim();

  const patients = window.HospitalData.getPatients();
  const targetPatient = patients.find(p => p.receiptId === receiptId);

  if (targetPatient) {
    targetPatient.clinicalSummary.diagnosis = diagnosis;
    targetPatient.clinicalSummary.clinicalNotes = notes;
    if (bp) targetPatient.vitals.bp = bp;
    if (pulse) targetPatient.vitals.pulse = pulse;

    if (tempPrescriptionsToAdd.length > 0) {
      targetPatient.prescriptions.push(...tempPrescriptionsToAdd);
      tempPrescriptionsToAdd = [];
    }

    targetPatient.status = "Reviewed by Specialist";
    window.HospitalData.savePatients(patients);

    showToast(`Patient ${targetPatient.name}'s record updated successfully!`);
    
    // Also if the patient record view is currently visible on screen, reload it
    const searchInput = document.getElementById("patient-search-input");
    if (searchInput && searchInput.value.trim().toLowerCase() === receiptId.toLowerCase()) {
      window.RecordEngine.search(receiptId);
    }
  }
}

window.DoctorEngine = {
  renderWorkbench: renderDoctorWorkbench,
  selectQueuePatient,
  addQuickMedicineToPatient,
  handleSaveConsultation
};
