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

-- Indexing for instantaneous lookup by Receipt ID, ABHA ID, and Appointment Status
CREATE INDEX IF NOT EXISTS idx_patients_receipt ON patients(receipt_id);
CREATE INDEX IF NOT EXISTS idx_patients_abha ON patients(abha_id);
CREATE INDEX IF NOT EXISTS idx_doctors_reg ON doctors(reg_no);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dept_status ON appointments(department, status);
