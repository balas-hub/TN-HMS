// Preloaded data store for Tamil Nadu Healthcare & Pan-India Medical Centre
const INITIAL_PATIENTS = [
  {
    id: "P-1001",
    receiptId: "TN-REC-8841",
    abhaId: "14-9923-4512-7801",
    abhaAddress: "karthik.s@abdm",
    name: "Karthikeyan Subramanian",
    age: 48,
    gender: "Male",
    bloodGroup: "O +ve",
    phone: "+91 98401 23456",
    address: "No. 42, Anna Salai, Teynampet, Chennai, Tamil Nadu - 600018",
    centerName: "Government Multi Super Speciality Hospital, Omandurar Estate, Chennai",
    admissionDate: "05-Sep-2026",
    dischargeDate: "08-Sep-2026",
    status: "Discharged - Stable",
    department: "Cardiology",
    consultingDoctor: "Dr. S. K. Aravind, MD, DM (Cardiology)",
    doctorRegNo: "TMC-48291",
    vitals: {
      bp: "128/84 mmHg",
      pulse: "74 bpm",
      spo2: "99%",
      temp: "98.4 °F",
      weight: "72 kg",
      height: "172 cm",
      bmi: "24.3",
      bloodSugarFasting: "108 mg/dL"
    },
    clinicalSummary: {
      chiefComplaints: "Exertional dyspnea and mild retrosternal chest discomfort for 4 days.",
      diagnosis: "Ischemic Heart Disease (Mild CAD) - Stabilized, Essential Hypertension (Stage 1)",
      clinicalNotes: "Patient presented with atypical chest pain on exertion. Troponin T negative. 2D Echo showed normal LV systolic function (LVEF 58%). Coronary angiography showed single vessel 40% stenosis in mid-LAD, managed medically. Hemodynamically stable upon discharge.",
      allergies: "No known drug allergies (NKDA)"
    },
    labReports: [
      { testName: "Complete Blood Count (CBC)", date: "05-Sep-2026", result: "Hb: 14.2 g/dL, WBC: 7,800 /mcL, Platelets: 2.4 Lakhs", status: "Normal", normalRange: "Hb: 13-17 g/dL" },
      { testName: "Lipid Profile", date: "05-Sep-2026", result: "Total Chol: 210 mg/dL, LDL: 132 mg/dL, HDL: 44 mg/dL, Triglycerides: 170 mg/dL", status: "Borderline High", normalRange: "LDL < 100 mg/dL" },
      { testName: "Cardiac Troponin I", date: "05-Sep-2026", result: "0.01 ng/mL (Negative)", status: "Normal", normalRange: "< 0.04 ng/mL" },
      { testName: "12-Lead ECG", date: "06-Sep-2026", result: "Normal sinus rhythm, non-specific T-wave flattening in V4-V6", status: "Stable", normalRange: "Normal Sinus" },
      { testName: "2D Echocardiography", date: "06-Sep-2026", result: "LVEF 58%, No regional wall motion abnormalities, Grade 1 diastolic dysfunction", status: "Mild Abnormality", normalRange: "LVEF > 55%" }
    ],
    prescriptions: [
      { medicine: "Tab. Ecosprin (Aspirin)", dosage: "75 mg", frequency: "1 - 0 - 0", timing: "After Breakfast", duration: "30 Days", instructions: "Continue daily, do not skip" },
      { medicine: "Tab. Atorva (Atorvastatin)", dosage: "20 mg", frequency: "0 - 0 - 1", timing: "After Dinner", duration: "30 Days", instructions: "Night time, lipid control" },
      { medicine: "Tab. Telma (Telmisartan)", dosage: "40 mg", frequency: "1 - 0 - 0", timing: "Morning", duration: "30 Days", instructions: "For BP control" },
      { medicine: "Tab. Pan-D (Pantoprazole + Domperidone)", dosage: "40 mg", frequency: "1 - 0 - 0", timing: "Before Breakfast", duration: "10 Days", instructions: "Empty stomach" }
    ],
    billing: {
      totalAmount: "₹ 14,850",
      insuranceScheme: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS) / Ayushman Bharat (AB-PMJAY)",
      schemeApproved: "₹ 14,850",
      patientPayable: "₹ 0.00 (Fully Covered)",
      paymentStatus: "Settled via Gov Scheme"
    },
    followUp: "18-Sep-2026 at Cardiology OPD, Room 104"
  },
  {
    id: "P-1002",
    receiptId: "TN-REC-4920",
    abhaId: "14-8821-3342-9901",
    abhaAddress: "priya.ramanathan@abdm",
    name: "Priya Ramanathan",
    age: 34,
    gender: "Female",
    bloodGroup: "B +ve",
    phone: "+91 97902 54321",
    address: "Plot 18, Gandhi Nagar 2nd Street, Madurai, Tamil Nadu - 625020",
    centerName: "Government Rajaji Hospital & Pan-India Medical Centre, Madurai",
    admissionDate: "07-Sep-2026",
    dischargeDate: "Active OPD Consultation",
    status: "Outpatient - Active Care",
    department: "Endocrinology & Diabetology",
    consultingDoctor: "Dr. Meenakshi Sundaram, MD (General Medicine), DM (Endo)",
    doctorRegNo: "TMC-52190",
    vitals: {
      bp: "118/76 mmHg",
      pulse: "78 bpm",
      spo2: "99%",
      temp: "98.6 °F",
      weight: "61 kg",
      height: "158 cm",
      bmi: "24.4",
      bloodSugarFasting: "142 mg/dL"
    },
    clinicalSummary: {
      chiefComplaints: "Polydipsia, generalized fatigue, and recent unexplained weight changes for 3 weeks.",
      diagnosis: "Type 2 Diabetes Mellitus (Newly Detected), Subclinical Hypothyroidism",
      clinicalNotes: "Patient evaluated for persistent lethargy and increased thirst. Fasting plasma glucose elevated at 142 mg/dL with HbA1c at 7.8%. Started on lifestyle modifications, medical nutrition therapy, and oral antidiabetic therapy.",
      allergies: "Penicillin allergy (skin rash)"
    },
    labReports: [
      { testName: "Glycated Hemoglobin (HbA1c)", date: "07-Sep-2026", result: "7.8 %", status: "High", normalRange: "< 5.7 %" },
      { testName: "Fasting Blood Glucose", date: "07-Sep-2026", result: "142 mg/dL", status: "High", normalRange: "70 - 99 mg/dL" },
      { testName: "Post Prandial Blood Glucose", date: "07-Sep-2026", result: "196 mg/dL", status: "High", normalRange: "< 140 mg/dL" },
      { testName: "Thyroid Stimulating Hormone (TSH)", date: "07-Sep-2026", result: "6.12 uIU/mL", status: "Mildly Elevated", normalRange: "0.4 - 4.2 uIU/mL" },
      { testName: "Serum Creatinine", date: "07-Sep-2026", result: "0.8 mg/dL", status: "Normal", normalRange: "0.5 - 1.1 mg/dL" }
    ],
    prescriptions: [
      { medicine: "Tab. Metformin (Glucophage SR)", dosage: "500 mg", frequency: "1 - 0 - 1", timing: "After Meals", duration: "60 Days", instructions: "Take with food to minimize GI discomfort" },
      { medicine: "Tab. Thyronorm (Levothyroxine)", dosage: "25 mcg", frequency: "1 - 0 - 0", timing: "Before Breakfast", duration: "60 Days", instructions: "Early morning, empty stomach with plain water" },
      { medicine: "Cap. Becosules (Vitamin B-Complex)", dosage: "1 cap", frequency: "0 - 1 - 0", timing: "After Lunch", duration: "30 Days", instructions: "Daily nutritional support" }
    ],
    billing: {
      totalAmount: "₹ 1,850",
      insuranceScheme: "Direct Government Subsidized OPD Care",
      schemeApproved: "₹ 1,850",
      patientPayable: "₹ 0.00",
      paymentStatus: "Free OPD Service"
    },
    followUp: "07-Nov-2026 with repeat HbA1c & Fasting Glucose"
  },
  {
    id: "P-1003",
    receiptId: "TN-REC-7731",
    abhaId: "14-7712-9081-6542",
    abhaAddress: "selvaraj.m@abdm",
    name: "Selvaraj Murugesan",
    age: 62,
    gender: "Male",
    bloodGroup: "A +ve",
    phone: "+91 94432 10987",
    address: "15-B, Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012",
    centerName: "Coimbatore Medical College Hospital (CMCH) & Pan-India Trauma Care",
    admissionDate: "02-Sep-2026",
    dischargeDate: "06-Sep-2026",
    status: "Post-Operative Recovery",
    department: "Orthopaedics & Joint Reconstruction",
    consultingDoctor: "Dr. K. Vijayaraghavan, MS (Ortho), MCh",
    doctorRegNo: "TMC-39811",
    vitals: {
      bp: "124/80 mmHg",
      pulse: "72 bpm",
      spo2: "98%",
      temp: "98.2 °F",
      weight: "78 kg",
      height: "168 cm",
      bmi: "27.6",
      bloodSugarFasting: "102 mg/dL"
    },
    clinicalSummary: {
      chiefComplaints: "Severe right knee pain and limitation of mobility for 1 year, aggravated recently.",
      diagnosis: "Right Knee Primary Osteoarthritis (Grade IV Kellgren-Lawrence) - Post Total Knee Arthroplasty (TKA)",
      clinicalNotes: "Underwent uncomplicated Right Total Knee Replacement on 03-Sep-2026. Surgical wound healthy, no signs of infection. Mobilized with walker on post-op day 1. Full weight bearing tolerated with physical therapy.",
      allergies: "Sulfa drugs"
    },
    labReports: [
      { testName: "Right Knee Digital X-Ray (Post-Op)", date: "04-Sep-2026", result: "Prosthetic alignment anatomically accurate, no periprosthetic lucency", status: "Optimal", normalRange: "Proper alignment" },
      { testName: "C-Reactive Protein (CRP)", date: "05-Sep-2026", result: "8.2 mg/L (Post-op expected drop)", status: "Decreasing", normalRange: "< 5.0 mg/L" },
      { testName: "Hemoglobin (Post-Op Day 2)", date: "05-Sep-2026", result: "11.6 g/dL", status: "Acceptable", normalRange: "13-17 g/dL" }
    ],
    prescriptions: [
      { medicine: "Tab. Dolo (Paracetamol)", dosage: "650 mg", frequency: "1 - 1 - 1", timing: "SOS / After Meals", duration: "7 Days", instructions: "For pain relief as needed" },
      { medicine: "Tab. Cefuroxime (Ceftum)", dosage: "500 mg", frequency: "1 - 0 - 1", timing: "After Food", duration: "5 Days", instructions: "Complete antibiotic course" },
      { medicine: "Tab. Shelcal (Calcium + Vit D3)", dosage: "500 mg", frequency: "0 - 1 - 0", timing: "After Food", duration: "60 Days", instructions: "Bone strengthening" },
      { medicine: "Inj. Clexane (Enoxaparin)", dosage: "40 mg", frequency: "Subcutaneous", timing: "Once Daily", duration: "3 Days", instructions: "Deep vein thrombosis prophylaxis" }
    ],
    billing: {
      totalAmount: "₹ 1,12,000",
      insuranceScheme: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
      schemeApproved: "₹ 1,12,000",
      patientPayable: "₹ 0.00",
      paymentStatus: "Approved 100% Cashless"
    },
    followUp: "16-Sep-2026 for Suture Removal & Mobility Check"
  }
];

const INITIAL_DOCTORS = [
  {
    id: "DOC-101",
    regNo: "TMC-48291",
    pin: "1234",
    name: "Dr. S. K. Aravind",
    degrees: "MD, DM (Cardiology), FACC",
    designation: "Chief Consultant Cardiologist & HOD",
    department: "Cardiology",
    hospital: "Govt Multi Super Speciality Hospital, Omandurar, Chennai",
    phone: "+91 94440 88990",
    opdRoom: "Room 104, Block-A",
    todayQueue: [
      { token: 1, receiptId: "TN-REC-8841", patientName: "Karthikeyan Subramanian", age: 48, status: "Review Completed", type: "Post-Discharge Follow-up" },
      { token: 2, receiptId: "TN-REC-9102", patientName: "M. Anbazhagan", age: 54, status: "Waiting in Queue", type: "New Consultation - Chest Discomfort" },
      { token: 3, receiptId: "TN-REC-9144", patientName: "Revathi Natarajan", age: 60, status: "In Waiting Area", type: "BP Fluctuation Review" }
    ]
  },
  {
    id: "DOC-102",
    regNo: "TMC-52190",
    pin: "1234",
    name: "Dr. Meenakshi Sundaram",
    degrees: "MD (General Med), DM (Endocrinology)",
    designation: "Senior Consultant Endocrinologist",
    department: "Endocrinology & Diabetology",
    hospital: "Govt Rajaji Hospital & Pan-India Medical Centre, Madurai",
    phone: "+91 94433 77112",
    opdRoom: "Room 208, OPD Tower",
    todayQueue: [
      { token: 1, receiptId: "TN-REC-4920", patientName: "Priya Ramanathan", age: 34, status: "Attending Now", type: "Diabetes Evaluation" },
      { token: 2, receiptId: "TN-REC-9311", patientName: "Venkatesh Rao", age: 58, status: "Waiting in Queue", type: "HbA1c Quarterly Review" }
    ]
  }
];

const PAN_INDIA_CENTRES = [
  { city: "Chennai (HQ)", hospital: "Govt Multi Super Speciality Hospital (Omandurar)", beds: 500, emergency: "044-2566 5000", badge: "Apex Centre - Tamil Nadu" },
  { city: "Madurai", hospital: "Government Rajaji Hospital & Pan-India Medical Centre", beds: 1400, emergency: "0452-253 2535", badge: "Southern Hub" },
  { city: "Coimbatore", hospital: "Coimbatore Medical College Hospital & Trauma Centre", beds: 1250, emergency: "0422-230 1393", badge: "Western Hub" },
  { city: "Tiruchirappalli", hospital: "K.A.P. Viswanatham Government Medical College Hospital", beds: 850, emergency: "0431-240 1011", badge: "Central Hub" },
  { city: "New Delhi", hospital: "Tamil Nadu House Healthcare Facilitation & AIIMS Liaison", beds: 120, emergency: "011-2419 3100", badge: "Pan-India Northern Cell" },
  { city: "Bengaluru", hospital: "Pan-India Inter-State Patient Care & Referral Wing", beds: 200, emergency: "080-2227 4444", badge: "Southern Inter-State Cell" },
  { city: "Mumbai", hospital: "Tamil Nadu Healthcare Support Desk (KEM / Tata Memorial)", beds: 150, emergency: "022-2410 7000", badge: "Oncology Liaison Wing" },
  { city: "Kolkata", hospital: "Tamil Nadu Healthcare Facilitation Cell (Eastern Region)", beds: 160, emergency: "033-2287 5500", badge: "Eastern Inter-State Cell" }
];

// Initialize LocalStorage Data Store
function initDataStore() {
  if (!localStorage.getItem("tnhc_patients")) {
    localStorage.setItem("tnhc_patients", JSON.stringify(INITIAL_PATIENTS));
  }
  if (!localStorage.getItem("tnhc_doctors")) {
    localStorage.setItem("tnhc_doctors", JSON.stringify(INITIAL_DOCTORS));
  }
}

function getStoredPatients() {
  initDataStore();
  return JSON.parse(localStorage.getItem("tnhc_patients") || "[]");
}

function saveStoredPatients(patients) {
  localStorage.setItem("tnhc_patients", JSON.stringify(patients));
}

function getStoredDoctors() {
  initDataStore();
  return JSON.parse(localStorage.getItem("tnhc_doctors") || "[]");
}

function saveStoredDoctors(doctors) {
  localStorage.setItem("tnhc_doctors", JSON.stringify(doctors));
}

// Find patient by Receipt ID or ABHA ID / ABHI
function findPatientRecord(query) {
  const clean = (query || "").trim().toLowerCase();
  if (!clean) return null;
  const patients = getStoredPatients();
  return patients.find(p => 
    p.receiptId.toLowerCase() === clean ||
    p.abhaId.toLowerCase() === clean ||
    p.abhaAddress.toLowerCase() === clean ||
    p.phone.replace(/[\s\-\+]/g, "").includes(clean.replace(/[\s\-\+]/g, "")) ||
    p.name.toLowerCase().includes(clean)
  );
}

// Global exposure
window.HospitalData = {
  getPatients: getStoredPatients,
  savePatients: saveStoredPatients,
  getDoctors: getStoredDoctors,
  saveDoctors: saveStoredDoctors,
  findPatientRecord,
  panIndiaCentres: PAN_INDIA_CENTRES,
  resetToDefault: function() {
    localStorage.setItem("tnhc_patients", JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem("tnhc_doctors", JSON.stringify(INITIAL_DOCTORS));
  }
};
