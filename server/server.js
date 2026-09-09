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
          clinicalNotes: `Self-registered via Tamil Nadu Health Care Portal. Guardian/Relation: ${guardianName || 'Self'}. Emergency: ${emergencyPhone || phone}. Ayushman Bharat Digital Mission (ABDM) record generated.`,
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

    // 5. Doctor / Staff Login
    if (pathname === '/api/auth/doctor' && method === 'POST') {
      const body = await parseBody(req);
      const regNo = (body.regNo || '').trim().toUpperCase();
      const pin = (body.pin || '').trim();

      const doctor = db.doctors.find(d => d.regNo.toUpperCase() === regNo && d.pin === pin);
      if (doctor) {
        return sendJSON(res, 200, { success: true, doctor, token: 'doctor_token_' + doctor.id });
      } else {
        return sendJSON(res, 401, { success: false, message: 'Invalid Medical Council Registration Number or PIN' });
      }
    }

    // 6. Doctor Consultation Updates (Clinical Notes, BP, Rx)
    if (pathname === '/api/doctor/consultation' && method === 'POST') {
      const body = await parseBody(req);
      const { receiptId, diagnosis, notes, bp, pulse, newPrescriptions } = body;

      const patient = db.patients.find(p => p.receiptId === receiptId);
      if (!patient) {
        return sendJSON(res, 404, { success: false, message: 'Patient not found' });
      }

      if (diagnosis) patient.clinicalSummary.diagnosis = diagnosis;
      if (notes) patient.clinicalSummary.clinicalNotes = notes;
      if (bp) patient.vitals.bp = bp;
      if (pulse) patient.vitals.pulse = pulse;
      if (Array.isArray(newPrescriptions) && newPrescriptions.length > 0) {
        patient.prescriptions.push(...newPrescriptions);
      }
      patient.status = 'Reviewed by Specialist';

      writeDB(db);
      return sendJSON(res, 200, { success: true, patient, message: 'Consultation record saved successfully' });
    }

    // 6b. Doctor OPD Queue
    if (pathname === '/api/doctor/queue' && method === 'GET') {
      const queue = (db.patients || []).slice(0, 5).map((p, idx) => ({
        token: idx + 1,
        id: p.id,
        receiptId: p.receiptId,
        abhaId: p.abhaId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        department: p.department,
        status: idx === 0 ? 'Attending Now' : 'Waiting in Queue',
        clinicalSummary: p.clinicalSummary,
        prescriptions: p.prescriptions,
        vitals: p.vitals,
        followUp: p.followUp
      }));
      return sendJSON(res, 200, { success: true, queue });
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
        );
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
        });
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

    // 10. WebRTC Signaling Pull
    if (pathname.startsWith('/api/teleconsult/signal/') && method === 'GET') {
      const parts = pathname.split('/');
      const roomId = parts[4];
      const forRole = parsedUrl.query.forRole || '';
      const since = parseInt(parsedUrl.query.since || '0', 10);

      const signals = signalingStore[roomId] || [];
      const pending = signals.filter(s => s.from !== forRole && s.timestamp > since);

      return sendJSON(res, 200, { success: true, signals: pending });
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
  console.log(` TAMIL NADU HEALTH CARE & PAN-INDIA MEDICAL CENTRE BACKEND SERVER`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Teleconsultation Signaling & REST API Active`);
  console.log(`===================================================================`);
});
