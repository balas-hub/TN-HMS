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
    const labReports = database.prepare('SELECT COUNT(*) as count FROM lab_reports').get().count;
    const billings = database.prepare('SELECT COUNT(*) as count FROM billings').get().count;
    const doctors = database.prepare('SELECT COUNT(*) as count FROM doctors').get().count;
    const opdQueue = database.prepare('SELECT COUNT(*) as count FROM opd_queue').get().count;

    return {
      isReady: true,
      dbPath: DB_FILE,
      patients,
      vitals,
      summaries,
      prescriptions,
      labReports,
      billings,
      doctors,
      opdQueue
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

  const stmt = database.prepare(`
    SELECT * FROM patients 
    WHERE UPPER(receipt_id) = UPPER(?) 
       OR UPPER(abha_id) = UPPER(?)
       OR UPPER(phone) = UPPER(?)
    LIMIT 1
  `);
  const patientRow = stmt.get(cleanQ, cleanQ, cleanQ);
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

  return {
    id: patientRow.id,
    receiptId: patientRow.receipt_id,
    abhaId: patientRow.abha_id,
    abhaAddress: patientRow.abha_address,
    name: patientRow.name,
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
    labReports: labRows,
    billing: billingRow
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

// ---------------------------------------------------------------------------
// APPOINTMENTS & TELECONSULTATION SCHEDULING
// ---------------------------------------------------------------------------
function createAppointment(apt) {
  const database = getDB();

  // Find or normalize patient_id to match patients table
  let pid = apt.patientId;
  try {
    const match = database.prepare('SELECT id FROM patients WHERE id = ? OR receipt_id = ? OR abha_id = ?').get(apt.patientId, apt.receiptId, apt.abhaId || '');
    if (match) {
      pid = match.id;
    } else {
      database.prepare(`
        INSERT OR IGNORE INTO patients (id, name, abha_id, abha_address, receipt_id, age, gender, blood_group, phone, address, center_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        apt.patientId,
        apt.patientName || 'Citizen',
        apt.abhaId || `14-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}`,
        `${(apt.patientName || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '')}@abdm`,
        apt.receiptId || `TN-REC-${Math.floor(1000+Math.random()*9000)}`,
        35,
        'Male',
        'O +ve',
        apt.phone || '9876543210',
        'Tamil Nadu',
        'Government Apex Centre'
      );
    }
  } catch (err) {}

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
  return stmt.all(patientId, patientId);
}

function getAppointmentsForDoctor(department, doctorRegNo) {
  const database = getDB();
  // Returns:
  // 1. All pending appointments for the doctor's department (so any respective doctor can accept)
  // 2. All appointments confirmed/handled by this specific doctor
  let stmt;
  if (department && doctorRegNo) {
    stmt = database.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        receipt_id as receiptId, abha_id as abhaId, phone,
        department, issue_description as issueDescription,
        requested_date as requestedDate, requested_time as requestedTime,
        status, doctor_id as doctorId, doctor_name as doctorName,
        doctor_reg_no as doctorRegNo, confirmed_time as confirmedTime,
        room_id as roomId, created_at as createdAt
      FROM appointments
      WHERE (UPPER(department) = UPPER(?) AND status = 'Pending')
         OR (UPPER(doctor_reg_no) = UPPER(?))
      ORDER BY created_at DESC
    `);
    return stmt.all(department, doctorRegNo);
  } else if (department) {
    stmt = database.prepare(`
      SELECT 
        id, patient_id as patientId, patient_name as patientName,
        receipt_id as receiptId, abha_id as abhaId, phone,
        department, issue_description as issueDescription,
        requested_date as requestedDate, requested_time as requestedTime,
        status, doctor_id as doctorId, doctor_name as doctorName,
        doctor_reg_no as doctorRegNo, confirmed_time as confirmedTime,
        room_id as roomId, created_at as createdAt
      FROM appointments
      WHERE UPPER(department) = UPPER(?)
      ORDER BY created_at DESC
    `);
    return stmt.all(department);
  } else {
    stmt = database.prepare(`
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
    `);
    return stmt.all();
  }
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

module.exports = {
  getDB,
  feedDatabase,
  getStats,
  getPatientByQuery,
  getDoctorByRegNo,
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsForDoctor,
  acceptAppointment
};
