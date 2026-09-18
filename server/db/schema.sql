-- ============================================================================
-- TAMIL NADU HEALTH CARE & PAN-INDIA MEDICAL CENTRE
-- RELATIONAL SQL DATABASE SCHEMA (schema.sql)
-- Standard SQL DDL compatible with SQLite, PostgreSQL, MySQL
-- ============================================================================

-- 1. PATIENTS CORE TABLE
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(32) PRIMARY KEY,
  receipt_id VARCHAR(32) UNIQUE NOT NULL,
  abha_id VARCHAR(64) UNIQUE NOT NULL,
  abha_address VARCHAR(64),
  name VARCHAR(128) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(16) NOT NULL,
  blood_group VARCHAR(8) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  dob VARCHAR(32),
  guardian_name VARCHAR(128),
  emergency_phone VARCHAR(32),
  email VARCHAR(128),
  district VARCHAR(64),
  pincode VARCHAR(16),
  pin VARCHAR(16) DEFAULT '1234',
  address TEXT,
  center_name VARCHAR(255) NOT NULL,
  admission_date VARCHAR(32),
  discharge_date VARCHAR(32),
  status VARCHAR(64) NOT NULL,
  department VARCHAR(64) NOT NULL,
  consulting_doctor VARCHAR(128) NOT NULL,
  doctor_reg_no VARCHAR(32) NOT NULL,
  follow_up VARCHAR(128),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. PATIENT VITALS TABLE
CREATE TABLE IF NOT EXISTS patient_vitals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id VARCHAR(32) NOT NULL,
  bp VARCHAR(32),
  pulse VARCHAR(16),
  spo2 VARCHAR(16),
  temp VARCHAR(16),
  weight VARCHAR(16),
  height VARCHAR(16),
  bmi VARCHAR(16),
  blood_sugar_fasting VARCHAR(32),
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 3. CLINICAL SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS clinical_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id VARCHAR(32) UNIQUE NOT NULL,
  chief_complaints TEXT,
  diagnosis TEXT NOT NULL,
  clinical_notes TEXT,
  allergies TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 4. ELECTRONIC PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id VARCHAR(32) NOT NULL,
  medicine VARCHAR(128) NOT NULL,
  dosage VARCHAR(64),
  frequency VARCHAR(32),
  timing VARCHAR(64),
  duration VARCHAR(64),
  instructions TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 5. DIAGNOSTIC INVESTIGATIONS & LAB REPORTS TABLE
CREATE TABLE IF NOT EXISTS lab_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id VARCHAR(32) NOT NULL,
  test_name VARCHAR(128) NOT NULL,
  test_date VARCHAR(32),
  observed_value TEXT,
  normal_range VARCHAR(64),
  status VARCHAR(32),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 6. CMCHIS INSURANCE & BILLING TABLE
CREATE TABLE IF NOT EXISTS billings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id VARCHAR(32) UNIQUE NOT NULL,
  total_amount VARCHAR(32),
  insurance_scheme TEXT,
  scheme_approved VARCHAR(32),
  patient_payable VARCHAR(32),
  payment_status VARCHAR(64),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 7. DOCTORS & SPECIALISTS TABLE
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  reg_no VARCHAR(32) UNIQUE NOT NULL,
  qualification VARCHAR(128),
  department VARCHAR(64),
  hospital VARCHAR(255),
  phone VARCHAR(32),
  status VARCHAR(32) DEFAULT 'Available',
  password_hash VARCHAR(128)
);

-- 8. OPD APPOINTMENT QUEUE TABLE
CREATE TABLE IF NOT EXISTS opd_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_no INTEGER NOT NULL,
  patient_id VARCHAR(32) NOT NULL,
  doctor_id VARCHAR(32) NOT NULL,
  queue_status VARCHAR(32) DEFAULT 'Waiting',
  priority VARCHAR(32) DEFAULT 'Normal',
  scheduled_time VARCHAR(32),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 9. TELECONSULTATION & VIDEO APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32) NOT NULL,
  patient_name VARCHAR(128) NOT NULL,
  receipt_id VARCHAR(32) NOT NULL,
  abha_id VARCHAR(64),
  phone VARCHAR(32),
  department VARCHAR(64) NOT NULL,
  issue_description TEXT NOT NULL,
  requested_date VARCHAR(32) NOT NULL,
  requested_time VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'Pending',
  doctor_id VARCHAR(32),
  doctor_name VARCHAR(128),
  doctor_reg_no VARCHAR(32),
  confirmed_time VARCHAR(64),
  room_id VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 10. RIS & PACS RADIOLOGY STUDIES TABLE
CREATE TABLE IF NOT EXISTS radiology_studies (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32) NOT NULL,
  patient_name VARCHAR(128) NOT NULL,
  receipt_id VARCHAR(32) NOT NULL,
  study_title VARCHAR(128) NOT NULL,
  modality VARCHAR(32) NOT NULL, -- CR (Digital X-Ray), CT, MR (MRI), US (Ultrasound), ECHO, NM
  body_part VARCHAR(64) NOT NULL,
  study_date VARCHAR(32) NOT NULL,
  accession_no VARCHAR(32) UNIQUE NOT NULL,
  status VARCHAR(32) DEFAULT 'Reported & Verified', -- Ordered, In Progress, Reported & Verified
  priority VARCHAR(32) DEFAULT 'Routine', -- Routine, Urgent, Stat Emergency
  department VARCHAR(64),
  referring_doctor VARCHAR(128),
  radiologist_name VARCHAR(128),
  clinical_indication TEXT,
  technique TEXT,
  findings TEXT,
  impression TEXT,
  series_count INTEGER DEFAULT 1,
  slice_count INTEGER DEFAULT 1,
  dicom_window_center INTEGER DEFAULT 40,
  dicom_window_width INTEGER DEFAULT 400,
  scan_type VARCHAR(64),
  image_urls TEXT, -- JSON array of image/SVG slice representations
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 11. RIS DOCTOR SCAN REQUISITIONS TABLE
CREATE TABLE IF NOT EXISTS ris_requests (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32) NOT NULL,
  patient_name VARCHAR(128) NOT NULL,
  abha_id VARCHAR(64) NOT NULL,
  receipt_id VARCHAR(32) NOT NULL,
  age INTEGER,
  gender VARCHAR(16),
  modality VARCHAR(32) NOT NULL, -- CT, MR, CR, US, ECHO, NM
  body_part VARCHAR(64) NOT NULL,
  priority VARCHAR(32) DEFAULT 'Routine', -- Routine, Urgent (24h), STAT Emergency
  clinical_indication TEXT NOT NULL,
  doctor_name VARCHAR(128) NOT NULL,
  doctor_reg_no VARCHAR(32),
  department VARCHAR(64),
  status VARCHAR(32) DEFAULT 'Pending', -- Pending, Accepted, In Progress, Completed, Cancelled
  assigned_machine VARCHAR(128),
  assigned_technician VARCHAR(128),
  study_id VARCHAR(32), -- Links to radiology_studies when completed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 12. RIS SCAN WARD MACHINES & EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS ris_ward_machines (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  model VARCHAR(128) NOT NULL,
  modality VARCHAR(32) NOT NULL, -- CT, MR, CR, US, NM, CATH
  room_no VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'Free', -- Free, Occupied, Maintenance
  current_patient_id VARCHAR(32),
  current_patient_name VARCHAR(128),
  current_abha_id VARCHAR(64),
  current_scan_type VARCHAR(64),
  assigned_technician VARCHAR(128),
  uptime_pct REAL DEFAULT 99.4,
  last_calibrated VARCHAR(32) DEFAULT '12-Sep-2026'
);

-- 13. RIS SCAN WARD WORKERS & STAFF ROSTER TABLE
CREATE TABLE IF NOT EXISTS ris_ward_workers (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  role VARCHAR(64) NOT NULL, -- Consultant Radiologist, Senior MRI Tech, CT Specialist, Radiographer, Nursing Officer, Medical Physicist
  reg_no VARCHAR(32),
  shift VARCHAR(32) DEFAULT 'Morning (08:00 - 16:00)',
  assigned_room VARCHAR(32) DEFAULT 'Room 101',
  status VARCHAR(32) DEFAULT 'On Duty', -- On Duty, On Break, Off Duty
  phone VARCHAR(32)
);

-- 14. PREVIOUSLY USED MEDICINES (PAST MEDICATIONS HISTORY)
CREATE TABLE IF NOT EXISTS past_medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id VARCHAR(32) NOT NULL,
  medicine VARCHAR(128) NOT NULL,
  dosage VARCHAR(64) NOT NULL,
  frequency VARCHAR(64),
  duration VARCHAR(64),
  prescribed_by VARCHAR(128),
  indication VARCHAR(128),
  reason_for_change TEXT,
  status VARCHAR(64) DEFAULT 'Completed Course',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 15. PAST ELECTRONIC HEALTH EPISODES & ARCHIVED E-RECORDS
CREATE TABLE IF NOT EXISTS past_records (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32) NOT NULL,
  date VARCHAR(32) NOT NULL,
  hospital VARCHAR(255) NOT NULL,
  department VARCHAR(64) NOT NULL,
  doctor VARCHAR(128) NOT NULL,
  diagnosis VARCHAR(255) NOT NULL,
  outcome TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 16. LIS (LABORATORY INFORMATION SYSTEM) REQUISITIONS & LAB TEST ORDERS
CREATE TABLE IF NOT EXISTS lis_requests (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32) NOT NULL,
  patient_name VARCHAR(128) NOT NULL,
  abha_id VARCHAR(64) NOT NULL,
  receipt_id VARCHAR(32) NOT NULL,
  age INTEGER,
  gender VARCHAR(16),
  test_type VARCHAR(64) NOT NULL, -- Biochemistry, Hematology, Microbiology, Pathology, Serology, Urinalysis
  tests_requested TEXT NOT NULL, -- e.g. "Complete Blood Count (CBC), Lipid Profile, Serum Creatinine"
  priority VARCHAR(32) DEFAULT 'Routine', -- Routine, Urgent, STAT Emergency
  clinical_indication TEXT,
  doctor_name VARCHAR(128) NOT NULL,
  doctor_reg_no VARCHAR(32),
  department VARCHAR(64),
  specimen_type VARCHAR(64) DEFAULT 'Venous Blood (EDTA / Serum)',
  status VARCHAR(32) DEFAULT 'Pending', -- Pending, Sample Collected, In-Testing, Completed, Cancelled
  assigned_technician VARCHAR(128),
  pathologist_name VARCHAR(128),
  sample_collected_at DATETIME,
  completed_at DATETIME,
  findings_summary TEXT,
  test_parameters_json TEXT, -- JSON array of [{ parameter, value, unit, normalRange, status }]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 17. PIS (PHARMACY INFORMATION SYSTEM) PRESCRIPTIONS & DISPENSARY ORDERS
CREATE TABLE IF NOT EXISTS pis_prescriptions (
  id VARCHAR(32) PRIMARY KEY,
  patient_id VARCHAR(32) NOT NULL,
  patient_name VARCHAR(128) NOT NULL,
  abha_id VARCHAR(64) NOT NULL,
  receipt_id VARCHAR(32) NOT NULL,
  age INTEGER,
  gender VARCHAR(16),
  doctor_name VARCHAR(128) NOT NULL,
  doctor_reg_no VARCHAR(32),
  department VARCHAR(64),
  diagnosis TEXT,
  allergies TEXT,
  medicines_json TEXT NOT NULL, -- JSON array of [{ medicine, dosage, frequency, timing, duration, instructions, batchNo }]
  priority VARCHAR(32) DEFAULT 'Normal', -- Normal, Urgent Discharge, STAT
  status VARCHAR(32) DEFAULT 'Pending', -- Pending, Under Verification, Dispensed / Fulfilled, Cancelled
  dispensed_by VARCHAR(128),
  pharmacist_reg_no VARCHAR(32),
  dispensation_token VARCHAR(32),
  dispensed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Indexing for instantaneous lookup by Receipt ID, ABHA ID, Appointment, RIS, LIS, and PIS
CREATE INDEX IF NOT EXISTS idx_patients_receipt ON patients(receipt_id);
CREATE INDEX IF NOT EXISTS idx_patients_abha ON patients(abha_id);
CREATE INDEX IF NOT EXISTS idx_doctors_reg ON doctors(reg_no);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dept_status ON appointments(department, status);
CREATE INDEX IF NOT EXISTS idx_radiology_patient ON radiology_studies(patient_id);
CREATE INDEX IF NOT EXISTS idx_radiology_receipt ON radiology_studies(receipt_id);
CREATE INDEX IF NOT EXISTS idx_radiology_accession ON radiology_studies(accession_no);
CREATE INDEX IF NOT EXISTS idx_ris_requests_status ON ris_requests(status);
CREATE INDEX IF NOT EXISTS idx_ris_requests_abha ON ris_requests(abha_id);
CREATE INDEX IF NOT EXISTS idx_ris_requests_patient ON ris_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_past_meds_patient ON past_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_past_records_patient ON past_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_lis_requests_status ON lis_requests(status);
CREATE INDEX IF NOT EXISTS idx_lis_requests_abha ON lis_requests(abha_id);
CREATE INDEX IF NOT EXISTS idx_lis_requests_patient ON lis_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_pis_prescriptions_status ON pis_prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_pis_prescriptions_abha ON pis_prescriptions(abha_id);
CREATE INDEX IF NOT EXISTS idx_pis_prescriptions_patient ON pis_prescriptions(patient_id);



