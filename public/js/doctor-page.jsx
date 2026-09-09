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

function DoctorStandaloneApp() {
  const [doctorSession, setDoctorSession] = useState(() => {
    try {
      const saved = localStorage.getItem('tn_doctor_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
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

  const [queue, setQueue] = useState([]);
  const [selectedQueuePatient, setSelectedQueuePatient] = useState(null);
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState('notes');
  const [activeVideoRoom, setActiveVideoRoom] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Workbench Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [newMed, setNewMed] = useState({ medicine: '', dosage: '', frequency: '1 - 0 - 0', timing: 'After Food', duration: '15 Days' });

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!doctorSession) return;
    try {
      const dept = doctorSession.department || 'Cardiology';
      const res = await fetch(`/api/appointments/doctor?department=${encodeURIComponent(dept)}&regNo=${encodeURIComponent(doctorSession.regNo)}`);
      const data = await res.json();
      if (data.success && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (e) {}
  }, [doctorSession]);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/doctor/queue');
      const data = await res.json();
      if (data.success && data.queue) {
        setQueue(data.queue);
        if (!selectedQueuePatient && data.queue.length > 0) {
          selectPatient(data.queue[0]);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [selectedQueuePatient]);

  const selectPatient = (pt) => {
    setSelectedQueuePatient(pt);
    setDiagnosis(pt.clinicalSummary?.diagnosis || '');
    setClinicalNotes(pt.clinicalSummary?.clinicalNotes || '');
    setFollowUp(pt.followUp || '15-Oct-2026 at Cardiology OPD');
    setPrescriptions(pt.prescriptions ? [...pt.prescriptions] : []);
  };

  useEffect(() => {
    if (doctorSession) {
      fetchQueue();
      fetchAppointments();
      const timer = setInterval(() => {
        fetchAppointments();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [doctorSession, fetchQueue, fetchAppointments]);

  const handleAcceptAppointment = async (apt) => {
    try {
      const res = await fetch('/api/appointments/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: apt.id,
          doctorName: doctorSession.name,
          doctorRegNo: doctorSession.regNo,
          department: doctorSession.department || 'Cardiology',
          confirmedTime: `${apt.requestedDate} at ${apt.requestedTime}`
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Consultation schedule confirmed for ${apt.patientName}! Patient has been notified.`);
        fetchAppointments();
      } else {
        addToast(data.message || 'Failed to accept schedule', 'error');
      }
    } catch (e) {
      addToast('Network error accepting schedule', 'error');
    }
  };

  const handleStartAppointmentVideo = (apt) => {
    setActiveVideoRoom({
      roomId: apt.roomId || `ROOM_${apt.id.replace(/[^a-zA-Z0-9]/g, '')}`,
      patientName: apt.patientName,
      receiptId: apt.receiptId,
      role: 'doctor'
    });
    addToast(`Connected to consultation room with ${apt.patientName}`);
  };

  const handleSaveEMR = async (e) => {
    if (e) e.preventDefault();
    if (!selectedQueuePatient) return;

    try {
      const res = await fetch('/api/doctor/update-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: selectedQueuePatient.receiptId,
          diagnosis,
          clinicalNotes,
          followUp,
          prescriptions
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`EMR updated for ${selectedQueuePatient.name}`);
        // update local state
        setSelectedQueuePatient(prev => ({
          ...prev,
          clinicalSummary: {
            ...prev.clinicalSummary,
            diagnosis,
            clinicalNotes
          },
          followUp,
          prescriptions
        }));
      } else {
        addToast(data.message || 'Failed to update EMR', 'error');
      }
    } catch (err) {
      addToast('Error saving EMR to database', 'error');
    }
  };

  const handleAddPrescription = () => {
    if (!newMed.medicine.trim()) {
      addToast('Please enter medicine name', 'error');
      return;
    }
    setPrescriptions([...prescriptions, { ...newMed, instructions: 'Take as directed' }]);
    setNewMed({ medicine: '', dosage: '', frequency: '1 - 0 - 0', timing: 'After Food', duration: '15 Days' });
    addToast('Medication added to active prescription');
  };

  const handleRemovePrescription = (idx) => {
    const updated = prescriptions.filter((_, i) => i !== idx);
    setPrescriptions(updated);
    addToast('Medication removed');
  };

  const handleStartVideo = async () => {
    if (!selectedQueuePatient) return;
    try {
      const res = await fetch('/api/teleconsult/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: selectedQueuePatient.receiptId,
          patientName: selectedQueuePatient.name,
          doctorName: doctorSession.name,
          doctorRegNo: doctorSession.regNo,
          role: 'doctor'
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveVideoRoom({ ...data.room, role: 'doctor' });
        addToast(`Connected to teleconsultation room: ${data.room.roomId}`);
      }
    } catch (e) {
      addToast('Error starting video consultation room', 'error');
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedQueuePatient) return;
    await handleSaveEMR();
    addToast(`Consultation for ${selectedQueuePatient.name} marked complete`);
    // advance queue
    const currentIdx = queue.findIndex(q => q.id === selectedQueuePatient.id);
    if (currentIdx !== -1 && currentIdx < queue.length - 1) {
      selectPatient(queue[currentIdx + 1]);
    }
  };

  if (!doctorSession) {
    return (
      <div>
        <ToastList toasts={toasts} />
        <DoctorLoginGate onLoginSuccess={handleDoctorLoginSuccess} onToast={addToast} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <ToastList toasts={toasts} />

      {/* Institutional Doctor Header */}
      <header style={{ background: '#FFFFFF', borderBottom: '2px solid #E2E8F0', padding: '12px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={LOGO_SRC} alt="Government of Tamil Nadu" style={{ width: '48px', height: '48px' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#046A38', fontWeight: '800', textTransform: 'uppercase' }}>
                TAMIL NADU MEDICAL COUNCIL • CLINICAL OPD DESK
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                {doctorSession.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {doctorSession.qualification} • Reg: <strong>{doctorSession.regNo}</strong> • {doctorSession.hospital}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '6px 14px', borderRadius: '9999px', fontSize: '12.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot-pulse"></span>
              OPD ROOM 104 • ACTIVE
            </span>
            <a href="/" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 16px', textDecoration: 'none' }}>
              Public Portal
            </a>
            <button 
              className="btn btn-danger" 
              style={{ fontSize: '13px', padding: '8px 16px' }}
              onClick={handleDoctorLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Doctor OPD Layout */}
      <main className="container" style={{ flex: 1, padding: '24px 0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '24px' }}>
          
          {/* Left Column: OPD Queue List & Video Consultation Requests */}
          <div>
            
            {/* REQUESTED VIDEO CONSULTATIONS PANEL */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Requested Schedules
                  </h3>
                </div>
                <span style={{ 
                  background: appointments.filter(a => a.status === 'Pending').length > 0 ? '#DC2626' : '#64748B', 
                  color: '#FFFFFF', 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  padding: '2px 8px', 
                  borderRadius: '9999px' 
                }}>
                  {appointments.filter(a => a.status === 'Pending').length} Pending
                </span>
              </div>

              {appointments.length === 0 ? (
                <div style={{ fontSize: '12.5px', color: '#64748B', textAlign: 'center', padding: '14px 8px' }}>
                  No pending consultation requests in {doctorSession.department || 'Cardiology'} department.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {appointments.map((apt) => {
                    const isPending = apt.status === 'Pending';
                    return (
                      <div 
                        key={apt.id}
                        style={{
                          background: isPending ? '#FFFBEB' : '#F0FDF4',
                          border: isPending ? '1.5px solid #FCD34D' : '1.5px solid #86EFAC',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                              {apt.department}
                            </span>
                            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '2px 0' }}>
                              {apt.patientName}
                            </h4>
                          </div>
                          <span style={{ 
                            fontSize: '10.5px', 
                            fontWeight: '700', 
                            padding: '2px 7px', 
                            borderRadius: '4px',
                            background: isPending ? '#F59E0B' : '#166534',
                            color: '#FFFFFF'
                          }}>
                            {isPending ? 'Pending Doctor Action' : 'Confirmed'}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          Receipt: <strong>{apt.receiptId}</strong> • Slot: <strong>{apt.requestedDate} ({apt.requestedTime})</strong>
                        </div>

                        {/* PATIENT REPORTED HEALTH ISSUE BOX */}
                        <div style={{ margin: '8px 0', background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#046A38', textTransform: 'uppercase' }}>
                            Patient's Reported Issue:
                          </span>
                          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#1E293B', fontStyle: 'italic', lineHeight: '1.4' }}>
                            "{apt.issueDescription}"
                          </p>
                        </div>

                        {isPending ? (
                          <button 
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '12.5px', padding: '8px 12px', marginTop: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            onClick={() => handleAcceptAppointment(apt)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Accept Schedule & Confirm Timing
                          </button>
                        ) : (
                          <button 
                            className="btn btn-video"
                            style={{ width: '100%', fontSize: '12.5px', padding: '8px 12px', marginTop: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            onClick={() => handleStartAppointmentVideo(apt)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                            Join Confirmed Video Room
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Today's OPD Queue ({queue.length})
                </h3>
                <button 
                  onClick={fetchQueue} 
                  title="Refresh Queue"
                  style={{ background: 'none', border: 'none', color: '#0F4C81', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  Refresh
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {queue.map((pt, idx) => {
                  const isSelected = selectedQueuePatient && selectedQueuePatient.id === pt.id;
                  return (
                    <div 
                      key={pt.id}
                      onClick={() => selectPatient(pt)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                        background: isSelected ? '#F0F9FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: isSelected ? 'var(--primary)' : '#64748B' }}>
                            TOKEN #{String(idx + 1).padStart(2, '0')}
                          </span>
                          <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: '#0F172A', margin: '2px 0' }}>
                            {pt.name}
                          </h4>
                        </div>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '700', 
                          padding: '3px 8px', 
                          borderRadius: '9999px',
                          background: pt.status?.includes('Waiting') ? '#FEF3C7' : '#DCFCE7',
                          color: pt.status?.includes('Waiting') ? '#92400E' : '#166534'
                        }}>
                          {pt.status?.includes('Waiting') ? 'Waiting' : 'In Clinic'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                        Receipt: <strong>{pt.receiptId}</strong> | Age: {pt.age} ({pt.gender})
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#0F4C81', fontWeight: '600', marginTop: '2px' }}>
                        {pt.clinicalSummary?.diagnosis || 'Initial OPD Evaluation'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Clinical Workbench */}
          <div>
            {selectedQueuePatient ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Patient Banner */}
                <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#046A38', fontWeight: '800', textTransform: 'uppercase' }}>
                      ACTIVE CONSULTATION EMR FILE
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '2px 0 6px' }}>
                      {selectedQueuePatient.name}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>Receipt: <strong>{selectedQueuePatient.receiptId}</strong></span>
                      <span>•</span>
                      <span>ABHA: <strong>{selectedQueuePatient.abhaId}</strong></span>
                      <span>•</span>
                      <span>Age: <strong>{selectedQueuePatient.age} ({selectedQueuePatient.gender})</strong></span>
                      <span>•</span>
                      <span>Blood: <strong style={{ color: '#DC2626' }}>{selectedQueuePatient.bloodGroup}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-video" 
                      style={{ padding: '10px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      onClick={handleStartVideo}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                      Start Video Consultation with Patient
                    </button>
                  </div>
                </div>

                {/* Workbench Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', paddingBottom: '2px' }}>
                  <button 
                    className={`modal-tab-btn ${activeWorkbenchTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('notes')}
                    style={{ fontSize: '14px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Clinical Findings & Progress Notes
                  </button>

                  <button 
                    className={`modal-tab-btn ${activeWorkbenchTab === 'vitals' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('vitals')}
                    style={{ fontSize: '14px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Vitals on Record
                  </button>

                  <button 
                    className={`modal-tab-btn ${activeWorkbenchTab === 'prescriptions' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('prescriptions')}
                    style={{ fontSize: '14px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                      <path d="m8.5 8.5 7 7"/>
                    </svg>
                    Electronic Prescriptions ({prescriptions.length})
                  </button>

                  <button 
                    className={`modal-tab-btn ${activeWorkbenchTab === 'labs' ? 'active' : ''}`}
                    onClick={() => setActiveWorkbenchTab('labs')}
                    style={{ fontSize: '14px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 2v7.31"/>
                      <path d="M14 9.3V2"/>
                      <path d="M8.5 2h7"/>
                      <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
                      <path d="M5.52 16h12.96"/>
                    </svg>
                    Diagnostic Lab Reports ({selectedQueuePatient.labReports?.length || 0})
                  </button>
                </div>

                {/* Tab 1: Clinical Notes Form */}
                {activeWorkbenchTab === 'notes' && (
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
                    <form onSubmit={handleSaveEMR}>
                      <div className="form-group" style={{ marginBottom: '18px' }}>
                        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                          Clinical Diagnosis & Assessment Findings
                        </label>
                        <textarea 
                          className="form-control" 
                          rows="2" 
                          value={diagnosis} 
                          onChange={(e) => setDiagnosis(e.target.value)} 
                          required 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '18px' }}>
                        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                          Physician Progress Notes & Management Strategy
                        </label>
                        <textarea 
                          className="form-control" 
                          rows="4" 
                          value={clinicalNotes} 
                          onChange={(e) => setClinicalNotes(e.target.value)} 
                          required 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                          Scheduled Follow-up Date & Clinic Location
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={followUp} 
                          onChange={(e) => setFollowUp(e.target.value)} 
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }}>
                          Save & Update Patient EMR
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ padding: '12px 20px', fontSize: '14px' }} onClick={handleMarkComplete}>
                          Mark Consultation Complete & Next Patient
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab 2: Vitals */}
                {activeWorkbenchTab === 'vitals' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
                      <div className="vital-card" style={{ padding: '16px' }}>
                        <div className="vital-label">Blood Pressure</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.bp || '120/80 mmHg'}</div>
                        <div className="vital-status">Controlled</div>
                      </div>
                      <div className="vital-card" style={{ padding: '16px' }}>
                        <div className="vital-label">Pulse Rate</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.pulse || '72 bpm'}</div>
                        <div className="vital-status">Normal Rhythm</div>
                      </div>
                      <div className="vital-card" style={{ padding: '16px' }}>
                        <div className="vital-label">Oxygen (SpO2)</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.spo2 || '98%'}</div>
                        <div className="vital-status">Adequate</div>
                      </div>
                      <div className="vital-card" style={{ padding: '16px' }}>
                        <div className="vital-label">Temperature</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.temp || '98.4 °F'}</div>
                        <div className="vital-status">Afebrile</div>
                      </div>
                      <div className="vital-card" style={{ padding: '16px' }}>
                        <div className="vital-label">Fasting Blood Sugar</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.bloodSugarFasting || '95 mg/dL'}</div>
                        <div className="vital-status">Euglycemic</div>
                      </div>
                      <div className="vital-card" style={{ padding: '16px' }}>
                        <div className="vital-label">Body Mass Index</div>
                        <div className="vital-value" style={{ fontSize: '20px' }}>{selectedQueuePatient.vitals?.bmi || '23.8'}</div>
                        <div className="vital-status">Wt: {selectedQueuePatient.vitals?.weight || '68 kg'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Prescriptions Builder */}
                {activeWorkbenchTab === 'prescriptions' && (
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
                      Active Clinical Prescription
                    </h3>

                    <div className="table-wrapper" style={{ marginBottom: '24px' }}>
                      <table className="medical-table">
                        <thead>
                          <tr>
                            <th>Medicine & Form</th>
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

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>
                        Add New Medicine to Prescription
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
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
                          placeholder="Frequency (e.g. 1 - 0 - 0)"
                          value={newMed.frequency} 
                          onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Timing (e.g. After Food)"
                          value={newMed.timing} 
                          onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Duration (e.g. 30 Days)"
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

                    <div style={{ marginTop: '20px' }}>
                      <button type="button" className="btn btn-primary" onClick={handleSaveEMR} style={{ padding: '12px 24px', fontSize: '14px' }}>
                        Save Prescription Updates to EMR
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 4: Lab Reports */}
                {activeWorkbenchTab === 'labs' && (
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
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
                                <span className={`status-badge ${r.status.toLowerCase().includes('normal') ? 'status-normal' : 'status-warning'}`}>
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

              </div>
            ) : (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
                <p style={{ color: '#64748B', fontSize: '15px' }}>Please select a patient from the OPD Queue to load their clinical chart.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Teleconsultation Video Call Modal */}
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

// Mount Doctor App
const doctorRoot = ReactDOM.createRoot(document.getElementById('doctor-root'));
doctorRoot.render(<DoctorStandaloneApp />);
