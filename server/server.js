const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'data', 'database.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Import SQLite database service
let sqlDb = null;
try {
  sqlDb = require('./db/database');
} catch (e) {
  console.warn('[SQL DB] Warning: SQL service not loaded, using JSON store:', e.message);
}

// Helper to read and write database
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database.json:', err);
    return { patients: [], doctors: [], videoRooms: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database.json:', err);
  }
}

// In-memory WebRTC signaling store
const signalingStore = {};

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Request Parser Helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Server Creation
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // -------------------------------------------------------------------------
  // REST API ENDPOINTS
  // -------------------------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    const db = readDB();

    // 1. Health check & DB status
    if (pathname === '/api/health' && method === 'GET') {
      const sqlStats = sqlDb ? sqlDb.getStats() : null;
      return sendJSON(res, 200, { status: 'healthy', sqlStats, timestamp: new Date().toISOString() });
    }

    // 1b. SQL Database Status
    if (pathname === '/api/db/status' && method === 'GET') {
      const stats = sqlDb ? sqlDb.getStats() : { isReady: false, message: 'SQL engine not loaded' };
      return sendJSON(res, 200, { success: true, stats });
    }

    // 1c. SQL Database Trigger Feed
    if (pathname === '/api/db/feed' && method === 'POST') {
      if (sqlDb) {
        const result = sqlDb.feedDatabase();
        return sendJSON(res, result.success ? 200 : 500, result);
      } else {
        return sendJSON(res, 500, { success: false, error: 'SQL module unavailable' });
      }
    }

    // 2. Patient Search by Receipt ID or ABHA ID (Queries SQL DB with JSON fallback)
    if (pathname.startsWith('/api/patients/search') && method === 'GET') {
      const q = (parsedUrl.query.q || '').trim();
      if (!q) {
        return sendJSON(res, 400, { error: 'Search query required' });
      }

      // Try SQL Database first
      if (sqlDb) {
        try {
          const sqlPatient = sqlDb.getPatientByQuery(q);
          if (sqlPatient) {
            return sendJSON(res, 200, { success: true, patient: sqlPatient, source: 'sqlite' });
          }
        } catch (err) {
          console.error('[SQL DB Search Error]:', err);
        }
      }

      // JSON Fallback
      const match = db.patients.find(p =>
        p.receiptId.toLowerCase() === q.toLowerCase() ||
        p.abhaId.toLowerCase() === q.toLowerCase() ||
        p.abhaAddress.toLowerCase() === q.toLowerCase() ||
        p.phone.replace(/[\s\-\+]/g, '').includes(q.replace(/[\s\-\+]/g, '')) ||
        p.name.toLowerCase().includes(q.toLowerCase())
      );

      if (match) {
        return sendJSON(res, 200, { success: true, patient: match, source: 'json' });
      } else {
        return sendJSON(res, 404, { success: false, message: `No record found for '${q}'` });
      }
    }

    // 3. List all demo patients / quick lookup
    if (pathname === '/api/patients' && method === 'GET') {
      return sendJSON(res, 200, { success: true, patients: db.patients });
    }

    // 4. Client / Patient Login
    if (pathname === '/api/auth/client' && method === 'POST') {
      const body = await parseBody(req);
      const identifier = (body.identifier || '').trim().toLowerCase();

      // Check SQL first
      let patient = null;
      if (sqlDb) {
        try {
          patient = sqlDb.getPatientByQuery(identifier);
        } catch (e) {}
      }

      if (!patient) {
        patient = db.patients.find(p =>
          p.abhaId.toLowerCase() === identifier ||
          p.receiptId.toLowerCase() === identifier ||
          p.phone.replace(/[\s\-\+]/g, '').includes(identifier.replace(/[\s\-\+]/g, ''))
        );
      }

      if (patient) {
        return sendJSON(res, 200, { success: true, patient, token: 'patient_token_' + patient.id });
      } else {
        return sendJSON(res, 401, { success: false, message: 'No registered patient record matches this identifier. Please register a new account.' });
      }
    }

    // 4b. Patient Self-Registration / Account Creation
    if (pathname === '/api/patients/register' && method === 'POST') {
      const body = await parseBody(req);
      const name = (body.name || '').trim();
      const phone = (body.phone || '').trim();
      const dob = (body.dob || '').trim();
      let age = parseInt(body.age, 10);
      if (!age && dob) {
        const birthYear = new Date(dob).getFullYear();
        if (!isNaN(birthYear) && birthYear > 1900) {
          age = new Date().getFullYear() - birthYear;
        }
      }
      if (!age || isNaN(age)) age = 30;

      const gender = body.gender || 'Male';
      const bloodGroup = body.bloodGroup || 'O +ve';
      const guardianName = (body.guardianName || '').trim();
      const emergencyPhone = (body.emergencyPhone || '').trim();
      const email = (body.email || '').trim();
      const district = (body.district || 'Chennai').trim();
      const pincode = (body.pincode || '').trim();
      const rawAddress = (body.address || '').trim();
      const address = rawAddress ? `${rawAddress}, ${district}${pincode ? ' - ' + pincode : ''}, Tamil Nadu` : `${district}, Tamil Nadu`;
      const centerName = body.centerName || `Government Multi Super Speciality Hospital, ${district} Apex Centre`;
      const pin = (body.pin || '1234').trim();
      const allergies = (body.allergies || 'None Reported').trim();
      const preExistingConditions = (body.preExistingConditions || 'None Reported').trim();

      if (!name || !phone) {
        return sendJSON(res, 400, { success: false, message: 'Full Name and Mobile Number are required for registration.' });
      }

      // Check if already registered
      const existing = db.patients.find(p => p.phone.replace(/[\s\-\+]/g, '') === phone.replace(/[\s\-\+]/g, ''));
      if (existing) {
        return sendJSON(res, 400, { 
          success: false, 
          message: `An account is already registered with this mobile number (${phone}). Please sign in with Receipt ID: ${existing.receiptId} or ABHA: ${existing.abhaId}.` 
        });
      }

      // Generate IDs
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const receiptId = `TN-REC-${random4}`;
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      const part3 = Math.floor(1000 + Math.random() * 9000);
      const abhaId = `14-${part1}-${part2}-${part3}`;
      const cleanUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '.').substring(0, 15);
      const abhaAddress = `${cleanUsername}@abdm`;
      const patientId = `P-${Date.now().toString().slice(-4)}`;

      const newPatient = {
        id: patientId,
        receiptId,
        abhaId,
        abhaAddress,
        name,
        age,
        gender,
        bloodGroup,
        phone,
        dob,
        guardianName,
        emergencyPhone,
        email,
        district,
        pincode,
        address,
        centerName,
        admissionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        dischargeDate: 'Active OPD Registered',
        status: 'Active Citizen Health Locker',
        department: 'General Medicine / Preventive Health',
        consultingDoctor: 'Dr. S. K. Aravind, MD, DM (Cardiology)',
        doctorRegNo: 'TMC-48291',
        pin,
        vitals: {
          bp: '120/80 mmHg',
          pulse: '72 bpm',
          spo2: '99%',
          temp: '98.4 °F',
          weight: '68 kg',
          height: '168 cm',
          bmi: '24.1',
          bloodSugarFasting: '95 mg/dL'
        },
        clinicalSummary: {
          chiefComplaints: 'New Citizen Health Profile Enrollment & Initial Consultation',
          diagnosis: preExistingConditions !== 'None Reported' ? `Pre-existing: ${preExistingConditions}` : 'Healthy Individual - Periodic Routine Evaluation Scheduled',
          clinicalNotes: `Self-registered via Health Care Portal. Guardian/Relation: ${guardianName || 'Self'}. Emergency: ${emergencyPhone || phone}. Ayushman Bharat Digital Mission (ABDM) record generated.`,
          allergies: allergies
        },
        labReports: [
          {
            testName: 'Complete Health Screening Profile',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            result: 'Baseline Parameters Within Normal Range',
            normalRange: 'Standard Normal',
            status: 'Normal'
          }
        ],
        prescriptions: [
          {
            medicine: 'Tab. Multivitamin & Minerals (Govt Medical Store)',
            dosage: '1 Tab',
            frequency: '0 - 1 - 0',
            timing: 'After Lunch',
            duration: '30 Days',
            instructions: 'Daily preventive wellness'
          }
        ],
        billing: {
          totalAmount: '₹ 0.00 (Free Government Enrollment)',
          insuranceScheme: 'Chief Minister\'s Comprehensive Health Insurance Scheme (CMCHIS)',
          schemeApproved: '100% Cashless Coverage Active',
          patientPayable: '₹ 0.00 (Free of Cost)',
          paymentStatus: 'Approved via Government Scheme'
        },
        followUp: 'Visit nearest Government Primary Health Centre (PHC) or Hospital for annual checkup.'
      };

      // Save into database.json
      db.patients.push(newPatient);
      writeDB(db);

      // Also persist to SQLite hospital.db if available
      if (sqlDb) {
        try {
          const database = sqlDb.getDB();
          database.prepare(`
            INSERT INTO patients (id, receipt_id, abha_id, abha_address, name, age, gender, blood_group, phone, dob, guardian_name, emergency_phone, email, district, pincode, pin, address, center_name, admission_date, discharge_date, status, department, consulting_doctor, doctor_reg_no, follow_up)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            newPatient.id, newPatient.receiptId, newPatient.abhaId, newPatient.abhaAddress,
            newPatient.name, newPatient.age, newPatient.gender, newPatient.bloodGroup,
            newPatient.phone, newPatient.dob, newPatient.guardianName, newPatient.emergencyPhone,
            newPatient.email, newPatient.district, newPatient.pincode, newPatient.pin,
            newPatient.address, newPatient.centerName, newPatient.admissionDate,
            newPatient.dischargeDate, newPatient.status, newPatient.department,
            newPatient.consultingDoctor, newPatient.doctorRegNo, newPatient.followUp
          );

          database.prepare(`
            INSERT INTO patient_vitals (patient_id, bp, pulse, spo2, temp, weight, height, bmi, blood_sugar_fasting)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            newPatient.id, newPatient.vitals.bp, newPatient.vitals.pulse, newPatient.vitals.spo2,
            newPatient.vitals.temp, newPatient.vitals.weight, newPatient.vitals.height,
            newPatient.vitals.bmi, newPatient.vitals.bloodSugarFasting
          );

          database.prepare(`
            INSERT INTO clinical_summaries (patient_id, chief_complaints, diagnosis, clinical_notes, allergies)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            newPatient.id, newPatient.clinicalSummary.chiefComplaints, newPatient.clinicalSummary.diagnosis,
            newPatient.clinicalSummary.clinicalNotes, newPatient.clinicalSummary.allergies
          );

          database.prepare(`
            INSERT INTO billings (patient_id, total_amount, insurance_scheme, scheme_approved, patient_payable, payment_status)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            newPatient.id, newPatient.billing.totalAmount, newPatient.billing.insuranceScheme,
            newPatient.billing.schemeApproved, newPatient.billing.patientPayable, newPatient.billing.paymentStatus
          );
        } catch (err) {
          console.error('[SQL DB Insert Error on Register]:', err);
        }
      }

      return sendJSON(res, 201, {
        success: true,
        message: `Account created successfully! Your Receipt ID is ${receiptId} and ABHA ID is ${abhaId}.`,
        patient: newPatient,
        token: 'patient_token_' + newPatient.id
      });
    }

    // 5. Doctor / Staff Login (Supports /api/auth/doctor and /api/auth/doctor/login)
    if ((pathname === '/api/auth/doctor' || pathname === '/api/auth/doctor/login') && method === 'POST') {
      const body = await parseBody(req);
      const regNo = (body.regNo || '').trim().toUpperCase();
      const enteredPass = (body.password || body.pin || '').trim();

      if (!regNo || !enteredPass) {
        return sendJSON(res, 400, { success: false, message: 'Medical Council Registration Number and Password are required.' });
      }

      // 1. Check SQLite database
      let doctor = null;
      if (sqlDb && sqlDb.getDoctorByRegNo) {
        try {
          const sqlDoc = sqlDb.getDoctorByRegNo(regNo);
          if (sqlDoc) {
            if (sqlDoc.password === enteredPass || (sqlDoc.password_hash && sqlDoc.password_hash === enteredPass)) {
              doctor = {
                id: sqlDoc.id,
                name: sqlDoc.name,
                regNo: sqlDoc.regNo,
                qualification: sqlDoc.qualification,
                department: sqlDoc.department,
                hospital: sqlDoc.hospital,
                phone: sqlDoc.phone,
                status: sqlDoc.status || 'Available'
              };
            }
          }
        } catch (e) {
          console.error('[SQL DB Doctor Login Error]:', e.message);
        }
      }

      // 2. Check JSON database
      if (!doctor && db.doctors) {
        const jsonDoc = db.doctors.find(d => 
          d.regNo.toUpperCase() === regNo && 
          (d.password === enteredPass || d.pin === enteredPass || d.password_hash === enteredPass)
        );
        if (jsonDoc) {
          doctor = {
            id: jsonDoc.id,
            name: jsonDoc.name,
            regNo: jsonDoc.regNo,
            qualification: jsonDoc.qualification,
            department: jsonDoc.department,
            hospital: jsonDoc.hospital,
            phone: jsonDoc.phone,
            status: jsonDoc.status || 'Available'
          };
        }
      }

      if (doctor) {
        return sendJSON(res, 200, {
          success: true,
          message: `Authenticated as Dr. ${doctor.name}`,
          doctor,
          token: 'doctor_jwt_token_' + doctor.regNo
        });
      } else {
        return sendJSON(res, 401, {
          success: false,
          message: 'Invalid Medical Registration No. or Password'
        });
      }
    }

    // 5b. List all Specialist Doctors and Roles
    if (pathname === '/api/doctors' && method === 'GET') {
      let doctorsList = [];
      if (sqlDb && sqlDb.getAllDoctors) {
        try {
          doctorsList = sqlDb.getAllDoctors();
        } catch (e) {}
      }
      if (!doctorsList || doctorsList.length === 0) {
        doctorsList = db.doctors || [
          { id: 'DOC-01', name: 'Dr. S. K. Aravind, MD, DM', regNo: 'TMC-48291', qualification: 'MD (Gen Med), DM (Cardiology), FACC', department: 'Cardiology', hospital: 'Government Multi Super Speciality Hospital, Omandurar, Chennai', status: 'Available' },
          { id: 'DOC-02', name: 'Dr. Radhika Sundaram, MS, MCh', regNo: 'TMC-39182', qualification: 'MS (Gen Surg), MCh (Neuro Surgery)', department: 'Neurology', hospital: 'Government Rajaji Hospital, Madurai', status: 'Available' },
          { id: 'DOC-03', name: 'Dr. K. Balaji, MD, DNB', regNo: 'TMC-51024', qualification: 'MD (Pediatrics), DNB (Neonatology)', department: 'Pediatrics', hospital: 'Institute of Child Health & Hospital for Children, Egmore, Chennai', status: 'In Consultation' },
          { id: 'DOC-04', name: 'Dr. M. Sangeetha, MD, DM', regNo: 'TMC-42901', qualification: 'MD (Medicine), DM (Nephrology)', department: 'Nephrology', hospital: 'Coimbatore Medical College Hospital, Coimbatore', status: 'Available' },
          { id: 'DOC-05', name: 'Dr. P. Ramanathan, MD', regNo: 'TMC-60192', qualification: 'MD (General Medicine), DNB', department: 'General Medicine', hospital: 'Rajiv Gandhi Government General Hospital, Chennai', status: 'Available' }
        ];
      }
      return sendJSON(res, 200, { success: true, doctors: doctorsList });
    }

    // 6. Doctor Consultation Updates (Clinical Notes, Diagnosis, Vitals, Rx, Follow-up)
    if (pathname === '/api/doctor/consultation' && method === 'POST') {
      const body = await parseBody(req);
      const { receiptId, patientId, id, diagnosis, notes, clinicalNotes, chiefComplaints, bp, pulse, spo2, temp, bloodSugarFasting, followUp, newPrescriptions, prescriptions, consultingDoctor, doctorRegNo, status } = body;

      const identifier = receiptId || patientId || id;
      if (!identifier) {
        return sendJSON(res, 400, { success: false, message: 'Patient identifier is required' });
      }

      // 1. Update SQLite DB if available
      let updatedPatient = null;
      if (sqlDb && sqlDb.updateDoctorConsultation) {
        try {
          const sqlRes = sqlDb.updateDoctorConsultation(body);
          if (sqlRes.success) {
            updatedPatient = sqlRes.patient;
          }
        } catch (e) {
          console.error('[SQL DB Consultation Error]:', e.message);
        }
      }

      // 2. Update JSON Database
      const patient = db.patients.find(p => 
        p.receiptId === identifier || 
        p.id === identifier || 
        (p.abhaId && p.abhaId === identifier)
      );

      if (patient) {
        if (!patient.clinicalSummary) patient.clinicalSummary = {};
        if (!patient.vitals) patient.vitals = {};
        if (!Array.isArray(patient.prescriptions)) patient.prescriptions = [];

        if (diagnosis) patient.clinicalSummary.diagnosis = diagnosis;
        if (clinicalNotes || notes) patient.clinicalSummary.clinicalNotes = clinicalNotes || notes;
        if (chiefComplaints) patient.clinicalSummary.chiefComplaints = chiefComplaints;
        if (bp) patient.vitals.bp = bp;
        if (pulse) patient.vitals.pulse = pulse;
        if (spo2) patient.vitals.spo2 = spo2;
        if (temp) patient.vitals.temp = temp;
        if (bloodSugarFasting) patient.vitals.bloodSugarFasting = bloodSugarFasting;
        if (followUp) patient.followUp = followUp;
        if (consultingDoctor) patient.consultingDoctor = consultingDoctor;
        if (doctorRegNo) patient.doctorRegNo = doctorRegNo;
        if (status) patient.status = status;
        else patient.status = 'Reviewed by Specialist';

        if (Array.isArray(prescriptions) && prescriptions.length > 0) {
          patient.prescriptions = prescriptions;
        } else if (Array.isArray(newPrescriptions) && newPrescriptions.length > 0) {
          patient.prescriptions.push(...newPrescriptions);
        }

        writeDB(db);
        if (!updatedPatient) updatedPatient = patient;
      }

      if (updatedPatient) {
        return sendJSON(res, 200, { success: true, patient: updatedPatient, message: 'Consultation & clinical notes saved successfully' });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Patient not found' });
      }
    }

    // 6a-2. Doctor Attends Patient (Role-Based Patient Call-in)
    if (pathname === '/api/doctor/attend' && method === 'POST') {
      const body = await parseBody(req);
      const { patientId, receiptId, doctor } = body;
      const identifier = patientId || receiptId;

      if (!identifier) {
        return sendJSON(res, 400, { success: false, message: 'Patient ID is required' });
      }

      let attendedPatient = null;
      if (sqlDb && sqlDb.updatePatientAttendance) {
        try {
          const sqlRes = sqlDb.updatePatientAttendance(identifier, doctor);
          if (sqlRes.success) attendedPatient = sqlRes.patient;
        } catch (e) {
          console.error('[SQL DB Attend Error]:', e.message);
        }
      }

      const p = db.patients.find(pt => pt.id === identifier || pt.receiptId === identifier);
      if (p) {
        const docName = (doctor && doctor.name) ? doctor.name : 'Specialist Consultant';
        const docReg = (doctor && doctor.regNo) ? doctor.regNo : 'TMC-48291';
        const docDept = (doctor && doctor.department) ? doctor.department : p.department;
        p.status = `In Clinic with ${docName}`;
        p.consultingDoctor = docName;
        p.doctorRegNo = docReg;
        p.department = docDept;
        writeDB(db);
        if (!attendedPatient) attendedPatient = p;
      }

      if (attendedPatient) {
        return sendJSON(res, 200, { success: true, patient: attendedPatient, message: `Patient is now attending consultation with ${doctor?.name || 'Doctor'}` });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Patient not found' });
      }
    }

    // 6b. Doctor OPD Queue (Filtered strictly by Doctor's Department & Doctor Reg No)
    if (pathname === '/api/doctor/queue' && method === 'GET') {
      const department = (parsedUrl.query.department || '').trim();
      const regNo = (parsedUrl.query.regNo || '').trim().toUpperCase();

      let queue = [];
      if (sqlDb && sqlDb.getQueueForDoctor) {
        try {
          queue = sqlDb.getQueueForDoctor(department, regNo);
        } catch (e) {
          console.error('[SQL DB Queue Error]:', e.message);
        }
      }

      if (!queue || queue.length === 0) {
        const allPatients = db.patients || [];
        const normDept = (department || '').toLowerCase();
        const filtered = allPatients.filter(p => {
          const pDept = (p.department || '').toLowerCase();
          const deptMatch = !normDept || pDept.includes(normDept) || normDept.includes(pDept);
          const docMatch = regNo && p.doctorRegNo && p.doctorRegNo.toUpperCase() === regNo;
          return (normDept && deptMatch) || docMatch;
        });

        queue = filtered.map((p, idx) => ({
          token: idx + 1,
          id: p.id,
          receiptId: p.receiptId,
          abhaId: p.abhaId,
          name: (p.name || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim(),
          age: p.age,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          department: p.department,
          consultingDoctor: p.consultingDoctor,
          doctorRegNo: p.doctorRegNo,
          status: idx === 0 ? 'In Clinic' : 'Waiting in Queue',
          isUrgent: idx === 0,
          summaryCondition: (p.clinicalSummary && p.clinicalSummary.diagnosis) || 'Clinical OPD evaluation',
          clinicalSummary: p.clinicalSummary || { diagnosis: 'Clinical OPD evaluation', clinicalNotes: 'Reviewed in OPD' },
          prescriptions: p.prescriptions || [],
          pastMedications: p.pastMedications || [],
          pastRecords: p.pastRecords || [],
          vitals: p.vitals || { bp: '120/80 mmHg', pulse: '72 bpm', spo2: '98%', temp: '98.4 °F' },
          labReports: p.labReports || [],
          radiologyStudies: p.radiologyStudies || [],
          followUp: p.followUp || ''
        }));
      }

      return sendJSON(res, 200, { success: true, queue, department, doctorRegNo: regNo });
    }

    // 6b-2. Get Previously Used Medications (Past Medications History)
    if ((pathname === '/api/doctor/past-medications' || pathname === '/api/patients/past-medications') && method === 'GET') {
      const patientId = (parsedUrl.query.patientId || parsedUrl.query.id || parsedUrl.query.receiptId || '').trim();
      if (!patientId) {
        return sendJSON(res, 400, { success: false, message: 'Patient ID is required' });
      }

      let pastMeds = [];
      if (sqlDb && sqlDb.getPastMedicationsByPatient) {
        try {
          pastMeds = sqlDb.getPastMedicationsByPatient(patientId);
        } catch (e) {}
      }

      if (!pastMeds || pastMeds.length === 0) {
        const pt = (db.patients || []).find(p => p.id === patientId || p.receiptId === patientId || p.abhaId === patientId);
        pastMeds = (pt && pt.pastMedications) ? pt.pastMedications : [];
      }

      return sendJSON(res, 200, { success: true, patientId, pastMedications: pastMeds });
    }

    // 6b-3. Add Previously Used Medication Record to Database
    if ((pathname === '/api/doctor/past-medications' || pathname === '/api/patients/past-medications') && method === 'POST') {
      const body = await parseBody(req);
      const { patientId, medicine, dosage, frequency, duration, prescribedBy, indication, reasonForChange, status } = body;

      if (!patientId || !medicine) {
        return sendJSON(res, 400, { success: false, message: 'Patient ID and Medicine Name are required' });
      }

      const newPastMed = {
        medicine,
        dosage: dosage || 'Standard Dose',
        frequency: frequency || '1 - 0 - 0',
        duration: duration || 'Completed',
        prescribedBy: prescribedBy || 'Consulting Physician',
        indication: indication || 'Clinical Therapy',
        reasonForChange: reasonForChange || 'Completed Course',
        status: status || 'Completed Course'
      };

      if (sqlDb && sqlDb.addPastMedication) {
        try {
          sqlDb.addPastMedication({ ...newPastMed, patientId });
        } catch (e) {}
      }

      // Also update database.json
      const pt = (db.patients || []).find(p => p.id === patientId || p.receiptId === patientId);
      if (pt) {
        if (!Array.isArray(pt.pastMedications)) pt.pastMedications = [];
        pt.pastMedications.unshift(newPastMed);
        writeDB(db);
      }

      return sendJSON(res, 201, { success: true, message: 'Previously used medication archived to database', medication: newPastMed });
    }

    // 6c. Patient Schedules Video Consultation
    if (pathname === '/api/appointments/schedule' && method === 'POST') {
      const body = await parseBody(req);
      const {
        patientId, patientName, receiptId, abhaId, phone,
        department, issueDescription, requestedDate, requestedTime
      } = body;

      if (!patientName || !receiptId || !department || !issueDescription) {
        return sendJSON(res, 400, { 
          success: false, 
          message: 'Please provide all details: department, symptoms/issue, and preferred timing.' 
        });
      }

      const id = 'APT-' + Math.floor(1000 + Math.random() * 9000);
      const apt = {
        id,
        patientId: patientId || receiptId,
        patientName,
        receiptId,
        abhaId: abhaId || '',
        phone: phone || '',
        department,
        issueDescription,
        requestedDate: requestedDate || new Date().toLocaleDateString('en-GB'),
        requestedTime: requestedTime || '10:30 AM',
        status: 'Pending',
        doctorId: null,
        doctorName: null,
        doctorRegNo: null,
        confirmedTime: null,
        roomId: null,
        createdAt: new Date().toISOString()
      };

      if (sqlDb && sqlDb.createAppointment) {
        try {
          sqlDb.createAppointment(apt);
        } catch (e) {
          console.error('[SQL DB] createAppointment error:', e.message);
        }
      }

      if (!db.appointments) db.appointments = [];
      db.appointments.unshift(apt);
      writeDB(db);

      return sendJSON(res, 201, {
        success: true,
        appointment: apt,
        message: `Video consultation requested for ${department}! Awaiting specialist doctor review.`
      });
    }

    // 6d. Patient List of Scheduled Video Consultations
    if (pathname.startsWith('/api/appointments/patient') && method === 'GET') {
      const parts = pathname.split('/');
      const patientId = parts[4] || parsedUrl.query.patientId || '';
      let list = [];
      if (sqlDb && sqlDb.getAppointmentsByPatient && patientId) {
        try {
          list = sqlDb.getAppointmentsByPatient(patientId);
        } catch (e) {}
      }
      if (!list || list.length === 0) {
        const allApts = db.appointments || [];
        list = allApts.filter(a => 
          !patientId || (a.patientId === patientId || a.receiptId === patientId || a.abhaId === patientId)
        ).map(a => ({
          ...a,
          patientName: (a.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
        }));
      }
      return sendJSON(res, 200, { success: true, appointments: list });
    }

    // 6e. Doctor List of Scheduled Consultations (for Department & Personal)
    if (pathname === '/api/appointments/doctor' && method === 'GET') {
      const department = parsedUrl.query.department || '';
      const regNo = parsedUrl.query.regNo || '';

      let list = [];
      if (sqlDb && sqlDb.getAppointmentsForDoctor) {
        try {
          list = sqlDb.getAppointmentsForDoctor(department, regNo);
        } catch (e) {}
      }

      if (!list || list.length === 0) {
        const allApts = db.appointments || [];
        list = allApts.filter(a => {
          const deptMatch = !department || (a.department && a.department.toLowerCase() === department.toLowerCase());
          const isPending = a.status === 'Pending';
          const isMine = regNo && a.doctorRegNo === regNo;
          return (deptMatch && isPending) || isMine;
        }).map(a => ({
          ...a,
          patientName: (a.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
        }));
      }

      return sendJSON(res, 200, { success: true, appointments: list });
    }

    // 6f. Doctor Accepts & Confirms Schedule
    if (pathname === '/api/appointments/accept' && method === 'POST') {
      const body = await parseBody(req);
      const { appointmentId, doctorRegNo, doctorName, doctorId, confirmedTime } = body;

      if (!appointmentId || !doctorName) {
        return sendJSON(res, 400, { success: false, message: 'Appointment ID and doctor name are required.' });
      }

      const timeConfirmed = confirmedTime || (new Date().toLocaleDateString('en-GB') + ' at 10:30 AM');
      const roomId = 'ROOM_' + appointmentId.replace(/[^a-zA-Z0-9]/g, '');

      let updatedApt = null;
      if (sqlDb && sqlDb.acceptAppointment) {
        try {
          updatedApt = sqlDb.acceptAppointment(appointmentId, { regNo: doctorRegNo, name: doctorName, id: doctorId }, timeConfirmed);
        } catch (e) {
          console.error('[SQL DB] acceptAppointment error:', e.message);
        }
      }

      if (!db.appointments) db.appointments = [];
      const apt = db.appointments.find(a => a.id === appointmentId);
      if (apt) {
        apt.status = 'Confirmed';
        apt.doctorName = doctorName;
        apt.doctorRegNo = doctorRegNo;
        apt.doctorId = doctorId;
        apt.confirmedTime = timeConfirmed;
        apt.roomId = roomId;
        if (!updatedApt) updatedApt = apt;
      }

      // Automatically initialize WebRTC Video Room
      if (!db.videoRooms) db.videoRooms = {};
      if (!db.videoRooms[roomId]) {
        db.videoRooms[roomId] = {
          roomId,
          receiptId: apt ? apt.receiptId : 'GEN',
          patientName: apt ? apt.patientName : 'Patient',
          doctorName,
          doctorRegNo: doctorRegNo || 'TMC-48291',
          created: new Date().toISOString(),
          status: 'Active',
          participants: {}
        };
      }

      writeDB(db);

      return sendJSON(res, 200, {
        success: true,
        appointment: updatedApt || apt,
        message: `Schedule accepted! Consultation confirmed for ${timeConfirmed}.`
      });
    }

    // 7. Teleconsultation: Create / Join Video Consultation Room
    if (pathname === '/api/teleconsult/room' && method === 'POST') {
      const body = await parseBody(req);
      const { receiptId, patientName, doctorRegNo, doctorName, role } = body;

      const roomId = 'ROOM_' + (receiptId || 'GEN').replace(/[^a-zA-Z0-9]/g, '');
      
      if (!db.videoRooms[roomId]) {
        db.videoRooms[roomId] = {
          roomId,
          receiptId,
          patientName: patientName || 'Patient',
          doctorName: doctorName || 'Dr. S. K. Aravind',
          doctorRegNo: doctorRegNo || 'TMC-48291',
          created: new Date().toISOString(),
          status: 'Active',
          participants: {}
        };
      }

      db.videoRooms[roomId].participants[role || 'user'] = {
        joinedAt: new Date().toISOString(),
        online: true
      };

      writeDB(db);
      return sendJSON(res, 200, { success: true, room: db.videoRooms[roomId] });
    }

    // 8. Teleconsultation: Get Room Info
    if (pathname.startsWith('/api/teleconsult/room/') && method === 'GET') {
      const roomId = pathname.split('/').pop();
      const room = db.videoRooms[roomId];
      if (room) {
        return sendJSON(res, 200, { success: true, room });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Room not found' });
      }
    }

    // 9. WebRTC Signaling Bus (Exchange offer, answer, ice-candidates)
    if (pathname === '/api/teleconsult/signal' && method === 'POST') {
      const body = await parseBody(req);
      const { roomId, from, type, data } = body;

      if (!roomId) {
        return sendJSON(res, 400, { error: 'roomId required' });
      }

      if (!signalingStore[roomId]) {
        signalingStore[roomId] = [];
      }

      signalingStore[roomId].push({
        id: Date.now() + Math.random().toString(36).substring(2, 5),
        from,
        type,
        data,
        timestamp: Date.now()
      });

      // Keep maximum 50 signals per room
      if (signalingStore[roomId].length > 50) {
        signalingStore[roomId].shift();
      }

      return sendJSON(res, 200, { success: true });
    }

    // 11. RIS & PACS: List Radiology Studies
    if (pathname === '/api/radiology/studies' && method === 'GET') {
      const patientId = parsedUrl.query.patientId || parsedUrl.query.receiptId || '';
      const modality = parsedUrl.query.modality || '';
      const status = parsedUrl.query.status || '';
      const accessionNo = parsedUrl.query.accessionNo || '';

      let studies = [];
      if (sqlDb && sqlDb.getRadiologyStudies) {
        try {
          studies = sqlDb.getRadiologyStudies(patientId, modality, status, accessionNo);
        } catch (e) {
          console.error('[SQL DB Radiology Error]:', e.message);
        }
      }

      if (!studies || studies.length === 0) {
        const all = db.radiologyStudies || [];
        studies = all.filter(s => {
          const pMatch = !patientId || s.patientId === patientId || s.receiptId === patientId;
          const mMatch = !modality || (s.modality && s.modality.toUpperCase() === modality.toUpperCase());
          const sMatch = !status || s.status === status;
          const aMatch = !accessionNo || s.accessionNo === accessionNo;
          return pMatch && mMatch && sMatch && aMatch;
        }).map(s => ({
          ...s,
          patientName: (s.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
        }));
      }

      return sendJSON(res, 200, { success: true, count: studies.length, studies });
    }

    // 12. RIS & PACS: Get Single Study Detail by ID
    if (pathname.startsWith('/api/radiology/studies/') && method === 'GET') {
      const studyId = pathname.split('/').pop();
      let study = null;
      if (sqlDb && sqlDb.getRadiologyStudyById) {
        try {
          study = sqlDb.getRadiologyStudyById(studyId);
        } catch (e) {}
      }

      if (!study && db.radiologyStudies) {
        study = db.radiologyStudies.find(s => s.id === studyId || s.accessionNo === studyId);
        if (study) {
          study = {
            ...study,
            patientName: (study.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
          };
        }
      }

      if (study) {
        return sendJSON(res, 200, { success: true, study });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Radiology study not found' });
      }
    }

    // 13. RIS: Order New Radiology Study / Modality Request
    if (pathname === '/api/radiology/order' && method === 'POST') {
      const body = await parseBody(req);
      const patientId = body.patientId || body.patient_id;
      const patientName = body.patientName || body.patient_name;
      const receiptId = body.receiptId || body.receipt_id;
      const studyTitle = body.studyTitle || body.study_title;
      const modality = body.modality;
      const bodyPart = body.bodyPart || body.body_part;
      const department = body.department;
      const referringDoctor = body.referringDoctor || body.referring_doctor || body.ordered_by;
      const clinicalIndication = body.clinicalIndication || body.clinical_indication;
      const priority = body.priority || body.urgency;

      if (!receiptId || !studyTitle || !modality) {
        return sendJSON(res, 400, { success: false, message: 'Receipt ID, Study Title, and Modality are required.' });
      }

      const cleanName = (patientName || 'Patient').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim();
      const id = `RAD-${Math.floor(1000 + Math.random() * 9000)}`;
      const accessionNo = `ACC-RAD-${Math.floor(1000 + Math.random() * 9000)}`;
      const studyDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      // Detect scan type for PACS preview
      let scanType = 'chest_xray';
      const m = (modality || '').toUpperCase();
      const bp = (bodyPart || studyTitle || '').toLowerCase();
      if (m === 'MR' || bp.includes('brain') || bp.includes('mri')) scanType = 'brain_mri';
      else if (m === 'CT' || bp.includes('ct')) scanType = 'brain_ct';
      else if (m === 'US' && bp.includes('renal')) scanType = 'renal_ultrasound';
      else if (m === 'US' || bp.includes('echo') || bp.includes('ultra')) scanType = 'ultrasound';
      else if (bp.includes('knee') || bp.includes('ortho') || bp.includes('bone')) scanType = 'knee_xray';
      else if (bp.includes('pediat') || bp.includes('child')) scanType = 'pediatric_chest_xray';

      const newStudy = {
        id,
        patientId: patientId || receiptId,
        patientName: cleanName,
        receiptId,
        studyTitle,
        modality,
        bodyPart: bodyPart || 'Chest',
        studyDate,
        accessionNo,
        status: 'Reported & Verified',
        priority: priority || 'Routine',
        department: department || 'General Medicine',
        referringDoctor: referringDoctor || 'Attending Physician',
        radiologistName: 'Dr. S. Meenakshi, MD, DMRD',
        clinicalIndication: clinicalIndication || 'Clinical diagnostic workup',
        technique: `Digital acquisition performed under standard ${modality} protocol.`,
        findings: 'Diagnostic scan successfully acquired and processed. Anatomical landmarks clearly visualized.',
        impression: `Completed ${studyTitle} examination. Logged in RIS worklist.`,
        seriesCount: m === 'MR' || m === 'CT' ? 3 : 1,
        sliceCount: m === 'MR' ? 16 : (m === 'CT' ? 24 : 1),
        dicomWindowCenter: m === 'MR' ? 40 : 50,
        dicomWindowWidth: m === 'MR' ? 80 : 400,
        scanType
      };

      if (sqlDb && sqlDb.orderRadiologyStudy) {
        try {
          sqlDb.orderRadiologyStudy(newStudy);
        } catch (e) {
          console.error('[SQL DB Radiology Order Error]:', e.message);
        }
      }

      if (!db.radiologyStudies) db.radiologyStudies = [];
      db.radiologyStudies.unshift(newStudy);
      writeDB(db);

      return sendJSON(res, 201, {
        success: true,
        study: newStudy,
        message: `Radiology study order (${accessionNo}) confirmed in RIS! PACS scan ready for diagnostic review.`
      });
    }

    // =========================================================================
    // RIS (RADIOLOGY INFORMATION SYSTEM) & SCAN WARD PORTAL API ENDPOINTS
    // =========================================================================

    // 14. Radiologist Login Authentication
    if (pathname === '/api/auth/ris' && method === 'POST') {
      const body = await parseBody(req);
      const regNo = (body.regNo || body.username || '').trim().toUpperCase();
      const enteredPass = (body.password || body.pin || '').trim();

      if (!regNo || !enteredPass) {
        return sendJSON(res, 400, { success: false, message: 'Radiologist Registration Number and PIN are required.' });
      }

      // Predefined Radiologist profiles
      const radiologistProfiles = [
        {
          id: 'RAD-DOC-01',
          name: 'Dr. R. Vijayakumar',
          regNo: 'TMC-RAD-38910',
          pin: '1234',
          qualification: 'MD, DNB (Radio-Diagnosis)',
          department: 'Radiology & Imaging',
          subSpecialty: 'Neuro-Radiology & CT Interventions',
          hospital: 'Apex Health & Research Hospital',
          role: 'Chief Radiologist & HOD'
        },
        {
          id: 'RAD-DOC-02',
          name: 'Dr. S. Meenakshi',
          regNo: 'TMC-RAD-42019',
          pin: '1234',
          qualification: 'MD, DMRD, FRCR',
          department: 'Radiology & Imaging',
          subSpecialty: 'Cardiovascular & Body MRI',
          hospital: 'Apex Health & Research Hospital',
          role: 'Senior Consultant Radiologist'
        }
      ];

      // Check predefined or fallback match
      let radiologist = radiologistProfiles.find(r => 
        (r.regNo === regNo || r.id === regNo) && (r.pin === enteredPass || enteredPass === '1234' || enteredPass === 'admin')
      );

      // Check if it's any doctor from database with 1234 or doctor's password
      if (!radiologist && sqlDb && sqlDb.getDoctorByRegNo) {
        try {
          const doc = sqlDb.getDoctorByRegNo(regNo);
          if (doc && (enteredPass === doc.password || enteredPass === '1234')) {
            radiologist = {
              id: doc.id,
              name: doc.name,
              regNo: doc.regNo,
              qualification: doc.qualification,
              department: 'Radiology & Imaging Sciences',
              subSpecialty: 'Diagnostic Radiology',
              hospital: doc.hospital,
              role: 'Consultant Radiologist'
            };
          }
        } catch (e) {}
      }

      // Allow demo login for standard test credentials
      if (!radiologist && (regNo === 'TMC-RAD-38910' || regNo === 'RADIOLOGY' || regNo === 'ADMIN') && (enteredPass === '1234' || enteredPass === 'admin')) {
        radiologist = radiologistProfiles[0];
      }

      if (radiologist) {
        return sendJSON(res, 200, {
          success: true,
          radiologist,
          token: `ris_token_${radiologist.id}_${Date.now()}`,
          message: `Welcome Dr. ${radiologist.name.replace(/^Dr\.\s*/, '')} to RIS Scan Ward Console`
        });
      } else {
        return sendJSON(res, 401, {
          success: false,
          message: 'Invalid Radiologist Medical Council Reg No or Security PIN. (Demo: TMC-RAD-38910 / 1234)'
        });
      }
    }

    // 15. RIS: Get Live Scan Ward Resource Status & Counts
    if (pathname === '/api/ris/ward-status' && method === 'GET') {
      if (sqlDb && sqlDb.getRISWardStatus) {
        try {
          const wardStatus = sqlDb.getRISWardStatus();
          return sendJSON(res, 200, { success: true, ...wardStatus });
        } catch (e) {
          console.error('[SQL DB RIS Ward Status Error]:', e.message);
        }
      }
      return sendJSON(res, 200, {
        success: true,
        totalMachines: 6,
        freeMachines: 4,
        occupiedMachines: 2,
        maintenanceMachines: 0,
        totalWorkers: 8,
        pendingRequestsCount: 0
      });
    }

    // 16. RIS: Get Ward Machines List
    if (pathname === '/api/ris/machines' && method === 'GET') {
      let machines = [];
      if (sqlDb && sqlDb.getRISWardMachines) {
        try {
          machines = sqlDb.getRISWardMachines();
        } catch (e) {
          console.error('[SQL DB RIS Machines Error]:', e.message);
        }
      }
      return sendJSON(res, 200, { success: true, count: machines.length, machines });
    }

    // 17. RIS: Update Machine Status (Free, Occupied, Maintenance)
    if (pathname.startsWith('/api/ris/machines/') && (method === 'PATCH' || method === 'POST')) {
      const machineId = pathname.split('/').pop();
      const body = await parseBody(req);
      let updated = null;
      if (sqlDb && sqlDb.updateRISMachineStatus) {
        try {
          updated = sqlDb.updateRISMachineStatus(machineId, body.status, body.patientId, body.patientName, body.abhaId, body.scanType, body.assignedTechnician);
        } catch (e) {
          console.error('[SQL DB RIS Update Machine Error]:', e.message);
        }
      }
      return sendJSON(res, 200, { success: true, machine: updated });
    }

    // 18. RIS: Get Ward Workers / Staff Roster
    if (pathname === '/api/ris/workers' && method === 'GET') {
      let workers = [];
      if (sqlDb && sqlDb.getRISWardWorkers) {
        try {
          workers = sqlDb.getRISWardWorkers();
        } catch (e) {
          console.error('[SQL DB RIS Workers Error]:', e.message);
        }
      }
      return sendJSON(res, 200, { success: true, count: workers.length, workers });
    }

    // 19. RIS: Get Requisitions Worklist
    if (pathname === '/api/ris/requests' && method === 'GET') {
      const status = parsedUrl.query.status || '';
      const abhaId = parsedUrl.query.abhaId || parsedUrl.query.q || '';
      let requests = [];
      if (sqlDb && sqlDb.getRISRequests) {
        try {
          requests = sqlDb.getRISRequests(status, abhaId);
        } catch (e) {
          console.error('[SQL DB RIS Requests Error]:', e.message);
        }
      }
      return sendJSON(res, 200, { success: true, count: requests.length, requests });
    }

    // 20. RIS: Create Scan Requisition from Doctor Workbench (Contains ABHA ID)
    if (pathname === '/api/ris/requests' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.patientName && !body.name && !body.receiptId && !body.abhaId) {
        return sendJSON(res, 400, { success: false, message: 'Patient Name or ABHA ID is required for RIS Requisition.' });
      }
      if (!body.modality) {
        return sendJSON(res, 400, { success: false, message: 'Scan Modality is required (e.g. CT, MRI, X-Ray, US).' });
      }

      let newReq = null;
      if (sqlDb && sqlDb.createRISRequest) {
        try {
          newReq = sqlDb.createRISRequest(body);
        } catch (e) {
          console.error('[SQL DB Create RIS Req Error]:', e.message);
        }
      }
      if (newReq) {
        return sendJSON(res, 201, {
          success: true,
          request: newReq,
          message: `Scan requisition successfully sent to Scan Ward & RIS with ABHA ID: ${newReq.abhaId}`
        });
      } else {
        return sendJSON(res, 500, { success: false, message: 'Failed to record RIS scan requisition.' });
      }
    }

    // 21. RIS: Radiologist Accepts Scan Request & Assigns Free Machine & Tech
    if (pathname.includes('/api/ris/requests/') && pathname.endsWith('/accept') && (method === 'PATCH' || method === 'POST')) {
      const parts = pathname.split('/');
      const reqId = parts[parts.length - 2];
      const body = await parseBody(req);

      let accepted = null;
      if (sqlDb && sqlDb.acceptRISRequest) {
        try {
          accepted = sqlDb.acceptRISRequest(reqId, body.assignedMachine, body.assignedTechnician);
        } catch (e) {
          console.error('[SQL DB Accept RIS Error]:', e.message);
        }
      }

      if (accepted) {
        return sendJSON(res, 200, {
          success: true,
          request: accepted,
          message: `Scan request ${reqId} accepted. Machine allocated & status set to In-Progress.`
        });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Scan request not found' });
      }
    }

    // 22. RIS: Complete Scan & Push to PACS
    if (pathname.includes('/api/ris/requests/') && pathname.endsWith('/complete') && (method === 'PATCH' || method === 'POST')) {
      const parts = pathname.split('/');
      const reqId = parts[parts.length - 2];
      const body = await parseBody(req);

      let completed = null;
      if (sqlDb && sqlDb.completeRISRequest) {
        try {
          completed = sqlDb.completeRISRequest(reqId, body.findings, body.impression, body.radiologistName);
        } catch (e) {
          console.error('[SQL DB Complete RIS Error]:', e.message);
        }
      }

      if (completed) {
        const reqData = completed.request || completed;
        return sendJSON(res, 200, {
          success: true,
          request: reqData,
          study: completed.study,
          message: `Scan completed successfully! DICOM study generated and pushed to PACS archive.`
        });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Scan request not found' });
      }
    }

    // 23. RIS: Search Patient Profile & Complete Clinical Details by ABHA ID
    if (pathname.startsWith('/api/ris/patient-abha/') && method === 'GET') {
      const abhaQuery = decodeURIComponent(pathname.replace('/api/ris/patient-abha/', '')).trim();
      let patient = null;

      if (sqlDb && sqlDb.getPatientByQuery) {
        try {
          patient = sqlDb.getPatientByQuery(abhaQuery);
        } catch (e) {
          console.error('[SQL DB ABHA Search Error]:', e.message);
        }
      }

      // Fallback in json DB
      if (!patient && db.patients) {
        patient = db.patients.find(p => 
          p.abhaId.toLowerCase() === abhaQuery.toLowerCase() ||
          p.abhaAddress.toLowerCase() === abhaQuery.toLowerCase() ||
          p.receiptId.toLowerCase() === abhaQuery.toLowerCase() ||
          p.phone.replace(/\D/g, '') === abhaQuery.replace(/\D/g, '')
        );
      }

      if (patient) {
        // Fetch past radiology studies for this patient
        let pastStudies = [];
        if (sqlDb && sqlDb.getRadiologyStudies) {
          try {
            pastStudies = sqlDb.getRadiologyStudies(patient.receiptId);
          } catch (e) {}
        }
        // Fetch pending RIS requests for this patient
        let pendingRequests = [];
        if (sqlDb && sqlDb.getRISRequests) {
          try {
            pendingRequests = sqlDb.getRISRequests('', patient.abhaId);
          } catch (e) {}
        }

        return sendJSON(res, 200, {
          success: true,
          patient: {
            ...patient,
            patientName: (patient.name || patient.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
          },
          pastStudies,
          pendingRequests
        });
      } else {
        return sendJSON(res, 404, { success: false, message: `No patient record located for ABHA ID: ${abhaQuery}` });
      }
    }

    // =========================================================================
    // LIS (LABORATORY INFORMATION SYSTEM) REST API ENDPOINTS
    // =========================================================================

    // 24. LIS Lab Staff Authentication
    if (pathname === '/api/auth/lis' && method === 'POST') {
      const body = await parseBody(req);
      const regNo = (body.regNo || body.username || '').trim().toUpperCase();
      const enteredPass = (body.password || body.pin || '').trim();

      if (!regNo || !enteredPass) {
        return sendJSON(res, 400, { success: false, message: 'Laboratory Staff ID / Reg No and PIN are required.' });
      }

      const labProfiles = [
        {
          id: 'LAB-DOC-01',
          name: 'Dr. S. Kanthimathi',
          regNo: 'TMC-LAB-5501',
          pin: '1234',
          qualification: 'MD (Pathology), DNB (Biochemistry)',
          department: 'Central Clinical Laboratory & Pathology',
          role: 'Chief Pathologist & HOD'
        },
        {
          id: 'LAB-TECH-01',
          name: 'K. Selvam',
          regNo: 'LAB-TECH-01',
          pin: '1234',
          qualification: 'B.Sc MLT, PG-Diploma in Clinical Automation',
          department: 'Central Clinical Laboratory',
          role: 'Senior Medical Laboratory Technologist (MLT)'
        }
      ];

      let labUser = labProfiles.find(l => 
        (l.regNo === regNo || l.id === regNo) && (l.pin === enteredPass || enteredPass === '1234' || enteredPass === 'admin')
      );

      if (!labUser && (regNo === 'TMC-LAB-5501' || regNo === 'LAB' || regNo === 'PATHOLOGY' || regNo === 'ADMIN') && (enteredPass === '1234' || enteredPass === 'admin')) {
        labUser = labProfiles[0];
      }

      if (labUser) {
        return sendJSON(res, 200, {
          success: true,
          labUser,
          token: `lis_token_${labUser.id}_${Date.now()}`,
          message: `Authenticated as ${labUser.name} (${labUser.role})`
        });
      } else {
        return sendJSON(res, 401, {
          success: false,
          message: 'Invalid Laboratory Staff Registration No or PIN. (Demo: TMC-LAB-5501 / 1234 or LAB-TECH-01 / 1234)'
        });
      }
    }

    // 25. LIS: List Requisitions
    if (pathname === '/api/lis/requests' && method === 'GET') {
      const status = parsedUrl.query.status || '';
      const abhaId = parsedUrl.query.abhaId || parsedUrl.query.q || '';
      let requests = [];
      if (sqlDb && sqlDb.getLISRequests) {
        try {
          requests = sqlDb.getLISRequests(status, abhaId);
        } catch (e) {
          console.error('[SQL DB LIS Requests Error]:', e.message);
        }
      }
      return sendJSON(res, 200, { success: true, count: requests.length, requests });
    }

    // 26. LIS: Create Lab Order Requisition from Doctor Workbench
    if (pathname === '/api/lis/requests' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.patientName && !body.name && !body.receiptId && !body.abhaId) {
        return sendJSON(res, 400, { success: false, message: 'Patient Name or ABHA ID is required for Lab Order.' });
      }

      let newReq = null;
      if (sqlDb && sqlDb.createLISRequest) {
        try {
          newReq = sqlDb.createLISRequest(body);
        } catch (e) {
          console.error('[SQL DB Create LIS Req Error]:', e.message);
        }
      }

      if (newReq) {
        return sendJSON(res, 201, {
          success: true,
          request: newReq,
          message: `Laboratory requisition (${newReq.id}) dispatched to Central LIS with ABHA ID: ${newReq.abhaId}`
        });
      } else {
        return sendJSON(res, 500, { success: false, message: 'Failed to record LIS laboratory requisition.' });
      }
    }

    // 27. LIS: Accept Lab Order & Record Specimen Collection
    if (pathname.includes('/api/lis/requests/') && pathname.endsWith('/accept') && (method === 'PATCH' || method === 'POST')) {
      const parts = pathname.split('/');
      const reqId = parts[parts.length - 2];
      const body = await parseBody(req);

      let accepted = null;
      if (sqlDb && sqlDb.acceptLISRequest) {
        try {
          accepted = sqlDb.acceptLISRequest(reqId, body.assignedTechnician, body.specimenType);
        } catch (e) {
          console.error('[SQL DB Accept LIS Error]:', e.message);
        }
      }

      if (accepted) {
        return sendJSON(res, 200, {
          success: true,
          request: accepted,
          message: `Sample collected and accessioned into LIS analyzer queue.`
        });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Lab requisition not found' });
      }
    }

    // 28. LIS: Complete Lab Test & Upload Diagnostic Report to Patient EMR
    if (pathname.includes('/api/lis/requests/') && pathname.endsWith('/upload') && (method === 'PATCH' || method === 'POST')) {
      const parts = pathname.split('/');
      const reqId = parts[parts.length - 2];
      const body = await parseBody(req);

      let result = null;
      if (sqlDb && sqlDb.uploadLISReport) {
        try {
          result = sqlDb.uploadLISReport(reqId, body);
        } catch (e) {
          console.error('[SQL DB Upload LIS Error]:', e.message);
        }
      }

      // Also update database.json if JSON patient exists
      if (result && result.request) {
        const reqObj = result.request;
        const pt = db.patients.find(p => p.id === reqObj.patientId || p.receiptId === reqObj.receiptId || p.abhaId === reqObj.abhaId);
        if (pt) {
          if (!Array.isArray(pt.labReports)) pt.labReports = [];
          const testDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          if (Array.isArray(body.testParameters) && body.testParameters.length > 0) {
            body.testParameters.forEach(tp => {
              pt.labReports.unshift({
                testName: tp.parameter || tp.name || reqObj.testsRequested,
                date: testDate,
                result: `${tp.value} ${tp.unit || ''}`.trim(),
                normalRange: tp.normalRange || 'Standard Normal',
                status: tp.status || 'Normal'
              });
            });
          } else {
            pt.labReports.unshift({
              testName: reqObj.testsRequested,
              date: testDate,
              result: body.observedValue || 'Verified Normal',
              normalRange: body.normalRange || 'Standard Normal',
              status: body.status || 'Normal'
            });
          }
          writeDB(db);
        }
      }

      if (result) {
        return sendJSON(res, 200, {
          success: true,
          request: result.request,
          labReports: result.labReports,
          message: `Laboratory report validated and uploaded to Doctor Workbench and Citizen Health Locker!`
        });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Lab requisition not found' });
      }
    }

    // 29. LIS: Patient Lookup & Historical Lab Archive by ABHA ID
    if (pathname.startsWith('/api/lis/patient-abha/') && method === 'GET') {
      const abhaQuery = decodeURIComponent(pathname.replace('/api/lis/patient-abha/', '')).trim();
      let patient = null;

      if (sqlDb && sqlDb.getPatientByQuery) {
        try {
          patient = sqlDb.getPatientByQuery(abhaQuery);
        } catch (e) {}
      }

      if (!patient && db.patients) {
        patient = db.patients.find(p => 
          p.abhaId.toLowerCase() === abhaQuery.toLowerCase() ||
          p.receiptId.toLowerCase() === abhaQuery.toLowerCase()
        );
      }

      if (patient) {
        let pendingLIS = [];
        if (sqlDb && sqlDb.getLISRequests) {
          try {
            pendingLIS = sqlDb.getLISRequests('', patient.abhaId);
          } catch (e) {}
        }
        return sendJSON(res, 200, {
          success: true,
          patient: {
            ...patient,
            patientName: (patient.name || patient.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
          },
          pendingLIS,
          labReports: patient.labReports || []
        });
      } else {
        return sendJSON(res, 404, { success: false, message: `No patient found for ABHA ID: ${abhaQuery}` });
      }
    }

    // 30. LIS: Dashboard Statistics
    if (pathname === '/api/lis/stats' && method === 'GET') {
      let stats = { total: 0, pending: 0, inProgress: 0, completedToday: 0, totalLabReports: 0 };
      if (sqlDb && sqlDb.getLISStats) {
        try {
          stats = sqlDb.getLISStats();
        } catch (e) {}
      }
      return sendJSON(res, 200, { success: true, ...stats });
    }

    // =========================================================================
    // PIS (PHARMACY INFORMATION SYSTEM) REST API ENDPOINTS
    // =========================================================================

    // 31. PIS Pharmacist Authentication
    if (pathname === '/api/auth/pis' && method === 'POST') {
      const body = await parseBody(req);
      const regNo = (body.regNo || body.username || '').trim().toUpperCase();
      const enteredPass = (body.password || body.pin || '').trim();

      if (!regNo || !enteredPass) {
        return sendJSON(res, 400, { success: false, message: 'Pharmacist Registration No and Security PIN are required.' });
      }

      const pharmacyProfiles = [
        {
          id: 'PHARM-DOC-01',
          name: 'Pharm. R. Murugan',
          regNo: 'TMC-PHARM-8802',
          pin: '1234',
          qualification: 'M.Pharm (Hospital Pharmacy), R.Ph',
          department: 'Central Dispensary & Hospital Pharmacy',
          role: 'Senior Chief Pharmacist & In-charge'
        },
        {
          id: 'PHARM-01',
          name: 'Pharm. M. Priya',
          regNo: 'PHARM-01',
          pin: '1234',
          qualification: 'B.Pharm, R.Ph',
          department: 'OPD Dispensary Unit',
          role: 'Registered Clinical Pharmacist'
        }
      ];

      let pharmUser = pharmacyProfiles.find(p => 
        (p.regNo === regNo || p.id === regNo) && (p.pin === enteredPass || enteredPass === '1234' || enteredPass === 'admin')
      );

      if (!pharmUser && (regNo === 'TMC-PHARM-8802' || regNo === 'PHARMACY' || regNo === 'ADMIN') && (enteredPass === '1234' || enteredPass === 'admin')) {
        pharmUser = pharmacyProfiles[0];
      }

      if (pharmUser) {
        return sendJSON(res, 200, {
          success: true,
          pharmUser,
          token: `pis_token_${pharmUser.id}_${Date.now()}`,
          message: `Authenticated as ${pharmUser.name} (${pharmUser.role})`
        });
      } else {
        return sendJSON(res, 401, {
          success: false,
          message: 'Invalid Pharmacist Registration No or PIN. (Demo: TMC-PHARM-8802 / 1234 or PHARM-01 / 1234)'
        });
      }
    }

    // 32. PIS: List Incoming Prescriptions
    if (pathname === '/api/pis/prescriptions' && method === 'GET') {
      const status = parsedUrl.query.status || '';
      const abhaId = parsedUrl.query.abhaId || parsedUrl.query.q || '';
      let prescriptions = [];
      if (sqlDb && sqlDb.getPISPrescriptions) {
        try {
          prescriptions = sqlDb.getPISPrescriptions(status, abhaId);
        } catch (e) {
          console.error('[SQL DB PIS Prescriptions Error]:', e.message);
        }
      }
      return sendJSON(res, 200, { success: true, count: prescriptions.length, prescriptions });
    }

    // 33. PIS: Transmit Electronic Prescription from Doctor Workbench
    if (pathname === '/api/pis/prescriptions' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.patientName && !body.name && !body.receiptId && !body.abhaId) {
        return sendJSON(res, 400, { success: false, message: 'Patient Details and ABHA ID are required for Pharmacy Order.' });
      }

      let newRx = null;
      if (sqlDb && sqlDb.createPISPrescription) {
        try {
          newRx = sqlDb.createPISPrescription(body);
        } catch (e) {
          console.error('[SQL DB Create PIS Prescription Error]:', e.message);
        }
      }

      if (newRx) {
        return sendJSON(res, 201, {
          success: true,
          prescription: newRx,
          message: `Prescription successfully transmitted to Hospital Pharmacy (PIS) for dispensing via ABHA ID: ${newRx.abhaId}`
        });
      } else {
        return sendJSON(res, 500, { success: false, message: 'Failed to transmit prescription to pharmacy.' });
      }
    }

    // 34. PIS: Pharmacist Accepts Prescription
    if (pathname.includes('/api/pis/prescriptions/') && pathname.endsWith('/accept') && (method === 'PATCH' || method === 'POST')) {
      const parts = pathname.split('/');
      const rxId = parts[parts.length - 2];
      const body = await parseBody(req);

      let accepted = null;
      if (sqlDb && sqlDb.acceptPISPrescription) {
        try {
          accepted = sqlDb.acceptPISPrescription(rxId, body.pharmacistName);
        } catch (e) {
          console.error('[SQL DB Accept PIS Error]:', e.message);
        }
      }

      if (accepted) {
        return sendJSON(res, 200, {
          success: true,
          prescription: accepted,
          message: `Prescription accepted and marked Under Verification.`
        });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Prescription order not found' });
      }
    }

    // 35. PIS: Pharmacist Calls Patient ABHA ID & Dispenses Medicines
    if (pathname.includes('/api/pis/prescriptions/') && pathname.endsWith('/dispense') && (method === 'PATCH' || method === 'POST')) {
      const parts = pathname.split('/');
      const rxId = parts[parts.length - 2];
      const body = await parseBody(req);

      let result = null;
      if (sqlDb && sqlDb.dispensePISPrescription) {
        try {
          result = sqlDb.dispensePISPrescription(rxId, body);
        } catch (e) {
          console.error('[SQL DB Dispense PIS Error]:', e.message);
        }
      }

      if (result) {
        return sendJSON(res, 200, {
          success: true,
          prescription: result.prescription,
          dispensationToken: result.dispensationToken,
          message: `Medicines successfully dispensed by verifying ABHA ID! Dispensation token: ${result.dispensationToken}`
        });
      } else {
        return sendJSON(res, 404, { success: false, message: 'Prescription order not found' });
      }
    }

    // 36. PIS: Patient Lookup, Active Prescriptions, Allergies & Past Medication History by ABHA ID
    if (pathname.startsWith('/api/pis/patient-abha/') && method === 'GET') {
      const abhaQuery = decodeURIComponent(pathname.replace('/api/pis/patient-abha/', '')).trim();
      let patient = null;

      if (sqlDb && sqlDb.getPatientByQuery) {
        try {
          patient = sqlDb.getPatientByQuery(abhaQuery);
        } catch (e) {}
      }

      if (!patient && db.patients) {
        patient = db.patients.find(p => 
          p.abhaId.toLowerCase() === abhaQuery.toLowerCase() ||
          p.receiptId.toLowerCase() === abhaQuery.toLowerCase()
        );
      }

      if (patient) {
        let pendingPIS = [];
        if (sqlDb && sqlDb.getPISPrescriptions) {
          try {
            pendingPIS = sqlDb.getPISPrescriptions('', patient.abhaId);
          } catch (e) {}
        }

        return sendJSON(res, 200, {
          success: true,
          patient: {
            ...patient,
            patientName: (patient.name || patient.patientName || '').replace(/^(Master|Baby|Mr\.|Ms\.|Mrs\.|Miss)\s+/i, '').trim()
          },
          pendingPrescriptions: pendingPIS,
          prescriptions: patient.prescriptions || [],
          pastMedications: patient.pastMedications || []
        });
      } else {
        return sendJSON(res, 404, { success: false, message: `No patient found for ABHA ID: ${abhaQuery}` });
      }
    }

    // 37. PIS: Dashboard Statistics
    if (pathname === '/api/pis/stats' && method === 'GET') {
      let stats = { total: 0, pending: 0, inProgress: 0, dispensedToday: 0, stockStatus: 'Available' };
      if (sqlDb && sqlDb.getPISStats) {
        try {
          stats = sqlDb.getPISStats();
        } catch (e) {}
      }
      return sendJSON(res, 200, { success: true, ...stats });
    }

    // 404 for unhandled API
    return sendJSON(res, 404, { error: 'Endpoint not found' });
  }

  // -------------------------------------------------------------------------
  // STATIC FILE SERVING FOR REACT FRONTEND
  // -------------------------------------------------------------------------
  let requestedFile = pathname;
  if (requestedFile === '/' || requestedFile === '') {
    requestedFile = 'index.html';
  } else if (requestedFile === '/doctor' || requestedFile === '/doctor/') {
    requestedFile = 'doctor.html';
  } else if (requestedFile === '/ris' || requestedFile === '/ris/' || requestedFile === '/radiology' || requestedFile === '/radiology/') {
    requestedFile = 'ris.html';
  } else if (requestedFile === '/lis' || requestedFile === '/lis/' || requestedFile === '/laboratory' || requestedFile === '/laboratory/' || requestedFile === '/lab' || requestedFile === '/lab/') {
    requestedFile = 'lis.html';
  } else if (requestedFile === '/pis' || requestedFile === '/pis/' || requestedFile === '/pharmacy' || requestedFile === '/pharmacy/') {
    requestedFile = 'pis.html';
  } else if (requestedFile === '/client' || requestedFile === '/client/' || requestedFile === '/patient' || requestedFile === '/patient/' || requestedFile === '/client-portal' || requestedFile === '/client-portal/') {
    requestedFile = 'client.html';
  }

  let filePath = path.join(PUBLIC_DIR, requestedFile);

  // Security: Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: Return index.html
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Server Error reading file');
      }

      let finalContentType = contentType;
      // Auto-detect WebP binary signature (RIFF....WEBP) even if extension was .svg
      if (content.length >= 12 && content.subarray(0, 4).toString('ascii') === 'RIFF' && content.subarray(8, 12).toString('ascii') === 'WEBP') {
        finalContentType = 'image/webp';
      }

      res.writeHead(200, {
        'Content-Type': finalContentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`===================================================================`);
  console.log(` UNIFIED HEALTH CARE & PAN-INDIA MEDICAL CENTRE BACKEND SERVER`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Teleconsultation Signaling & REST API Active`);
  console.log(`===================================================================`);
});
