// ===========================================================================
// TAMIL NADU HEALTH CARE - DEDICATED STANDALONE CLIENT / PATIENT PORTAL PAGE
// Independent Patient Portal Application (public/js/client-page.jsx)
// Persists session in localStorage to prevent loss on page refresh
// ===========================================================================

const { useState, useEffect, useRef, useCallback } = React;

const LOGO_SRC = (typeof window !== 'undefined' && window.TN_EMBLEM_DATA_URL) 
  ? window.TN_EMBLEM_DATA_URL 
  : '/Tamil_Nadu.webp';

const DEFAULT_PROBLEM_LISTS = {
  "P-1001": [
    {
      id: "PL-101",
      problem: "Ischemic Heart Disease (Single Vessel LAD CAD 40%)",
      icd10: "I25.10",
      category: "Cardiovascular",
      status: "Active",
      severity: "Moderate",
      onsetDate: "14-Oct-2025",
      notes: "Managed medically with Aspirin + Atorvastatin. LVEF 58% on 2D Echo.",
      recordedBy: "Dr. S. K. Aravind, MD, DM"
    },
    {
      id: "PL-102",
      problem: "Essential (Primary) Hypertension",
      icd10: "I10",
      category: "Cardiovascular",
      status: "Active",
      severity: "Mild (Controlled)",
      onsetDate: "18-May-2024",
      notes: "Well controlled on Telmisartan 40mg OD. Target BP < 130/80 mmHg.",
      recordedBy: "Dr. K. Srinivasan, MD"
    },
    {
      id: "PL-103",
      problem: "Mixed Dyslipidemia & Hypercholesterolemia",
      icd10: "E78.5",
      category: "Endocrine & Metabolic",
      status: "Active",
      severity: "Mild",
      onsetDate: "05-Nov-2024",
      notes: "On Atorvastatin 20mg nocte. Low cholesterol diet advised.",
      recordedBy: "Dr. M. Deepa, MD"
    },
    {
      id: "PL-104",
      problem: "Hepatic Steatosis (Grade 1 Fatty Liver)",
      icd10: "K76.0",
      category: "Gastrointestinal",
      status: "In Remission",
      severity: "Mild",
      onsetDate: "05-Nov-2024",
      notes: "Identified on ultrasound. Aerobic exercise & weight management advised.",
      recordedBy: "Dr. M. Deepa, MD"
    }
  ],
  "P-1004": [
    {
      id: "PL-401",
      problem: "Atypical Non-Cardiac Chest Wall Sensitivity",
      icd10: "R07.89",
      category: "Musculoskeletal",
      status: "Active",
      severity: "Mild",
      onsetDate: "12-Feb-2026",
      notes: "Musculoskeletal trigger points. Normal 12-lead ECG and 2D Echo.",
      recordedBy: "Dr. M. Venkat, MD"
    },
    {
      id: "PL-402",
      problem: "Physiological Sinus Bradycardia",
      icd10: "R00.1",
      category: "Cardiovascular",
      status: "Active",
      severity: "Mild",
      onsetDate: "07-Sep-2026",
      notes: "Asymptomatic resting HR 65-70 bpm. Normal rhythm axis.",
      recordedBy: "Dr. S. K. Aravind, MD, DM"
    },
    {
      id: "PL-403",
      problem: "Vitamin D Deficiency & Myalgia",
      icd10: "E55.9",
      category: "Endocrine & Metabolic",
      status: "Resolved",
      severity: "Mild",
      onsetDate: "01-Dec-2025",
      notes: "Treated with Cholecalciferol 60K weekly course. Levels normalized.",
      recordedBy: "General Medicine OPD"
    }
  ],
  "P-1002": [
    {
      id: "PL-201",
      problem: "Migraine with Aura, Intractable",
      icd10: "G43.109",
      category: "Neurological",
      status: "Active",
      severity: "Moderate",
      onsetDate: "14-Jan-2024",
      notes: "Hemicranial throbbing attacks with visual scintillations. Flunarizine 10mg daily + Sumatriptan SOS.",
      recordedBy: "Dr. Radhika Sundaram, MS, MCh"
    },
    {
      id: "PL-202",
      problem: "Occipital Neuralgia",
      icd10: "M54.81",
      category: "Neurological",
      status: "Active",
      severity: "Mild",
      onsetDate: "02-Sep-2026",
      notes: "Bilateral suboccipital tenderness. Ergonomic correction advised.",
      recordedBy: "Dr. Radhika Sundaram, MS, MCh"
    },
    {
      id: "PL-203",
      problem: "Penicillin Drug Allergy (Urticaria)",
      icd10: "Z88.0",
      category: "Immunology & Allergy",
      status: "Chronic",
      severity: "Moderate",
      onsetDate: "10-Mar-2019",
      notes: "Severe cutaneous rash with Amoxicillin. Avoid all Beta-lactams.",
      recordedBy: "Allergy Clinic"
    }
  ],
  "P-1005": [
    {
      id: "PL-501",
      problem: "Subacute Ischemic Stroke (Right MCA Territory)",
      icd10: "I63.511",
      category: "Neurological",
      status: "Active",
      severity: "Severe",
      onsetDate: "08-Sep-2026",
      notes: "Right corona radiata infarct. Upper limb power 4/5. Under active physiotherapy.",
      recordedBy: "Dr. Radhika Sundaram, MS, MCh"
    },
    {
      id: "PL-502",
      problem: "Essential Hypertension",
      icd10: "I10",
      category: "Cardiovascular",
      status: "Active",
      severity: "Moderate",
      onsetDate: "08-Sep-2026",
      notes: "Monitoring BP closely for secondary prevention.",
      recordedBy: "Dr. Radhika Sundaram, MS, MCh"
    }
  ],
  "P-1006": [
    {
      id: "PL-601",
      problem: "Acute Pediatric Bronchiolitis & Reactive Airway",
      icd10: "J21.9",
      category: "Respiratory",
      status: "Active",
      severity: "Mild",
      onsetDate: "09-Sep-2026",
      notes: "Bilateral peribronchial cuffing. Prescribed Budesonide nebulization + Montelukast syrup.",
      recordedBy: "Dr. K. Balaji, MD, DNB"
    }
  ],
  "P-1007": [
    {
      id: "PL-701",
      problem: "Roseola Infantum (Viral Exanthem - HHV-6)",
      icd10: "B08.2",
      category: "Infectious & Pediatric",
      status: "Active",
      severity: "Mild",
      onsetDate: "10-Sep-2026",
      notes: "Defervescent macular trunk rash following 3-day fever. Child active and feeding.",
      recordedBy: "Dr. K. Balaji, MD, DNB"
    }
  ],
  "P-1003": [
    {
      id: "PL-301",
      problem: "Type 2 Diabetes Mellitus with Microalbuminuria",
      icd10: "E11.21",
      category: "Endocrine & Metabolic",
      status: "Active",
      severity: "Moderate",
      onsetDate: "12-Aug-2023",
      notes: "HbA1c 7.8%. On Metformin 1000mg BD + Glimepiride 1mg OD.",
      recordedBy: "Dr. K. Srinivasan, MD"
    },
    {
      id: "PL-302",
      problem: "Diabetic Peripheral Neuropathy",
      icd10: "E11.40",
      category: "Neurological",
      status: "Active",
      severity: "Mild",
      onsetDate: "15-Jan-2025",
      notes: "Bilateral burning sensation in soles. Foot care precautions given.",
      recordedBy: "Dr. K. Srinivasan, MD"
    }
  ],
  "P-1008": [
    {
      id: "PL-801",
      problem: "Degenerative Lumbar Spondylosis with Radiculopathy (L4-L5)",
      icd10: "M47.816",
      category: "Musculoskeletal",
      status: "Active",
      severity: "Moderate",
      onsetDate: "04-Jun-2025",
      notes: "L4-L5 disc desiccation with right L5 nerve root impingement. Physical therapy & core strengthening advised.",
      recordedBy: "Orthopedics OPD"
    }
  ]
};

const getPatientProblemList = (patient) => {
  if (!patient) return [];
  if (Array.isArray(patient.problemList) && patient.problemList.length > 0) {
    return patient.problemList;
  }
  if (patient.id && DEFAULT_PROBLEM_LISTS[patient.id]) {
    return DEFAULT_PROBLEM_LISTS[patient.id];
  }
  if (patient.clinicalSummary && patient.clinicalSummary.diagnosis) {
    return [
      {
        id: `PL-${patient.id || 'GEN'}-01`,
        problem: patient.clinicalSummary.diagnosis.split(',')[0].trim(),
        icd10: 'R69',
        category: patient.department || 'General Medicine',
        status: 'Active',
        severity: 'Moderate',
        onsetDate: patient.admissionDate || 'Recent',
        notes: patient.clinicalSummary.clinicalNotes || 'Recorded during clinical evaluation.',
        recordedBy: patient.consultingDoctor || 'Attending Physician'
      }
    ];
  }
  return [];
};

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
  const [patientChat, setPatientChat] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
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
          onToast('Camera preview active (simulated feed)', 'info');
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

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!patientChat.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'You', text: patientChat.trim() }]);
    setPatientChat('');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="video-consult-window">
        <div className="video-consult-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO_SRC} alt="Medical Emblem" style={{ width: '36px', height: '36px' }} />
            <div>
              <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase' }}>
                TELEMEDICINE CITIZEN SESSION
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                  Consultation with {room.doctorName || 'Assigned Doctor'}
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
                {room.doctorName || 'Attending Physician'}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#94A3B8', maxWidth: '440px', lineHeight: '1.5', margin: '0 auto' }}>
                {room.department ? `${room.department} Consultation` : 'Specialist Tele-Consultation'}
                {room.doctorRegNo ? ` • Reg: ${room.doctorRegNo}` : ''}
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
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  </svg>
                  <span style={{ fontSize: '11px' }}>Camera Off</span>
                </div>
              )}
              <span className="pip-label">You (Patient)</span>
            </div>
          </div>

          <div className="video-clinical-sidebar">
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#38BDF8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
              </svg>
              In-Consultation Room Details
            </div>

            <div className="in-call-card">
              <div style={{ color: '#94A3B8', fontSize: '11px', marginBottom: '4px', fontWeight: '700' }}>SESSION DETAILS</div>
              <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                <div><span style={{ color: '#94A3B8' }}>Room ID:</span> <code style={{ color: '#38BDF8' }}>{room.roomId || room.appointmentId || 'TELE-SESSION'}</code></div>
                {room.doctorName && <div><span style={{ color: '#94A3B8' }}>Doctor:</span> <strong>{room.doctorName}</strong></div>}
                {room.patientName && <div><span style={{ color: '#94A3B8' }}>Patient:</span> <strong>{room.patientName}</strong></div>}
                {room.department && <div><span style={{ color: '#94A3B8' }}>Department:</span> {room.department}</div>}
                {room.issueDescription && (
                  <div style={{ marginTop: '6px', borderTop: '1px dashed #334155', paddingTop: '6px' }}>
                    <span style={{ color: '#94A3B8', fontSize: '11px' }}>Health Issue:</span>
                    <div style={{ color: '#F8FAFC', fontStyle: 'italic', marginTop: '2px' }}>"{room.issueDescription}"</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                Consultation Message Thread:
              </div>
              <div style={{ flex: 1, background: '#0B1329', border: '1px solid #1E293B', borderRadius: '8px', padding: '10px', overflowY: 'auto', maxHeight: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chatMessages.length === 0 ? (
                  <div style={{ color: '#64748B', fontSize: '12px', textAlign: 'center', margin: 'auto', fontStyle: 'italic', padding: '16px 8px' }}>
                    Consultation chat is ready. Send a message to communicate with the doctor.
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} style={{ fontSize: '12px', wordBreak: 'break-word' }}>
                      <strong style={{ color: msg.sender === 'You' ? '#38BDF8' : '#34D399' }}>{msg.sender}: </strong>
                      <span style={{ color: '#F1F5F9' }}>{msg.text}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <input 
                  type="text" 
                  value={patientChat}
                  onChange={(e) => setPatientChat(e.target.value)}
                  placeholder="Type message to doctor..."
                  style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0F172A', color: '#FFFFFF', fontSize: '12px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Send</button>
              </form>
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
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
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
            className="control-circle-btn end-call" 
            onClick={onClose}
            title="Leave Call"
            aria-label="Leave Call"
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

// 3. Schedule Consultation Modal Component
function ScheduleConsultationModal({ isOpen, onClose, patient, onToast, onScheduled }) {
  if (!isOpen) return null;
  const [department, setDepartment] = useState('Cardiology');
  const [issueDescription, setIssueDescription] = useState('');
  const [requestedDate, setRequestedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [requestedTime, setRequestedTime] = useState('10:30 AM - 11:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    { value: 'Cardiology', label: 'Cardiology (இதயவியல்)' },
    { value: 'Neurology', label: 'Neurology (நரம்பியல்)' },
    { value: 'Orthopaedics', label: 'Orthopaedics (எலும்பியல்)' },
    { value: 'General Medicine', label: 'General Medicine (பொது மருத்துவம்)' },
    { value: 'Paediatrics', label: 'Paediatrics (குழந்தைகள் நலம்)' },
    { value: 'Nephrology', label: 'Nephrology (சிறுநீரகவியல்)' },
    { value: 'Oncology', label: 'Oncology (புற்றுநோயியல்)' },
    { value: 'Pulmonology', label: 'Pulmonology (சுவாசவியல்)' },
    { value: 'ENT', label: 'ENT (காது மூக்கு தொண்டை)' },
    { value: 'Dermatology', label: 'Dermatology (தோல் நலம்)' }
  ];

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:30 AM - 11:00 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '03:00 PM - 03:30 PM',
    '04:00 PM - 04:30 PM',
    '05:00 PM - 05:30 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      onToast('Please describe your medical symptoms / issue', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id || patient.receiptId,
          patientName: patient.name,
          receiptId: patient.receiptId,
          abhaId: patient.abhaId,
          phone: patient.phone || patient.contact || '9840123456',
          department,
          issueDescription: issueDescription.trim(),
          requestedDate,
          requestedTime
        })
      });
      const data = await res.json();
      if (data.success) {
        onToast(`Schedule request broadcasted to all ${department} doctors!`);
        if (onScheduled) onScheduled(data.appointment);
        onClose();
      } else {
        onToast(data.message || 'Failed to submit schedule', 'error');
      }
    } catch (err) {
      onToast('Network error creating schedule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const symptomPresets = [
    { label: '🫀 Heart & Chest Pain', dept: 'Cardiology', text: 'Chest tightness, palpitations, and exertion breathlessness', doctor: 'Dr. S. K. Aravind, MD, DM (Cardiology)' },
    { label: '🧠 Headache & Nerves', dept: 'Neurology', text: 'Severe pulsating migraine headache, numbness, and vertigo', doctor: 'Dr. Radhika Sundaram, MS, MCh (Neurology)' },
    { label: '👶 Child & Infant Care', dept: 'Pediatrics', text: 'Child nocturnal cough, fever episodes, and pediatric health check', doctor: 'Dr. K. Balaji, MD, DNB (Pediatrics)' },
    { label: '🩺 Kidney & Swelling', dept: 'Nephrology', text: 'Bilateral pedal edema, elevated creatinine, and reduced urine output', doctor: 'Dr. M. Sangeetha, MD, DM (Nephrology)' },
    { label: '🦴 Bone & Joint Pain', dept: 'Orthopaedics', text: 'Severe knee joint pain, arthritis stiffness, and mobility difficulty', doctor: 'Orthopaedic Specialist OPD' },
    { label: '🫁 Breathing & Asthma', dept: 'Pulmonology', text: 'Wheezing, seasonal asthma symptoms, and persistent dry cough', doctor: 'Pulmonology Specialist OPD' }
  ];

  const handleSelectPreset = (preset) => {
    setDepartment(preset.dept);
    setIssueDescription(preset.text);
    onToast(`Assigned to ${preset.dept} Specialist Doctor!`, 'info');
  };

  const selectedPreset = symptomPresets.find(p => p.dept === department);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-dialog" style={{ maxWidth: '580px', width: '92%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
        <div style={{ background: '#0F4C81', color: '#FFFFFF', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px', borderRadius: '8px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Schedule Video Consultation</h3>
              <span style={{ fontSize: '11.5px', color: '#93C5FD' }}>Direct Specialist Tele-OPD by Patient Health Condition</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', background: '#FFFFFF' }}>
          {/* Quick Symptom / Condition Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              Quick Select Health Condition / Symptoms (Auto-routes to correct doctor):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {symptomPresets.map(preset => (
                <button
                  key={preset.dept}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: department === preset.dept ? '1.5px solid #0F4C81' : '1px solid #E2E8F0',
                    background: department === preset.dept ? '#EFF6FF' : '#F8FAFC',
                    color: department === preset.dept ? '#0F4C81' : '#334155',
                    fontSize: '12px',
                    fontWeight: department === preset.dept ? '700' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Specialist Doctor Callout Banner */}
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '12.5px', color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div>
              <strong>Specialist Routing:</strong> Appointment will be posted exclusively to <strong>{department}</strong> Doctors ({selectedPreset?.doctor || `${department} Specialist Clinic`}).
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Specialty / Medical Department <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <select 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)}
              className="form-control"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
              required
            >
              {departments.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Describe Your Health Issue / Medical Symptoms <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea 
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g., Experiencing frequent palpitation and breathlessness after climbing steps for past 4 days..."
              rows="3"
              className="form-control"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
              required
            />
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>Posted directly to {department} specialist doctor workbench.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Preferred Consultation Date <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input 
                type="date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="form-control"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Preferred Time Slot <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select 
                value={requestedTime}
                onChange={(e) => setRequestedTime(e.target.value)}
                className="form-control"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                required
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '10px 22px', fontWeight: '700' }}>
              {isSubmitting ? 'Broadcasting Request...' : 'Submit Schedule to Respective Doctors'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. Standalone Patient Login Gate Component
function PatientLoginGate({ onLoginSuccess, onToast }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regBlood, setRegBlood] = useState('O +ve');
  const [regDistrict, setRegDistrict] = useState('Chennai');
  const [regAddress, setRegAddress] = useState('');
  const [regAllergies, setRegAllergies] = useState('None Reported');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      onToast('Please enter your Receipt ID, ABHA ID or Mobile Number', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });
      const data = await res.json();
      if (data.success && data.patient) {
        onToast(`Welcome, ${data.patient.name}`);
        onLoginSuccess(data.patient);
      } else {
        onToast(data.message || 'Login failed. Please verify your ID or register.', 'error');
      }
    } catch (err) {
      onToast('Server error during patient authentication', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      onToast('Name and Mobile Number are required', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          dob: regDob,
          age: regAge,
          gender: regGender,
          bloodGroup: regBlood,
          district: regDistrict,
          address: regAddress.trim(),
          allergies: regAllergies.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.patient) {
        onToast(`Account created successfully! Receipt ID: ${data.patient.receiptId}`);
        onLoginSuccess(data.patient);
      } else {
        onToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      onToast('Server error during registration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO_SRC} alt="Medical Portal" style={{ width: '44px', height: '44px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: '800', textTransform: 'uppercase' }}>Unified Health Care • Patient Portal</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Citizen Health Locker & Tele-OPD</div>
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
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '520px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src={LOGO_SRC} alt="Emblem" style={{ width: '56px', height: '56px', marginBottom: '10px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Citizen Health Portal Access</h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Ayushman Bharat Digital Health Locker & Multi-Speciality Teleconsultations
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '20px' }}>
            <button 
              className={`modal-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
              style={{ flex: 1, padding: '10px', fontSize: '13.5px', textAlign: 'center' }}
            >
              Sign In to Existing Account
            </button>
            <button 
              className={`modal-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
              style={{ flex: 1, padding: '10px', fontSize: '13.5px', textAlign: 'center' }}
            >
              Register New Patient
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Patient Receipt ID / ABHA ID / Mobile Number
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  placeholder="e.g. TN-REC-8841 or 9840123456" 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
                <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Enter your OPD Receipt ID (e.g. <code>TN-REC-8841</code>) or registered 10-digit mobile number
                </span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
                style={{ width: '100%', padding: '12px', fontSize: '14.5px', fontWeight: '700', background: '#0F4C81', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                {isLoading ? 'Accessing Records...' : 'Sign In to Patient Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Full Name *</label>
                  <input type="text" className="form-control" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. Anitha Kumar" required style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Mobile Phone *</label>
                  <input type="tel" className="form-control" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="10-digit mobile" required style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Age (Years)</label>
                  <input type="number" className="form-control" value={regAge} onChange={(e) => setRegAge(e.target.value)} placeholder="e.g. 35" style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Gender</label>
                  <select value={regGender} onChange={(e) => setRegGender(e.target.value)} className="form-control" style={{ width: '100%', padding: '8px', fontSize: '13px' }}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Blood Group</label>
                  <select value={regBlood} onChange={(e) => setRegBlood(e.target.value)} className="form-control" style={{ width: '100%', padding: '8px', fontSize: '13px' }}>
                    <option>O +ve</option>
                    <option>A +ve</option>
                    <option>B +ve</option>
                    <option>AB +ve</option>
                    <option>O -ve</option>
                    <option>A -ve</option>
                    <option>B -ve</option>
                    <option>AB -ve</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>District</label>
                  <select value={regDistrict} onChange={(e) => setRegDistrict(e.target.value)} className="form-control" style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }}>
                    <option>Chennai</option>
                    <option>Coimbatore</option>
                    <option>Madurai</option>
                    <option>Tiruchirappalli</option>
                    <option>Salem</option>
                    <option>Tirunelveli</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Known Allergies</label>
                  <input type="text" className="form-control" value={regAllergies} onChange={(e) => setRegAllergies(e.target.value)} placeholder="e.g. Penicillin or None" style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Residential Address</label>
                <input type="text" className="form-control" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} placeholder="Street address / Town" style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }} />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', background: '#046A38', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration & Open Portal'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>
            Unified Digital Health Mission • Citizen Patient Portal
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Main Standalone Client / Patient Portal Application Component
function ClientPortalStandaloneApp() {
  const [patientSession, setPatientSession] = useState(() => {
    try {
      const saved = localStorage.getItem('tn_patient_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [pastReportSubTab, setPastReportSubTab] = useState('all'); // 'all' | 'diagnoses' | 'medications' | 'labs' | 'radiology'
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [activeVideoRoom, setActiveVideoRoom] = useState(null);
  const [activePACSStudy, setActivePACSStudy] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Sync latest patient clinical file in background if logged in
  useEffect(() => {
    if (patientSession?.receiptId || patientSession?.abhaId) {
      const q = patientSession.receiptId || patientSession.abhaId;
      fetch(`/api/patients/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.patient) {
            setPatientSession(data.patient);
            localStorage.setItem('tn_patient_session', JSON.stringify(data.patient));
          }
        })
        .catch(() => {});
    }
  }, [patientSession?.receiptId, patientSession?.abhaId]);

  // Fetch appointments for this patient
  const fetchAppointments = useCallback(async () => {
    if (!patientSession) return;
    const pid = patientSession.id || patientSession.receiptId;
    if (!pid) return;
    try {
      const res = await fetch(`/api/appointments/patient/${encodeURIComponent(pid)}`);
      const data = await res.json();
      if (data.success && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (e) {}
  }, [patientSession]);

  useEffect(() => {
    if (patientSession) {
      fetchAppointments();
      const interval = setInterval(fetchAppointments, 5000);
      return () => clearInterval(interval);
    }
  }, [patientSession, fetchAppointments]);

  const handleLoginSuccess = (patient) => {
    setPatientSession(patient);
    try {
      localStorage.setItem('tn_patient_session', JSON.stringify(patient));
    } catch (e) {}
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('tn_patient_session');
    } catch (e) {}
    setPatientSession(null);
    addToast('Signed out of Patient Health Locker');
  };

  const handleStartVideoCall = (pt, role = 'patient') => {
    const roomObj = {
      roomId: pt.roomId || `ROOM_${(pt.receiptId || 'GEN').replace(/[^a-zA-Z0-9]/g, '')}`,
      patientName: pt.name || patientSession.name,
      doctorName: pt.doctorName || patientSession.consultingDoctor || 'Specialist Doctor',
      doctorRegNo: pt.doctorRegNo || 'TMC-48291',
      receiptId: pt.receiptId || patientSession.receiptId,
      role
    };
    setActiveVideoRoom(roomObj);
    addToast(`Entering Teleconsultation Video Room: ${roomObj.roomId}`);
  };

  if (!patientSession) {
    return (
      <div>
        <ToastList toasts={toasts} />
        <PatientLoginGate onLoginSuccess={handleLoginSuccess} onToast={addToast} />
      </div>
    );
  }

  const confirmedAppointment = appointments.find(a => a.status === 'Confirmed');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <ToastList toasts={toasts} />

      {/* Institutional Citizen Header */}
      <header style={{ background: '#FFFFFF', borderBottom: '2px solid var(--primary)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={LOGO_SRC} alt="Medical Emblem" className="emblem-logo-img" style={{ width: '44px', height: '44px' }} />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>
                CITIZEN HEALTH PORTAL
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Patient Health Locker & Telemedicine
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontWeight: '700' }}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="12" y1="14" x2="12" y2="18"/>
                <line x1="10" y1="16" x2="14" y2="16"/>
              </svg>
              Create Schedule
            </button>
            <button className="btn btn-video" onClick={() => handleStartVideoCall(patientSession, 'patient')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Live Video Room
            </button>
            <a href="/lis" className="btn btn-outline" style={{ background: '#F0FDFA', borderColor: '#99F6E4', color: '#0D9488', fontWeight: '700', textDecoration: 'none' }}>
              🔬 LIS Lab
            </a>
            <a href="/pis" className="btn btn-outline" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#046A38', fontWeight: '700', textDecoration: 'none' }}>
              💊 PIS Pharmacy
            </a>
            <a href="/" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Public Portal
            </a>
            <button className="btn btn-danger" style={{ padding: '8px 14px' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: '30px 20px' }}>
        
        {/* CONFIRMED TIMING BANNER IF ANY DOCTOR ACCEPTED */}
        {confirmedAppointment && (
          <div style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
            border: '2px solid #34D399',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '24px',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -4px rgba(6, 78, 59, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.25)',
                border: '2px solid #34D399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34D399',
                flexShrink: 0
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#A7F3D0', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  TELECONSULTATION CONFIRMED BY SPECIALIST
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', margin: '3px 0' }}>
                  Confirmed on that timing: <span style={{ color: '#FDE047', textDecoration: 'underline' }}>{confirmedAppointment.confirmedTime || `${confirmedAppointment.requestedDate} at ${confirmedAppointment.requestedTime}`}</span> with {confirmedAppointment.doctorName}
                </div>
                <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                  Department: <strong>{confirmedAppointment.department}</strong> • Issue: <em>"{confirmedAppointment.issueDescription}"</em> — <strong style={{ color: '#FDE047', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>Please Be Ready</strong>
                </div>
              </div>
            </div>
            <button 
              className="btn btn-video" 
              style={{ padding: '12px 22px', fontSize: '14px', background: '#F59E0B', color: '#0F172A', fontWeight: '800', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => handleStartVideoCall({ ...patientSession, roomId: confirmedAppointment.roomId, doctorName: confirmedAppointment.doctorName }, 'patient')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Enter Video Consultation Room Now
            </button>
          </div>
        )}

        {/* Patient Welcome Card */}
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="patient-avatar-box" style={{ width: '74px', height: '74px', fontSize: '28px' }}>
              {patientSession.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge-gov">VERIFIED CITIZEN</span>
                <span className="badge-primary">ABHA COMPLIANT</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                Welcome, {patientSession.name}
              </h1>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#475569' }}>
                <span>ABHA ID: <strong>{patientSession.abhaId}</strong></span>
                <span>•</span>
                <span>Blood: <strong style={{ color: '#DC2626' }}>{patientSession.bloodGroup}</strong></span>
                <span>•</span>
                <span>Receipt: <strong>{patientSession.receiptId}</strong></span>
                <span>•</span>
                <span>Hospital: <strong>{patientSession.centerName}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '12px 20px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="12" y1="14" x2="12" y2="18"/>
                <line x1="10" y1="16" x2="14" y2="16"/>
              </svg>
              Create Schedule for Video Consulting
            </button>
            <button className="btn btn-video" style={{ padding: '12px 20px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => handleStartVideoCall(patientSession, 'patient')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              Start Instant Video Consultation
            </button>
          </div>
        </div>

        {/* Dashboard Nav Tabs */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #E2E8F0', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button 
            className={`modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Health Records & Vitals
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedules')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Video Schedules ({appointments.length})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('prescriptions')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
            Prescriptions ({patientSession.prescriptions?.length || 0})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
            onClick={() => setActiveTab('labs')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v7.31L4.68 18.2A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.72-2.8L14 9.31V2"/></svg>
            Diagnostic Lab Reports ({patientSession.labReports?.length || 0})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            Past Patient Reports ({(patientSession.pastRecords?.length || 0) + (patientSession.pastMedications?.length || 0) + (patientSession.labReports?.length || 0) + (patientSession.radiologyStudies?.length || 0)})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'insurance' ? 'active' : ''}`}
            onClick={() => setActiveTab('insurance')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Insurance & Billing
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
            ABHA Health Card
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'radiology' ? 'active' : ''}`}
            onClick={() => setActiveTab('radiology')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="5"/></svg>
            Radiology & Digital Scans ({patientSession.radiologyStudies?.length || 0})
          </button>
        </div>

        {/* Tab 1: Overview & Vitals */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Blood Pressure</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patientSession.vitals?.bp || '120/80 mmHg'}</div>
                <div className="vital-status">Controlled</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Pulse Rate</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patientSession.vitals?.pulse || '72 bpm'}</div>
                <div className="vital-status">Normal Rhythm</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Oxygen (SpO2)</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patientSession.vitals?.spo2 || '98%'}</div>
                <div className="vital-status">Adequate</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Temperature</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patientSession.vitals?.temp || '98.4 °F'}</div>
                <div className="vital-status">Afebrile</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Blood Sugar (F)</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patientSession.vitals?.bloodSugarFasting || '94 mg/dL'}</div>
                <div className="vital-status">Fasting</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Body Mass Index</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patientSession.vitals?.bmi || '24.2'}</div>
                <div className="vital-status">Wt: {patientSession.vitals?.weight || '68 kg'}</div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Current Medical Assessment & Doctor Diagnosis
              </h3>
              <div className="clinical-notes-card">
                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
                  {patientSession.clinicalSummary?.diagnosis || 'Comprehensive Outpatient Clinical Evaluation'}
                </div>
                <p style={{ fontSize: '13.5px', marginBottom: '8px' }}>
                  <strong>Chief Complaints:</strong> {patientSession.clinicalSummary?.chiefComplaints || 'Routine health examination'}
                </p>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
                  <strong>Doctor Clinical Notes:</strong> {patientSession.clinicalSummary?.clinicalNotes || 'Patient is compliant with medications and lifestyle modifications.'}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#DC2626', fontWeight: '700', marginTop: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>Drug Allergies: {patientSession.clinicalSummary?.allergies || 'None Reported'}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', padding: '14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#92400E', fontSize: '13.5px' }}>Next Scheduled Follow-up:</strong>
                  <div style={{ color: '#78350F', fontSize: '13px', marginTop: '2px' }}>{patientSession.followUp || '15-Oct-2026 at Cardiology Apex OPD'}</div>
                </div>
                <button className="btn btn-video" style={{ fontSize: '12px' }} onClick={() => handleStartVideoCall(patientSession, 'patient')}>
                  Join Scheduled Video Room
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Video Schedules */}
        {activeTab === 'schedules' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Teleconsultation Schedules & Video Appointments
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                  Real-time status of your requested specialty consultations with Government apex doctors
                </p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setIsScheduleModalOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13.5px', fontWeight: '700' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <line x1="12" y1="14" x2="12" y2="18"/>
                  <line x1="10" y1="16" x2="14" y2="16"/>
                </svg>
                Create New Schedule
              </button>
            </div>

            {appointments.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.6" style={{ margin: '0 auto 12px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', margin: '0 0 6px' }}>No Schedules Created Yet</h4>
                <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto 16px' }}>
                  Click "Create Schedule" to request a video consultation with any specialist doctor in our government hospital network.
                </p>
                <button className="btn btn-primary" onClick={() => setIsScheduleModalOpen(true)}>
                  Create Schedule Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {appointments.map((apt) => {
                  const isConfirmed = apt.status === 'Confirmed';
                  return (
                    <div 
                      key={apt.id}
                      style={{
                        background: isConfirmed ? '#F0FDF4' : '#F8FAFC',
                        border: isConfirmed ? '2px solid #86EFAC' : '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: isConfirmed ? '0 4px 12px rgba(22, 101, 52, 0.08)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ 
                              background: isConfirmed ? '#166534' : '#D97706',
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              letterSpacing: '0.5px'
                            }}>
                              {isConfirmed ? 'Confirmed by Doctor' : 'Pending Doctor Acceptance'}
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>
                              Department: <strong style={{ color: '#0F172A' }}>{apt.department}</strong>
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>
                              ID: <code>{apt.id}</code>
                            </span>
                          </div>

                          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '4px 0' }}>
                            {isConfirmed ? (
                              <>Confirmed on that timing: <span style={{ color: '#166534' }}>{apt.confirmedTime || `${apt.requestedDate} at ${apt.requestedTime}`}</span> with Dr. {apt.doctorName}</>
                            ) : (
                              <>Requested Timing: {apt.requestedDate} ({apt.requestedTime})</>
                            )}
                          </h4>

                          <div style={{ marginTop: '8px', background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                              Reported Issue / Symptoms to Respective Doctors:
                            </div>
                            <div style={{ fontSize: '13.5px', color: '#1E293B', fontWeight: '500', marginTop: '3px' }}>
                              "{apt.issueDescription}"
                            </div>
                          </div>

                          {isConfirmed && (
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#166534', fontWeight: '700' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              <span>Doctor {apt.doctorName} (Reg: {apt.doctorRegNo}) has confirmed your slot — <strong style={{ color: '#B45309' }}>Please Be Ready</strong></span>
                            </div>
                          )}

                          {!isConfirmed && (
                            <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="status-dot-pulse" style={{ background: '#D97706' }}></span>
                              <span>Broadcasted to all <strong>{apt.department}</strong> doctors. Any specialist can review your reported symptoms and accept.</span>
                            </div>
                          )}
                        </div>

                        {isConfirmed && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button 
                              className="btn btn-video"
                              style={{ padding: '10px 20px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                              onClick={() => handleStartVideoCall({ ...patientSession, roomId: apt.roomId, doctorName: apt.doctorName }, 'patient')}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="23 7 16 12 23 17 23 7"/>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                              </svg>
                              Enter Video Room Now
                            </button>
                            <span style={{ fontSize: '11px', color: '#64748B', textAlign: 'center' }}>Room ID: {apt.roomId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Active Prescribed Medications (Rx)</h3>
              <button className="btn btn-outline" onClick={() => window.print()}>Print Prescription Slip</button>
            </div>
            <div className="table-wrapper">
              <table className="medical-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine Name</th>
                    <th>Strength</th>
                    <th>Dosage (M-A-N)</th>
                    <th>Timing</th>
                    <th>Duration</th>
                    <th>Doctor Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {(patientSession.prescriptions || []).map((rx, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: '700', color: '#0F172A' }}>{rx.medicine}</td>
                      <td>{rx.dosage}</td>
                      <td><span className="status-badge status-normal">{rx.frequency}</span></td>
                      <td>{rx.timing}</td>
                      <td>{rx.duration}</td>
                      <td style={{ fontSize: '12.5px', color: '#475569' }}>{rx.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Lab Reports (LIS) */}
        {activeTab === 'labs' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2"><path d="M10 2v7.31L4.68 18.2A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.72-2.8L14 9.31V2"/></svg>
                  Laboratory & Pathology Reports (LIS)
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 0' }}>
                  Verified diagnostic tests and pathology records processed by the Central LIS Laboratory
                </p>
              </div>
              <button className="btn btn-outline" onClick={() => window.print()}>Print Lab Slip</button>
            </div>

            {(!patientSession.labReports || patientSession.labReports.length === 0) ? (
              <div style={{
                background: '#F8FAFC',
                border: '2px dashed #CBD5E1',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#F0FDFA', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2v7.31L4.68 18.2A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.72-2.8L14 9.31V2"/></svg>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  No Diagnostic Lab Reports Available Yet
                </h4>
                <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
                  When your consulting doctor orders blood tests or pathology assays, they appear in the <strong>Laboratory Information System (LIS)</strong>. Once the central hospital lab conducts the analysis and uploads the pathology report, it will instantly display here.
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="medical-table">
                  <thead>
                    <tr>
                      <th>Investigation / Test Name</th>
                      <th>Specimen Date</th>
                      <th>Observed Result</th>
                      <th>Normal Reference Range</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientSession.labReports.map((lab, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '700', color: '#0F172A' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D9488' }}></span>
                            {lab.testName}
                          </div>
                        </td>
                        <td>{lab.date}</td>
                        <td style={{ fontWeight: '800', color: '#0F4C81' }}>{lab.result}</td>
                        <td>{lab.normalRange}</td>
                        <td>
                          <span className={`status-badge ${
                            (lab.status || '').toLowerCase().includes('high') ? 'status-alert' :
                            (lab.status || '').toLowerCase().includes('danger') ? 'status-danger' : 'status-normal'
                          }`}>
                            {lab.status || 'Verified'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Past Patient Reports (Categorized & Non-Clumsy) */}
        {activeTab === 'records' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                    Past Patient Reports & Medical History
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Structured longitudinal health records across past diagnoses, prior medications, LIS laboratory tests, and RIS radiology scans.
                  </p>
                </div>
              </div>

              {/* Category Filter Sub-Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Past Reports', count: (getPatientProblemList(patientSession).length) + (patientSession.pastRecords?.length || 0) + (patientSession.pastMedications?.length || 0) + (patientSession.labReports?.length || 0) + (patientSession.radiologyStudies?.length || 0) },
                  { id: 'problems', label: 'Problem List & Conditions', count: getPatientProblemList(patientSession).length },
                  { id: 'diagnoses', label: 'Past Diagnoses', count: patientSession.pastRecords?.length || 0 },
                  { id: 'medications', label: 'Past Medications', count: patientSession.pastMedications?.length || 0 },
                  { id: 'labs', label: 'Past Lab Reports (LIS)', count: patientSession.labReports?.length || 0 },
                  { id: 'radiology', label: 'Past Radiology Tests (RIS)', count: patientSession.radiologyStudies?.length || 0 }
                ].map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setPastReportSubTab(sub.id)}
                    style={{
                      background: pastReportSubTab === sub.id ? '#0F4C81' : '#F8FAFC',
                      color: pastReportSubTab === sub.id ? '#FFFFFF' : '#475569',
                      border: pastReportSubTab === sub.id ? '1px solid #0F4C81' : '1px solid #CBD5E1',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {sub.label}
                    <span style={{
                      background: pastReportSubTab === sub.id ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                      color: pastReportSubTab === sub.id ? '#FFFFFF' : '#334155',
                      fontSize: '10.5px',
                      fontWeight: '800',
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}>
                      {sub.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category 0: Problem List & Chronic Conditions */}
            {(pastReportSubTab === 'all' || pastReportSubTab === 'problems') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#0284C7' }}>●</span> Active Problem List & Chronic Diagnoses ({getPatientProblemList(patientSession).length})
                </div>
                {getPatientProblemList(patientSession).length === 0 ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                    No recorded chronic conditions or problems.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                    {getPatientProblemList(patientSession).map((prob, idx) => (
                      <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ background: '#0F4C81', color: '#FFFFFF', fontSize: '10.5px', fontWeight: '800', padding: '2px 7px', borderRadius: '4px' }}>
                            {prob.icd10}
                          </span>
                          <span style={{ background: prob.status === 'Active' ? '#DCFCE7' : prob.status === 'Chronic' ? '#E0F2FE' : '#FEF3C7', color: prob.status === 'Active' ? '#166534' : prob.status === 'Chronic' ? '#0369A1' : '#92400E', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                            {prob.status}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                          {prob.problem}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Category: <strong>{prob.category}</strong> • Severity: <strong>{prob.severity}</strong>
                        </div>
                        {prob.notes && (
                          <div style={{ fontSize: '12px', color: '#334155', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            {prob.notes}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          Onset: {prob.onsetDate || 'Recent'} • Logged by: {prob.recordedBy || 'Attending Physician'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category 1: Past Diagnoses & Prior Consultations */}
            {(pastReportSubTab === 'all' || pastReportSubTab === 'diagnoses') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#0284C7' }}>●</span> Past Diagnoses & Prior Hospital Consultations ({patientSession.pastRecords?.length || 0})
                </div>
                {(!patientSession.pastRecords || patientSession.pastRecords.length === 0) ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                    No prior hospital consultation records logged.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                    {patientSession.pastRecords.map((rec, idx) => (
                      <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ background: '#E2E8F0', color: '#0F172A', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                            {rec.id} • {rec.date}
                          </span>
                          <span style={{ color: '#046A38', fontSize: '11.5px', fontWeight: '700' }}>
                            {rec.hospital}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '4px 0 2px' }}>
                          {rec.diagnosis}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                          Consultant: <strong>{rec.doctor}</strong> ({rec.department})
                        </div>
                        <p style={{ fontSize: '12px', color: '#334155', fontStyle: 'italic', margin: 0, background: '#FFFFFF', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          "{rec.outcome}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Category 2: Past Medications */}
            {(pastReportSubTab === 'all' || pastReportSubTab === 'medications') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#D97706' }}>●</span> Past Prescription Medications History ({patientSession.pastMedications?.length || 0})
                </div>
                {(!patientSession.pastMedications || patientSession.pastMedications.length === 0) ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                    No past medication records on file.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="medical-table">
                      <thead>
                        <tr>
                          <th>Medicine & Dose</th>
                          <th>Frequency & Timing</th>
                          <th>Prescribed Date</th>
                          <th>Prescribed By</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientSession.pastMedications.map((pm, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '800', color: '#0F172A' }}>{pm.name || pm.medicine} {pm.dose || pm.dosage}</td>
                            <td>{pm.frequency} • {pm.timing}</td>
                            <td>{pm.date}</td>
                            <td>{pm.prescribedBy}</td>
                            <td>
                              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                {pm.status || 'Previous Course'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Category 3: Past Lab Reports (LIS) */}
            {(pastReportSubTab === 'all' || pastReportSubTab === 'labs') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#0D9488' }}>●</span> Past Diagnostic Lab Reports (LIS) ({patientSession.labReports?.length || 0})
                </div>
                {(!patientSession.labReports || patientSession.labReports.length === 0) ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                    No past laboratory reports recorded.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="medical-table">
                      <thead>
                        <tr>
                          <th>Lab Investigation</th>
                          <th>Date</th>
                          <th>Result</th>
                          <th>Reference Range</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientSession.labReports.map((lab, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '700', color: '#0F172A' }}>{lab.testName}</td>
                            <td>{lab.date}</td>
                            <td style={{ fontWeight: '800', color: '#0F4C81' }}>{lab.result}</td>
                            <td>{lab.normalRange}</td>
                            <td>
                              <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '10.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                {lab.status || 'Verified'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Category 4: Past Radiology Tests (RIS) */}
            {(pastReportSubTab === 'all' || pastReportSubTab === 'radiology') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#0284C7' }}>●</span> Past Radiology & PACS Imaging Tests ({patientSession.radiologyStudies?.length || 0})
                </div>
                {(!patientSession.radiologyStudies || patientSession.radiologyStudies.length === 0) ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                    No radiology studies logged.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                    {patientSession.radiologyStudies.map((study, idx) => (
                      <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ background: '#0284C7', color: '#FFFFFF', fontSize: '10.5px', fontWeight: '800', padding: '2px 7px', borderRadius: '4px' }}>
                            {study.modality}
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                            {study.studyDate}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: '4px 0 2px' }}>
                          {study.studyDescription}
                        </h4>
                        <div style={{ fontSize: '11.5px', color: '#475569', marginBottom: '8px' }}>
                          Radiologist: <strong>{study.radiologist}</strong> ({study.seriesCount} series, {study.instanceCount} slices)
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setActivePACSStudy(study)}
                          style={{ padding: '6px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="5"/></svg>
                          View Scan in PACS Viewer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Tab 6: Insurance & Billing */}
        {activeTab === 'insurance' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)
            </h3>
            <div className="insurance-banner">
              <div>
                <strong style={{ fontSize: '15px', color: '#0F172A' }}>{patientSession.billing?.insuranceScheme || "Comprehensive Health Insurance Scheme (Cashless)"}</strong>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  Total Hospital Claim: <strong>{patientSession.billing?.totalAmount || "₹ 0 (Free Public Care)"}</strong> | Scheme Coverage: <strong>{patientSession.billing?.schemeApproved || "100% Cashless"}</strong>
                </div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary-dark)' }}>
                Citizen Payable: {patientSession.billing?.patientPayable || "₹ 0.00"} ({patientSession.billing?.paymentStatus || "Free Treatment"})
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Profile & ABHA Card */}
        {activeTab === 'profile' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 50%, #065F46 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', opacity: 0.08, pointerEvents: 'none' }}>
                <img src={LOGO_SRC} alt="" style={{ width: '220px', height: '220px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '14px', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={LOGO_SRC} alt="Medical Emblem" style={{ width: '42px', height: '42px', background: '#FFFFFF', borderRadius: '50%', padding: '2px' }} />
                  <div>
                    <div style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#A7F3D0', fontWeight: '800' }}>
                      NATIONAL DIGITAL HEALTH MISSION • UNIFIED CITIZEN HEALTH CARD
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px' }}>
                      AYUSHMAN BHARAT DIGITAL MISSION (ABDM) HEALTH CARD
                    </div>
                  </div>
                </div>
                <div>
                  <span style={{ background: '#047857', border: '1px solid #34D399', padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '700', letterSpacing: '0.5px' }}>
                    ACTIVE CITIZEN LOCKER
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '24px', alignItems: 'center' }}>
                <div style={{
                  width: '96px',
                  height: '110px',
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px dashed rgba(255,255,255,0.4)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
                  <span style={{ fontSize: '10px', color: '#D1FAE5', textTransform: 'uppercase', fontWeight: '700' }}>PHOTO ID</span>
                </div>

                <div>
                  <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.3px', marginBottom: '4px' }}>
                    {patientSession.name}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#E2E8F0', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span>DOB: <strong>{patientSession.dob || 'Recorded upon checkup'}</strong></span>
                    <span>Age: <strong>{patientSession.age} Yrs</strong></span>
                    <span>Gender: <strong>{patientSession.gender}</strong></span>
                    <span>Blood: <strong style={{ color: '#FECACA' }}>{patientSession.bloodGroup}</strong></span>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '8px 14px', borderRadius: '8px', display: 'inline-block' }}>
                    <div style={{ fontSize: '10.5px', color: '#A7F3D0', textTransform: 'uppercase', fontWeight: '800' }}>
                      ABHA 14-DIGIT NUMBER
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: '900', letterSpacing: '2px', color: '#FFFFFF', marginTop: '2px' }}>
                      {patientSession.abhaId}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '10px', borderRadius: '10px' }}>
                  <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="1.8">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="3" height="3"/>
                    <rect x="18" y="18" width="3" height="3"/>
                  </svg>
                  <div style={{ fontSize: '10px', color: '#0F172A', fontWeight: '800', marginTop: '2px' }}>SECURE QR</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
                Citizen Official Registry Particulars
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Government Receipt ID</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{patientSession.receiptId}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Primary Mobile Phone</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{patientSession.phone}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>District / City</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{patientSession.district || 'Chennai (Apex Zone)'}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Residential Street Address</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>{patientSession.address || 'Chennai, Tamil Nadu'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Radiology & Digital Scans */}
        {activeTab === 'radiology' && (
          <RadiologyStudiesPanel
            studies={patientSession.radiologyStudies || []}
            onLaunchPACS={(study) => setActivePACSStudy(study)}
            onOrderStudy={null}
            isDoctor={false}
          />
        )}

        {/* Schedule Consultation Modal */}
        <ScheduleConsultationModal 
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          patient={patientSession}
          onToast={addToast}
          onScheduled={fetchAppointments}
        />
      </main>

      {/* Video Call Modal */}
      {activeVideoRoom && (
        <VideoConsultationModal 
          room={activeVideoRoom}
          onClose={() => {
            setActiveVideoRoom(null);
            addToast('Video consultation session concluded');
          }}
          onToast={addToast}
        />
      )}

      {/* PACS DICOM Medical Imaging Viewer Modal */}
      {activePACSStudy && (
        <PACSViewerModal
          study={activePACSStudy}
          onClose={() => setActivePACSStudy(null)}
          onToast={addToast}
        />
      )}
    </div>
  );
}

// Mount Client / Patient App
const clientRoot = ReactDOM.createRoot(document.getElementById('client-root'));
clientRoot.render(<ClientPortalStandaloneApp />);
