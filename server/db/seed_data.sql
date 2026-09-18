-- ============================================================================
-- TAMIL NADU HEALTH CARE & PAN-INDIA MEDICAL CENTRE
-- SEED DATA SQL FILE (seed_data.sql)
-- Multi-Specialty Clinical Database (Cardiology, Neurology, Pediatrics, Nephrology)
-- ============================================================================

-- CLEAR EXISTING RECORDS BEFORE SEEDING (Idempotent)
DELETE FROM past_medications;
DELETE FROM past_records;
DELETE FROM ris_requests;
DELETE FROM ris_ward_machines;
DELETE FROM ris_ward_workers;
DELETE FROM radiology_studies;
DELETE FROM appointments;
DELETE FROM opd_queue;
DELETE FROM billings;
DELETE FROM lab_reports;
DELETE FROM prescriptions;
DELETE FROM clinical_summaries;
DELETE FROM patient_vitals;
DELETE FROM patients;
DELETE FROM doctors;

-- 1. SEED SPECIALIST DOCTORS
INSERT INTO doctors (id, name, reg_no, qualification, department, hospital, phone, status, password_hash) VALUES
('DOC-01', 'Dr. S. K. Aravind, MD, DM', 'TMC-48291', 'MD (Gen Med), DM (Cardiology), FACC', 'Cardiology', 'Government Multi Super Speciality Hospital, Omandurar, Chennai', '+91 94440 12345', 'Available', 'doctor123'),
('DOC-02', 'Dr. Radhika Sundaram, MS, MCh', 'TMC-39182', 'MS (Gen Surg), MCh (Neuro Surgery)', 'Neurology', 'Government Rajaji Hospital & Medical College, Madurai', '+91 94440 67890', 'Available', 'doctor123'),
('DOC-03', 'Dr. K. Balaji, MD, DNB', 'TMC-51024', 'MD (Pediatrics), DNB (Neonatology)', 'Pediatrics', 'Institute of Child Health & Hospital for Children, Egmore, Chennai', '+91 94440 11223', 'In Consultation', 'doctor123'),
('DOC-04', 'Dr. M. Sangeetha, MD, DM', 'TMC-42901', 'MD (Medicine), DM (Nephrology)', 'Nephrology', 'Coimbatore Medical College Hospital, Coimbatore', '+91 94440 33445', 'Available', 'doctor123');

-- 2. SEED MULTI-SPECIALTY PATIENTS
INSERT INTO patients (id, receipt_id, abha_id, abha_address, name, age, gender, blood_group, phone, dob, guardian_name, emergency_phone, email, district, pincode, pin, address, center_name, admission_date, discharge_date, status, department, consulting_doctor, doctor_reg_no, follow_up) VALUES
-- CARDIOLOGY PATIENTS
('P-1001', 'TN-REC-8841', '14-9923-4512-7801', 'karthik.s@abdm', 'Karthikeyan Subramanian', 48, 'Male', 'O +ve', '+91 98401 23456', '12-May-1978', 'Subramanian V', '+91 94440 98765', 'karthik.sub@tnhealth.gov.in', 'Chennai', '600018', '1234', 'No. 42, Anna Salai, Teynampet, Chennai, Tamil Nadu - 600018', 'Government Multi Super Speciality Hospital, Omandurar Estate, Chennai', '05-Sep-2026', '08-Sep-2026', 'Discharged - Stable', 'Cardiology', 'Dr. S. K. Aravind, MD, DM (Cardiology)', 'TMC-48291', '18-Sep-2026 at Cardiology OPD, Room 104'),
('P-1004', 'TN-REC-6521', '14-6634-1189-5512', 'ananya.k@abdm', 'Ananya Krishnan', 29, 'Female', 'AB +ve', '+91 98404 56789', '18-Nov-1997', 'Krishnan S', '+91 94443 44556', 'ananya.k@tnhealth.gov.in', 'Coimbatore', '641012', '1234', 'No. 15, Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012', 'Coimbatore Medical College Hospital & Trauma Centre, Coimbatore', '07-Sep-2026', '08-Sep-2026', 'Out-Patient Verified', 'Cardiology', 'Dr. S. K. Aravind, MD, DM (Cardiology)', 'TMC-48291', '22-Sep-2026 at Preventive Cardiology OPD'),

-- NEUROLOGY PATIENTS
('P-1002', 'TN-REC-9012', '14-8821-3342-9901', 'priya.ram@abdm', 'Priya Ramanathan', 34, 'Female', 'B +ve', '+91 98402 34567', '24-Aug-1992', 'Ramanathan K', '+91 94441 22334', 'priya.ram@tnhealth.gov.in', 'Madurai', '625020', '1234', 'Plot 18, 4th Cross Street, Gandhinagar, Madurai, Tamil Nadu - 625020', 'Government Rajaji Hospital, Pan-India Tertiary Wing, Madurai', '02-Sep-2026', '06-Sep-2026', 'Discharged - Recovered', 'Neurology', 'Dr. Radhika Sundaram, MS, MCh', 'TMC-39182', '24-Sep-2026 at Madurai Neurology OPD'),
('P-1005', 'TN-REC-4892', '14-1188-4422-9911', 'vignesh.n@abdm', 'Vigneshwaran Natarajan', 42, 'Male', 'O +ve', '+91 98405 67890', '14-Mar-1984', 'Natarajan M', '+91 94444 55667', 'vignesh.n@tnhealth.gov.in', 'Madurai', '625001', '1234', 'Door 5, West Veli Street, Madurai - 625001', 'Government Rajaji Hospital, Neurology Wing, Madurai', '08-Sep-2026', 'In-Patient', 'Under Active Treatment', 'Neurology', 'Dr. Radhika Sundaram, MS, MCh', 'TMC-39182', '26-Sep-2026 at Neuro Rehab Clinic'),

-- PEDIATRICS PATIENTS
('P-1006', 'TN-REC-3310', '14-2233-4455-6677', 'tharun.b@abdm', 'Tharun Balasubramanian', 6, 'Male', 'A +ve', '+91 98406 78901', '10-Oct-2020', 'Balasubramanian R', '+91 94445 66778', 'bala.sub@tnhealth.gov.in', 'Chennai', '600008', '1234', 'No. 8, Halls Road, Egmore, Chennai - 600008', 'Institute of Child Health & Hospital for Children, Egmore, Chennai', '09-Sep-2026', 'Active OPD', 'Recovering Well', 'Pediatrics', 'Dr. K. Balaji, MD, DNB', 'TMC-51024', '19-Sep-2026 at Pediatrics OPD Room 12'),
('P-1007', 'TN-REC-5520', '14-3344-5566-7788', 'varsha.r@abdm', 'Varsha Rangarajan', 2, 'Female', 'B +ve', '+91 98407 89012', '15-Dec-2024', 'Rangarajan P', '+91 94446 77889', 'ranga.p@tnhealth.gov.in', 'Chennai', '600008', '1234', 'Plot 22, Gandhi Irwin Road, Egmore, Chennai - 600008', 'Institute of Child Health & Hospital for Children, Egmore, Chennai', '10-Sep-2026', 'Active OPD', 'Follow-up Scheduled', 'Pediatrics', 'Dr. K. Balaji, MD, DNB', 'TMC-51024', '20-Sep-2026 at Child Immunization Cell'),

-- NEPHROLOGY PATIENTS
('P-1003', 'TN-REC-7734', '14-7712-4491-0023', 'selvaraj.m@abdm', 'Selvaraj Murugesan', 62, 'Male', 'A +ve', '+91 98403 45678', '10-Feb-1964', 'Murugesan P', '+91 94442 33445', 'selvaraj.m@tnhealth.gov.in', 'Tiruchirappalli', '620018', '1234', 'Door 7/12, Trichy Main Road, Thillai Nagar, Tiruchirappalli - 620018', 'K.A.P. Viswanatham Government Medical College Hospital, Tiruchirappalli', '06-Sep-2026', 'In-Patient', 'Under Active Treatment', 'Nephrology', 'Dr. M. Sangeetha, MD, DM', 'TMC-42901', 'Daily Ward Rounds at Dialysis Wing Room 202'),
('P-1008', 'TN-REC-8822', '14-4455-6677-8899', 'ganesan.s@abdm', 'Ganesan Swaminathan', 55, 'Male', 'O +ve', '+91 98408 90123', '20-Jul-1971', 'Swaminathan K', '+91 94447 88990', 'ganesan.s@tnhealth.gov.in', 'Coimbatore', '641018', '1234', 'Door 18, Race Course Road, Coimbatore - 641018', 'Coimbatore Medical College Hospital, Nephrology Centre', '08-Sep-2026', 'Active OPD', 'Under Renal Conservative Care', 'Nephrology', 'Dr. M. Sangeetha, MD, DM', 'TMC-42901', '25-Sep-2026 at Nephrology Clinic');

-- 3. SEED PATIENT VITALS
INSERT INTO patient_vitals (patient_id, bp, pulse, spo2, temp, weight, height, bmi, blood_sugar_fasting) VALUES
('P-1001', '128/84 mmHg', '74 bpm', '99%', '98.4 °F', '72 kg', '172 cm', '24.3', '108 mg/dL'),
('P-1004', '114/72 mmHg', '70 bpm', '99%', '98.5 °F', '54 kg', '160 cm', '21.1', '88 mg/dL'),
('P-1002', '118/76 mmHg', '72 bpm', '98%', '98.6 °F', '58 kg', '162 cm', '22.1', '92 mg/dL'),
('P-1005', '132/86 mmHg', '78 bpm', '98%', '98.4 °F', '66 kg', '166 cm', '24.0', '104 mg/dL'),
('P-1006', '100/65 mmHg', '92 bpm', '99%', '98.6 °F', '21 kg', '115 cm', '15.9', '84 mg/dL'),
('P-1007', '95/60 mmHg', '104 bpm', '99%', '99.1 °F', '12 kg', '86 cm', '16.2', '80 mg/dL'),
('P-1003', '144/92 mmHg', '82 bpm', '96%', '98.2 °F', '68 kg', '168 cm', '24.1', '134 mg/dL'),
('P-1008', '138/88 mmHg', '76 bpm', '97%', '98.4 °F', '74 kg', '170 cm', '25.6', '118 mg/dL');

-- 4. SEED CLINICAL SUMMARIES
INSERT INTO clinical_summaries (patient_id, chief_complaints, diagnosis, clinical_notes, allergies) VALUES
('P-1001', 'Exertional dyspnea and mild retrosternal chest discomfort for 4 days.', 'Ischemic Heart Disease (Mild CAD) - Stabilized, Essential Hypertension (Stage 1)', 'Patient presented with atypical chest pain on exertion. Troponin T negative. 2D Echo showed normal LV systolic function (LVEF 58%). Coronary angiography showed single vessel 40% stenosis in mid-LAD, managed medically. Hemodynamically stable upon discharge.', 'No known drug allergies (NKDA)'),
('P-1004', 'Routine pre-employment screening and intermittent non-cardiac chest wall sensitivity.', 'Atypical Non-Anginal Chest Pain, Sinus Bradycardia (Physiological)', '12-lead ECG confirmed normal sinus bradycardia with normal axis. Echocardiogram completely normal. Reassured and advised regular aerobic exercise.', 'None Reported'),
('P-1002', 'Severe pulsating hemicranial headache, photophobia, and visual scintillating scotoma for 3 days.', 'Migraine with Aura (ICD-10 G43.109), Occipital Neuralgia', 'Patient reports recurring throbbing headaches triggered by fatigue and screen exposure. Neurological cranial nerve examination intact. Fundoscopy normal. Started on Triptan abortive therapy and prophylactic Flunarizine.', 'Penicillin (mild cutaneous rash)'),
('P-1005', 'Left-sided upper extremity weakness and intermittent distal sensory numbness post-stroke.', 'Subacute Ischemic Stroke (Right MCA Territory) - In Neuro-Rehabilitation Phase', 'CT Brain showed stabilized subacute infarct without hemorrhagic conversion. Power 4/5 in left upper limb. Under active physiotherapy and antiplatelet secondary stroke prevention.', 'None Reported'),
('P-1006', 'Recurrent dry nocturnal cough and seasonal breathlessness for 10 days.', 'Acute Pediatric Bronchiolitis, Mild Childhood Wheeze (Hyperreactive Airway)', 'Bilateral clear air entry with mild end-expiratory rhonchi. SpO2 99% on room air. Peak flow adequate. Prescribed low-dose nebulized Budesonide and Levocetirizine.', 'None Reported'),
('P-1007', 'High fever for 3 days followed by erythematous macular skin rash on trunk.', 'Roseola Infantum (Viral Exanthem) - Defervescent Stage', 'Fever resolved following 72-hour peak. Active, feeding normally. Hydration maintained. Reassured parents; routine booster vaccinations scheduled.', 'None Reported'),
('P-1003', 'Bilateral lower limb swelling, elevated serum creatinine, and reduced urine output.', 'Chronic Kidney Disease Stage 3b secondary to Diabetic Nephropathy', 'Known diabetic for 14 years. Baseline creatinine 2.4 mg/dL with moderate proteinuria. Fluid intake restricted to 1.5L/day. Renal protective therapy commenced with SGLT2i and ARB.', 'Sulfa-based medications'),
('P-1008', 'Periorbital morning puffiness, tea-colored urine, and borderline hypertension.', 'Chronic Glomerulonephritis with Moderate Proteinuria (eGFR 48 mL/min)', '24-hour urinary protein 1.2g. Renal ultrasonography showed bilateral normal sized kidneys with grade 1 cortical echogenicity. Salt restriction and ACE-i renoprotection active.', 'None Reported');

-- 5. SEED PRESCRIPTIONS
INSERT INTO prescriptions (patient_id, medicine, dosage, frequency, timing, duration, instructions) VALUES
('P-1001', 'Tab. Ecosprin (Aspirin)', '75 mg', '1 - 0 - 0', 'After Breakfast', '30 Days', 'Continue daily, do not skip'),
('P-1001', 'Tab. Atorva (Atorvastatin)', '20 mg', '0 - 0 - 1', 'After Dinner', '30 Days', 'Night time, lipid control'),
('P-1001', 'Tab. Telma (Telmisartan)', '40 mg', '1 - 0 - 0', 'Morning', '30 Days', 'For BP control'),
('P-1004', 'Tab. Neurobion Forte (B-Complex)', '1 Tab', '0 - 1 - 0', 'After Lunch', '30 Days', 'Nutritional nerve supplement'),
('P-1002', 'Tab. Suminat (Sumatriptan)', '50 mg', 'SOS', 'At onset of headache', '6 Doses', 'Take immediately at migraine aura onset'),
('P-1002', 'Tab. Flunarin (Flunarizine)', '10 mg', '0 - 0 - 1', 'Night', '30 Days', 'Migraine prophylaxis'),
('P-1005', 'Tab. Clopidogrel', '75 mg', '1 - 0 - 0', 'Morning', '30 Days', 'Secondary stroke prevention'),
('P-1005', 'Tab. Citicoline', '500 mg', '1 - 0 - 1', 'After Food', '30 Days', 'Neuro-recovery support'),
('P-1006', 'Respules Budecort (Budesonide)', '0.5 mg', '1 - 0 - 1', 'Nebulization', '5 Days', 'Use with compressor nebulizer'),
('P-1006', 'Syrup Montair-LC (Montelukast + Levocetirizine)', '5 mL', '0 - 0 - 1', 'Night', '14 Days', 'Airway anti-allergic coverage'),
('P-1007', 'Syrup Paracetamol (Calpol)', '250 mg / 5 mL', 'SOS', 'Every 6 hours if Temp > 99.5F', '3 Days', 'Antipyretic suspension'),
('P-1003', 'Tab. Forxiga (Dapagliflozin)', '10 mg', '1 - 0 - 0', 'Morning', '30 Days', 'Renal and glucose control'),
('P-1003', 'Tab. Cilacar (Cilnidipine)', '10 mg', '1 - 0 - 0', 'Morning', '30 Days', 'Renal vasodilatory antihypertensive'),
('P-1003', 'Tab. Torsemide', '10 mg', '1 - 0 - 0', 'Morning', '15 Days', 'Diuretic for pedal edema'),
('P-1008', 'Tab. Ramipril', '2.5 mg', '1 - 0 - 0', 'Morning', '30 Days', 'Renoprotective antiproteinuric');

-- 6. SEED DIAGNOSTIC LAB REPORTS
INSERT INTO lab_reports (patient_id, test_name, test_date, observed_value, normal_range, status) VALUES
('P-1001', 'Complete Blood Count (CBC)', '05-Sep-2026', 'Hb: 14.2 g/dL, WBC: 7,800 /mcL, Platelets: 2.4 Lakhs', 'Hb: 13-17 g/dL', 'Normal'),
('P-1001', 'Cardiac Troponin I', '05-Sep-2026', '0.01 ng/mL (Negative)', '< 0.04 ng/mL', 'Normal'),
('P-1001', '12-Lead ECG', '06-Sep-2026', 'Normal sinus rhythm, non-specific T-wave flattening in V4-V6', 'Normal Sinus', 'Stable'),
('P-1004', '12-Lead ECG Screening', '07-Sep-2026', 'Normal Sinus Rhythm, HR 58 bpm', 'Normal Sinus', 'Normal'),
('P-1002', 'MRI Brain (Plain + Contrast)', '03-Sep-2026', 'No acute intracranial hemorrhage or territorial infarct. Normal ventricles.', 'Normal Brain MRI', 'Normal'),
('P-1002', 'Digital EEG Study', '03-Sep-2026', 'Normal background posterior alpha rhythm, no epileptiform discharges', 'Normal Alpha', 'Normal'),
('P-1005', 'CT Angiography Neck & Brain', '08-Sep-2026', 'Right MCA M2 segment patent with distal flow; no aneurysm', 'Normal Vascular', 'Stable'),
('P-1006', 'Pediatric Chest X-Ray (AP View)', '09-Sep-2026', 'Bilateral lung fields clear, no focal consolidation or effusion', 'Clear Lungs', 'Normal'),
('P-1007', 'Serum C-Reactive Protein (CRP)', '10-Sep-2026', '3.4 mg/L (Normal)', '< 5.0 mg/L', 'Normal'),
('P-1003', 'Serum Creatinine', '06-Sep-2026', '2.42 mg/dL', '0.7 - 1.3 mg/dL', 'High'),
('P-1003', 'Estimated GFR (eGFR)', '06-Sep-2026', '34 mL/min/1.73m²', '> 90 mL/min', 'Reduced (Stage 3b)'),
('P-1008', '24-Hour Urine Total Protein', '08-Sep-2026', '1.20 g / 24 hrs', '< 0.15 g / 24 hrs', 'Elevated (Proteinuria)');

-- 7. SEED CMCHIS BILLINGS
INSERT INTO billings (patient_id, total_amount, insurance_scheme, scheme_approved, patient_payable, payment_status) VALUES
('P-1001', '₹ 14,850', 'Chief Minister''s Comprehensive Health Insurance Scheme (CMCHIS) / Ayushman Bharat (AB-PMJAY)', '₹ 14,850', '₹ 0.00 (Fully Covered)', 'Settled via Gov Scheme'),
('P-1004', '₹ 2,100', 'Ayushman Bharat Digital Mission (ABDM) Outpatient OPD Cell', '₹ 2,100', '₹ 0.00 (Free OPD)', 'Free Government OPD'),
('P-1002', '₹ 8,400', 'CMCHIS Neuro-Diagnostics Free Scheme', '₹ 8,400', '₹ 0.00 (Fully Covered)', 'Settled via Gov Scheme'),
('P-1005', '₹ 24,000', 'CMCHIS Acute Stroke Management Protocol', '₹ 24,000', '₹ 0.00 (Fully Covered)', 'Approved by CMCHIS Cell'),
('P-1006', '₹ 1,800', 'State Free Pediatric Care Scheme', '₹ 1,800', '₹ 0.00 (Free OPD)', 'Free Government OPD'),
('P-1007', '₹ 950', 'National Child Health Programme (RBSK)', '₹ 950', '₹ 0.00 (Free OPD)', 'Free Government OPD'),
('P-1003', '₹ 28,400', 'CMCHIS Dialysis & Chronic Renal Care Sub-Scheme', '₹ 28,400', '₹ 0.00 (Fully Covered)', 'Approved by CMCHIS Cell'),
('P-1008', '₹ 6,500', 'CMCHIS Renal Care Scheme', '₹ 6,500', '₹ 0.00 (Fully Covered)', 'Approved by CMCHIS Cell');

-- 8. SEED APPOINTMENTS & TELECONSULTATIONS (Routed by Specialty Department)
INSERT INTO appointments (id, patient_id, patient_name, receipt_id, abha_id, phone, department, issue_description, requested_date, requested_time, status, doctor_id, doctor_name, doctor_reg_no, confirmed_time, room_id) VALUES
-- Cardiology Appointments
('APT-1001', 'P-1001', 'Kavitha Ranganathan', 'TN-REC-9102', '14-9923-4512-7801', '+91 98401 23456', 'Cardiology', 'Exertional chest tightness, palpitations, and hypertension follow-up review', 'Today, 13-Sep-2026', '10:30 AM', 'Pending', NULL, NULL, NULL, NULL, NULL),
('APT-1002', 'P-1001', 'Murugan Thangavel', 'TN-REC-5519', '14-8821-3342-9901', '+91 94440 98765', 'Cardiology', 'Post-PTCA stent cardiac follow-up review and blood thinner prescription check', 'Today, 13-Sep-2026', '02:30 PM', 'Confirmed', 'DOC-01', 'Dr. S. K. Aravind, MD, DM', 'TMC-48291', '13-Sep-2026 at 02:30 PM', 'ROOM_APT1002'),

-- Neurology Appointments
('APT-2001', 'P-1002', 'Senthil Velan', 'TN-REC-3381', '14-3329-8811-9042', '+91 97890 54321', 'Neurology', 'Severe throbbing unilateral headache with photophobia, nausea and aura episodes', 'Today, 13-Sep-2026', '11:30 AM', 'Pending', NULL, NULL, NULL, NULL, NULL),
('APT-2002', 'P-1002', 'Meena Kumari', 'TN-REC-4819', '14-1122-3344-5566', '+91 98410 99887', 'Neurology', 'Peripheral neuropathy, burning sensation in soles and tingling numbness in fingers', 'Tomorrow, 14-Sep-2026', '03:00 PM', 'Confirmed', 'DOC-02', 'Dr. Radhika Sundaram, MS, MCh', 'TMC-39182', '14-Sep-2026 at 03:00 PM', 'ROOM_APT2002'),

-- Pediatrics Appointments
('APT-3001', 'P-1006', 'Kavin Anand', 'TN-REC-2104', '14-6655-4433-2211', '+91 99620 44332', 'Pediatrics', 'Child recurrent nocturnal dry cough, allergic sneezing, and appetite checkup', 'Today, 13-Sep-2026', '10:00 AM', 'Pending', NULL, NULL, NULL, NULL, NULL),
('APT-3002', 'P-1006', 'Nivedha Sundaram', 'TN-REC-8921', '14-5544-3322-1100', '+91 94441 55667', 'Pediatrics', 'Infant fever with irritability and routine 18-month vaccination milestone check', 'Tomorrow, 14-Sep-2026', '11:00 AM', 'Confirmed', 'DOC-03', 'Dr. K. Balaji, MD, DNB', 'TMC-51024', '14-Sep-2026 at 11:00 AM', 'ROOM_APT3002'),

-- Nephrology Appointments
('APT-4001', 'P-1003', 'Dhanalakshmi K', 'TN-REC-6218', '14-7712-4491-0023', '+91 94442 33445', 'Nephrology', 'Bilateral lower limb swelling, elevated serum creatinine, and reduced urine output', 'Today, 13-Sep-2026', '01:30 PM', 'Pending', NULL, NULL, NULL, NULL, NULL),
('APT-4002', 'P-1003', 'Rajeshwari Narayanan', 'TN-REC-7390', '14-6634-1189-5512', '+91 94443 44556', 'Nephrology', 'Post-dialysis stabilization review, renal diet, and erythropoietin therapy check', 'Tomorrow, 14-Sep-2026', '02:00 PM', 'Confirmed', 'DOC-04', 'Dr. M. Sangeetha, MD, DM', 'TMC-42901', '14-Sep-2026 at 02:00 PM', 'ROOM_APT4002');

-- 9. SEED RIS & PACS RADIOLOGY STUDIES (Multi-Modality Digital DICOM Studies)
INSERT INTO radiology_studies (
  id, patient_id, patient_name, receipt_id, study_title, modality, body_part, study_date, accession_no,
  status, priority, department, referring_doctor, radiologist_name, clinical_indication, technique,
  findings, impression, series_count, slice_count, dicom_window_center, dicom_window_width, scan_type
) VALUES
('RAD-1001', 'P-1001', 'Karthikeyan Subramanian', 'TN-REC-8841', 'Digital Chest Radiograph (PA View)', 'CR', 'Chest', '07-Sep-2026', 'ACC-RAD-8841',
 'Reported & Verified', 'Routine', 'Cardiology', 'Dr. S. K. Aravind, MD, DM', 'Dr. S. Meenakshi, MD, DMRD',
 'Atypical chest discomfort on exertion; evaluate cardiothoracic ratio and pulmonary vascularity.',
 'Single digital erect PA projection acquired at 115 kVp, 3.2 mAs on DR high-frequency detector matrix 3000x3000.',
 'The cardiac silhouette is within normal size limits (Cardiothoracic ratio 0.48). Trachea is central. Both hilar vascular points are normal. No focal air space consolidation, interstitial edema, pleural thickening or pneumothorax identified. Costophrenic sulci and cardiophrenic angles are acute. Visualized thoracic cage and bony rib cage appear intact.',
 '1. No active cardiopulmonary consolidation or acute thoracic pathology. 2. Heart size within normal physiological limits.', 1, 1, 40, 400, 'chest_xray'),

('RAD-1002', 'P-1002', 'Priya Ramanathan', 'TN-REC-9012', '3.0T Brain MRI with Multi-Planar FLAIR & Diffusion', 'MR', 'Brain / Head', '03-Sep-2026', 'ACC-RAD-9012',
 'Reported & Verified', 'Routine', 'Neurology', 'Dr. Radhika Sundaram, MS, MCh', 'Dr. R. Vijayakumar, MD, DNB (Neuro-Radiology)',
 'Recurrent intractable hemicranial pulsating headache with visual scintillating scotoma and photophobia. Rule out intracranial structural lesion.',
 'Multi-planar multi-echo 3.0 Tesla MR imaging of the brain performed with Axial T1WI, T2WI, FLAIR, Sagittal T1, Coronal T2, DWI/ADC, and 3D TOF MR Angiography without IV contrast.',
 'Brain parenchyma shows normal signal characteristics. Preserved grey-white matter differentiation in cerebral hemispheres, cerebellum, and brainstem. No acute restriction on DWI. Ventricular system, basal cisterns, and subarachnoid spaces are symmetric and age-appropriate. No midline shift, hydrocephalus, or intra/extra-axial hemorrhage. Major intracranial flow-voids patent on 3D TOF.',
 '1. Normal 3.0 Tesla Brain MRI study. 2. No evidence of intracranial space occupying lesion, vascular malformation, or acute ischemic stroke.', 4, 16, 40, 80, 'brain_mri'),

('RAD-1005', 'P-1005', 'Vigneshwaran Natarajan', 'TN-REC-4892', '128-Slice CT Brain & Cerebral Angiography', 'CT', 'Brain / Neurovascular', '08-Sep-2026', 'ACC-RAD-4892',
 'Reported & Verified', 'Urgent', 'Neurology', 'Dr. Radhika Sundaram, MS, MCh', 'Dr. R. Vijayakumar, MD, DNB (Neuro-Radiology)',
 'Subacute ischemic stroke (Right MCA territory) post-rehabilitation assessment; check collateral vascularity and exclude hemorrhage.',
 'Non-contrast volumetric CT brain followed by 128-slice helical CT Angiography from aortic arch to cranial vertex with 60ml non-ionic contrast.',
 'Well-defined hypodensity involving the right corona radiata and posterior limb of right internal capsule consistent with subacute MCA infarction. No hyperdense mass effect or petechial hemorrhagic transformation. CTA demonstrates patent right M1 and M2 branches with robust pial collateral perfusion. Carotid bifurcations show smooth walls without significant stenosis.',
 '1. Subacute right MCA territory ischemic stroke without hemorrhagic transformation. 2. Patent intracranial arterial vasculature with adequate collateral circulation.', 3, 24, 40, 150, 'brain_ct'),

('RAD-1006', 'P-1006', 'Tharun Balasubramanian', 'TN-REC-3310', 'Pediatric High-Resolution Digital Chest X-Ray (AP)', 'CR', 'Chest (Pediatric)', '09-Sep-2026', 'ACC-RAD-3310',
 'Reported & Verified', 'Routine', 'Pediatrics', 'Dr. K. Balaji, MD, DNB', 'Dr. P. Sharmila, MD (Radio-Diagnosis)',
 'Recurrent nocturnal dry wheezing, acute pediatric bronchiolitis evaluation.',
 'Single erect pediatric AP chest radiograph acquired with low-dose pediatric protocol (65 kVp, 1.6 mAs).',
 'Bilateral lung aeration is symmetrical and normal. Mild peribronchial cuffing and prominence noted in both perihilar regions, consistent with pediatric reactive small airway irritation / bronchiolitis. No lobar alveolar consolidation, effusion, or pneumothorax. Cardiothymic silhouette is normal for a 6-year-old child. Visualized pediatric bony thorax is intact.',
 '1. Mild pediatric reactive airway changes / bronchiolitis. 2. No focal pneumonia, collapse, or pleural collection.', 1, 1, 50, 400, 'pediatric_chest_xray'),

('RAD-1007', 'P-1007', 'Varsha Rangarajan', 'TN-REC-5520', 'High-Resolution Pediatric Abdominal & Thoracic Ultrasound', 'US', 'Abdomen & Pelvis', '10-Sep-2026', 'ACC-RAD-5520',
 'Reported & Verified', 'Routine', 'Pediatrics', 'Dr. K. Balaji, MD, DNB', 'Dr. P. Sharmila, MD (Radio-Diagnosis)',
 'Post-viral exanthem recovery check, ruling out mesenteric adenitis.',
 'Real-time high-resolution gray scale and color Doppler ultrasound examination using 7-12 MHz linear and 3-5 MHz curvilinear pediatric transducers.',
 'Liver, gallbladder, spleen, pancreas and both kidneys demonstrate normal pediatric dimensions and homogeneous echotexture. No focal solid or cystic parenchymal lesions. Mesenteric lymph nodes are within normal non-enlarged dimensions (< 5 mm). No free fluid in Morison pouch or pelvis. Normal bowel peristalsis without intussusception.',
 '1. Normal pediatric high-resolution abdominal and pelvic ultrasound examination.', 2, 6, 128, 256, 'ultrasound'),

('RAD-1003', 'P-1003', 'Selvaraj Murugesan', 'TN-REC-7734', 'Digital Bilateral Knee Radiograph (AP & Lateral Weight-Bearing)', 'CR', 'Bilateral Knees', '01-Sep-2026', 'ACC-RAD-7734',
 'Reported & Verified', 'Routine', 'Orthopaedics', 'Dr. S. K. Aravind, MD, DM', 'Dr. S. Meenakshi, MD, DMRD',
 'Post-operative Day 12 Right Total Knee Arthroplasty follow-up and Left Knee OA review.',
 'High-definition digital weight-bearing bilateral AP and right knee lateral views acquired.',
 'Right Knee: Bicondylar total knee prosthesis in optimal anatomical alignment with normal femoral and tibial component seating. Stable bone-cement interface with no periprosthetic lucency or displacement. Left Knee: Severe medial compartment joint space obliteration with marginal osteophytosis and subchondral sclerosis (Grade IV Kellgren-Lawrence Osteoarthritis).',
 '1. Right Knee: Anatomically aligned, stable Total Knee Arthroplasty. 2. Left Knee: Severe Grade IV primary osteoarthritis.', 2, 2, 500, 2000, 'knee_xray'),

('RAD-1004', 'P-1004', 'Ananya Krishnan', 'TN-REC-6521', 'Preventive Screening Digital Chest X-Ray (PA View)', 'CR', 'Chest', '07-Sep-2026', 'ACC-RAD-6521',
 'Reported & Verified', 'Routine', 'Cardiology', 'Dr. S. K. Aravind, MD, DM', 'Dr. S. Meenakshi, MD, DMRD',
 'Preventive health screening and intermittent non-cardiac chest discomfort.',
 'Digital PA erect chest radiograph acquired with modern low-dose solid-state detector.',
 'Lungs are clear throughout all lobes with crisp diaphragmatic domes. Normal pulmonary vascular markings. Normal cardiac contours and size. Aortic knob and mediastinal lines intact. No skeletal or soft tissue abnormalities.',
 '1. Unremarkable preventive chest radiograph. Within normal limits.', 1, 1, 40, 400, 'chest_xray'),

('RAD-1008', 'P-1008', 'Ganesan Swaminathan', 'TN-REC-8822', 'Bilateral Renal High-Resolution Ultrasound & Color Doppler', 'US', 'Kidneys & Urinary Tract', '08-Sep-2026', 'ACC-RAD-8822',
 'Reported & Verified', 'Routine', 'Nephrology', 'Dr. M. Sangeetha, MD, DM', 'Dr. S. Meenakshi, MD, DMRD',
 'Chronic glomerulonephritis with proteinuria; evaluate renal parenchymal cortical thickness and resistive indices.',
 'Real-time multi-frequency curved array transducer (3.5 - 5.0 MHz) evaluation with color and spectral Doppler interrogation.',
 'Right Kidney measures 10.4 x 4.6 cm (Cortical thickness: 13 mm). Left Kidney measures 10.6 x 4.8 cm (Cortical thickness: 14 mm). Bilateral diffuse Grade 1 increase in renal parenchymal cortical echogenicity with preserved corticomedullary demarcation. No hydronephrosis, calculus, or focal mass lesion. Main renal artery spectral Doppler reveals normal peak systolic velocities (PSV 88 cm/s) and Resistive Index (RI 0.64, normal < 0.70). Urinary bladder normal wall thickness.',
 '1. Bilateral medical renal parenchymal disease (Grade 1 cortical echogenicity) consistent with chronic glomerulonephritis. 2. Normal renal vascular flow without renal artery stenosis.', 2, 8, 128, 256, 'renal_ultrasound');

-- ===========================================================================
-- SEED DATA: RIS SCAN WARD MACHINES INVENTORY
-- ===========================================================================
INSERT OR REPLACE INTO ris_ward_machines 
(id, name, model, modality, room_no, status, current_patient_id, current_patient_name, current_abha_id, current_scan_type, assigned_technician, uptime_pct, last_calibrated)
VALUES
('MACH-CT-101', 'SOMATOM Force 128-Slice CT', 'Siemens Healthineers 128-MDCT Dual Source', 'CT', 'Room 101', 'Occupied', 'P-1005', 'Vigneshwaran Natarajan', '14-5544-3322-1100', '128-Slice Brain CT Angiography', 'R. Sivakumar, B.Sc RT', 99.8, '12-Sep-2026'),
('MACH-MR-102', 'Signa Premier 3.0T MRI', 'GE Healthcare 3.0 Tesla 70cm Bore', 'MR', 'Room 102', 'Free', NULL, NULL, NULL, NULL, 'K. Soundararajan, M.Sc', 99.4, '11-Sep-2026'),
('MACH-CR-103', 'Sonialvision Digital X-Ray Suite A', 'Shimadzu High-Frequency Flat Panel DR', 'CR', 'Room 103', 'Free', NULL, NULL, NULL, NULL, 'M. Revathi, DMRT', 100.0, '13-Sep-2026'),
('MACH-US-104', 'Epiq Elite Color Doppler Ultrasound', 'Philips High-Resolution Matrix Probe US', 'US', 'Room 104', 'Occupied', 'P-1008', 'Ganesan Swaminathan', '14-8899-7711-2233', 'Renal Vascular Doppler Scan', 'Dr. P. Sharmila, MD', 99.6, '10-Sep-2026'),
('MACH-NM-105', 'Biograph Horizon PET-CT System', 'Siemens Flow Motion PET/CT Scanner', 'NM', 'Room 105', 'Free', NULL, NULL, NULL, NULL, 'J. Arunkumar, M.Sc RSO', 98.9, '09-Sep-2026'),
('MACH-CATH-106', 'Innova IGS 530 Digital Cath Lab', 'GE Digital Flat-Panel Angiography', 'CT', 'Room 106', 'Free', NULL, NULL, NULL, NULL, 'Dr. R. Vijayakumar, MD', 99.7, '12-Sep-2026');

-- ===========================================================================
-- SEED DATA: RIS SCAN WARD WORKERS & ROSTER
-- ===========================================================================
INSERT OR REPLACE INTO ris_ward_workers 
(id, name, role, reg_no, shift, assigned_room, status, phone)
VALUES
('WRK-001', 'Dr. R. Vijayakumar, MD, DNB', 'Chief Consultant Radiologist & HOD', 'TMC-RAD-38910', 'Morning (08:00 - 16:00)', 'Reporting Console 1 / Room 101', 'On Duty', '+91 94441 23001'),
('WRK-002', 'Dr. P. Sharmila, MD (Radio-Diagnosis)', 'Consultant Sonologist & Radiologist', 'TMC-RAD-41208', 'Morning (08:00 - 16:00)', 'Ultrasound Suite / Room 104', 'On Duty', '+91 94441 23002'),
('WRK-003', 'R. Sivakumar, B.Sc RT', 'Senior CT Specialist Technologist', 'TMC-TECH-1041', 'Morning (08:00 - 16:00)', 'CT Suite / Room 101', 'On Duty', '+91 98401 55101'),
('WRK-004', 'K. Soundararajan, M.Sc Med Imaging', 'Lead MRI Technologist & Safety Officer', 'TMC-TECH-1088', 'Morning (08:00 - 16:00)', 'MRI Suite / Room 102', 'On Duty', '+91 98401 55102'),
('WRK-005', 'M. Revathi, DMRT', 'Senior Radiographer', 'TMC-TECH-1102', 'Morning (08:00 - 16:00)', 'X-Ray Suite / Room 103', 'On Duty', '+91 98401 55103'),
('WRK-006', 'J. Arunkumar, M.Sc RSO', 'Radiation Safety Officer & Nuclear Med Tech', 'AERB-RSO-882', 'Morning (08:00 - 16:00)', 'PET-CT Suite / Room 105', 'On Duty', '+91 98401 55105'),
('WRK-007', 'S. Deepa, B.Sc Nursing', 'Radiology Clinical Nursing Officer', 'TNC-NUR-9021', 'Morning (08:00 - 16:00)', 'Ward Triage & IV Contrast Desk', 'On Duty', '+91 98401 55107'),
('WRK-008', 'V. Karthik, M.Sc Med Physics', 'Chief Medical Physicist & QA Specialist', 'AMPI-PHY-419', 'Morning (08:00 - 16:00)', 'Quality Control & Calibration Lab', 'On Duty', '+91 98401 55108');

-- ===========================================================================
-- SEED DATA: INITIAL DOCTOR SCAN REQUISITIONS (RIS REQUESTS)
-- ===========================================================================
INSERT OR REPLACE INTO ris_requests
(id, patient_id, patient_name, abha_id, receipt_id, age, gender, modality, body_part, priority, clinical_indication, doctor_name, doctor_reg_no, department, status, assigned_machine, assigned_technician)
VALUES
('REQ-2026-101', 'P-1001', 'Karthikeyan Subramanian', '14-9923-4512-7801', 'TN-REC-8841', 48, 'Male', 'CT', 'Coronary Arteries / Thorax', 'Urgent (24h)', 'Atypical chest discomfort with mild CAD history. Re-evaluate mid-LAD luminal patency & Agatston score.', 'Dr. S. K. Aravind, MD, DM', 'TMC-48291', 'Cardiology', 'Pending', NULL, NULL),
('REQ-2026-102', 'P-1003', 'Selvaraj Murugesan', '14-3329-8811-9042', 'TN-REC-7731', 62, 'Male', 'CR', 'Right Knee Joint (AP & Lat)', 'Routine', 'Post-operative Day 12 Right Total Knee Arthroplasty. Check prosthetic seating and alignment.', 'Dr. S. K. Aravind, MD, DM', 'TMC-48291', 'Cardiology', 'Accepted', 'Sonialvision Digital X-Ray Suite A (Room 103)', 'M. Revathi, DMRT'),
('REQ-2026-103', 'P-1002', 'Priya Ramanathan', '14-7712-8834-1102', 'TN-REC-4920', 34, 'Female', 'MR', 'Brain / Sella & Head', 'Routine', 'Subclinical hypothyroidism with persistent migraine. Screen hypothalamic-pituitary axis.', 'Dr. S. K. Aravind, MD, DM', 'TMC-48291', 'Cardiology', 'Pending', NULL, NULL);

-- ===========================================================================
-- SEED DATA: PREVIOUSLY USED MEDICINES (PAST MEDICATIONS HISTORY)
-- ===========================================================================
INSERT INTO past_medications 
(patient_id, medicine, dosage, frequency, duration, prescribed_by, indication, reason_for_change, status)
VALUES
-- P-1001 (Karthikeyan Subramanian - Cardiology CAD/HTN)
('P-1001', 'Tab. Atenolol', '50 mg', '1 - 0 - 0', '18 Months (Jan 2024 - Jun 2025)', 'Dr. K. Srinivasan, MD (GH Chennai)', 'Essential Hypertension Management', 'Switched to Telmisartan due to exertional fatigue and resting bradycardia.', 'Switched to ARB'),
('P-1001', 'Tab. Rosuvastatin', '10 mg', '0 - 0 - 1', '12 Months (Mar 2024 - Mar 2025)', 'Cardiology OPD, Rajiv Gandhi GH', 'Hyperlipidemia & Atherosclerosis', 'Upgraded to Atorvastatin 20mg post-angiography for enhanced plaque stabilization.', 'Switched (Dose Escalation)'),
('P-1001', 'Tab. Clopidogrel', '75 mg', '0 - 1 - 0', '6 Months (Sep 2025 - Mar 2026)', 'Dr. S. K. Aravind, MD, DM', 'Dual Antiplatelet Therapy (DAPT)', 'Completed prescribed 6-month post-angio course; stepped down to Ecosprin monotherapy.', 'Completed Course'),
('P-1001', 'Tab. Pantoprazole', '40 mg', '1 - 0 - 0', '6 Months (Sep 2025 - Mar 2026)', 'Cardiology OPD', 'Gastroprotection during DAPT', 'Discontinued following cessation of dual antiplatelet therapy.', 'Discontinued'),

-- P-1004 (Ananya Krishnan - Cardiology / General OPD)
('P-1004', 'Tab. Propranolol', '10 mg', '1 - 0 - 1', '3 Months (Nov 2025 - Jan 2026)', 'Dr. M. Venkat, MD (Coimbatore CMC)', 'Palpitations & Performance Anxiety', 'Tapered off after normal Holter monitoring and sinus bradycardia confirmation.', 'Tapered & Stopped'),
('P-1004', 'Cap. Vitamin D3 60K', '60,000 IU', 'Once Weekly', '8 Weeks (Dec 2025 - Feb 2026)', 'General Medicine OPD', 'Vitamin D Deficiency & Myalgia', 'Serum 25-OH Vitamin D normalized to 48 ng/mL.', 'Completed Course'),
('P-1004', 'Tab. Paracetamol', '650 mg', 'SOS', 'Intermittent (2025)', 'OPD Casualty', 'Tension Headache / Fatigue', 'Used as needed; symptoms resolved with hydration and rest.', 'PRN Completed'),

-- P-1002 (Priya Ramanathan - Neurology)
('P-1002', 'Tab. Topiramate', '25 mg', '0 - 0 - 1', '6 Months (Jan 2025 - Jun 2025)', 'Dr. Radhika Sundaram, MS, MCh (Madurai GH)', 'Migraine Prophylaxis with Aura', 'Switched to Flunarizine due to mild cognitive slowing and paresthesias.', 'Switched'),
('P-1002', 'Tab. Naproxen', '500 mg', 'SOS', '1 Year (2024 - 2025)', 'Neurology Clinic', 'Acute Migraine Cephalea', 'Switched to Sumatriptan nasal spray for faster relief.', 'Switched'),
('P-1002', 'Tab. Amitriptyline', '10 mg', '0 - 0 - 1', '4 Months (2024)', 'GH Madurai', 'Sleep Disturbance & Tension Headache', 'Successfully resolved sleep cycle disturbance.', 'Completed Course'),

-- P-1003 (Selvaraj Murugesan - Nephrology)
('P-1003', 'Tab. Enalapril', '5 mg', '1 - 0 - 0', '18 Months (2022 - 2024)', 'Stanley Medical College, Chennai', 'Diabetic Nephropathy & Microalbuminuria', 'Developed persistent dry ACE-inhibitor cough; switched to ARB (Telmisartan).', 'Switched (Adverse Effect)'),
('P-1003', 'Tab. Glimepiride', '2 mg', '1 - 0 - 0', '2 Years (2023 - 2025)', 'Dr. T. Balaji, MD, DM Nephrology', 'Type 2 Diabetes Mellitus', 'Switched to Teneligliptin 20mg to preserve renal function and prevent hypoglycemia.', 'Switched'),
('P-1003', 'Tab. Atorvastatin', '40 mg', '0 - 0 - 1', '1 Year (2024 - 2025)', 'Nephrology OPD', 'Dyslipidemia with CKD Stage 2', 'Dose reduced to 20mg after LDL reached target 68 mg/dL.', 'Dose Reduced');

-- ===========================================================================
-- SEED DATA: PAST ELECTRONIC HEALTH RECORDS (PAST RECORDS)
-- ===========================================================================
INSERT INTO past_records
(id, patient_id, date, hospital, department, doctor, diagnosis, outcome)
VALUES
('REC-2025-081', 'P-1001', '14-Oct-2025', 'Government Multi Super Speciality Hospital, Omandurar', 'Cardiology', 'Dr. S. K. Aravind, MD, DM', 'Coronary Angiography (CAG) - Single Vessel LAD 40%', 'Managed conservatively with optimal medical therapy; stable.'),
('REC-2025-042', 'P-1001', '18-May-2025', 'Rajiv Gandhi Government General Hospital, Chennai', 'General Medicine', 'Dr. K. Srinivasan, MD', 'Essential Hypertension & Dyslipidemia Evaluation', 'Blood pressure optimized, lifestyle and dietary sodium restriction advised.'),
('REC-2024-119', 'P-1001', '05-Nov-2024', 'Government Kilpauk Medical College Hospital', 'Preventive Health', 'Dr. M. Deepa, MD', 'Annual State Health Checkup Screening', 'Early Grade-1 fatty liver noted on ultrasound; lipid profiling recommended.'),
('REC-2026-015', 'P-1004', '12-Feb-2026', 'Coimbatore Medical College Hospital & Trauma Centre', 'General OPD', 'Dr. M. Venkat, MD', 'Atypical Chest Wall Sensitivity Screening', 'Resting ECG normal, reassured and advised physical exercise.'),
('REC-2025-090', 'P-1002', '15-Aug-2025', 'Government Rajaji Hospital, Madurai', 'Neurology', 'Dr. Radhika Sundaram, MS, MCh', 'Migraine with Aura Staging', 'Visual aura documented, started on Flunarizine prophylaxis.'),
('REC-2025-064', 'P-1003', '20-Jun-2025', 'K.A.P.V. Government Medical College Hospital, Trichy', 'Nephrology', 'Dr. M. Sangeetha, MD, DM', 'Diabetic Nephropathy Stage 3b Review', 'Proteinuria stabilized with SGLT2i and dietary protein moderation.');

