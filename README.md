# Tamil Nadu Health Care • Pan-India Medical Centre & Hospital Management System (TN-HMS)

Official Hospital Management, Electronic Medical Records (EMR), and Telemedicine OPD Portal for the **Government of Tamil Nadu • Department of Health & Family Welfare**.

---

## 🏛️ System Features

### 1. Dedicated Citizen & Patient Health Portal (`/client`)
- **Standalone Page**: Independent `/client` page with persistent `localStorage` session state preventing reset on page refresh.
- **ABHA Digital Health Locker**: Verified Ayushman Bharat Digital Mission (ABDM) integration with digital QR code and registration.
- **Health Records & Vitals**: Real-time tracking of blood pressure, pulse, SpO2, temperature, fasting blood sugar, and BMI.
- **Electronic Prescriptions (Rx)**: Full dosage, timing, frequency, and instructions with print functionality.
- **Laboratory Investigations**: Diagnostic test results with clinical status badges and reference ranges.
- **CMCHIS Billing**: Chief Minister's Comprehensive Health Insurance Scheme approval tracking.

### 2. Specialist Doctor Clinical Workbench & EMR (`/doctor`)
- **Independent Clinical Desk**: Dedicated `/doctor` workstation with Medical Council credential verification.
- **OPD Queue Management**: Token-based patient queue with live consultation status.
- **Clinical EMR File Management**: Update diagnosis, progress notes, follow-up clinic scheduling, and medication prescriptions.
- **Requested Schedules Panel**: Review incoming teleconsultation requests routed to the doctor's specialty.
- **Reported Health Issue Review**: Clear visibility of the patient's reported symptoms and preferred slot.
- **Accept Schedule & Confirm Timing**: One-click acceptance that notifies the patient and activates the teleconsultation room.

### 3. Telemedicine Video Consultation System
- **Department Routing**: Consultation requests are broadcasted to all doctors registered under that medical specialty.
- **Instant Confirmation Banner**: Once accepted, the patient portal immediately displays:
  > **"Confirmed on that timing: [Date/Time] with Dr. [Doctor Name] — Please Be Ready"**
- **Encrypted In-Browser Video Session**: HD video feed, microphone toggle, camera toggle, session timer, and real-time clinical chat.

### 4. Database & Storage Architecture
- **Relational SQLite Storage**: Structured schema (`server/db/schema.sql`) for patients, vitals, prescriptions, lab reports, CMCHIS billing, doctors, OPD queue, and appointments.
- **JSON Synchronization**: Dual persistence engine supporting SQLite with automated JSON fallback.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### Starting the Portal Server
Run with Node.js directly:
```bash
node server/server.js
```
Or use the provided batch/PowerShell launchers:
```cmd
start.bat
```
or
```powershell
.\Start-Portal.ps1
```

### Accessing the Web Portals
- **Public Home Portal**: [http://localhost:5000/](http://localhost:5000/)
- **Citizen / Patient Portal**: [http://localhost:5000/client](http://localhost:5000/client)
- **Doctor Clinical Workbench**: [http://localhost:5000/doctor](http://localhost:5000/doctor)

### Demo Credentials
- **Verified Patient**:
  - Receipt ID: `TN-REC-8841` (or Mobile: `9840123456`)
- **Specialist Doctor**:
  - Medical Council Reg No: `TMC-48291`
  - Passcode: `doctor123`