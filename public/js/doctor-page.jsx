// ===========================================================================
// TAMIL NADU HEALTH CARE - DEDICATED DOCTOR CLINICAL WORKBENCH & EMR PAGE
// Independent Doctor Portal Application (public/js/doctor-page.jsx)
// ===========================================================================

const { useState, useEffect, useRef, useCallback } = React;

const LOGO_SRC = (typeof window !== 'undefined' && window.TN_EMBLEM_DATA_URL) 
  ? window.TN_EMBLEM_DATA_URL 
  : '/Tamil_Nadu.webp';

// 1. Toast Notification Component
function ToastList({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type === 'error' ? 'toast-error' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {t.type === 'error' ? (
              <>
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </>
            ) : (
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </>
            )}
          </svg>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// 2. Telemedicine Video Modal Component
function VideoConsultationModal({ room, onClose, onToast }) {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [doctorNote, setDoctorNote] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallSeconds(s => s + 1);
    }, 1000);

    // Acquire webcam/mic safely with fallback
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          onToast('Simulated teleconsultation camera feed active', 'info');
        });
    }

    return () => {
      clearInterval(timer);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setIsAudioMuted(!isAudioMuted);
    onToast(!isAudioMuted ? 'Microphone muted' : 'Microphone unmuted');
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setIsVideoOff(!isVideoOff);
    onToast(!isVideoOff ? 'Camera turned off' : 'Camera turned on');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="video-consult-window">
        <div className="video-consult-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO_SRC} alt="Emblem" style={{ width: '36px', height: '36px' }} />
            <div>
              <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase' }}>
                DOCTOR TELE-CLINIC WORKBENCH
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                  Consultation with Patient {room.patientName || 'Registered Patient'}
                </h3>
                <span className="video-status-indicator">
                  <span className="status-dot-pulse"></span>
                  Connected ({formatTimer(callSeconds)})
                </span>
              </div>
            </div>
          </div>
          <button className="close-btn" style={{ color: '#FFFFFF' }} onClick={onClose} aria-label="End Consultation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="video-body-grid">
          <div className="video-stream-container">
            <div className="simulated-remote-feed">
              <div className="clinician-avatar-pulse">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px', color: '#FFFFFF' }}>
                {room.patientName || 'Registered Patient'}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#94A3B8', maxWidth: '440px', lineHeight: '1.5', margin: '0 auto' }}>
                {room.receiptId ? `Receipt ID: ${room.receiptId}` : 'Tele-Consultation Patient'}
                {room.department ? ` • ${room.department}` : ''}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                <span style={{ background: 'rgba(15, 76, 129, 0.3)', border: '1px solid var(--primary)', color: '#38BDF8', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700' }}>
                  Encrypted HD Video Session
                </span>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#34D399', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700' }}>
                  Active Tele-OPD Feed
                </span>
              </div>
            </div>

            <div className="local-pip-video">
              {localStream && !isVideoOff ? (
                <video ref={localVideoRef} autoPlay playsInline muted />
              ) : (
                <div className="pip-fallback-avatar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#94A3B8', fontSize: '12px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                  <span style={{ fontSize: '11px' }}>Camera Off</span>
                </div>
              )}
              <span className="pip-label">You (Doctor)</span>
            </div>
          </div>

          <div className="video-clinical-sidebar">
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#38BDF8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              </svg>
              Clinical Tele-Consultation Desk
            </div>

            <div className="in-call-card">
              <div style={{ color: '#94A3B8', fontSize: '11px', marginBottom: '4px', fontWeight: '700' }}>SESSION DETAILS</div>
              <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                <div><span style={{ color: '#94A3B8' }}>Room ID:</span> <code style={{ color: '#38BDF8' }}>{room.roomId || room.appointmentId || 'ACTIVE-CALL'}</code></div>
                {room.patientName && <div><span style={{ color: '#94A3B8' }}>Patient:</span> <strong>{room.patientName}</strong></div>}
                {room.receiptId && <div><span style={{ color: '#94A3B8' }}>Receipt:</span> <strong>{room.receiptId}</strong></div>}
                {room.department && <div><span style={{ color: '#94A3B8' }}>Department:</span> {room.department}</div>}
              </div>
            </div>

            <div className="in-call-card">
              <div style={{ color: '#94A3B8', fontSize: '11px', marginBottom: '4px', fontWeight: '700' }}>PATIENT CONSULTATION REASON</div>
              {room.issueDescription ? (
                <div style={{ fontSize: '12.5px', color: '#F1F5F9', lineHeight: '1.5', background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '6px', border: '1px solid #334155' }}>
                  "{room.issueDescription}"
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>Tele-consultation requested by patient.</div>
              )}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0', display: 'block', marginBottom: '6px' }}>
                In-Call Clinical Advice / Prescription Note:
              </label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Doctor can type quick advice or medicine modification..."
                value={doctorNote}
                onChange={(e) => setDoctorNote(e.target.value)}
                style={{ background: '#0F172A', borderColor: '#334155', color: '#FFFFFF', fontSize: '12.5px' }}
              />
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px', fontSize: '12px' }}
                onClick={() => {
                  onToast('In-call medical advice dispatched to patient health locker');
                  setDoctorNote('');
                }}
              >
                Send Prescription Note
              </button>
            </div>
          </div>
        </div>

        <div className="video-consult-footer">
          <button 
            className={`control-circle-btn ${isAudioMuted ? 'active-off' : ''}`} 
            onClick={toggleAudio}
            title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
            aria-label="Toggle Microphone"
          >
            {isAudioMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
          <button 
            className={`control-circle-btn ${isVideoOff ? 'active-off' : ''}`} 
            onClick={toggleVideo}
            title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
            aria-label="Toggle Camera"
          >
            {isVideoOff ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="m16 16 5 3V8l-5 3"/>
                <rect x="2" y="6" width="14" height="12" rx="2"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            )}
          </button>
          <button 
            className="control-circle-btn" 
            onClick={() => onToast('Screen sharing initialized')}
            title="Share Screen"
            aria-label="Share Screen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          <button 
            className="control-circle-btn end-call" 
            onClick={onClose}
            title="End Call"
            aria-label="End Call"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Standalone Doctor Login Gate
function DoctorLoginGate({ onLoginSuccess, onToast }) {
  const [regNo, setRegNo] = useState('TMC-48291');
  const [password, setPassword] = useState('doctor123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          regNo: regNo.trim(), 
          password: password.trim(),
          pin: password.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.doctor) {
        onToast(`Welcome, ${data.doctor.name}`);
        onLoginSuccess(data.doctor);
      } else {
        onToast(data.message || 'Invalid registration number or password', 'error');
      }
    } catch (err) {
      onToast('Server connection error during doctor authentication', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO_SRC} alt="Government of Tamil Nadu" style={{ width: '48px', height: '48px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#046A38', fontWeight: '800' }}>தமிழ்நாடு அரசு • மக்கள் நல்வாழ்வுத்துறை</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Tamil Nadu Medical Council • Physician Portal</div>
            </div>
          </div>
          <a href="/" style={{ fontSize: '13.5px', color: '#0F4C81', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Public Hospital Portal
          </a>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '460px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src={LOGO_SRC} alt="Emblem" style={{ width: '56px', height: '56px', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Doctor Clinical Access</h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              State Government Tertiary Care OPD Workbench & Electronic Medical Records (EMR)
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Medical Council Registration No.
              </label>
              <input 
                type="text" 
                className="form-control" 
                value={regNo} 
                onChange={(e) => setRegNo(e.target.value)} 
                placeholder="e.g. TMC-48291" 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Physician Access Password
              </label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter doctor passcode" 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{ width: '100%', padding: '12px', fontSize: '14.5px', fontWeight: '700', background: '#0F4C81', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Doctor Clinical Workbench'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>
            Authorized Medical Council Personnel Only • Tamil Nadu Health System Reform Project
          </div>
        </div>
      </div>
    </div>
  );
}

const INITIAL_CARDIOLOGY_PATIENTS = [
  {
    id: 'p-101',
    tokenNum: '01',
    name: 'Karthikeyan Subramanian',
    initials: 'KS',
    receiptId: 'TN-REC-8841',
    abhaId: '14-9923-4512-7801',
    age: 48,
    gender: 'Male',
    bloodGroup: 'O +ve',
    isUrgent: true,
    status: 'In Clinic',
    hasUrgentBorder: false,
    diagnosis: 'Ischemic Heart Disease (Mild CAD) - Stabilized, Essential Hypertension (Stage 1)',
    clinicalNotes: 'Patient presented with atypical chest pain on exertion. Troponin T negative. 2D Echo showed normal LV systolic function (LVEF 58%). Coronary angiography showed single vessel 40% stenosis in mid-LAD, managed medically. Hemodynamically stable upon discharge.',
    followUp: '18-Sep-2026 at Cardiology OPD, Room 104',
    vitals: { bp: '130/84 mmHg', pulse: '74 bpm', spo2: '99%', temp: '98.4 °F', bloodSugarFasting: '102 mg/dL', bmi: '24.2', weight: '72 kg' },
    prescriptions: [
      { medicine: 'Tab. Telmisartan', dosage: '40 mg', frequency: '1 - 0 - 0', timing: 'After Food', duration: '30 Days' },
      { medicine: 'Tab. Atorvastatin', dosage: '20 mg', frequency: '0 - 0 - 1', timing: 'After Dinner', duration: '30 Days' },
      { medicine: 'Tab. Aspirin (Ecosprin)', dosage: '75 mg', frequency: '0 - 1 - 0', timing: 'After Lunch', duration: '30 Days' },
      { medicine: 'Tab. Metoprolol Succinate', dosage: '25 mg', frequency: '1 - 0 - 0', timing: 'After Breakfast', duration: '30 Days' }
    ],
    labReports: [
      { testName: 'High Sensitivity Troponin T (hs-cTnT)', date: '08-Sep-2026', result: '< 0.014 ng/mL', normalRange: '< 0.014 ng/mL', status: 'Normal' },
      { testName: 'Lipid Profile - Total Cholesterol', date: '08-Sep-2026', result: '178 mg/dL', normalRange: '125 - 200 mg/dL', status: 'Optimal' },
      { testName: '12-Lead Electrocardiogram (ECG)', date: '08-Sep-2026', result: 'Normal Sinus Rhythm, No ST-T changes', normalRange: 'Normal Sinus Rhythm', status: 'Normal' },
      { testName: '2D Echocardiography (Echo)', date: '07-Sep-2026', result: 'LVEF 58%, No regional wall motion abnormality', normalRange: 'LVEF 55 - 70%', status: 'Normal' },
      { testName: 'Coronary Angiogram (CAG)', date: '06-Sep-2026', result: 'Single vessel mild disease (40% mid-LAD)', normalRange: 'No obstructive lesions', status: 'Evaluated' }
    ],
    pastRecords: [
      { id: 'REC-01', title: 'Cardiology Discharge Summary', date: '08-Sep-2026', hospital: 'Govt Multi Super Speciality Hospital, Omandurar', type: 'Discharge Summary' },
      { id: 'REC-02', title: 'Hypertension Staging Consultation Note', date: '14-Jun-2026', hospital: 'Rajiv Gandhi Govt General Hospital, Chennai', type: 'OPD Note' },
      { id: 'REC-03', title: 'Preventive Cardiology Screening', date: '10-Jan-2026', hospital: 'Govt Stanley Medical College Hospital', type: 'Health Check' }
    ],
    oldReceipts: [
      { receiptNo: 'TN-REC-8841', date: '05-Sep-2026', department: 'Cardiology Super-Speciality', fee: '₹ 0 (CMCHIS Free Scheme)' },
      { receiptNo: 'TN-REC-5512', date: '14-Jun-2026', department: 'General Medicine OPD', fee: '₹ 0 (Govt Free OPD)' },
      { receiptNo: 'TN-REC-3209', date: '10-Jan-2026', department: 'Preventive Health Check', fee: '₹ 0 (Govt Free OPD)' }
    ]
  },
  {
    id: 'p-102',
    tokenNum: '02',
    name: 'Priya Ramanathan',
    initials: 'PR',
    receiptId: 'TN-REC-4920',
    abhaId: '14-8832-9011-3421',
    age: 34,
    gender: 'Female',
    bloodGroup: 'B +ve',
    isUrgent: false,
    status: 'Waiting',
    hasUrgentBorder: false,
    diagnosis: 'Type 2 Diabetes Mellitus (Newly Detected), Subclinical Hypothyroidism',
    clinicalNotes: 'Routine endocrine review. Fasting blood glucose elevated (142 mg/dL). Thyroid profile indicates elevated TSH (6.2 uIU/mL). Advised dietary modifications, regular brisk walking, and started on Metformin 500mg BD.',
    followUp: '25-Sep-2026 at Endocrinology OPD',
    vitals: { bp: '118/76 mmHg', pulse: '78 bpm', spo2: '98%', temp: '98.6 °F', bloodSugarFasting: '142 mg/dL', bmi: '25.8', weight: '64 kg' },
    prescriptions: [
      { medicine: 'Tab. Metformin HCl', dosage: '500 mg', frequency: '1 - 0 - 1', timing: 'With Meals', duration: '30 Days' },
      { medicine: 'Tab. Thyronorm', dosage: '25 mcg', frequency: '1 - 0 - 0', timing: 'Empty Stomach in Morning', duration: '30 Days' }
    ],
    labReports: [
      { testName: 'HbA1c Glycated Hemoglobin', date: '10-Sep-2026', result: '7.4 %', normalRange: '< 5.7 %', status: 'Elevated' },
      { testName: 'Serum TSH (Ultrasensitive)', date: '10-Sep-2026', result: '6.2 uIU/mL', normalRange: '0.4 - 4.2 uIU/mL', status: 'Elevated' },
      { testName: 'Serum Creatinine', date: '10-Sep-2026', result: '0.8 mg/dL', normalRange: '0.6 - 1.1 mg/dL', status: 'Normal' }
    ],
    pastRecords: [
      { id: 'REC-04', title: 'Annual Health Check Profile', date: '10-Sep-2026', hospital: 'Govt Multi Super Speciality Hospital, Omandurar', type: 'Lab Summary' }
    ],
    oldReceipts: [
      { receiptNo: 'TN-REC-4920', date: '10-Sep-2026', department: 'Endocrinology OPD', fee: '₹ 0 (Free OPD)' }
    ]
  },
  {
    id: 'p-103',
    tokenNum: '03',
    name: 'Selvaraj Murugesan',
    initials: 'SM',
    receiptId: 'TN-REC-7731',
    abhaId: '14-3451-8729-1102',
    age: 62,
    gender: 'Male',
    bloodGroup: 'A +ve',
    isUrgent: true,
    status: 'Waiting',
    hasUrgentBorder: true,
    diagnosis: 'Right Knee Primary Osteoarthritis (Grade IV Kellgren-Lawrence) - Post Total Knee Arthroplasty (TKA)',
    clinicalNotes: 'Post-operative week 3 review following Right TKA. Surgical wound healed cleanly with healthy scar formation. Active knee flexion measured at 95 degrees. Advised ongoing quadriceps strengthening and gait training.',
    followUp: '02-Oct-2026 at Ortho Post-Op Clinic',
    vitals: { bp: '138/88 mmHg', pulse: '76 bpm', spo2: '97%', temp: '98.2 °F', bloodSugarFasting: '110 mg/dL', bmi: '27.4', weight: '76 kg' },
    prescriptions: [
      { medicine: 'Tab. Paracetamol', dosage: '650 mg', frequency: '1 - 0 - 1', timing: 'After Food (SOS)', duration: '10 Days' },
      { medicine: 'Tab. Calcium + Vitamin D3', dosage: '500 mg', frequency: '0 - 1 - 0', timing: 'After Lunch', duration: '60 Days' }
    ],
    labReports: [
      { testName: 'Post-Op Digital X-Ray Right Knee (AP & Lat)', date: '04-Sep-2026', result: 'Prosthesis in optimal alignment, no loosening', normalRange: 'Anatomical Alignment', status: 'Normal' },
      { testName: 'C-Reactive Protein (CRP)', date: '04-Sep-2026', result: '4.8 mg/L', normalRange: '< 5.0 mg/L', status: 'Normal' }
    ],
    pastRecords: [
      { id: 'REC-05', title: 'Orthopaedic In-Patient Discharge Summary', date: '04-Sep-2026', hospital: 'Govt Multi Super Speciality Hospital, Omandurar', type: 'Discharge Summary' }
    ],
    oldReceipts: [
      { receiptNo: 'TN-REC-7731', date: '01-Sep-2026', department: 'Orthopaedics & Joint Replacement', fee: '₹ 0 (CMCHIS Free Scheme)' }
    ]
  },
  {
    id: 'p-104',
    tokenNum: '04',
    name: 'Sundar Pichai',
    initials: 'SP',
    receiptId: 'TN-REC-2844',
    abhaId: '14-1102-9938-4451',
    age: 52,
    gender: 'Male',
    bloodGroup: 'O +ve',
    isUrgent: false,
    status: 'Waiting',
    hasUrgentBorder: false,
    diagnosis: 'Healthy Individual - Periodic Routine Evaluation Scheduled',
    clinicalNotes: 'Annual executive cardiac health screening. Resting 12-lead ECG demonstrates normal sinus rhythm with physiological intervals. Lipid panel and renal markers all within ideal ranges. Encouraged daily 30-minute moderate aerobic exercise.',
    followUp: '12-Mar-2027 at Executive Wellness OPD',
    vitals: { bp: '122/80 mmHg', pulse: '68 bpm', spo2: '99%', temp: '98.4 °F', bloodSugarFasting: '92 mg/dL', bmi: '22.9', weight: '70 kg' },
    prescriptions: [
      { medicine: 'Tab. Multivitamin & Minerals', dosage: '1 Tab', frequency: '0 - 1 - 0', timing: 'After Lunch', duration: '30 Days' }
    ],
    labReports: [
      { testName: 'Comprehensive Cardiac Executive Profile', date: '11-Sep-2026', result: 'All parameters normal, CAC score 0', normalRange: 'Normal', status: 'Normal' }
    ],
    pastRecords: [
      { id: 'REC-06', title: 'Executive Wellness Report', date: '11-Sep-2026', hospital: 'Govt Multi Super Speciality Hospital, Omandurar', type: 'Annual Review' }
    ],
    oldReceipts: [
      { receiptNo: 'TN-REC-2844', date: '11-Sep-2026', department: 'Executive Preventive OPD', fee: '₹ 0 (Govt Free OPD)' }
    ]
  },
  {
    id: 'p-105',
    tokenNum: '05',
    name: 'Meenakshi Sundaram',
    initials: 'MS',
    receiptId: 'TN-REC-6645',
    abhaId: '14-7762-3341-9980',
    age: 31,
    gender: 'Female',
    bloodGroup: 'AB +ve',
    isUrgent: false,
    status: 'Waiting',
    hasUrgentBorder: false,
    diagnosis: 'Pre-existing: Mild Asthma',
    clinicalNotes: 'Complaints of intermittent seasonal cough and mild nocturnal wheezing during climatic shifts. Chest auscultation shows clear vesicular breath sounds with bilateral end-expiratory rhonchi. Metered dose inhaler technique demonstrated.',
    followUp: '20-Oct-2026 at Pulmonary Medicine OPD',
    vitals: { bp: '116/74 mmHg', pulse: '76 bpm', spo2: '98%', temp: '98.6 °F', bloodSugarFasting: '88 mg/dL', bmi: '21.8', weight: '56 kg' },
    prescriptions: [
      { medicine: 'Inhaler Budesonide + Formoterol', dosage: '200/6 mcg', frequency: '1 - 0 - 1', timing: 'Inhalation via Spacer (SOS)', duration: '60 Days' },
      { medicine: 'Tab. Montelukast Sodium', dosage: '10 mg', frequency: '0 - 0 - 1', timing: 'At Bedtime', duration: '30 Days' }
    ],
    labReports: [
      { testName: 'Pulmonary Function Spirometry (PFT)', date: '09-Sep-2026', result: 'Mild Reversible Airway Obstruction', normalRange: 'FEV1/FVC > 75%', status: 'Evaluated' }
    ],
    pastRecords: [
      { id: 'REC-07', title: 'Pulmonology Consultation Summary', date: '09-Sep-2026', hospital: 'Govt Multi Super Speciality Hospital, Omandurar', type: 'OPD Note' }
    ],
    oldReceipts: [
      { receiptNo: 'TN-REC-6645', date: '09-Sep-2026', department: 'Pulmonary OPD', fee: '₹ 0 (Govt Free OPD)' }
    ]
  }
];

function DoctorStandaloneApp() {
  const [doctorSession, setDoctorSession] = useState(() => {
    try {
      const saved = localStorage.getItem('tn_doctor_session');
      return saved ? JSON.parse(saved) : {
        name: 'Dr. S. K. Aravind',
        qualification: 'MD (Gen Med), DM (Cardiology), FACC',
        department: 'Cardiology',
        regNo: 'TMC-48291',
        hospital: 'Government Multi Super Speciality Hospital, Omandurar, Chennai'
      };
    } catch (e) {
      return {
        name: 'Dr. S. K. Aravind',
        qualification: 'MD (Gen Med), DM (Cardiology), FACC',
        department: 'Cardiology',
        regNo: 'TMC-48291',
        hospital: 'Government Multi Super Speciality Hospital, Omandurar, Chennai'
      };
    }
  });

  const handleDoctorLoginSuccess = (doc) => {
    try {
      localStorage.setItem('tn_doctor_session', JSON.stringify(doc));
    } catch (e) {}
    setDoctorSession(doc);
  };

  const handleDoctorLogout = () => {
    try {
      localStorage.removeItem('tn_doctor_session');
    } catch (e) {}
    setDoctorSession(null);
    addToast('Doctor session ended successfully', 'info');
  };

  const [queue, setQueue] = useState(INITIAL_CARDIOLOGY_PATIENTS);
  const [selectedQueuePatient, setSelectedQueuePatient] = useState(INITIAL_CARDIOLOGY_PATIENTS[0]);
  const [activeSideTab, setActiveSideTab] = useState('queue'); // 'queue' | 'schedules'
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState('notes'); // 'notes' | 'vitals' | 'prescriptions' | 'labs' | 'past' | 'receipts'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoRoom, setActiveVideoRoom] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [appointments, setAppointments] = useState([
    {
      id: 'APT-101',
      patientName: 'Karthikeyan Subramanian',
      receiptId: 'TN-REC-8841',
      department: 'Cardiology',
      requestedDate: 'Today',
      requestedTime: '12:30 PM',
      issueDescription: 'Mild exertion tightness, request follow-up video review with Dr. Aravind.',
      status: 'Pending'
    },
    {
      id: 'APT-102',
      patientName: 'Selvaraj Murugesan',
      receiptId: 'TN-REC-7731',
      department: 'Cardiology',
      requestedDate: 'Today',
      requestedTime: '01:15 PM',
      issueDescription: 'Post-op knee swelling and blood pressure reading check.',
      status: 'Pending'
    }
  ]);

  // Workbench Form State
  const [diagnosis, setDiagnosis] = useState(INITIAL_CARDIOLOGY_PATIENTS[0].diagnosis);
  const [clinicalNotes, setClinicalNotes] = useState(INITIAL_CARDIOLOGY_PATIENTS[0].clinicalNotes);
  const [followUp, setFollowUp] = useState(INITIAL_CARDIOLOGY_PATIENTS[0].followUp);
  const [prescriptions, setPrescriptions] = useState(INITIAL_CARDIOLOGY_PATIENTS[0].prescriptions);
  const [newMed, setNewMed] = useState({ medicine: '', dosage: '', frequency: '1 - 0 - 0', timing: 'After Food', duration: '15 Days' });

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const selectPatient = (pt) => {
    setSelectedQueuePatient(pt);
    setDiagnosis(pt.diagnosis || pt.clinicalSummary?.diagnosis || '');
    setClinicalNotes(pt.clinicalNotes || pt.clinicalSummary?.clinicalNotes || '');
    setFollowUp(pt.followUp || '18-Sep-2026 at Cardiology OPD, Room 104');
    setPrescriptions(pt.prescriptions ? [...pt.prescriptions] : []);
  };

  const handleAttendPriorityCase = () => {
    // Select first urgent patient (Selvaraj or Karthikeyan)
    const urgentPt = queue.find(q => q.isUrgent && q.id !== selectedQueuePatient.id) || queue.find(q => q.isUrgent);
    if (urgentPt) {
      selectPatient(urgentPt);
      addToast(`Switched to priority triage patient: ${urgentPt.name}`);
    }
  };

  const handleInsertSoapTemplate = () => {
    const soapTemplate = `SUBJECTIVE:\nPatient reports improvement in symptoms with current medication regimen.\n\nOBJECTIVE:\nGeneral condition fair, afebrile, clear chest sounds, cardiovascular S1/S2 heard normal.\n\nASSESSMENT:\nStable cardiac status under medical management.\n\nPLAN:\nContinue existing medications, re-evaluate during scheduled OPD review.`;
    setClinicalNotes(soapTemplate);
    addToast('SOAP clinical documentation template inserted');
  };

  const handleQuickSelectDiagnosis = (term) => {
    if (diagnosis.includes(term)) return;
    const updated = diagnosis ? `${diagnosis}, ${term}` : term;
    setDiagnosis(updated);
    addToast(`Added '${term}' to diagnosis`);
  };

  const handleSetFollowUpDate = (period) => {
    let dateStr = '';
    const now = new Date();
    if (period === '1w') now.setDate(now.getDate() + 7);
    else if (period === '2w') now.setDate(now.getDate() + 14);
    else if (period === '1m') now.setMonth(now.getMonth() + 1);
    else if (period === '3m') now.setMonth(now.getMonth() + 3);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = String(now.getDate()).padStart(2, '0');
    const m = months[now.getMonth()];
    const y = now.getFullYear();
    dateStr = `${d}-${m}-${y} at Cardiology OPD, Room 104`;
    setFollowUp(dateStr);
    addToast(`Follow-up schedule set: ${dateStr}`);
  };

  const handleSaveEMR = async (e) => {
    if (e) e.preventDefault();
    if (!selectedQueuePatient) return;

    // Update in local state
    const updatedQueue = queue.map(q => {
      if (q.id === selectedQueuePatient.id) {
        return {
          ...q,
          diagnosis,
          clinicalNotes,
          followUp,
          prescriptions
        };
      }
      return q;
    });
    setQueue(updatedQueue);
    setSelectedQueuePatient(prev => ({
      ...prev,
      diagnosis,
      clinicalNotes,
      followUp,
      prescriptions
    }));
    addToast(`EMR saved & verified for ${selectedQueuePatient.name}`);
  };

  const handleAddPrescription = () => {
    if (!newMed.medicine.trim()) {
      addToast('Please enter medicine name', 'error');
      return;
    }
    setPrescriptions([...prescriptions, { ...newMed }]);
    setNewMed({ medicine: '', dosage: '', frequency: '1 - 0 - 0', timing: 'After Food', duration: '15 Days' });
    addToast('Medication added to prescription');
  };

  const handleRemovePrescription = (idx) => {
    const updated = prescriptions.filter((_, i) => i !== idx);
    setPrescriptions(updated);
    addToast('Medication removed');
  };

  const handleStartVideo = () => {
    if (!selectedQueuePatient) return;
    setActiveVideoRoom({
      roomId: `ROOM_${selectedQueuePatient.receiptId.replace(/[^a-zA-Z0-9]/g, '')}`,
      patientName: selectedQueuePatient.name,
      receiptId: selectedQueuePatient.receiptId,
      department: 'Cardiology Super-Speciality',
      role: 'doctor'
    });
    addToast(`Starting HD Teleconsultation with ${selectedQueuePatient.name}...`);
  };

  const handleMarkComplete = () => {
    handleSaveEMR();
    addToast(`Consultation for ${selectedQueuePatient.name} completed successfully!`);
  };

  // Filtered queue based on search input
  const filteredQueue = queue.filter(q => {
    if (!searchQuery.trim()) return true;
    const qLower = searchQuery.toLowerCase();
    return (
      q.name.toLowerCase().includes(qLower) ||
      q.receiptId.toLowerCase().includes(qLower) ||
      (q.diagnosis && q.diagnosis.toLowerCase().includes(qLower))
    );
  });

  if (!doctorSession) {
    return (
      <div>
        <ToastList toasts={toasts} />
        <DoctorLoginGate onLoginSuccess={handleDoctorLoginSuccess} onToast={addToast} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Top Dark Navy Accent Strip */}
      <div className="top-navy-strip"></div>

      <ToastList toasts={toasts} />

      {/* Institutional Top Header */}
      <header style={{ background: '#FFFFFF', borderBottom: '1.5px solid #E2E8F0', padding: '12px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Header Left: Emblem Logo, Name, Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', padding: '2px' }}>
              <img src={LOGO_SRC} alt="Government of Tamil Nadu" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#046A38', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  TAMIL NADU MEDICAL COUNCIL
                </span>
                <span style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                  Cardiology Speciality
                </span>
              </div>
              <h1 style={{ fontSize: '18.5px', fontWeight: '800', color: '#0F172A', margin: '2px 0 0 0', lineHeight: '1.2' }}>
                {doctorSession.name || 'Dr. S. K. Aravind'}
              </h1>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>
                {doctorSession.qualification || 'MD (Gen Med), DM (Cardiology), FACC'}
              </div>
            </div>
          </div>

          {/* Header Right: Public Portal button + Sign Out button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a 
              href="/" 
              style={{ 
                background: '#FFFFFF', 
                border: '1.5px solid #CBD5E1', 
                color: '#0F172A', 
                fontSize: '13px', 
                fontWeight: '700', 
                padding: '7px 14px', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Public Portal
            </a>

            <button 
              style={{ 
                background: '#DC2626', 
                color: '#FFFFFF', 
                border: 'none', 
                fontSize: '13px', 
                fontWeight: '700', 
                padding: '7px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer' 
              }}
              onClick={handleDoctorLogout}
            >
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, padding: '16px 0 40px' }}>

        {/* Coral Priority Triage Banner */}
        <div className="triage-priority-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="triage-pulse-dot"></span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#B91C1C' }}>
              PRIORITY TRIAGE: 3 patient(s) flagged with acute/urgent clinical complaints.
            </span>
          </div>
          <button 
            style={{ 
              background: '#DC2626', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '6px 14px', 
              fontSize: '12px', 
              fontWeight: '700', 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={handleAttendPriorityCase}
          >
            Attend Priority Case Immediately →
          </button>
        </div>

        {/* Quick Stats Overview: Today's Appointments & Patient Count */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          {/* Card 1: Today's Appointments */}
          <div style={{ 
            background: '#FFFFFF', 
            border: '1.5px solid #E2E8F0', 
            borderRadius: '12px', 
            padding: '14px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '10px', 
              background: '#EFF6FF', 
              color: '#0284C7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Today's Appointments
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', lineHeight: '1.2' }}>
                {appointments.length} <span style={{ fontSize: '12px', fontWeight: '600', color: '#0284C7' }}>Total</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                <strong style={{ color: '#D97706' }}>{appointments.filter(a => a.status === 'Pending').length} Pending</strong> • <strong style={{ color: '#046A38' }}>{appointments.filter(a => a.status === 'Confirmed').length} Confirmed</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Today's Patient Count */}
          <div style={{ 
            background: '#FFFFFF', 
            border: '1.5px solid #E2E8F0', 
            borderRadius: '12px', 
            padding: '14px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '10px', 
              background: '#F0FDF4', 
              color: '#046A38', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Today's Patient Count
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', lineHeight: '1.2' }}>
                {queue.length} <span style={{ fontSize: '12px', fontWeight: '600', color: '#046A38' }}>Patients</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                <strong style={{ color: '#046A38' }}>{queue.filter(q => q.status === 'In Clinic').length} In Clinic</strong> • <strong style={{ color: '#2563EB' }}>{queue.filter(q => q.status === 'Waiting').length} Waiting</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Priority Triage */}
          <div style={{ 
            background: '#FFFFFF', 
            border: '1.5px solid #FEE2E2', 
            borderRadius: '12px', 
            padding: '14px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '10px', 
              background: '#FEF2F2', 
              color: '#DC2626', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Priority Triage
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#B91C1C', lineHeight: '1.2' }}>
                {queue.filter(q => q.isUrgent).length} <span style={{ fontSize: '12px', fontWeight: '600', color: '#DC2626' }}>Urgent</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                Acute clinical complaint flagged
              </div>
            </div>
          </div>

          {/* Card 4: Clinical EMR Status */}
          <div style={{ 
            background: '#FFFFFF', 
            border: '1.5px solid #E2E8F0', 
            borderRadius: '12px', 
            padding: '14px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '10px', 
              background: '#F5F3FF', 
              color: '#7C3AED', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Patient
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', lineHeight: '1.3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                {selectedQueuePatient ? selectedQueuePatient.name.split(' ')[0] : 'None'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                Token #{selectedQueuePatient?.tokenNum || '01'} ({selectedQueuePatient?.gender})
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split Workbench Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(310px, 330px) 1fr', gap: '22px', alignItems: 'start' }}>
          
          {/* LEFT SIDEBAR: Duty Card + Pills + Search + Token List */}
          <div>
            
            {/* Clinical Duty Physician Card */}
            <div className="physician-duty-card">
              <div className="physician-duty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '9.5px', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  CLINICAL DUTY PHYSICIAN
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF', marginTop: '1px' }}>
                  Dr. S. K. Aravind, MD, DM
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Chief Consultant & HOD
                </div>
              </div>
            </div>

            {/* OPD Queue & Schedules Pills */}
            <div className="pill-nav-group">
              <button 
                className={`pill-nav-btn ${activeSideTab === 'queue' ? 'active' : ''}`}
                onClick={() => setActiveSideTab('queue')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Today's Patients</span>
                <span className="pill-count-badge">{queue.length}</span>
              </button>

              <button 
                className={`pill-nav-btn ${activeSideTab === 'schedules' ? 'active' : ''}`}
                onClick={() => setActiveSideTab('schedules')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Today's Appointments</span>
                <span className="pill-count-badge">{appointments.length}</span>
              </button>
            </div>

            {/* Search Input Box */}
            <div className="queue-search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                className="queue-search-input"
                placeholder="Search queue by name, receipt, or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Patient Token Cards List (when Queue tab active) */}
            {activeSideTab === 'queue' && (
              <div>
                {filteredQueue.length === 0 ? (
                  <div style={{ background: '#FFFFFF', padding: '24px', textAlign: 'center', borderRadius: '10px', color: '#64748B', fontSize: '13px' }}>
                    No patients match your search.
                  </div>
                ) : (
                  filteredQueue.map((pt) => {
                    const isSelected = selectedQueuePatient && selectedQueuePatient.id === pt.id;
                    const isUrgentBorder = pt.hasUrgentBorder || (pt.isUrgent && pt.tokenNum === '03');

                    return (
                      <div 
                        key={pt.id}
                        className={`patient-token-card ${isSelected ? 'active' : ''} ${isUrgentBorder ? 'urgent-indicator' : ''}`}
                        onClick={() => selectPatient(pt)}
                      >
                        {/* Token Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: isSelected ? '#0284C7' : '#64748B' }}>
                            TOKEN #{pt.tokenNum}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {pt.isUrgent && (
                              <span className="badge-urgent">URGENT</span>
                            )}
                            {pt.status === 'In Clinic' ? (
                              <span className="badge-inclinic">In Clinic</span>
                            ) : (
                              <span className="badge-waiting">Waiting</span>
                            )}
                          </div>
                        </div>

                        {/* Patient Name */}
                        <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#0F172A', margin: '2px 0' }}>
                          {pt.name}
                        </div>

                        {/* Receipt and Age */}
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Receipt: <strong>{pt.receiptId}</strong> | Age: {pt.age} ({pt.gender})
                        </div>

                        {/* Diagnosis Tag Line */}
                        <div style={{ fontSize: '11.5px', color: '#0284C7', fontWeight: '600', marginTop: '3px', lineHeight: '1.35' }}>
                          {pt.diagnosis}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Requested Schedules Panel (when Schedules tab active) */}
            {activeSideTab === 'schedules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {appointments.map((apt) => (
                  <div 
                    key={apt.id}
                    style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '12px 14px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                          {apt.department}
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                          {apt.patientName}
                        </div>
                      </div>
                      <span className="badge-urgent">Pending</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', margin: '4px 0' }}>
                      Receipt: <strong>{apt.receiptId}</strong> • Slot: <strong>{apt.requestedTime}</strong>
                    </div>
                    <p style={{ margin: '4px 0 8px', fontSize: '12px', color: '#334155', fontStyle: 'italic', background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px' }}>
                      "{apt.issueDescription}"
                    </p>
                    <button 
                      className="btn-start-video-blue"
                      style={{ width: '100%', justifyContent: 'center', padding: '6px 12px', fontSize: '12px' }}
                      onClick={handleStartVideo}
                    >
                      Connect Video Consultation
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: MAIN EMR CONSULTATION WORKBENCH */}
          <div>
            {selectedQueuePatient && (
              <div>
                
                {/* 1. Large Patient Header Card */}
                <div className="emr-header-card">
                  {/* Green Confidential Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ACTIVE CONSULTATION EMR FILE • CONFIDENTIAL
                    </span>
                  </div>

                  {/* Patient Initials Avatar + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div className="emr-initials-box">
                      {selectedQueuePatient.initials || 'PT'}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: '1.2' }}>
                        {selectedQueuePatient.name}
                      </h2>
                      {/* Tags Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        <span className="emr-tag-pill">
                          Receipt: <strong>{selectedQueuePatient.receiptId}</strong>
                        </span>
                        <span className="emr-tag-pill green-border">
                          ABHA: <strong>{selectedQueuePatient.abhaId}</strong>
                        </span>
                        <span className="emr-tag-pill">
                          Age: <strong>{selectedQueuePatient.age} ({selectedQueuePatient.gender})</strong>
                        </span>
                        <span className="emr-tag-pill coral-border">
                          Blood: <strong>{selectedQueuePatient.bloodGroup}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Patient Action Controls Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                    <button className="btn-start-video-blue" onClick={handleStartVideo}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                      Start Video Call
                    </button>
                  </div>
                </div>

                {/* 2. Horizontal Workbench Tabs */}
                <div className="emr-horizontal-tabs">
                  <button 
                    className={`emr-tab-pill ${activeWorkbenchTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('notes')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Clinical Notes
                  </button>

                  <button 
                    className={`emr-tab-pill ${activeWorkbenchTab === 'vitals' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('vitals')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Vital Signs
                  </button>

                  <button 
                    className={`emr-tab-pill ${activeWorkbenchTab === 'prescriptions' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('prescriptions')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                    </svg>
                    Prescriptions <span style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>{prescriptions.length}</span>
                  </button>

                  <button 
                    className={`emr-tab-pill ${activeWorkbenchTab === 'labs' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('labs')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 2v7.31"/>
                      <path d="M14 9.3V2"/>
                      <path d="M8.5 2h7"/>
                      <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
                      <path d="M5.52 16h12.96"/>
                    </svg>
                    Lab Reports <span style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>{selectedQueuePatient.labReports?.length || 5}</span>
                  </button>

                  <button 
                    className={`emr-tab-pill ${activeWorkbenchTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('past')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    </svg>
                    Past E-Records <span style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>{selectedQueuePatient.pastRecords?.length || 3}</span>
                  </button>

                  <button 
                    className={`emr-tab-pill ${activeWorkbenchTab === 'receipts' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('receipts')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <line x1="6" y1="8" x2="18" y2="8"/>
                      <line x1="6" y1="12" x2="18" y2="12"/>
                    </svg>
                    Old Receipts <span style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>{selectedQueuePatient.oldReceipts?.length || 3}</span>
                  </button>
                </div>

                {/* TAB 1: CLINICAL NOTES (Matches Screenshot Section by Section) */}
                {activeWorkbenchTab === 'notes' && (
                  <div>
                    
                    {/* Section 1: Clinical Diagnosis & Assessment Findings */}
                    <div className="emr-section-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                          <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                              Clinical Diagnosis & Assessment Findings
                            </h3>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              Primary Diagnostic Staging & Cardiac Assessment
                            </div>
                          </div>
                        </div>

                        <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                          ICD-10 Clinical Standard
                        </span>
                      </div>

                      {/* Quick Select Chips Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '10px 0' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>
                          QUICK SELECT:
                        </span>
                        <button type="button" className="chip-quick-select" onClick={() => handleQuickSelectDiagnosis('CAD (Mild)')}>
                          + CAD (Mild)
                        </button>
                        <button type="button" className="chip-quick-select" onClick={() => handleQuickSelectDiagnosis('HTN Stage 1')}>
                          + HTN Stage 1
                        </button>
                        <button type="button" className="chip-quick-select" onClick={() => handleQuickSelectDiagnosis('T2DM')}>
                          + T2DM
                        </button>
                        <button type="button" className="chip-quick-select" onClick={() => handleQuickSelectDiagnosis('Normal Sinus')}>
                          + Normal Sinus
                        </button>
                        <button type="button" className="chip-quick-select" onClick={() => handleQuickSelectDiagnosis('Post-Angio Stable')}>
                          + Post-Angio Stable
                        </button>
                      </div>

                      {/* Diagnosis Textarea */}
                      <textarea 
                        rows="2"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', color: '#0F172A', outline: 'none', lineHeight: '1.4' }}
                      />
                    </div>

                    {/* Section 2: Physician Progress Notes & Management Strategy */}
                    <div className="emr-section-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                              Physician Progress Notes & Management Strategy
                            </h3>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              SOAP Clinical Documentation & Therapeutic Plan
                            </div>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', color: '#0284C7', padding: '4px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                          onClick={handleInsertSoapTemplate}
                        >
                          + Insert SOAP Template
                        </button>
                      </div>

                      {/* Progress Notes Textarea */}
                      <textarea 
                        rows="4"
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', color: '#0F172A', outline: 'none', lineHeight: '1.5' }}
                      />
                    </div>

                    {/* Section 3: Scheduled Follow-up Date & Clinic Location */}
                    <div className="emr-section-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                            Scheduled Follow-up Date & Clinic Location
                          </h3>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                            Next Consultation & Review Schedule
                          </div>
                        </div>
                      </div>

                      {/* Set Follow-up Chips Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '10px 0' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>
                          SET FOLLOW-UP:
                        </span>
                        <button type="button" className="chip-quick-select" onClick={() => handleSetFollowUpDate('1w')}>
                          + In 1 Week
                        </button>
                        <button type="button" className="chip-quick-select" onClick={() => handleSetFollowUpDate('2w')}>
                          + In 2 Weeks
                        </button>
                        <button type="button" className="chip-quick-select" onClick={() => handleSetFollowUpDate('1m')}>
                          + In 1 Month
                        </button>
                        <button type="button" className="chip-quick-select" onClick={() => handleSetFollowUpDate('3m')}>
                          + In 3 Months
                        </button>
                      </div>

                      {/* Follow-up Input Box */}
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                          📅
                        </span>
                        <input 
                          type="text"
                          value={followUp}
                          onChange={(e) => setFollowUp(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', color: '#0F172A', outline: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Bottom Action Bar (Matches Screenshot Exactly) */}
                    <div className="emr-bottom-bar">
                      <span style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ✓ TNMC EMR Verified
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button 
                          type="button" 
                          style={{ background: '#FFFFFF', border: '1.5px solid #0F172A', color: '#0F172A', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                          onClick={() => setActiveWorkbenchTab('prescriptions')}
                        >
                          Prescriptions (Rx) →
                        </button>

                        <button 
                          type="button" 
                          style={{ background: '#0F2942', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={handleSaveEMR}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                          </svg>
                          Save EMR
                        </button>

                        <button 
                          type="button" 
                          style={{ background: '#046A38', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={handleMarkComplete}
                        >
                          Complete Consultation
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: VITAL SIGNS */}
                {activeWorkbenchTab === 'vitals' && (
                  <div className="emr-section-box">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                      Clinical Vital Signs on Record
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      <div className="vital-card">
                        <div className="vital-label">Blood Pressure</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.bp}</div>
                        <div className="vital-status">Controlled</div>
                      </div>
                      <div className="vital-card">
                        <div className="vital-label">Pulse Rate</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.pulse}</div>
                        <div className="vital-status">Normal Rhythm</div>
                      </div>
                      <div className="vital-card">
                        <div className="vital-label">Oxygen Saturation (SpO2)</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.spo2}</div>
                        <div className="vital-status">Adequate</div>
                      </div>
                      <div className="vital-card">
                        <div className="vital-label">Temperature</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.temp}</div>
                        <div className="vital-status">Afebrile</div>
                      </div>
                      <div className="vital-card">
                        <div className="vital-label">Fasting Blood Sugar</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.bloodSugarFasting}</div>
                        <div className="vital-status">Euglycemic</div>
                      </div>
                      <div className="vital-card">
                        <div className="vital-label">Body Mass Index</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.bmi}</div>
                        <div className="vital-status">Wt: {selectedQueuePatient.vitals?.weight}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: ELECTRONIC PRESCRIPTIONS */}
                {activeWorkbenchTab === 'prescriptions' && (
                  <div className="emr-section-box">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                      Active Electronic Prescription ({prescriptions.length} items)
                    </h3>
                    
                    <div className="table-wrapper" style={{ marginBottom: '20px' }}>
                      <table className="medical-table">
                        <thead>
                          <tr>
                            <th>Medicine &amp; Form</th>
                            <th>Strength</th>
                            <th>Dosage Schedule</th>
                            <th>Timing</th>
                            <th>Duration</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptions.map((m, i) => (
                            <tr key={i}>
                              <td><strong>{m.medicine}</strong></td>
                              <td>{m.dosage}</td>
                              <td><span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>{m.frequency}</span></td>
                              <td>{m.timing}</td>
                              <td>{m.duration}</td>
                              <td>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemovePrescription(i)}
                                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Prescription Adder */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                        Add New Medication Row
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                        <input 
                          type="text" 
                          placeholder="Medicine (e.g. Tab. Telma)"
                          value={newMed.medicine} 
                          onChange={(e) => setNewMed({ ...newMed, medicine: e.target.value })}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Dosage (e.g. 40 mg)"
                          value={newMed.dosage} 
                          onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Frequency (1-0-0)"
                          value={newMed.frequency} 
                          onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Timing (After Food)"
                          value={newMed.timing} 
                          onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Duration (30 Days)"
                          value={newMed.duration} 
                          onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={handleAddPrescription}
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        Add Medication Row
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: DIAGNOSTIC LAB REPORTS */}
                {activeWorkbenchTab === 'labs' && (
                  <div className="emr-section-box">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                      Diagnostic Lab Investigations &amp; Imaging Reports
                    </h3>
                    <div className="table-wrapper">
                      <table className="medical-table">
                        <thead>
                          <tr>
                            <th>Investigation / Test</th>
                            <th>Date</th>
                            <th>Observed Value</th>
                            <th>Reference Range</th>
                            <th>Clinical Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedQueuePatient.labReports?.map((r, i) => (
                            <tr key={i}>
                              <td><strong>{r.testName}</strong></td>
                              <td>{r.date}</td>
                              <td><strong style={{ color: '#0F172A' }}>{r.result}</strong></td>
                              <td>{r.normalRange}</td>
                              <td>
                                <span className={`status-badge ${r.status.toLowerCase().includes('normal') || r.status.toLowerCase().includes('optimal') ? 'status-normal' : 'status-warning'}`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 5: PAST E-RECORDS */}
                {activeWorkbenchTab === 'past' && (
                  <div className="emr-section-box">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                      Past Electronic Health Records &amp; Discharge Summaries
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedQueuePatient.pastRecords?.map((rec, i) => (
                        <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>{rec.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{rec.hospital} • {rec.date}</div>
                          </div>
                          <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700' }}>
                            {rec.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: OLD RECEIPTS */}
                {activeWorkbenchTab === 'receipts' && (
                  <div className="emr-section-box">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                      OPD Registration &amp; Consultation Billing Receipts
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedQueuePatient.oldReceipts?.map((bill, i) => (
                        <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Receipt #{bill.receiptNo}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{bill.department} • {bill.date}</div>
                          </div>
                          <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700' }}>
                            {bill.fee}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </main>

      {/* Live Video Call Modal */}
      {activeVideoRoom && (
        <VideoConsultationModal 
          room={activeVideoRoom}
          onClose={() => {
            setActiveVideoRoom(null);
            addToast('Video consultation ended');
          }}
          onToast={addToast}
        />
      )}

    </div>
  );
}

// Mount Dedicated Doctor Application
const doctorRoot = ReactDOM.createRoot(document.getElementById('doctor-root'));
doctorRoot.render(<DoctorStandaloneApp />);

