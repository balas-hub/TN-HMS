// ============================================================================
// TAMIL NADU HEALTH CARE - SQL DATABASE SERVICE (database.js)
// Zero-Dependency Relational SQLite Engine using Node.js built-in node:sqlite
// Database file: server/db/hospital.db
// ============================================================================

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_FILE = path.join(__dirname, 'hospital.db');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const SEED_FILE = path.join(__dirname, 'seed_data.sql');

let db = null;

function getDB() {
  if (!db) {
    db = new DatabaseSync(DB_FILE);
    db.exec('PRAGMA foreign_keys = ON;');
    initSchema();
  }
  return db;
}

function initSchema() {
  try {
    if (fs.existsSync(SCHEMA_FILE)) {
      const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
      db.exec(schemaSql);

      // Safe schema migration for personal details columns
      try {
        const columns = db.prepare("PRAGMA table_info(patients)").all().map(c => c.name);
        const neededCols = [
          { name: 'dob', type: 'VARCHAR(32)' },
          { name: 'guardian_name', type: 'VARCHAR(128)' },
          { name: 'emergency_phone', type: 'VARCHAR(32)' },
          { name: 'email', type: 'VARCHAR(128)' },
          { name: 'district', type: 'VARCHAR(64)' },
          { name: 'pincode', type: 'VARCHAR(16)' },
          { name: 'pin', type: 'VARCHAR(16) DEFAULT "1234"' }
        ];
        for (const col of neededCols) {
          if (!columns.includes(col.name)) {
            db.exec(`ALTER TABLE patients ADD COLUMN ${col.name} ${col.type};`);
          }
        }
      } catch (colErr) {
        console.warn('[SQL DB] Notice during column migration:', colErr.message);
      }
    }
  } catch (err) {
    console.error('[SQL DB] Error initializing schema:', err);
  }
}

// Feed Data from seed_data.sql into hospital.db
function feedDatabase() {
  const database = getDB();
  try {
    if (!fs.existsSync(SEED_FILE)) {
      throw new Error(`Seed file not found: ${SEED_FILE}`);
    }
    const seedSql = fs.readFileSync(SEED_FILE, 'utf8');
    database.exec(seedSql);

    const stats = getStats();
    console.log('[SQL DB] Successfully fed clinical records into SQL database!');
    console.log(`[SQL DB] Patients: ${stats.patients} | Prescriptions: ${stats.prescriptions} | Lab Reports: ${stats.labReports} | Doctors: ${stats.doctors}`);
    return { success: true, stats };
  } catch (err) {
    console.error('[SQL DB] Error feeding database:', err);
    return { success: false, error: err.message };
  }
}

// Get statistics on current database tables
function getStats() {
  const database = getDB();
  try {
    const patients = database.prepare('SELECT COUNT(*) as count FROM patients').get().count;
    const vitals = database.prepare('SELECT COUNT(*) as count FROM patient_vitals').get().count;
    const summaries = database.prepare('SELECT COUNT(*) as count FROM clinical_summaries').get().count;
    const prescriptions = database.prepare('SELECT COUNT(*) as count FROM prescriptions').get().count;
    const pastMedications = database.prepare('SELECT COUNT(*) as count FROM past_medications').get().count;
    const pastRecords = database.prepare('SELECT COUNT(*) as count FROM past_records').get().count;
    const labReports = database.prepare('SELECT COUNT(*) as count FROM lab_reports').get().count;
    const billings = database.prepare('SELECT COUNT(*) as count FROM billings').get().count;
    const doctors = database.prepare('SELECT COUNT(*) as count FROM doctors').get().count;
    const opdQueue = database.prepare('SELECT COUNT(*) as count FROM opd_queue').get().count;
    const radiologyStudies = database.prepare('SELECT COUNT(*) as count FROM radiology_studies').get().count;

    return {
      isReady: true,
      dbPath: DB_FILE,
      patients,
      vitals,
      summaries,
      prescriptions,
      pastMedications,
      pastRecords,
      labReports,
      billings,
      doctors,
      opdQueue,
      radiologyStudies
    };
  } catch (err) {
    return { isReady: false, error: err.message };
  }
}

// Search patient by receipt_id or abha_id with full joined clinical entities
function getPatientByQuery(query) {
  if (!query) return null;
  const database = getDB();
  const cleanQ = query.trim();
  const strippedQ = cleanQ.replace(/[\s\-\+]/g, '');

  const stmt = database.prepare(`
    SELECT * FROM patients 
    WHERE UPPER(receipt_id) = UPPER(?) 
       OR UPPER(abha_id) = UPPER(?)
       OR UPPER(id) = UPPER(?)
       OR UPPER(phone) = UPPER(?)
       OR REPLACE(REPLACE(abha_id, '-', ''), ' ', '') = ?
       OR REPLACE(REPLACE(REPLACE(phone, '-', ''), ' ', ''), '+', '') = ?
       OR UPPER(name) LIKE ?
    LIMIT 1
  `);
  const patientRow = stmt.get(cleanQ, cleanQ, cleanQ, cleanQ, strippedQ, strippedQ, `%${cleanQ}%`);
  if (!patientRow) return null;

  // Query Vitals
  const vitalsRow = database.prepare(`
    SELECT * FROM patient_vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1
  `).get(patientRow.id) || {};

  // Query Clinical Summary
  const summaryRow = database.prepare(`
    SELECT * FROM clinical_summaries WHERE patient_id = ? LIMIT 1
  `).get(patientRow.id) || {};

  // Query Prescriptions
  const prescriptionRows = database.prepare(`
    SELECT medicine, dosage, frequency, timing, duration, instructions 
    FROM prescriptions WHERE patient_id = ?
  `).all(patientRow.id);

  // Query Previously Used Medicines (Past Medications)
  const pastMedRows = database.prepare(`
    SELECT medicine, dosage, frequency, duration, prescribed_by as prescribedBy, indication, reason_for_change as reasonForChange, status 
    FROM past_medications WHERE patient_id = ?
  `).all(patientRow.id);

  // Query Past Health Records
  const pastRecRows = database.prepare(`
    SELECT id, date, hospital, department, doctor, diagnosis, outcome 
    FROM past_records WHERE patient_id = ?
  `).all(patientRow.id);

  // Query Lab Reports
  const labRows = database.prepare(`
    SELECT test_name as testName, test_date as date, observed_value as result, normal_range as normalRange, status 
    FROM lab_reports WHERE patient_id = ?
  `).all(patientRow.id);

  // Query Billing
  const billingRow = database.prepare(`
    SELECT total_amount as totalAmount, insurance_scheme as insuranceScheme, 
           scheme_approved as schemeApproved, patient_payable as patientPayable, 
           payment_status as paymentStatus 
    FROM billings WHERE patient_id = ? LIMIT 1
  `).get(patientRow.id) || {};

  // Query RIS & PACS Radiology Studies
  const radRows = database.prepare(`
    SELECT id, patient_id as patientId, patient_name as patientName, receipt_id as receiptId,
           study_title as studyTitle, modality, body_part as bodyPart, study_date as studyDate,
           accession_no as accessionNo, status, priority, department, referring_doctor as referringDoctor,
           radiologist_name as radiologistName, clinical_indication as clinicalIndication, technique,
           findings, impression, series_count as seriesCount, slice_count as sliceCount,
           dicom_window_center as dicomWindowCenter, dicom_window_width as dicomWindowWidth,
           scan_type as scanType, image_urls as imageUrls, created_at as createdAt
    FROM radiology_studies WHERE patient_id = ? OR receipt_id = ?
    ORDER BY created_at DESC
  `).all(patientRow.id, patientRow.receipt_id);

  return {
    id: patientRow.id,
    receiptId: patientRow.receipt_id,
    abhaId: patientRow.abha_id,
    abhaAddress: patientRow.abha_address,
    name: (patientRow.name || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim(),
    age: patientRow.age,
    gender: patientRow.gender,
    bloodGroup: patientRow.blood_group,
    phone: patientRow.phone,
    dob: patientRow.dob || '',
    guardianName: patientRow.guardian_name || '',
    emergencyPhone: patientRow.emergency_phone || '',
    email: patientRow.email || '',
    district: patientRow.district || '',
    pincode: patientRow.pincode || '',
    pin: patientRow.pin || '1234',
    address: patientRow.address,
    centerName: patientRow.center_name,
    admissionDate: patientRow.admission_date,
    dischargeDate: patientRow.discharge_date,
    status: patientRow.status,
    department: patientRow.department,
    consultingDoctor: patientRow.consulting_doctor,
    doctorRegNo: patientRow.doctor_reg_no,
    followUp: patientRow.follow_up,
    vitals: {
      bp: vitalsRow.bp || '120/80 mmHg',
      pulse: vitalsRow.pulse || '72 bpm',
      spo2: vitalsRow.spo2 || '98%',
      temp: vitalsRow.temp || '98.4 °F',
      weight: vitalsRow.weight || '70 kg',
      height: vitalsRow.height || '170 cm',
      bmi: vitalsRow.bmi || '24.2',
      bloodSugarFasting: vitalsRow.blood_sugar_fasting || '100 mg/dL'
    },
    clinicalSummary: {
      chiefComplaints: summaryRow.chief_complaints || 'No active complaints',
      diagnosis: summaryRow.diagnosis || 'Clinical evaluation',
      clinicalNotes: summaryRow.clinical_notes || 'Patient reviewed',
      allergies: summaryRow.allergies || 'None Reported'
    },
    prescriptions: prescriptionRows,
    pastMedications: pastMedRows,
    pastRecords: pastRecRows,
    labReports: labRows,
    billing: billingRow,
    radiologyStudies: radRows
  };
}

// Get doctor by registration number
function getDoctorByRegNo(regNo) {
  const database = getDB();
  const stmt = database.prepare(`
    SELECT id, name, reg_no as regNo, qualification, department, hospital, phone, status, password_hash as password
    FROM doctors 
    WHERE UPPER(reg_no) = UPPER(?) 
    LIMIT 1
  `);
  return stmt.get(regNo.trim());
}

// Get all registered doctors and specialist roles
function getAllDoctors() {
  const database = getDB();
  try {
    return database.prepare(`
      SELECT id, name, reg_no as regNo, qualification, department, hospital, phone, status
      FROM doctors
      ORDER BY id ASC
    `).all();
  } catch (e) {
    return [];
  }
}

// Update Doctor Consultation Record (Clinical Notes, Diagnosis, Vitals, Rx, Follow-up)
function updateDoctorConsultation(data) {
  const database = getDB();
  const identifier = (data.patientId || data.receiptId || data.id || '').trim();
  if (!identifier) return { success: false, message: 'Patient identifier required' };

  // 1. Locate patient row
  const patientRow = database.prepare(`
    SELECT id, receipt_id, abha_id FROM patients 
    WHERE UPPER(id) = UPPER(?) OR UPPER(receipt_id) = UPPER(?) OR UPPER(abha_id) = UPPER(?)
    LIMIT 1
  `).get(identifier, identifier, identifier);

  if (!patientRow) {
    return { success: false, message: 'Patient not found in database' };
  }

  const pid = patientRow.id;

  // 2. Update Clinical Summary (Diagnosis & Clinical Notes)
  if (data.diagnosis || data.notes || data.clinicalNotes || data.chiefComplaints) {
    const existingSummary = database.prepare(`SELECT * FROM clinical_summaries WHERE patient_id = ?`).get(pid);
    const diag = data.diagnosis || (existingSummary ? existingSummary.diagnosis : 'Clinical OPD evaluation');
    const notes = data.clinicalNotes || data.notes || (existingSummary ? existingSummary.clinical_notes : 'Reviewed in OPD');
    const cc = data.chiefComplaints || (existingSummary ? existingSummary.chief_complaints : 'OPD Consultation');
    const allergies = data.allergies || (existingSummary ? existingSummary.allergies : 'None Reported');

    if (existingSummary) {
      database.prepare(`
        UPDATE clinical_summaries 
        SET diagnosis = ?, clinical_notes = ?, chief_complaints = ?, allergies = ?, updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?
      `).run(diag, notes, cc, allergies, pid);
    } else {
      database.prepare(`
        INSERT INTO clinical_summaries (patient_id, diagnosis, clinical_notes, chief_complaints, allergies)
        VALUES (?, ?, ?, ?, ?)
      `).run(pid, diag, notes, cc, allergies);
    }
  }

  // 3. Update or Insert Vitals
  if (data.bp || data.pulse || data.spo2 || data.temp || data.bloodSugarFasting || data.weight) {
    const existingVitals = database.prepare(`SELECT * FROM patient_vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1`).get(pid) || {};
    database.prepare(`
      INSERT INTO patient_vitals (patient_id, bp, pulse, spo2, temp, weight, height, bmi, blood_sugar_fasting)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pid,
      data.bp || existingVitals.bp || '120/80 mmHg',
      data.pulse || existingVitals.pulse || '72 bpm',
      data.spo2 || existingVitals.spo2 || '98%',
      data.temp || existingVitals.temp || '98.4 °F',
      data.weight || existingVitals.weight || '70 kg',
      data.height || existingVitals.height || '170 cm',
      data.bmi || existingVitals.bmi || '24.2',
      data.bloodSugarFasting || existingVitals.blood_sugar_fasting || '100 mg/dL'
    );
  }

  // 4. Update Prescriptions if provided
  if (Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
    database.prepare(`DELETE FROM prescriptions WHERE patient_id = ?`).run(pid);
    const insertRx = database.prepare(`
      INSERT INTO prescriptions (patient_id, medicine, dosage, frequency, timing, duration, instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const rx of data.prescriptions) {
      if (rx.medicine) {
        insertRx.run(
          pid,
          rx.medicine,
          rx.dosage || 'Standard Dose',
          rx.frequency || '1 - 0 - 0',
          rx.timing || 'After Food',
          rx.duration || '30 Days',
          rx.instructions || 'Take as directed'
        );
      }
    }
  } else if (Array.isArray(data.newPrescriptions) && data.newPrescriptions.length > 0) {
    const insertRx = database.prepare(`
      INSERT INTO prescriptions (patient_id, medicine, dosage, frequency, timing, duration, instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const rx of data.newPrescriptions) {
      if (rx.medicine) {
        insertRx.run(
          pid,
          rx.medicine,
          rx.dosage || 'Standard Dose',
          rx.frequency || '1 - 0 - 0',
          rx.timing || 'After Food',
          rx.duration || '30 Days',
          rx.instructions || 'Take as directed'
        );
      }
    }
  }

  // 5. Update Patient status, followUp, consultingDoctor
  const updates = [];
  const params = [];
  if (data.status) {
    updates.push('status = ?');
    params.push(data.status);
  }
  if (data.followUp || data.follow_up) {
    updates.push('follow_up = ?');
    params.push(data.followUp || data.follow_up);
  }
  if (data.consultingDoctor || data.doctorName) {
    updates.push('consulting_doctor = ?');
    params.push(data.consultingDoctor || data.doctorName);
  }
  if (data.doctorRegNo) {
    updates.push('doctor_reg_no = ?');
    params.push(data.doctorRegNo);
  }

  if (updates.length > 0) {
    params.push(pid);
    database.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }

  return { success: true, patient: getPatientByQuery(pid), message: 'Clinical consultation updated successfully' };
}

// Update Patient Attendance by Doctor Role
function updatePatientAttendance(patientIdOrReceipt, doctor) {
  const database = getDB();
  const identifier = (patientIdOrReceipt || '').trim();
  const patientRow = database.prepare(`
    SELECT id, name FROM patients 
    WHERE UPPER(id) = UPPER(?) OR UPPER(receipt_id) = UPPER(?) OR UPPER(abha_id) = UPPER(?)
    LIMIT 1
  `).get(identifier, identifier, identifier);

  if (!patientRow) return { success: false, message: 'Patient not found' };

  const docName = (doctor && doctor.name) ? doctor.name : 'Specialist Consultant';
  const docReg = (doctor && doctor.regNo) ? doctor.regNo : 'TMC-48291';
  const docDept = (doctor && doctor.department) ? doctor.department : 'General OPD';

  database.prepare(`
    UPDATE patients 
    SET status = ?, consulting_doctor = ?, doctor_reg_no = ?, department = ?
    WHERE id = ?
  `).run(`In Clinic with ${docName}`, docName, docReg, docDept, patientRow.id);

  return { success: true, patient: getPatientByQuery(patientRow.id) };
}

// ---------------------------------------------------------------------------
// APPOINTMENTS & TELECONSULTATION SCHEDULING
// ---------------------------------------------------------------------------
function createAppointment(apt) {
  const database = getDB();

  // Find or normalize patient_id to match patients table
  let pid = apt.patientId;
  try {
    const match = database.prepare('SELECT id FROM patients WHERE id = ? OR receipt_id = ? OR abha_id = ?').get(apt.patientId || '', apt.receiptId || '', apt.abhaId || '');
    if (match) {
      pid = match.id;
    } else {
      const generatedPid = 'P-' + Math.floor(1000 + Math.random() * 9000);
      pid = (apt.patientId && apt.patientId.startsWith('P-')) ? apt.patientId : generatedPid;
      database.prepare(`
        INSERT OR IGNORE INTO patients (id, name, abha_id, abha_address, receipt_id, age, gender, blood_group, phone, address, center_name, department)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        pid,
        apt.patientName || 'Citizen',
        apt.abhaId || `14-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}`,
        `${(apt.patientName || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '')}@abdm`,
        apt.receiptId || `TN-REC-${Math.floor(1000+Math.random()*9000)}`,
        35,
        'Male',
        'O +ve',
        apt.phone || '9876543210',
        'Tamil Nadu',
        'Government Apex Centre',
        apt.department || 'General Medicine'
      );
    }
  } catch (err) {
    console.error('[SQL DB] Patient ensure error:', err.message);
  }

  const stmt = database.prepare(`
    INSERT INTO appointments (
      id, patient_id, patient_name, receipt_id, abha_id, phone,
      department, issue_description, requested_date, requested_time,
      status, doctor_id, doctor_name, doctor_reg_no, confirmed_time, room_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    apt.id,
    pid,
    apt.patientName,
    apt.receiptId,
    apt.abhaId || '',
    apt.phone || '',
    apt.department,
    apt.issueDescription,
    apt.requestedDate,
    apt.requestedTime,
    apt.status || 'Pending',
    apt.doctorId || null,
    apt.doctorName || null,
    apt.doctorRegNo || null,
    apt.confirmedTime || null,
    apt.roomId || null
  );

  return apt;
}

function getAppointmentsByPatient(patientId) {
  const database = getDB();
  const stmt = database.prepare(`
    SELECT 
      id, patient_id as patientId, patient_name as patientName,
      receipt_id as receiptId, abha_id as abhaId, phone,
      department, issue_description as issueDescription,
      requested_date as requestedDate, requested_time as requestedTime,
      status, doctor_id as doctorId, doctor_name as doctorName,
      doctor_reg_no as doctorRegNo, confirmed_time as confirmedTime,
      room_id as roomId, created_at as createdAt
    FROM appointments
    WHERE patient_id = ? OR receipt_id = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(patientId, patientId).map(a => ({
    ...a,
    patientName: (a.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
  }));
}

// Helper to normalize department names for matching
function normalizeDept(dept) {
  if (!dept) return '';
  const d = dept.toLowerCase().trim();
  if (d.includes('cardio') || d.includes('heart')) return 'Cardiology';
  if (d.includes('neuro') || d.includes('brain')) return 'Neurology';
  if (d.includes('pediat') || d.includes('paediat') || d.includes('child')) return 'Pediatrics';
  if (d.includes('nephro') || d.includes('kidney') || d.includes('renal')) return 'Nephrology';
  if (d.includes('ortho') || d.includes('bone') || d.includes('joint')) return 'Orthopaedics';
  if (d.includes('pulmon') || d.includes('lung') || d.includes('chest') || d.includes('asthma')) return 'Pulmonology';
  if (d.includes('endo') || d.includes('diabet') || d.includes('thyroid')) return 'Endocrinology';
  return dept.trim();
}

// Get OPD Queue specifically for doctor's department or consulting doctor registration number
function getQueueForDoctor(department, doctorRegNo) {
  const database = getDB();
  const normDept = normalizeDept(department).toLowerCase();
  const cleanReg = (doctorRegNo || '').trim().toUpperCase();

  const allPatients = database.prepare(`
    SELECT p.*,
           v.bp, v.pulse, v.spo2, v.temp, v.weight, v.height, v.bmi, v.blood_sugar_fasting as bloodSugarFasting,
           c.chief_complaints as chiefComplaints, c.diagnosis, c.clinical_notes as clinicalNotes, c.allergies
    FROM patients p
    LEFT JOIN (SELECT * FROM patient_vitals GROUP BY patient_id HAVING MAX(recorded_at)) v ON p.id = v.patient_id
    LEFT JOIN clinical_summaries c ON p.id = c.patient_id
    ORDER BY p.id ASC
  `).all();

  const filtered = allPatients.filter(p => {
    const pDept = normalizeDept(p.department).toLowerCase();
    const deptMatch = normDept ? (pDept.includes(normDept) || normDept.includes(pDept)) : true;
    const docMatch = cleanReg && p.doctor_reg_no && p.doctor_reg_no.toUpperCase() === cleanReg;
    return (normDept && deptMatch) || docMatch;
  });

  return filtered.map((p, idx) => {
    const rx = database.prepare(`SELECT medicine, dosage, frequency, timing, duration, instructions FROM prescriptions WHERE patient_id = ?`).all(p.id);
    const pastMeds = database.prepare(`SELECT medicine, dosage, frequency, duration, prescribed_by as prescribedBy, indication, reason_for_change as reasonForChange, status FROM past_medications WHERE patient_id = ?`).all(p.id);
    const pastRecs = database.prepare(`SELECT id, date, hospital, department, doctor, diagnosis, outcome FROM past_records WHERE patient_id = ?`).all(p.id);
    const labs = database.prepare(`SELECT test_name as testName, test_date as date, observed_value as result, normal_range as normalRange, status FROM lab_reports WHERE patient_id = ?`).all(p.id);
    const rads = database.prepare(`
      SELECT id, patient_id as patientId, patient_name as patientName, receipt_id as receiptId,
             study_title as studyTitle, modality, body_part as bodyPart, study_date as studyDate,
             accession_no as accessionNo, status, priority, department, referring_doctor as referringDoctor,
             radiologist_name as radiologistName, clinical_indication as clinicalIndication, technique,
             findings, impression, series_count as seriesCount, slice_count as sliceCount,
             dicom_window_center as dicomWindowCenter, dicom_window_width as dicomWindowWidth,
             scan_type as scanType, image_urls as imageUrls, created_at as createdAt
      FROM radiology_studies WHERE patient_id = ? OR receipt_id = ?
      ORDER BY created_at DESC
    `).all(p.id, p.receipt_id);

    return {
      token: idx + 1,
      id: p.id,
      receiptId: p.receipt_id,
      abhaId: p.abha_id,
      name: (p.name || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim(),
      age: p.age,
      gender: p.gender,
      bloodGroup: p.blood_group,
      phone: p.phone,
      department: p.department,
      consultingDoctor: p.consulting_doctor,
      doctorRegNo: p.doctor_reg_no,
      status: idx === 0 ? 'In Clinic' : 'Waiting',
      isUrgent: idx === 0,
      summaryCondition: p.diagnosis || 'Clinical OPD evaluation',
      clinicalSummary: {
        diagnosis: p.diagnosis || 'Clinical evaluation',
        clinicalNotes: p.clinicalNotes || 'Reviewed in OPD',
        followUp: p.follow_up || 'As scheduled'
      },
      vitals: {
        bp: p.bp || '120/80 mmHg',
        pulse: p.pulse || '72 bpm',
        spo2: p.spo2 || '98%',
        temp: p.temp || '98.4 °F',
        weight: p.weight || '70 kg',
        height: p.height || '170 cm',
        bmi: p.bmi || '24.2',
        bloodSugarFasting: p.bloodSugarFasting || '100 mg/dL'
      },
      prescriptions: rx,
      pastMedications: pastMeds,
      pastRecords: pastRecs,
      labReports: labs,
      radiologyStudies: rads,
      oldReceipts: []
    };
  });
}

function getAppointmentsForDoctor(department, doctorRegNo) {
  const database = getDB();
  const allApts = database.prepare(`
    SELECT 
      id, patient_id as patientId, patient_name as patientName,
      receipt_id as receiptId, abha_id as abhaId, phone,
      department, issue_description as issueDescription,
      requested_date as requestedDate, requested_time as requestedTime,
      status, doctor_id as doctorId, doctor_name as doctorName,
      doctor_reg_no as doctorRegNo, confirmed_time as confirmedTime,
      room_id as roomId, created_at as createdAt
    FROM appointments
    ORDER BY created_at DESC
  `).all();

  const normDept = normalizeDept(department).toLowerCase();
  const cleanReg = (doctorRegNo || '').trim().toUpperCase();

  return allApts.filter(a => {
    const aDept = normalizeDept(a.department).toLowerCase();
    const isDeptMatch = normDept && (aDept.includes(normDept) || normDept.includes(aDept));
    const isPending = a.status === 'Pending';
    const isMine = cleanReg && a.doctorRegNo && a.doctorRegNo.toUpperCase() === cleanReg;

    // Doctor sees:
    // 1. Pending appointments for their specific specialty department
    // 2. Confirmed appointments assigned specifically to them
    return (isDeptMatch && isPending) || isMine;
  }).map(a => ({
    ...a,
    patientName: (a.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
  }));
}

function acceptAppointment(appointmentId, doctor, confirmedTime) {
  const database = getDB();
  const roomId = 'ROOM_' + appointmentId.replace(/[^a-zA-Z0-9]/g, '');

  const stmt = database.prepare(`
    UPDATE appointments
    SET status = 'Confirmed',
        doctor_id = ?,
        doctor_name = ?,
        doctor_reg_no = ?,
        confirmed_time = ?,
        room_id = ?
    WHERE id = ?
  `);

  stmt.run(
    doctor.id || null,
    doctor.name,
    doctor.regNo,
    confirmedTime || null,
    roomId,
    appointmentId
  );

  const updatedStmt = database.prepare(`
    SELECT 
      id, patient_id as patientId, patient_name as patientName,
      receipt_id as receiptId, abha_id as abhaId, phone,
      department, issue_description as issueDescription,
      requested_date as requestedDate, requested_time as requestedTime,
      status, doctor_id as doctorId, doctor_name as doctorName,
      doctor_reg_no as doctorRegNo, confirmed_time as confirmedTime,
      room_id as roomId, created_at as createdAt
    FROM appointments
    WHERE id = ?
  `);
  return updatedStmt.get(appointmentId);
}

// ---------------------------------------------------------------------------
// RIS & PACS RADIOLOGY MODULE METHODS
// ---------------------------------------------------------------------------
function getRadiologyStudies(patientId, modality, status, accessionNo) {
  const database = getDB();
  let query = `
    SELECT id, patient_id as patientId, patient_name as patientName, receipt_id as receiptId,
           study_title as studyTitle, modality, body_part as bodyPart, study_date as studyDate,
           accession_no as accessionNo, status, priority, department, referring_doctor as referringDoctor,
           radiologist_name as radiologistName, clinical_indication as clinicalIndication, technique,
           findings, impression, series_count as seriesCount, slice_count as sliceCount,
           dicom_window_center as dicomWindowCenter, dicom_window_width as dicomWindowWidth,
           scan_type as scanType, image_urls as imageUrls, created_at as createdAt
    FROM radiology_studies
    WHERE 1=1
  `;
  const params = [];

  if (patientId) {
    query += ` AND (patient_id = ? OR receipt_id = ?)`;
    params.push(patientId, patientId);
  }
  if (accessionNo) {
    query += ` AND accession_no = ?`;
    params.push(accessionNo);
  }
  if (modality) {
    query += ` AND UPPER(modality) = UPPER(?)`;
    params.push(modality);
  }
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC`;
  const rows = database.prepare(query).all(...params);
  return rows.map(r => ({
    ...r,
    patientName: (r.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
  }));
}

function getRadiologyStudyById(id) {
  const database = getDB();
  const stmt = database.prepare(`
    SELECT id, patient_id as patientId, patient_name as patientName, receipt_id as receiptId,
           study_title as studyTitle, modality, body_part as bodyPart, study_date as studyDate,
           accession_no as accessionNo, status, priority, department, referring_doctor as referringDoctor,
           radiologist_name as radiologistName, clinical_indication as clinicalIndication, technique,
           findings, impression, series_count as seriesCount, slice_count as sliceCount,
           dicom_window_center as dicomWindowCenter, dicom_window_width as dicomWindowWidth,
           scan_type as scanType, image_urls as imageUrls, created_at as createdAt
    FROM radiology_studies
    WHERE id = ? OR accession_no = ?
    LIMIT 1
  `);
  const r = stmt.get(id, id);
  if (!r) return null;
  return {
    ...r,
    patientName: (r.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
  };
}

function orderRadiologyStudy(order) {
  const database = getDB();
  const cleanName = (order.patientName || 'Patient').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim();
  const id = order.id || `RAD-${Math.floor(1000 + Math.random() * 9000)}`;
  const accessionNo = order.accessionNo || `ACC-RAD-${Math.floor(1000 + Math.random() * 9000)}`;
  const studyDate = order.studyDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const stmt = database.prepare(`
    INSERT INTO radiology_studies (
      id, patient_id, patient_name, receipt_id, study_title, modality, body_part, study_date,
      accession_no, status, priority, department, referring_doctor, radiologist_name,
      clinical_indication, technique, findings, impression, series_count, slice_count,
      dicom_window_center, dicom_window_width, scan_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    order.patientId || order.receiptId,
    cleanName,
    order.receiptId,
    order.studyTitle || `${order.modality || 'Digital'} Diagnostic Study`,
    order.modality || 'CR',
    order.bodyPart || 'Chest',
    studyDate,
    accessionNo,
    order.status || 'Reported & Verified',
    order.priority || 'Routine',
    order.department || 'General Medicine',
    order.referringDoctor || 'Attending Physician',
    order.radiologistName || 'Dr. S. Meenakshi, MD, DMRD',
    order.clinicalIndication || 'Clinical diagnostic evaluation',
    order.technique || 'Standard low-dose digital diagnostic protocol.',
    order.findings || 'Imaging completed. Preliminary review demonstrates normal anatomical alignment and tissue contours.',
    order.impression || 'Study completed and logged in RIS worklist.',
    order.seriesCount || 1,
    order.sliceCount || 1,
    order.dicomWindowCenter || 40,
    order.dicomWindowWidth || 400,
    order.scanType || 'chest_xray'
  );

  return getRadiologyStudyById(id);
}

// ---------------------------------------------------------------------------
// RIS (RADIOLOGY INFORMATION SYSTEM) & SCAN WARD DATABASE METHODS
// ---------------------------------------------------------------------------

function getRISRequests(status = '', abhaId = '') {
  const database = getDB();
  let query = `
    SELECT id, patient_id as patientId, patient_name as patientName, abha_id as abhaId,
           receipt_id as receiptId, age, gender, modality, body_part as bodyPart,
           priority, clinical_indication as clinicalIndication, doctor_name as doctorName,
           doctor_reg_no as doctorRegNo, department, status, assigned_machine as assignedMachine,
           assigned_technician as assignedTechnician, study_id as studyId,
           created_at as createdAt, completed_at as completedAt
    FROM ris_requests
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  if (abhaId) {
    query += ` AND (abha_id = ? OR receipt_id = ? OR patient_id = ?)`;
    params.push(abhaId, abhaId, abhaId);
  }
  query += ` ORDER BY created_at DESC`;

  const rows = database.prepare(query).all(...params);
  return rows.map(r => ({
    ...r,
    patientName: (r.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
  }));
}

function getRISRequestById(id) {
  const database = getDB();
  const stmt = database.prepare(`
    SELECT id, patient_id as patientId, patient_name as patientName, abha_id as abhaId,
           receipt_id as receiptId, age, gender, modality, body_part as bodyPart,
           priority, clinical_indication as clinicalIndication, doctor_name as doctorName,
           doctor_reg_no as doctorRegNo, department, status, assigned_machine as assignedMachine,
           assigned_technician as assignedTechnician, study_id as studyId,
           created_at as createdAt, completed_at as completedAt
    FROM ris_requests
    WHERE id = ?
    LIMIT 1
  `);
  const r = stmt.get(id);
  if (!r) return null;
  return {
    ...r,
    patientName: (r.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
  };
}

function createRISRequest(reqData) {
  const database = getDB();
  const id = reqData.id || `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
  const cleanName = (reqData.patientName || reqData.name || 'Patient').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim();
  const abhaId = reqData.abhaId || reqData.abha_id || '14-0000-0000-0000';
  const receiptId = reqData.receiptId || reqData.receipt_id || 'TN-REC-0000';
  const patientId = reqData.patientId || reqData.patient_id || receiptId;

  const stmt = database.prepare(`
    INSERT INTO ris_requests (
      id, patient_id, patient_name, abha_id, receipt_id, age, gender, modality,
      body_part, priority, clinical_indication, doctor_name, doctor_reg_no, department,
      status, assigned_machine, assigned_technician
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    patientId,
    cleanName,
    abhaId,
    receiptId,
    reqData.age || 40,
    reqData.gender || 'Male',
    reqData.modality || 'CT',
    reqData.bodyPart || reqData.body_part || 'Chest',
    reqData.priority || reqData.urgency || 'Routine',
    reqData.clinicalIndication || reqData.clinical_indication || 'Doctor diagnostic scan requisition',
    reqData.doctorName || reqData.doctor_name || 'Consulting Physician',
    reqData.doctorRegNo || reqData.doctor_reg_no || 'TMC-48291',
    reqData.department || 'General Medicine',
    'Pending',
    null,
    null
  );

  return getRISRequestById(id);
}

function acceptRISRequest(id, assignedMachine, assignedTechnician) {
  const database = getDB();
  const req = getRISRequestById(id);
  if (!req) return null;

  database.prepare(`
    UPDATE ris_requests
    SET status = 'Accepted',
        assigned_machine = ?,
        assigned_technician = ?
    WHERE id = ?
  `).run(assignedMachine || 'SOMATOM Force 128-Slice CT (Room 101)', assignedTechnician || 'R. Sivakumar, B.Sc RT', id);

  // If a machine was assigned, mark that machine as occupied
  if (assignedMachine) {
    const machStmt = database.prepare(`
      UPDATE ris_ward_machines
      SET status = 'Occupied',
          current_patient_id = ?,
          current_patient_name = ?,
          current_abha_id = ?,
          current_scan_type = ?,
          assigned_technician = ?
      WHERE name LIKE ? OR room_no LIKE ? OR id = ?
    `);
    machStmt.run(
      req.patientId,
      req.patientName,
      req.abhaId,
      `${req.modality} - ${req.bodyPart}`,
      assignedTechnician || 'On-Duty Specialist',
      `%${assignedMachine}%`,
      `%${assignedMachine}%`,
      assignedMachine
    );
  }

  return getRISRequestById(id);
}

function completeRISRequest(id, findings, impression, radiologistName) {
  const database = getDB();
  const req = getRISRequestById(id);
  if (!req) return null;

  const completedAt = new Date().toISOString();
  const studyId = `RAD-${Math.floor(1000 + Math.random() * 9000)}`;
  const accessionNo = `ACC-RAD-${Math.floor(1000 + Math.random() * 9000)}`;
  const studyDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // 1. Create PACS Diagnostic Study Record
  let scanType = 'chest_xray';
  const m = (req.modality || '').toUpperCase();
  const bp = (req.bodyPart || '').toLowerCase();
  if (m === 'MR' || bp.includes('brain') || bp.includes('mri')) scanType = 'brain_mri';
  else if (m === 'CT' || bp.includes('ct')) scanType = 'brain_ct';
  else if (m === 'US' && bp.includes('renal')) scanType = 'renal_ultrasound';
  else if (m === 'US' || bp.includes('echo') || bp.includes('ultra')) scanType = 'ultrasound';
  else if (bp.includes('knee') || bp.includes('ortho') || bp.includes('bone')) scanType = 'knee_xray';
  else if (bp.includes('pediat') || bp.includes('child')) scanType = 'pediatric_chest_xray';

  database.prepare(`
    INSERT INTO radiology_studies (
      id, patient_id, patient_name, receipt_id, study_title, modality, body_part,
      study_date, accession_no, status, priority, department, referring_doctor,
      radiologist_name, clinical_indication, technique, findings, impression,
      series_count, slice_count, dicom_window_center, dicom_window_width, scan_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studyId,
    req.patientId,
    req.patientName,
    req.receiptId,
    `${req.modality} Scan (${req.bodyPart})`,
    req.modality,
    req.bodyPart,
    studyDate,
    accessionNo,
    'Reported & Verified',
    req.priority,
    req.department,
    req.doctorName,
    radiologistName || 'Dr. R. Vijayakumar, MD, DNB (Neuro-Radiology)',
    req.clinicalIndication,
    `Digital scan completed under standardized ${req.modality} high-definition diagnostic protocol.`,
    findings || 'Diagnostic scan successfully acquired. Anatomical structures clearly delineated without motion artifact.',
    impression || `Completed ${req.modality} examination of ${req.bodyPart}. Archiving into PACS hospital repository.`,
    m === 'MR' || m === 'CT' ? 3 : 1,
    m === 'MR' ? 16 : (m === 'CT' ? 24 : 1),
    m === 'MR' ? 40 : 50,
    m === 'MR' ? 80 : 400,
    scanType
  );

  // 2. Mark RIS Requisition as Completed
  database.prepare(`
    UPDATE ris_requests
    SET status = 'Completed',
        completed_at = ?,
        study_id = ?
    WHERE id = ?
  `).run(completedAt, studyId, id);

  // 3. Free up any machine that was assigned to this patient
  if (req.assignedMachine) {
    database.prepare(`
      UPDATE ris_ward_machines
      SET status = 'Free',
          current_patient_id = NULL,
          current_patient_name = NULL,
          current_abha_id = NULL,
          current_scan_type = NULL
      WHERE name LIKE ? OR room_no LIKE ? OR id = ?
    `).run(`%${req.assignedMachine}%`, `%${req.assignedMachine}%`, req.assignedMachine);
  }

  return {
    success: true,
    request: getRISRequestById(id),
    study: getRadiologyStudyById(studyId)
  };
}

function getRISWardMachines() {
  const database = getDB();
  return database.prepare(`
    SELECT id, name, model, modality, room_no as roomNo, status,
           current_patient_id as currentPatientId, current_patient_name as currentPatientName,
           current_abha_id as currentAbhaId, current_scan_type as currentScanType,
           assigned_technician as assignedTechnician, uptime_pct as uptimePct,
           last_calibrated as lastCalibrated
    FROM ris_ward_machines
    ORDER BY room_no ASC
  `).all();
}

function updateRISMachineStatus(id, status, patientData = {}) {
  const database = getDB();
  database.prepare(`
    UPDATE ris_ward_machines
    SET status = ?,
        current_patient_id = ?,
        current_patient_name = ?,
        current_abha_id = ?,
        current_scan_type = ?,
        assigned_technician = COALESCE(?, assigned_technician)
    WHERE id = ? OR room_no = ?
  `).run(
    status,
    patientData.patientId || null,
    patientData.patientName || null,
    patientData.abhaId || null,
    patientData.scanType || null,
    patientData.assignedTechnician || null,
    id,
    id
  );
  return getRISWardMachines();
}

function getRISWardWorkers() {
  const database = getDB();
  return database.prepare(`
    SELECT id, name, role, reg_no as regNo, shift, assigned_room as assignedRoom,
           status, phone
    FROM ris_ward_workers
    ORDER BY id ASC
  `).all();
}

function getRISWardStatus() {
  const database = getDB();
  const machines = getRISWardMachines();
  const workers = getRISWardWorkers();
  const pendingRequests = database.prepare("SELECT COUNT(*) as count FROM ris_requests WHERE status = 'Pending'").get().count;
  const inProgressRequests = database.prepare("SELECT COUNT(*) as count FROM ris_requests WHERE status IN ('Accepted', 'In Progress')").get().count;
  const completedToday = database.prepare("SELECT COUNT(*) as count FROM ris_requests WHERE status = 'Completed'").get().count;

  const totalMachines = machines.length;
  const freeMachines = machines.filter(m => m.status === 'Free').length;
  const occupiedMachines = machines.filter(m => m.status === 'Occupied').length;
  const maintenanceMachines = machines.filter(m => m.status === 'Maintenance').length;
  const onDutyWorkers = workers.filter(w => w.status === 'On Duty').length;

  return {
    totalMachines,
    freeMachines,
    occupiedMachines,
    maintenanceMachines,
    totalWorkers: workers.length,
    onDutyWorkers,
    pendingRequests,
    inProgressRequests,
    completedToday,
    machines,
    workers
  };
}

function getPastMedicationsByPatient(patientId) {
  const database = getDB();
  return database.prepare(`
    SELECT id, patient_id as patientId, medicine, dosage, frequency, duration, prescribed_by as prescribedBy, indication, reason_for_change as reasonForChange, status
    FROM past_medications
    WHERE patient_id = ?
    ORDER BY id DESC
  `).all(patientId);
}

function addPastMedication(med) {
  const database = getDB();
  const stmt = database.prepare(`
    INSERT INTO past_medications (patient_id, medicine, dosage, frequency, duration, prescribed_by, indication, reason_for_change, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    med.patientId || med.patient_id,
    med.medicine,
    med.dosage || 'Standard Dose',
    med.frequency || '1 - 0 - 0',
    med.duration || 'Completed',
    med.prescribedBy || med.prescribed_by || 'Hospital Consultant',
    med.indication || 'Clinical Therapy',
    med.reasonForChange || med.reason_for_change || 'Completed Course',
    med.status || 'Completed Course'
  );
  return { success: true, id: result.lastInsertRowid };
}

// ============================================================================
// LIS (LABORATORY INFORMATION SYSTEM) DATABASE METHODS
// ============================================================================

function getLISRequests(status = '', abhaId = '') {
  const database = getDB();
  let query = `
    SELECT id, patient_id as patientId, patient_name as patientName, abha_id as abhaId,
           receipt_id as receiptId, age, gender, test_type as testType,
           tests_requested as testsRequested, priority, clinical_indication as clinicalIndication,
           doctor_name as doctorName, doctor_reg_no as doctorRegNo, department,
           specimen_type as specimenType, status, assigned_technician as assignedTechnician,
           pathologist_name as pathologistName, sample_collected_at as sampleCollectedAt,
           completed_at as completedAt, findings_summary as findingsSummary,
           test_parameters_json as testParametersJson, created_at as createdAt
    FROM lis_requests
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  if (abhaId) {
    query += ` AND (abha_id = ? OR receipt_id = ? OR patient_id = ?)`;
    params.push(abhaId, abhaId, abhaId);
  }
  query += ` ORDER BY created_at DESC`;

  const rows = database.prepare(query).all(...params);
  return rows.map(r => ({
    ...r,
    patientName: (r.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim(),
    testParameters: r.testParametersJson ? JSON.parse(r.testParametersJson) : []
  }));
}

function getLISRequestById(id) {
  const database = getDB();
  const stmt = database.prepare(`
    SELECT id, patient_id as patientId, patient_name as patientName, abha_id as abhaId,
           receipt_id as receiptId, age, gender, test_type as testType,
           tests_requested as testsRequested, priority, clinical_indication as clinicalIndication,
           doctor_name as doctorName, doctor_reg_no as doctorRegNo, department,
           specimen_type as specimenType, status, assigned_technician as assignedTechnician,
           pathologist_name as pathologistName, sample_collected_at as sampleCollectedAt,
           completed_at as completedAt, findings_summary as findingsSummary,
           test_parameters_json as testParametersJson, created_at as createdAt
    FROM lis_requests
    WHERE id = ?
    LIMIT 1
  `);
  const r = stmt.get(id);
  if (!r) return null;
  return {
    ...r,
    patientName: (r.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim(),
    testParameters: r.testParametersJson ? JSON.parse(r.testParametersJson) : []
  };
}

function createLISRequest(reqData) {
  const database = getDB();
  const id = reqData.id || `LIS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanName = (reqData.patientName || reqData.name || 'Patient').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim();
  const abhaId = reqData.abhaId || reqData.abha_id || '14-0000-0000-0000';
  const receiptId = reqData.receiptId || reqData.receipt_id || 'TN-REC-0000';
  const patientId = reqData.patientId || reqData.patient_id || receiptId;
  const tests = Array.isArray(reqData.testsRequested) 
    ? reqData.testsRequested.join(', ') 
    : (reqData.testsRequested || reqData.testName || 'Diagnostic Blood Profile');
  const testType = reqData.testType || 'Biochemistry & Hematology';

  const stmt = database.prepare(`
    INSERT INTO lis_requests (
      id, patient_id, patient_name, abha_id, receipt_id, age, gender, test_type,
      tests_requested, priority, clinical_indication, doctor_name, doctor_reg_no,
      department, specimen_type, status, assigned_technician, pathologist_name,
      test_parameters_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    patientId,
    cleanName,
    abhaId,
    receiptId,
    reqData.age || 40,
    reqData.gender || 'Male',
    testType,
    tests,
    reqData.priority || 'Routine',
    reqData.clinicalIndication || 'Clinical diagnostic evaluation',
    reqData.doctorName || 'Attending Physician',
    reqData.doctorRegNo || 'TMC-48291',
    reqData.department || 'General Medicine',
    reqData.specimenType || 'Venous Whole Blood / Serum',
    'Pending',
    null,
    null,
    JSON.stringify(reqData.testParameters || [])
  );

  return getLISRequestById(id);
}

function acceptLISRequest(id, assignedTechnician, specimenType) {
  const database = getDB();
  const req = getLISRequestById(id);
  if (!req) return null;

  const collectedAt = new Date().toISOString();
  database.prepare(`
    UPDATE lis_requests
    SET status = 'Sample Collected',
        assigned_technician = ?,
        specimen_type = COALESCE(?, specimen_type),
        sample_collected_at = ?
    WHERE id = ?
  `).run(assignedTechnician || 'K. Selvam, MLT (Chief Lab Tech)', specimenType, collectedAt, id);

  return getLISRequestById(id);
}

function uploadLISReport(id, uploadData) {
  const database = getDB();
  const req = getLISRequestById(id);
  if (!req) return null;

  const completedAt = new Date().toISOString();
  const testDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const pathologist = uploadData.pathologistName || 'Dr. S. Kanthimathi, MD (Pathology), DNB';
  const technician = uploadData.technicianName || req.assignedTechnician || 'K. Selvam, MLT';
  const findingsSummary = uploadData.findingsSummary || 'Diagnostic laboratory analysis processed and verified under automated analyzer calibration.';
  const parameters = uploadData.testParameters || [
    { parameter: req.testsRequested, value: uploadData.observedValue || 'Within Reference Interval', unit: '', normalRange: uploadData.normalRange || 'Normal', status: uploadData.status || 'Normal' }
  ];

  // 1. Insert each test parameter / aggregate into lab_reports table for Doctor & Patient portals
  const insertLab = database.prepare(`
    INSERT INTO lab_reports (patient_id, test_name, test_date, observed_value, normal_range, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  if (Array.isArray(parameters) && parameters.length > 0) {
    for (const p of parameters) {
      insertLab.run(
        req.patientId,
        p.parameter || p.name || req.testsRequested,
        testDate,
        `${p.value} ${p.unit || ''}`.trim(),
        p.normalRange || p.reference || 'Standard Normal',
        p.status || 'Normal'
      );
    }
  } else {
    insertLab.run(
      req.patientId,
      req.testsRequested,
      testDate,
      uploadData.observedValue || 'Verified Normal',
      uploadData.normalRange || 'Standard Normal',
      uploadData.status || 'Normal'
    );
  }

  // 2. Update lis_requests table to Completed
  database.prepare(`
    UPDATE lis_requests
    SET status = 'Completed',
        pathologist_name = ?,
        assigned_technician = ?,
        completed_at = ?,
        findings_summary = ?,
        test_parameters_json = ?
    WHERE id = ?
  `).run(
    pathologist,
    technician,
    completedAt,
    findingsSummary,
    JSON.stringify(parameters),
    id
  );

  return {
    success: true,
    request: getLISRequestById(id),
    labReports: database.prepare(`SELECT * FROM lab_reports WHERE patient_id = ? ORDER BY id DESC`).all(req.patientId)
  };
}

function getLISStats() {
  const database = getDB();
  const total = database.prepare('SELECT COUNT(*) as count FROM lis_requests').get().count;
  const pending = database.prepare("SELECT COUNT(*) as count FROM lis_requests WHERE status = 'Pending'").get().count;
  const inProgress = database.prepare("SELECT COUNT(*) as count FROM lis_requests WHERE status IN ('Sample Collected', 'In-Testing')").get().count;
  const completedToday = database.prepare("SELECT COUNT(*) as count FROM lis_requests WHERE status = 'Completed'").get().count;
  const totalLabReports = database.prepare("SELECT COUNT(*) as count FROM lab_reports").get().count;

  return {
    total,
    pending,
    inProgress,
    completedToday,
    totalLabReports
  };
}

// ============================================================================
// PIS (PHARMACY INFORMATION SYSTEM) DATABASE METHODS
// ============================================================================

function getPISPrescriptions(status = '', abhaId = '') {
  const database = getDB();
  let query = `
    SELECT id, patient_id as patientId, patient_name as patientName, abha_id as abhaId,
           receipt_id as receiptId, age, gender, doctor_name as doctorName,
           doctor_reg_no as doctorRegNo, department, diagnosis, allergies,
           medicines_json as medicinesJson, priority, status, dispensed_by as dispensedBy,
           pharmacist_reg_no as pharmacistRegNo, dispensation_token as dispensationToken,
           dispensed_at as dispensedAt, notes, created_at as createdAt
    FROM pis_prescriptions
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  if (abhaId) {
    query += ` AND (abha_id = ? OR receipt_id = ? OR patient_id = ?)`;
    params.push(abhaId, abhaId, abhaId);
  }
  query += ` ORDER BY created_at DESC`;

  const rows = database.prepare(query).all(...params);
  return rows.map(r => ({
    ...r,
    patientName: (r.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim(),
    medicines: r.medicinesJson ? JSON.parse(r.medicinesJson) : []
  }));
}

function getPISPrescriptionById(id) {
  const database = getDB();
  const stmt = database.prepare(`
    SELECT id, patient_id as patientId, patient_name as patientName, abha_id as abhaId,
           receipt_id as receiptId, age, gender, doctor_name as doctorName,
           doctor_reg_no as doctorRegNo, department, diagnosis, allergies,
           medicines_json as medicinesJson, priority, status, dispensed_by as dispensedBy,
           pharmacist_reg_no as pharmacistRegNo, dispensation_token as dispensationToken,
           dispensed_at as dispensedAt, notes, created_at as createdAt
    FROM pis_prescriptions
    WHERE id = ?
    LIMIT 1
  `);
  const r = stmt.get(id);
  if (!r) return null;
  return {
    ...r,
    patientName: (r.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim(),
    medicines: r.medicinesJson ? JSON.parse(r.medicinesJson) : []
  };
}

function createPISPrescription(rxData) {
  const database = getDB();
  const id = rxData.id || `PIS-RX-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanName = (rxData.patientName || rxData.name || 'Patient').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim();
  const abhaId = rxData.abhaId || rxData.abha_id || '14-0000-0000-0000';
  const receiptId = rxData.receiptId || rxData.receipt_id || 'TN-REC-0000';
  const patientId = rxData.patientId || rxData.patient_id || receiptId;
  const medicines = Array.isArray(rxData.medicines) ? rxData.medicines : (rxData.prescriptions || []);

  const stmt = database.prepare(`
    INSERT INTO pis_prescriptions (
      id, patient_id, patient_name, abha_id, receipt_id, age, gender,
      doctor_name, doctor_reg_no, department, diagnosis, allergies,
      medicines_json, priority, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    patientId,
    cleanName,
    abhaId,
    receiptId,
    rxData.age || 40,
    rxData.gender || 'Male',
    rxData.doctorName || 'Attending Doctor',
    rxData.doctorRegNo || 'TMC-48291',
    rxData.department || 'General Medicine',
    rxData.diagnosis || 'Clinical evaluation',
    rxData.allergies || 'NKDA',
    JSON.stringify(medicines),
    rxData.priority || 'Normal',
    'Pending'
  );

  return getPISPrescriptionById(id);
}

function acceptPISPrescription(id, pharmacistName) {
  const database = getDB();
  const rx = getPISPrescriptionById(id);
  if (!rx) return null;

  database.prepare(`
    UPDATE pis_prescriptions
    SET status = 'Under Verification',
        dispensed_by = ?
    WHERE id = ?
  `).run(pharmacistName || 'Pharm. R. Murugan, M.Pharm (Senior Pharmacist)', id);

  return getPISPrescriptionById(id);
}

function dispensePISPrescription(id, dispensationData) {
  const database = getDB();
  const rx = getPISPrescriptionById(id);
  if (!rx) return null;

  const dispensedAt = new Date().toISOString();
  const pharmacist = dispensationData.pharmacistName || 'Pharm. R. Murugan, M.Pharm (Chief Pharmacist)';
  const pharmacistReg = dispensationData.pharmacistRegNo || 'TN-PC-48192';
  const token = `DSP-ABHA-${Math.floor(1000 + Math.random() * 9000)}`;
  const notes = dispensationData.notes || `Medicines dispensed to patient after verifying ABHA ID: ${rx.abhaId}. Counseled on proper dosage timing.`;

  // 1. Update pis_prescriptions to Dispensed / Fulfilled
  database.prepare(`
    UPDATE pis_prescriptions
    SET status = 'Dispensed / Fulfilled',
        dispensed_by = ?,
        pharmacist_reg_no = ?,
        dispensation_token = ?,
        dispensed_at = ?,
        notes = ?
    WHERE id = ?
  `).run(pharmacist, pharmacistReg, token, dispensedAt, notes, id);

  // 2. Also archive dispensed medicines into past_medications for complete patient history
  const meds = Array.isArray(rx.medicines) ? rx.medicines : [];
  const insertPastMed = database.prepare(`
    INSERT INTO past_medications (patient_id, medicine, dosage, frequency, duration, prescribed_by, indication, reason_for_change, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const m of meds) {
    insertPastMed.run(
      rx.patientId,
      m.medicine || m.name,
      m.dosage || 'Standard Dose',
      m.frequency || 'As Prescribed',
      m.duration || 'Current Rx Course',
      rx.doctorName || 'OPD Physician',
      rx.diagnosis || 'Clinical OPD Prescription',
      `Dispensed by Central Hospital Pharmacy (Token ${token}) via ABHA ${rx.abhaId}`,
      'Dispensed / Active Therapy'
    );
  }

  return {
    success: true,
    prescription: getPISPrescriptionById(id),
    dispensationToken: token
  };
}

function getPISStats() {
  const database = getDB();
  const total = database.prepare('SELECT COUNT(*) as count FROM pis_prescriptions').get().count;
  const pending = database.prepare("SELECT COUNT(*) as count FROM pis_prescriptions WHERE status = 'Pending'").get().count;
  const inProgress = database.prepare("SELECT COUNT(*) as count FROM pis_prescriptions WHERE status = 'Under Verification'").get().count;
  const dispensedToday = database.prepare("SELECT COUNT(*) as count FROM pis_prescriptions WHERE status = 'Dispensed / Fulfilled'").get().count;

  return {
    total,
    pending,
    inProgress,
    dispensedToday,
    stockStatus: '98.6% Generic Drugs Available'
  };
}

module.exports = {
  getDB,
  feedDatabase,
  getStats,
  normalizeDept,
  getPatientByQuery,
  getDoctorByRegNo,
  getAllDoctors,
  updateDoctorConsultation,
  updatePatientAttendance,
  getQueueForDoctor,
  getPastMedicationsByPatient,
  addPastMedication,
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsForDoctor,
  acceptAppointment,
  getRadiologyStudies,
  getRadiologyStudyById,
  orderRadiologyStudy,
  getRISRequests,
  getRISRequestById,
  createRISRequest,
  acceptRISRequest,
  completeRISRequest,
  getRISWardMachines,
  updateRISMachineStatus,
  getRISWardWorkers,
  getRISWardStatus,
  getLISRequests,
  getLISRequestById,
  createLISRequest,
  acceptLISRequest,
  uploadLISReport,
  getLISStats,
  getPISPrescriptions,
  getPISPrescriptionById,
  createPISPrescription,
  acceptPISPrescription,
  dispensePISPrescription,
  getPISStats
};



