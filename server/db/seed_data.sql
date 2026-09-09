-- ============================================================================
-- TAMIL NADU HEALTH CARE & PAN-INDIA MEDICAL CENTRE
-- SEED DATA SQL FILE (seed_data.sql)
-- Ready to feed into SQL database on user command
-- ============================================================================

-- CLEAR EXISTING RECORDS BEFORE SEEDING (Optional / Idempotent)
DELETE FROM opd_queue;
DELETE FROM billings;
DELETE FROM lab_reports;
DELETE FROM prescriptions;
DELETE FROM clinical_summaries;
DELETE FROM patient_vitals;
DELETE FROM patients;
DELETE FROM doctors;

-- 1. SEED DOCTORS
INSERT INTO doctors (id, name, reg_no, qualification, department, hospital, phone, status, password_hash) VALUES
('DOC-01', 'Dr. S. K. Aravind, MD, DM', 'TMC-48291', 'MD (Gen Med), DM (Cardiology), FACC', 'Cardiology', 'Government Multi Super Speciality Hospital, Omandurar, Chennai', '+91 94440 12345', 'Available', 'doctor123'),
('DOC-02', 'Dr. Radhika Sundaram, MS, MCh', 'TMC-39182', 'MS (Gen Surg), MCh (Neuro Surgery)', 'Neurology', 'Government Rajaji Hospital & Medical College, Madurai', '+91 94440 67890', 'Available', 'doctor123'),
('DOC-03', 'Dr. K. Balaji, MD, DNB', 'TMC-51024', 'MD (Pediatrics), DNB (Neonatology)', 'Pediatrics', 'Institute of Child Health & Hospital for Children, Egmore, Chennai', '+91 94440 11223', 'In Consultation', 'doctor123'),
('DOC-04', 'Dr. M. Sangeetha, MD, DM', 'TMC-42901', 'MD (Medicine), DM (Nephrology)', 'Nephrology', 'Coimbatore Medical College Hospital, Coimbatore', '+91 94440 33445', 'Available', 'doctor123');

-- 2. SEED PATIENTS
INSERT INTO patients (id, receipt_id, abha_id, abha_address, name, age, gender, blood_group, phone, dob, guardian_name, emergency_phone, email, district, pincode, pin, address, center_name, admission_date, discharge_date, status, department, consulting_doctor, doctor_reg_no, follow_up) VALUES
('P-1001', 'TN-REC-8841', '14-9923-4512-7801', 'karthik.s@abdm', 'Karthikeyan Subramanian', 48, 'Male', 'O +ve', '+91 98401 23456', '12-May-1978', 'Subramanian V', '+91 94440 98765', 'karthik.sub@tnhealth.gov.in', 'Chennai', '600018', '1234', 'No. 42, Anna Salai, Teynampet, Chennai, Tamil Nadu - 600018', 'Government Multi Super Speciality Hospital, Omandurar Estate, Chennai', '05-Sep-2026', '08-Sep-2026', 'Discharged - Stable', 'Cardiology', 'Dr. S. K. Aravind, MD, DM (Cardiology)', 'TMC-48291', '18-Sep-2026 at Cardiology OPD, Room 104'),
('P-1002', 'TN-REC-9012', '14-8821-3342-9901', 'priya.ram@abdm', 'Priya Ramanathan', 34, 'Female', 'B +ve', '+91 98402 34567', '24-Aug-1992', 'Ramanathan K', '+91 94441 22334', 'priya.ram@tnhealth.gov.in', 'Madurai', '625020', '1234', 'Plot 18, 4th Cross Street, Gandhinagar, Madurai, Tamil Nadu - 625020', 'Government Rajaji Hospital, Pan-India Tertiary Wing, Madurai', '02-Sep-2026', '06-Sep-2026', 'Discharged - Recovered', 'Endocrinology', 'Dr. Radhika Sundaram, MS, MCh', 'TMC-39182', '24-Sep-2026 at Madurai Endocrinology OPD'),
('P-1003', 'TN-REC-7734', '14-7712-4491-0023', 'selvaraj.m@abdm', 'Selvaraj Murugesan', 62, 'Male', 'A +ve', '+91 98403 45678', '10-Feb-1964', 'Murugesan P', '+91 94442 33445', 'selvaraj.m@tnhealth.gov.in', 'Tiruchirappalli', '620018', '1234', 'Door 7/12, Trichy Main Road, Thillai Nagar, Tiruchirappalli - 620018', 'K.A.P. Viswanatham Government Medical College Hospital, Tiruchirappalli', '06-Sep-2026', 'In-Patient', 'Under Active Treatment', 'Nephrology', 'Dr. M. Sangeetha, MD, DM', 'TMC-42901', 'Daily Ward Rounds at Dialysis Wing Room 202'),
('P-1004', 'TN-REC-6521', '14-6634-1189-5512', 'ananya.k@abdm', 'Ananya Krishnan', 29, 'Female', 'AB +ve', '+91 98404 56789', '18-Nov-1997', 'Krishnan S', '+91 94443 44556', 'ananya.k@tnhealth.gov.in', 'Coimbatore', '641012', '1234', 'No. 15, Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012', 'Coimbatore Medical College Hospital & Trauma Centre, Coimbatore', '07-Sep-2026', '08-Sep-2026', 'Out-Patient Verified', 'Cardiology', 'Dr. S. K. Aravind, MD, DM (Cardiology)', 'TMC-48291', '22-Sep-2026 at Preventive Cardiology OPD');

-- 3. SEED PATIENT VITALS
INSERT INTO patient_vitals (patient_id, bp, pulse, spo2, temp, weight, height, bmi, blood_sugar_fasting) VALUES
('P-1001', '128/84 mmHg', '74 bpm', '99%', '98.4 °F', '72 kg', '172 cm', '24.3', '108 mg/dL'),
('P-1002', '118/76 mmHg', '72 bpm', '98%', '98.6 °F', '58 kg', '162 cm', '22.1', '92 mg/dL'),
('P-1003', '144/92 mmHg', '82 bpm', '96%', '98.2 °F', '68 kg', '168 cm', '24.1', '134 mg/dL'),
('P-1004', '114/72 mmHg', '70 bpm', '99%', '98.5 °F', '54 kg', '160 cm', '21.1', '88 mg/dL');

-- 4. SEED CLINICAL SUMMARIES
INSERT INTO clinical_summaries (patient_id, chief_complaints, diagnosis, clinical_notes, allergies) VALUES
('P-1001', 'Exertional dyspnea and mild retrosternal chest discomfort for 4 days.', 'Ischemic Heart Disease (Mild CAD) - Stabilized, Essential Hypertension (Stage 1)', 'Patient presented with atypical chest pain on exertion. Troponin T negative. 2D Echo showed normal LV systolic function (LVEF 58%). Coronary angiography showed single vessel 40% stenosis in mid-LAD, managed medically. Hemodynamically stable upon discharge.', 'No known drug allergies (NKDA)'),
('P-1002', 'Fatigue, mild heat intolerance, and intermittent palpitations for 3 weeks.', 'Hashimotos Thyroiditis with Subclinical Hypothyroidism, Mild Iron Deficiency Anemia', 'Evaluated for thyroid enlargement. Ultrasound neck showed diffuse thyroiditis without solitary nodules. Commenced on low-dose Levothyroxine. Energy levels improved.', 'Penicillin (mild cutaneous rash)'),
('P-1003', 'Bilateral lower limb swelling, elevated serum creatinine, and reduced urine output.', 'Chronic Kidney Disease Stage 3b secondary to Diabetic Nephropathy', 'Known diabetic for 14 years. Baseline creatinine 2.4 mg/dL with moderate proteinuria. Fluid intake restricted to 1.5L/day. Renal protective therapy commenced with SGLT2i and ARB.', 'Sulfa-based medications'),
('P-1004', 'Routine pre-employment screening and intermittent non-cardiac chest wall sensitivity.', 'Atypical Non-Anginal Chest Pain, Sinus Bradycardia (Physiological)', '12-lead ECG confirmed normal sinus bradycardia with normal axis. Echocardiogram completely normal. Reassured and advised regular aerobic exercise.', 'None Reported');

-- 5. SEED PRESCRIPTIONS
INSERT INTO prescriptions (patient_id, medicine, dosage, frequency, timing, duration, instructions) VALUES
('P-1001', 'Tab. Ecosprin (Aspirin)', '75 mg', '1 - 0 - 0', 'After Breakfast', '30 Days', 'Continue daily, do not skip'),
('P-1001', 'Tab. Atorva (Atorvastatin)', '20 mg', '0 - 0 - 1', 'After Dinner', '30 Days', 'Night time, lipid control'),
('P-1001', 'Tab. Telma (Telmisartan)', '40 mg', '1 - 0 - 0', 'Morning', '30 Days', 'For BP control'),
('P-1001', 'Tab. Pan-D (Pantoprazole + Domperidone)', '40 mg', '1 - 0 - 0', 'Before Breakfast', '10 Days', 'Empty stomach'),
('P-1002', 'Tab. Thyronorm (Levothyroxine)', '50 mcg', '1 - 0 - 0', 'Early Morning', '60 Days', 'Take 30 mins before tea/breakfast'),
('P-1002', 'Tab. Autrin (Iron + Folic Acid)', '1 Tab', '0 - 1 - 0', 'After Lunch', '30 Days', 'Avoid taking with milk or tea'),
('P-1002', 'Tab. Shelcal (Calcium + Vit D3)', '500 mg', '0 - 0 - 1', 'After Dinner', '30 Days', 'Bone mineral supplement'),
('P-1003', 'Tab. Forxiga (Dapagliflozin)', '10 mg', '1 - 0 - 0', 'Morning', '30 Days', 'Renal and glucose control'),
('P-1003', 'Tab. Cilacar (Cilnidipine)', '10 mg', '1 - 0 - 0', 'Morning', '30 Days', 'Renal vasodilatory antihypertensive'),
('P-1003', 'Tab. Torsemide', '10 mg', '1 - 0 - 0', 'Morning', '15 Days', 'Diuretic for pedal edema'),
('P-1004', 'Tab. Neurobion Forte (B-Complex)', '1 Tab', '0 - 1 - 0', 'After Lunch', '30 Days', 'Nutritional nerve supplement');

-- 6. SEED DIAGNOSTIC LAB REPORTS
INSERT INTO lab_reports (patient_id, test_name, test_date, observed_value, normal_range, status) VALUES
('P-1001', 'Complete Blood Count (CBC)', '05-Sep-2026', 'Hb: 14.2 g/dL, WBC: 7,800 /mcL, Platelets: 2.4 Lakhs', 'Hb: 13-17 g/dL', 'Normal'),
('P-1001', 'Lipid Profile', '05-Sep-2026', 'Total Chol: 210 mg/dL, LDL: 132 mg/dL, HDL: 44 mg/dL, Triglycerides: 170 mg/dL', 'LDL < 100 mg/dL', 'Borderline High'),
('P-1001', 'Cardiac Troponin I', '05-Sep-2026', '0.01 ng/mL (Negative)', '< 0.04 ng/mL', 'Normal'),
('P-1001', '12-Lead ECG', '06-Sep-2026', 'Normal sinus rhythm, non-specific T-wave flattening in V4-V6', 'Normal Sinus', 'Stable'),
('P-1001', '2D Echocardiography', '06-Sep-2026', 'LVEF 58%, No regional wall motion abnormalities, Grade 1 diastolic dysfunction', 'LVEF > 55%', 'Mild Abnormality'),
('P-1002', 'Thyroid Stimulating Hormone (TSH)', '02-Sep-2026', '6.84 mIU/L (Elevated)', '0.4 - 4.2 mIU/L', 'High'),
('P-1002', 'Free T4 (Thyroxine)', '02-Sep-2026', '1.02 ng/dL', '0.8 - 1.8 ng/dL', 'Normal'),
('P-1002', 'Serum Ferritin', '02-Sep-2026', '14.2 ng/mL', '15 - 150 ng/mL', 'Low'),
('P-1003', 'Serum Creatinine', '06-Sep-2026', '2.42 mg/dL', '0.7 - 1.3 mg/dL', 'High'),
('P-1003', 'Blood Urea Nitrogen (BUN)', '06-Sep-2026', '48 mg/dL', '7 - 20 mg/dL', 'High'),
('P-1003', 'Estimated GFR (eGFR)', '06-Sep-2026', '34 mL/min/1.73m²', '> 90 mL/min', 'Reduced (Stage 3b)'),
('P-1004', '12-Lead ECG Screening', '07-Sep-2026', 'Normal Sinus Rhythm, HR 58 bpm', 'Normal Sinus', 'Normal');

-- 7. SEED CMCHIS BILLINGS
INSERT INTO billings (patient_id, total_amount, insurance_scheme, scheme_approved, patient_payable, payment_status) VALUES
('P-1001', '₹ 14,850', 'Chief Minister''s Comprehensive Health Insurance Scheme (CMCHIS) / Ayushman Bharat (AB-PMJAY)', '₹ 14,850', '₹ 0.00 (Fully Covered)', 'Settled via Gov Scheme'),
('P-1002', '₹ 6,200', 'Chief Minister''s Comprehensive Health Insurance Scheme (CMCHIS)', '₹ 6,200', '₹ 0.00 (Fully Covered)', 'Settled via Gov Scheme'),
('P-1003', '₹ 28,400', 'CMCHIS Dialysis & Chronic Renal Care Sub-Scheme', '₹ 28,400', '₹ 0.00 (Fully Covered)', 'Approved by CMCHIS Cell'),
('P-1004', '₹ 2,100', 'Ayushman Bharat Digital Mission (ABDM) Outpatient OPD Cell', '₹ 2,100', '₹ 0.00 (Free OPD)', 'Free Government OPD');

-- 8. SEED OPD QUEUE
INSERT INTO opd_queue (token_no, patient_id, doctor_id, queue_status, priority, scheduled_time) VALUES
(1, 'P-1001', 'DOC-01', 'In Consultation', 'Normal', '09:30 AM'),
(2, 'P-1002', 'DOC-01', 'Waiting', 'Follow-up', '10:00 AM'),
(3, 'P-1003', 'DOC-01', 'Waiting', 'High Priority', '10:30 AM'),
(4, 'P-1004', 'DOC-01', 'Waiting', 'Normal', '11:00 AM');
