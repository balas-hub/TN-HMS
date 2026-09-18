// Patient Record Lookup and Presentation Engine
// Handles search by Receipt ID or ABHA ID / ABHI

function searchPatientRecord(identifier) {
  const query = (identifier || "").trim();
  if (!query) {
    showToast("Please enter a valid Receipt ID or ABHA ID", "error");
    return;
  }

  const patient = window.HospitalData.findPatientRecord(query);
  const resultSection = document.getElementById("record-result-section");
  const resultContainer = document.getElementById("record-display-target");

  if (!patient) {
    showToast(`No medical record found matching '${query}'. Please check the ID.`, "error");
    return;
  }

  // Render comprehensive medical record
  resultContainer.innerHTML = renderPatientFullRecord(patient);
  resultSection.style.display = "block";
  
  // Smooth scroll to record view
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`Medical record loaded successfully for ${patient.name}`);
}

// Quick fill search field
function quickFillSearch(val) {
  const searchInput = document.getElementById("patient-search-input");
  if (searchInput) {
    searchInput.value = val;
    searchPatientRecord(val);
  }
}

// Full Medical Record HTML Template
function renderPatientFullRecord(p) {
  const labRows = p.labReports.map(lab => {
    let badgeClass = "status-normal";
    if (lab.status.toLowerCase().includes("high") || lab.status.toLowerCase().includes("abnormality")) {
      badgeClass = "status-alert";
    } else if (lab.status.toLowerCase().includes("danger") || lab.status.toLowerCase().includes("critical")) {
      badgeClass = "status-danger";
    }
    return `
      <tr>
        <td style="font-weight: 600; color: #0F172A;">${escapeHtml(lab.testName)}</td>
        <td>${escapeHtml(lab.date)}</td>
        <td><strong>${escapeHtml(lab.result)}</strong></td>
        <td>${escapeHtml(lab.normalRange)}</td>
        <td><span class="status-badge ${badgeClass}">${escapeHtml(lab.status)}</span></td>
      </tr>
    `;
  }).join("");

  const rxRows = p.prescriptions.map((rx, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td style="font-weight: 700; color: #0F172A;">${escapeHtml(rx.medicine)}</td>
      <td>${escapeHtml(rx.dosage)}</td>
      <td><span class="status-badge status-normal" style="font-weight: 700;">${escapeHtml(rx.frequency)}</span></td>
      <td>${escapeHtml(rx.timing)}</td>
      <td>${escapeHtml(rx.duration)}</td>
      <td style="font-size: 12px; color: #475569;">${escapeHtml(rx.instructions)}</td>
    </tr>
  `).join("");

  return `
    <div class="record-container" id="printable-record-sheet">
      <!-- Official Header Strip -->
      <div class="record-header-strip">
        <div class="hospital-emblem-badge">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
            <path d="M12 2v20M2 12h20"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
          <div class="rec-title-wrap">
            <h3>${escapeHtml(p.centerName)}</h3>
            <p>Department of ${escapeHtml(p.department)} | Ayushman Bharat Health Account (ABHA) Compliant</p>
          </div>
        </div>
        <div class="record-meta-right">
          <span class="rec-id-tag">RECEIPT: ${escapeHtml(p.receiptId)}</span>
          <span class="rec-id-tag">ABHA: ${escapeHtml(p.abhaId)}</span>
          <span class="rec-status-badge">${escapeHtml(p.status)}</span>
        </div>
      </div>

      <!-- Patient Profile Strip -->
      <div class="record-patient-banner">
        <div class="patient-avatar-box">
          ${escapeHtml(p.name.charAt(0))}
        </div>
        <div class="patient-basic-info">
          <h4>${escapeHtml(p.name)}</h4>
          <div class="patient-chips">
            <span class="patient-chip">Age: ${p.age} Yrs</span>
            <span class="patient-chip">Gender: ${escapeHtml(p.gender)}</span>
            <span class="patient-chip blood-chip">Blood Group: ${escapeHtml(p.bloodGroup)}</span>
            <span class="patient-chip">ABHA Address: ${escapeHtml(p.abhaAddress)}</span>
          </div>
          <p style="font-size: 12.5px; color: #64748B; margin-top: 6px;">
            <strong>Residential Address:</strong> ${escapeHtml(p.address)}
          </p>
        </div>
        <div class="patient-meta-details">
          <p><strong>Admission / Visit:</strong> ${escapeHtml(p.admissionDate)}</p>
          <p><strong>Discharge / Review:</strong> ${escapeHtml(p.dischargeDate)}</p>
          <p><strong>Consulting Specialist:</strong> ${escapeHtml(p.consultingDoctor)}</p>
          <p><strong>Medical Reg No:</strong> ${escapeHtml(p.doctorRegNo)}</p>
        </div>
      </div>

      <!-- Clinical Vitals Grid -->
      <div class="vitals-grid-row">
        <div class="vital-card">
          <div class="vital-label">Blood Pressure</div>
          <div class="vital-value">${escapeHtml(p.vitals.bp)}</div>
          <div class="vital-status">Controlled</div>
        </div>
        <div class="vital-card">
          <div class="vital-label">Pulse Rate</div>
          <div class="vital-value">${escapeHtml(p.vitals.pulse)}</div>
          <div class="vital-status">Normal Rhythm</div>
        </div>
        <div class="vital-card">
          <div class="vital-label">SpO2 (Oxygen)</div>
          <div class="vital-value">${escapeHtml(p.vitals.spo2)}</div>
          <div class="vital-status">Adequate</div>
        </div>
        <div class="vital-card">
          <div class="vital-label">Temperature</div>
          <div class="vital-value">${escapeHtml(p.vitals.temp)}</div>
          <div class="vital-status">Afebrile</div>
        </div>
        <div class="vital-card">
          <div class="vital-label">Blood Sugar (F)</div>
          <div class="vital-value">${escapeHtml(p.vitals.bloodSugarFasting)}</div>
          <div class="vital-status">Fasting</div>
        </div>
        <div class="vital-card">
          <div class="vital-label">Body Mass Index</div>
          <div class="vital-value">${escapeHtml(p.vitals.bmi || "24.2")}</div>
          <div class="vital-status">Wt: ${escapeHtml(p.vitals.weight)}</div>
        </div>
      </div>

      <!-- Clinical Summary, Diagnostics, and Prescriptions -->
      <div class="record-body">
        <!-- Diagnosis & Physician Notes -->
        <div class="record-section-block">
          <div class="sec-head">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Clinical Assessment & Diagnosis
          </div>
          <div class="clinical-notes-card">
            <div class="diagnosis-highlight">
              Primary Diagnosis: <span style="color: #006A4E;">${escapeHtml(p.clinicalSummary.diagnosis)}</span>
            </div>
            <p style="font-size: 13px; margin-bottom: 8px;">
              <strong>Chief Complaints:</strong> ${escapeHtml(p.clinicalSummary.chiefComplaints)}
            </p>
            <p class="doctor-note-text">
              <strong>Clinical Assessment Notes:</strong> ${escapeHtml(p.clinicalSummary.clinicalNotes)}
            </p>
            <div style="margin-top: 8px; font-size: 12.5px; color: #DC2626; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Drug Allergies: ${escapeHtml(p.clinicalSummary.allergies || "None Reported")}</span>
            </div>
          </div>
        </div>

        <!-- Diagnostic & Laboratory Reports -->
        <div class="record-section-block">
          <div class="sec-head">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Diagnostic Investigations & Laboratory Findings
          </div>
          <div class="table-wrapper">
            <table class="medical-table">
              <thead>
                <tr>
                  <th>Investigation / Test Name</th>
                  <th>Date & Time</th>
                  <th>Observed Value / Result</th>
                  <th>Reference Range</th>
                  <th>Clinical Status</th>
                </tr>
              </thead>
              <tbody>
                ${labRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Digital Prescriptions -->
        <div class="record-section-block">
          <div class="sec-head">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            Prescribed Medications & Treatment Regimen (Rx)
          </div>
          <div class="table-wrapper">
            <table class="medical-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine Name</th>
                  <th>Strength</th>
                  <th>Dosage (M-A-N)</th>
                  <th>Food Instruction</th>
                  <th>Duration</th>
                  <th>Specific Doctor Advice</th>
                </tr>
              </thead>
              <tbody>
                ${rxRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Government Health Insurance Settlement -->
        <div class="insurance-banner">
          <div class="scheme-info">
            <span class="scheme-badge">GOVT HEALTH SCHEME</span>
            <div>
              <strong style="color: #0F172A; font-size: 13.5px;">${escapeHtml(p.billing.insuranceScheme)}</strong>
              <div style="font-size: 12px; color: #475569;">Total Hospital Bill: ${escapeHtml(p.billing.totalAmount)} | Approved Scheme Coverage: ${escapeHtml(p.billing.schemeApproved)}</div>
            </div>
          </div>
          <div class="settlement-badge">
            Patient Payable: ${escapeHtml(p.billing.patientPayable)} (${escapeHtml(p.billing.paymentStatus)})
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="record-footer-actions">
        <div class="doctor-sign-off">
          <strong>Next Review / Follow-Up:</strong> ${escapeHtml(p.followUp)} <br>
          Authorized Medical Officer: <strong>${escapeHtml(p.consultingDoctor)}</strong> (Tamil Nadu Medical Council)
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline" onclick="window.print()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print Medical Record
          </button>
          <button class="btn btn-primary" onclick="downloadRecordSummary('${p.receiptId}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Save Record Summary
          </button>
        </div>
      </div>
    </div>
  `;
}

// Download patient summary as text/markdown record
function downloadRecordSummary(receiptId) {
  const patient = window.HospitalData.findPatientRecord(receiptId);
  if (!patient) return;
  
  const textContent = `===================================================================
TAMIL NADU HEALTH CARE & PAN-INDIA MEDICAL CENTRE
OFFICIAL CLINICAL RECORD SUMMARY
===================================================================
Hospital: ${patient.centerName}
Receipt ID: ${patient.receiptId} | ABHA ID: ${patient.abhaId}
Patient: ${patient.name} | Age: ${patient.age} | Gender: ${patient.gender} | Blood: ${patient.bloodGroup}
Consulting Doctor: ${patient.consultingDoctor} (${patient.doctorRegNo})
Status: ${patient.status}
-------------------------------------------------------------------
DIAGNOSIS:
${patient.clinicalSummary.diagnosis}

CLINICAL NOTES:
${patient.clinicalSummary.clinicalNotes}

VITALS:
BP: ${patient.vitals.bp} | Pulse: ${patient.vitals.pulse} | SpO2: ${patient.vitals.spo2} | Temp: ${patient.vitals.temp}

PRESCRIPTION:
${patient.prescriptions.map(p => `- ${p.medicine} (${p.dosage}): ${p.frequency} | ${p.timing} | ${p.duration}`).join("\n")}

FOLLOW UP:
${patient.followUp}
===================================================================`;

  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Medical_Record_${patient.receiptId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Record summary downloaded successfully");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.RecordEngine = {
  search: searchPatientRecord,
  quickFill: quickFillSearch,
  download: downloadRecordSummary
};
