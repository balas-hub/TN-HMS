// ===========================================================================
// TAMIL NADU HEALTH CARE & PAN-INDIA MEDICAL CENTRE - REACT APPLICATION
// Robust Base64 Emblem Rendering, Royal Medical Color Palette, Dedicated Portals
// ===========================================================================

const { useState, useEffect, useRef, useCallback } = React;

// Emblem source guaranteed from inlined data URL or local WebP
const LOGO_SRC = (typeof window !== 'undefined' && window.TN_EMBLEM_DATA_URL) 
  ? window.TN_EMBLEM_DATA_URL 
  : '/Tamil_Nadu.webp';

// Toast Notification Mount Component
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

// 1. TOP BANNER (REMOVED AS PER USER INSTRUCTION)
function TopBanner() {
  return null;
}

// 2. MAIN HEADER
function Header({ onNavigate, clientSession, doctorSession, onOpenLoginModal }) {
  return (
    <header className="main-header">
      <div className="container header-inner">
        <div className="brand-wrapper" onClick={() => onNavigate('home')}>
          <img 
            src={LOGO_SRC} 
            alt="Medical Emblem" 
            className="emblem-logo-img"
          />
          <div className="brand-text">
            <span className="brand-tamil" style={{ color: '#0284C7', fontWeight: '800', fontSize: '11px', letterSpacing: '0.5px' }}>NATIONAL DIGITAL HEALTH MISSION</span>
            <span className="brand-title">Health Care Portal</span>
            <span className="brand-subtitle">Pan-India Medical Centre & Multi Super Speciality Network</span>
          </div>
        </div>

        <ul className="nav-menu">
          <li><a href="#hero-search" className="nav-link active">Home</a></li>
          <li><a href="/client" className="nav-link">Patient Portal</a></li>
          <li><a href="/doctor" className="nav-link">Doctor OPD</a></li>
          <li><a href="/lis" className="nav-link" style={{ color: '#0D9488', fontWeight: '700' }}>🔬 LIS Lab</a></li>
          <li><a href="/pis" className="nav-link" style={{ color: '#046A38', fontWeight: '700' }}>💊 PIS Pharmacy</a></li>
          <li><a href="/ris" className="nav-link" style={{ color: '#0284C7', fontWeight: '700' }}>☢️ RIS Scan Ward</a></li>
        </ul>

        <div className="nav-cta-group">
          {clientSession ? (
            <a href="/client" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              My Patient Portal ({clientSession.name.split(' ')[0]})
            </a>
          ) : (
            <a href="/client" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Client Login
            </a>
          )}

          {doctorSession && (
            <a href="/doctor" className="btn btn-doctor" style={{ textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Doctor Workbench ({doctorSession.name.split(' ')[1] || 'Doctor'})
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

// 2.5 SCHEDULE VIDEO CONSULTATION MODAL COMPONENT
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
          phone: patient.phone || patient.contact || '9876543210',
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

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-dialog" style={{ maxWidth: '560px', width: '92%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
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
              <span style={{ fontSize: '11.5px', color: '#93C5FD' }}>Direct Tele-OPD with Government Hospital Specialists</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', background: '#FFFFFF' }}>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '12.5px', color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Your request and health issue will be broadcasted to <strong>all doctors in the chosen department</strong>. Once any doctor accepts, you will receive confirmed timing notification.</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Select Specialty / Medical Department <span style={{ color: '#DC2626' }}>*</span>
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

          <div style={{ marginBottom: '16px' }}>
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
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>This description will be immediately reviewed by the respective doctors on their clinical workbench.</span>
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

// 3. DEDICATED SEPARATE CLIENT / PATIENT PORTAL PAGE
function DedicatedClientPortalPage({ patient, onLogout, onNavigateHome, onStartVideoCall, onToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [activePACSStudy, setActivePACSStudy] = useState(null);

  const fetchAppointments = useCallback(async () => {
    const pid = patient.id || patient.receiptId;
    if (!pid) return;
    try {
      const res = await fetch(`/api/appointments/patient/${encodeURIComponent(pid)}`);
      const data = await res.json();
      if (data.success && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (e) {}
  }, [patient]);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const confirmedAppointment = appointments.find(a => a.status === 'Confirmed');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#FFFFFF', borderBottom: '2px solid var(--primary)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onNavigateHome}>
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
            <button className="btn btn-video" onClick={() => onStartVideoCall(patient, 'patient')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Live Video Room
            </button>
            <button className="btn btn-outline" onClick={onNavigateHome}>
              Public Portal
            </button>
            <button className="btn btn-danger" style={{ padding: '8px 14px' }} onClick={onLogout}>
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
              onClick={() => onStartVideoCall({ ...patient, roomId: confirmedAppointment.roomId, doctorName: confirmedAppointment.doctorName }, 'patient')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Enter Video Consultation Room Now
            </button>
          </div>
        )}

        <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="patient-avatar-box" style={{ width: '74px', height: '74px', fontSize: '28px' }}>
              {patient.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge-gov">VERIFIED CITIZEN</span>
                <span className="badge-primary">ABHA COMPLIANT</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
                Welcome, {patient.name}
              </h1>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#475569' }}>
                <span>ABHA ID: <strong>{patient.abhaId}</strong></span>
                <span>•</span>
                <span>Blood: <strong style={{ color: '#DC2626' }}>{patient.bloodGroup}</strong></span>
                <span>•</span>
                <span>Receipt: <strong>{patient.receiptId}</strong></span>
                <span>•</span>
                <span>Hospital: <strong>{patient.centerName}</strong></span>
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
            <button className="btn btn-video" style={{ padding: '12px 20px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => onStartVideoCall(patient, 'patient')}>
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
            Prescriptions ({patient.prescriptions.length})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
            onClick={() => setActiveTab('labs')}
            style={{ fontSize: '15px', padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
            Diagnostic Lab Reports ({patient.labReports.length})
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
            Radiology & Digital Scans ({patient.radiologyStudies?.length || 0})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Blood Pressure</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patient.vitals.bp}</div>
                <div className="vital-status">Controlled</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Pulse Rate</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patient.vitals.pulse}</div>
                <div className="vital-status">Normal Rhythm</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Oxygen (SpO2)</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patient.vitals.spo2}</div>
                <div className="vital-status">Adequate</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Temperature</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patient.vitals.temp}</div>
                <div className="vital-status">Afebrile</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Blood Sugar (F)</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patient.vitals.bloodSugarFasting}</div>
                <div className="vital-status">Fasting</div>
              </div>
              <div className="vital-card" style={{ padding: '16px' }}>
                <div className="vital-label">Body Mass Index</div>
                <div className="vital-value" style={{ fontSize: '20px' }}>{patient.vitals.bmi || '24.2'}</div>
                <div className="vital-status">Wt: {patient.vitals.weight}</div>
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
                  {patient.clinicalSummary.diagnosis}
                </div>
                <p style={{ fontSize: '13.5px', marginBottom: '8px' }}>
                  <strong>Chief Complaints:</strong> {patient.clinicalSummary.chiefComplaints}
                </p>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
                  <strong>Doctor Clinical Notes:</strong> {patient.clinicalSummary.clinicalNotes}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#DC2626', fontWeight: '700', marginTop: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>Drug Allergies: {patient.clinicalSummary.allergies}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', padding: '14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#92400E', fontSize: '13.5px' }}>Next Scheduled Follow-up:</strong>
                  <div style={{ color: '#78350F', fontSize: '13px', marginTop: '2px' }}>{patient.followUp}</div>
                </div>
                <button className="btn btn-video" style={{ fontSize: '12px' }} onClick={() => onStartVideoCall(patient, 'patient')}>
                  Join Scheduled Video Room
                </button>
              </div>
            </div>
          </div>
        )}

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
                              onClick={() => onStartVideoCall({ ...patient, roomId: apt.roomId, doctorName: apt.doctorName }, 'patient')}
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
                  {patient.prescriptions.map((rx, idx) => (
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

        {activeTab === 'labs' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Laboratory & Diagnostic Investigations
            </h3>
            <div className="table-wrapper">
              <table className="medical-table">
                <thead>
                  <tr>
                    <th>Investigation / Test Name</th>
                    <th>Date</th>
                    <th>Observed Result</th>
                    <th>Normal Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.labReports.map((lab, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600', color: '#0F172A' }}>{lab.testName}</td>
                      <td>{lab.date}</td>
                      <td><strong>{lab.result}</strong></td>
                      <td>{lab.normalRange}</td>
                      <td>
                        <span className={`status-badge ${
                          lab.status.toLowerCase().includes('high') ? 'status-alert' :
                          lab.status.toLowerCase().includes('danger') ? 'status-danger' : 'status-normal'
                        }`}>
                          {lab.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)
            </h3>
            <div className="insurance-banner">
              <div>
                <strong style={{ fontSize: '15px', color: '#0F172A' }}>{patient.billing.insuranceScheme}</strong>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  Total Hospital Claim: <strong>{patient.billing.totalAmount}</strong> | Scheme Coverage: <strong>{patient.billing.schemeApproved}</strong>
                </div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary-dark)' }}>
                Citizen Payable: {patient.billing.patientPayable} ({patient.billing.paymentStatus})
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            {/* OFFICIAL ABHA DIGITAL HEALTH CARD */}
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
              {/* Background watermark badge */}
              <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', opacity: 0.08, pointerEvents: 'none' }}>
                <img src={LOGO_SRC} alt="" style={{ width: '220px', height: '220px' }} />
              </div>

              {/* Top Bar of the Card */}
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

              {/* Card Main Body */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '24px', alignItems: 'center' }}>
                {/* Photo Placeholder */}
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

                {/* Identity Info */}
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.3px', marginBottom: '4px' }}>
                    {patient.name}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#E2E8F0', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span>DOB: <strong>{patient.dob || 'Recorded upon checkup'}</strong></span>
                    <span>Age: <strong>{patient.age} Yrs</strong></span>
                    <span>Gender: <strong>{patient.gender}</strong></span>
                    <span>Blood: <strong style={{ color: '#FCA5A5' }}>{patient.bloodGroup}</strong></span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px 20px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#A7F3D0', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>ABHA Number</span>
                      <strong style={{ fontSize: '15px', letterSpacing: '1px', color: '#FFFFFF' }}>{patient.abhaId}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#A7F3D0', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>ABHA Address</span>
                      <strong style={{ fontSize: '13.5px', color: '#F0FDF4' }}>{patient.abhaAddress}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#A7F3D0', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>OPD Receipt ID</span>
                      <strong style={{ fontSize: '14px', color: '#FDE047' }}>{patient.receiptId}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#A7F3D0', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>Registered Mobile</span>
                      <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>{patient.phone}</strong>
                    </div>
                  </div>
                </div>

                {/* Simulated Digital Security QR */}
                <div style={{
                  background: '#FFFFFF',
                  padding: '10px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <svg width="84" height="84" viewBox="0 0 100 100" fill="#0F172A">
                    <rect x="0" y="0" width="30" height="30" fill="#0F172A" rx="4"/>
                    <rect x="6" y="6" width="18" height="18" fill="#FFFFFF" rx="2"/>
                    <rect x="11" y="11" width="8" height="8" fill="#0F172A" rx="1"/>

                    <rect x="70" y="0" width="30" height="30" fill="#0F172A" rx="4"/>
                    <rect x="76" y="6" width="18" height="18" fill="#FFFFFF" rx="2"/>
                    <rect x="81" y="11" width="8" height="8" fill="#0F172A" rx="1"/>

                    <rect x="0" y="70" width="30" height="30" fill="#0F172A" rx="4"/>
                    <rect x="6" y="76" width="18" height="18" fill="#FFFFFF" rx="2"/>
                    <rect x="11" y="81" width="8" height="8" fill="#0F172A" rx="1"/>

                    <rect x="36" y="8" width="8" height="8" fill="#0F172A"/>
                    <rect x="48" y="14" width="8" height="8" fill="#0F172A"/>
                    <rect x="36" y="24" width="8" height="8" fill="#0F172A"/>

                    <rect x="14" y="36" width="8" height="8" fill="#0F172A"/>
                    <rect x="26" y="44" width="8" height="8" fill="#0F172A"/>
                    <rect x="8" y="52" width="8" height="8" fill="#0F172A"/>

                    <rect x="38" y="38" width="24" height="24" fill="#065F46" rx="3"/>
                    <rect x="44" y="44" width="12" height="12" fill="#FFFFFF" rx="2"/>

                    <rect x="72" y="38" width="8" height="8" fill="#0F172A"/>
                    <rect x="84" y="46" width="8" height="8" fill="#0F172A"/>
                    <rect x="68" y="56" width="8" height="8" fill="#0F172A"/>

                    <rect x="36" y="72" width="8" height="8" fill="#0F172A"/>
                    <rect x="48" y="80" width="8" height="8" fill="#0F172A"/>
                    <rect x="62" y="72" width="8" height="8" fill="#0F172A"/>
                    <rect x="76" y="78" width="8" height="8" fill="#0F172A"/>
                    <rect x="88" y="70" width="8" height="8" fill="#0F172A"/>
                    <rect x="82" y="86" width="8" height="8" fill="#0F172A"/>
                  </svg>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: '#065F46', marginTop: '4px', letterSpacing: '0.5px' }}>
                    VERIFIED ABDM
                  </div>
                </div>
              </div>

              {/* Card Footer Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '11.5px', color: '#D1FAE5', flexWrap: 'wrap', gap: '8px' }}>
                <div>Center: <strong>{patient.centerName}</strong></div>
                <div>Coverage: <strong>Chief Minister's Comprehensive Health Insurance Scheme Active</strong></div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
              <button className="btn btn-outline" onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print Health Card & Demographic Record
              </button>
            </div>

            {/* COMPREHENSIVE PERSONAL DETAILS TABLE */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
                Registered Citizen Personal Details (Saved in Government Database)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Full Legal Name</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{patient.name}</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Date of Birth & Age</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                    {patient.dob ? `${patient.dob} (${patient.age} Years)` : `${patient.age} Years`}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Gender & Blood Group</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                    {patient.gender} • <span style={{ color: '#DC2626' }}>{patient.bloodGroup}</span>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Father / Spouse / Guardian</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                    {patient.guardianName || 'Self / Primary Head of Family'}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Primary Mobile Phone</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{patient.phone}</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Emergency Contact Phone</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                    {patient.emergencyPhone || patient.phone}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Official Email Address</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                    {patient.email || `${patient.abhaAddress.split('@')[0]}@tnhealth.gov.in`}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>District / City</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                    {patient.district || 'Chennai (Apex Zone)'}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Postal PIN Code</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                    {patient.pincode || '600001'}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Apex Hospital</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                    {patient.centerName}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Residential Street Address</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                    {patient.address}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Clinical Allergies & Notes</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#DC2626', marginTop: '2px' }}>
                    {patient.clinicalSummary ? patient.clinicalSummary.allergies : 'None Reported'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Radiology & Digital Scans */}
        {activeTab === 'radiology' && (
          <RadiologyStudiesPanel
            studies={patient.radiologyStudies || []}
            onLaunchPACS={(study) => setActivePACSStudy(study)}
            onOrderStudy={null}
            isDoctor={false}
          />
        )}

        {/* Schedule Consultation Modal */}
        <ScheduleConsultationModal 
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          patient={patient}
          onToast={onToast}
          onScheduled={fetchAppointments}
        />
      </main>

      {/* PACS DICOM Medical Imaging Viewer Modal */}
      {activePACSStudy && (
        <PACSViewerModal
          study={activePACSStudy}
          onClose={() => setActivePACSStudy(null)}
          onToast={onToast}
        />
      )}
    </div>
  );
}

// 4. DEDICATED SEPARATE DOCTOR PORTAL PAGE
function DedicatedDoctorPortalPage({ doctor, onLogout, onNavigateHome, onStartVideoCall, onToast, onSearch }) {
  const [selectedQueuePatient, setSelectedQueuePatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [medName, setMedName] = useState('');
  const [medFreq, setMedFreq] = useState('1 - 0 - 1');
  const [requestedAppointments, setRequestedAppointments] = useState([]);

  const fetchDoctorAppointments = useCallback(async () => {
    try {
      const dept = doctor.specialty || doctor.department || 'Cardiology';
      const res = await fetch(`/api/appointments/doctor?department=${encodeURIComponent(dept)}&regNo=${encodeURIComponent(doctor.regNo)}`);
      const data = await res.json();
      if (data.success && data.appointments) {
        setRequestedAppointments(data.appointments);
      }
    } catch (e) {}
  }, [doctor]);

  useEffect(() => {
    fetchDoctorAppointments();
    const interval = setInterval(fetchDoctorAppointments, 5000);
    return () => clearInterval(interval);
  }, [fetchDoctorAppointments]);

  useEffect(() => {
    if (doctor?.todayQueue?.length > 0) {
      loadPatientDetails(doctor.todayQueue[0].receiptId);
    }
  }, [doctor]);

  const loadPatientDetails = async (receiptId) => {
    try {
      const res = await fetch(`/api/patients/search?q=${receiptId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedQueuePatient(data.patient);
        setDiagnosis(data.patient.clinicalSummary.diagnosis);
        setNotes(data.patient.clinicalSummary.clinicalNotes);
        setBp(data.patient.vitals.bp);
        setPulse(data.patient.vitals.pulse);
      }
    } catch (e) {}
  };

  const handleAttendPatient = async (patient) => {
    if (!patient) return;
    try {
      await fetch('/api/doctor/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: patient.receiptId,
          patientId: patient.id,
          doctor: {
            name: doctor.name,
            regNo: doctor.regNo,
            department: doctor.specialty || doctor.department || 'Cardiology'
          }
        })
      });
      onToast(`👨‍⚕️ Dr. ${doctor.name} (${doctor.specialty || doctor.department || 'Specialist'}) is attending ${patient.name}`);
    } catch (e) {}
  };

  const handleGenerateNotes = (formatKey) => {
    if (!selectedQueuePatient) return;
    const p = selectedQueuePatient;
    const docDept = doctor.specialty || doctor.department || 'Cardiology';
    const complaints = p.clinicalSummary?.chiefComplaints || 'Routine outpatient consultation.';
    const allergies = p.clinicalSummary?.allergies || 'No known drug allergies (NKDA)';
    const diag = diagnosis || p.clinicalSummary?.diagnosis || 'Clinical evaluation';
    const bpVal = bp || p.vitals?.bp || '120/80 mmHg';
    const pulseVal = pulse || p.vitals?.pulse || '74 bpm';
    const spo2Val = p.vitals?.spo2 || '98%';
    const tempVal = p.vitals?.temp || '98.4 °F';
    const bsVal = p.vitals?.bloodSugarFasting || '95 mg/dL';

    let generatedText = '';
    let suggestedDiag = diag;

    if (formatKey === 'cardiology') {
      suggestedDiag = suggestedDiag.includes('Card') || suggestedDiag.includes('Hypertension') ? suggestedDiag : 'Essential Systemic Hypertension Stage-II with Left Ventricular Strain';
      generatedText = `CARDIOLOGY OUTPATIENT CONSULTATION & HEMODYNAMIC REVIEW
Patient: ${p.name} (${p.age}y / ${p.gender}) | Ref: ${p.receiptId}
Attending Specialist: ${doctor.name} (${doctor.regNo} - ${docDept})

1. CHIEF PRESENTATION & CARDIOVASCULAR HISTORY:
• Patient presented with: "${complaints}"
• Cardiac Risk Factors: Known hypertension, sedentary profile, Fasting Sugar: ${bsVal}.
• Known Drug Allergies: ${allergies}.

2. PHYSICAL EXAMINATION & CARDIOVASCULAR FINDINGS:
• Blood Pressure: ${bpVal} (Target: <130/80 mmHg) | Pulse: ${pulseVal} (Regular rhythm, no deficit).
• SpO2: ${spo2Val} on room air | Temperature: ${tempVal}.
• Heart Sounds: S1, S2 audible clearly. No pathological murmurs, gallops, or friction rubs.
• Peripheral Perfusion: Bilateral dorsalis pedis and radial pulses palpable; no pedal edema.

3. CLINICAL ASSESSMENT & PLAN:
• Impression: ${suggestedDiag}
• Optimize anti-hypertensive titration. Low sodium dietary regime (<2g NaCl/day).
• Follow-up lipid profile and serum electrolytes in 4 weeks.`;
    } else if (formatKey === 'neurology') {
      suggestedDiag = 'Chronic Vascular Cephalea / Tension-Type Neuro-Vascular Headache';
      generatedText = `NEUROLOGICAL CLINICAL EVALUATION & CRANIAL NERVE EXAM
Patient: ${p.name} (${p.age}y / ${p.gender}) | Ref: ${p.receiptId}
Attending Neurologist: ${doctor.name} (${doctor.regNo})

1. SUBJECTIVE SYMPTOMATOLOGY:
• Primary Complaints: "${complaints}"
• Drug Allergies: ${allergies}.

2. OBJECTIVE NEUROLOGIC STATUS:
• Hemodynamics: BP ${bpVal}, Pulse ${pulseVal}, SpO2 ${spo2Val}.
• Higher Mental Functions: Alert, conscious, oriented to time, place, and person (GCS 15/15).
• Cranial Nerves: CN II-XII grossly intact. Pupils equal, round, and reactive to light (PEARL 3mm).
• Motor Function: Muscle tone normal. Power 5/5 in all 4 extremities. Reflexes 2+ symmetrical.
• Sensory & Cerebellar: Normal light touch sensation. Finger-to-nose test negative. Gait steady.

3. IMPRESSION & MANAGEMENT:
• Assessment: ${suggestedDiag}
• Prophylactic neuro-protective management initiated. Sleep hygiene advised.`;
    } else if (formatKey === 'soap') {
      generatedText = `INSTITUTIONAL CLINICAL SOAP PROGRESS NOTE
Patient: ${p.name} | Receipt: ${p.receiptId} | Attending: Dr. ${doctor.name}

[S] SUBJECTIVE:
• Chief Complaint: "${complaints}"
• Reported Allergies: ${allergies}

[O] OBJECTIVE:
• Vitals: BP ${bpVal} | Pulse ${pulseVal} | SpO2 ${spo2Val} | Temp ${tempVal} | FBS ${bsVal}
• General: Conscious, oriented, no pallor, icterus, cyanosis, or lymphadenopathy.

[A] ASSESSMENT:
• Definitive Diagnosis: ${diag}

[P] PLAN:
• Medical therapy prescribed as per Tamil Nadu Essential Drug List.
• Diet and lifestyle counselling provided. Review in OPD as advised.`;
    }

    if (suggestedDiag && (!diagnosis || diagnosis === 'Routine outpatient consultation.')) {
      setDiagnosis(suggestedDiag);
    }
    setNotes(generatedText);
    onToast(`✨ Generated ${formatKey.toUpperCase()} clinical documentation for ${p.name}`);
  };

  const handleAcceptSchedule = async (apt) => {
    try {
      const res = await fetch('/api/appointments/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: apt.id,
          doctorName: doctor.name,
          doctorRegNo: doctor.regNo,
          department: doctor.specialty || doctor.department || 'Cardiology',
          confirmedTime: `${apt.requestedDate} at ${apt.requestedTime}`
        })
      });
      const data = await res.json();
      if (data.success) {
        onToast(`Schedule accepted for ${apt.patientName}! Patient portal updated with confirmed timing.`);
        fetchDoctorAppointments();
      } else {
        onToast(data.message || 'Error accepting schedule', 'error');
      }
    } catch (e) {
      onToast('Network error accepting schedule', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedQueuePatient) return;

    let newPrescriptions = [];
    if (medName.trim()) {
      newPrescriptions.push({
        medicine: medName.trim(),
        dosage: 'Standard',
        frequency: medFreq,
        timing: 'After Food',
        duration: '7 Days',
        instructions: 'Doctor prescribed during consultation'
      });
    }

    try {
      const res = await fetch('/api/doctor/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: selectedQueuePatient.receiptId,
          diagnosis,
          notes,
          bp,
          pulse,
          newPrescriptions,
          consultingDoctor: doctor.name,
          doctorRegNo: doctor.regNo
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedQueuePatient(data.patient);
        setMedName('');
        onToast(`Consultation record for ${data.patient.name} saved!`);
      }
    } catch (e) {
      onToast('Error updating consultation', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <header className="doctor-page-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={onNavigateHome}>
            <img src={LOGO_SRC} alt="Medical Emblem" className="emblem-logo-img" style={{ width: '44px', height: '44px' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase' }}>
                  CLINICAL OPD DESK • DOCTOR WORKBENCH
                </span>
                <span className="badge-primary" style={{ fontSize: '10px', padding: '1px 6px' }}>ONLINE ACTIVE</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: '2px 0 0 0' }}>
                {doctor.name} <span style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8' }}>({doctor.degrees})</span>
              </h2>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                Reg: <strong>{doctor.regNo}</strong> | {doctor.hospital} | <strong>{doctor.opdRoom}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: '#475569' }} onClick={onNavigateHome}>
              Public Hospital Site
            </button>
            <button className="btn btn-danger" onClick={onLogout}>
              Doctor Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: '24px 20px' }}>
        <div className="doctor-workbench-grid">
          <div className="queue-panel">
            
            {/* INCOMING VIDEO CONSULTATION REQUESTS WITH PATIENT REPORTED ISSUE */}
            <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '14px', marginBottom: '18px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Requested Schedules
                </span>
                <span style={{ 
                  background: requestedAppointments.filter(a => a.status === 'Pending').length > 0 ? '#DC2626' : '#64748B', 
                  color: '#FFFFFF', 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  padding: '2px 8px', 
                  borderRadius: '9999px' 
                }}>
                  {requestedAppointments.filter(a => a.status === 'Pending').length} Pending
                </span>
              </div>

              {requestedAppointments.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', padding: '12px 0' }}>
                  No video consultation requests in {doctor.specialty || doctor.department || 'Cardiology'} queue.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {requestedAppointments.map((apt) => {
                    const isPending = apt.status === 'Pending';
                    return (
                      <div 
                        key={apt.id}
                        style={{
                          background: isPending ? '#FFFBEB' : '#F0FDF4',
                          border: isPending ? '1.5px solid #FCD34D' : '1px solid #86EFAC',
                          borderRadius: '8px',
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong style={{ fontSize: '13px', color: '#0F172A' }}>{apt.patientName}</strong>
                          <span style={{ 
                            fontSize: '10.5px', 
                            fontWeight: '700', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            background: isPending ? '#F59E0B' : '#166534',
                            color: '#FFFFFF'
                          }}>
                            {isPending ? 'Pending Action' : 'Confirmed'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          Receipt: <strong>{apt.receiptId}</strong> • Slot: <strong>{apt.requestedDate} ({apt.requestedTime})</strong>
                        </div>
                        
                        <div style={{ margin: '6px 0', background: '#FFFFFF', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#046A38', textTransform: 'uppercase' }}>Reported Health Issue:</span>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#1E293B', fontStyle: 'italic', lineHeight: '1.4' }}>
                            "{apt.issueDescription}"
                          </p>
                        </div>

                        {isPending ? (
                          <button 
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '12px', padding: '6px 10px', marginTop: '4px', fontWeight: '700' }}
                            onClick={() => handleAcceptSchedule(apt)}
                          >
                            Accept Schedule & Confirm Timing
                          </button>
                        ) : (
                          <button 
                            className="btn btn-video"
                            style={{ width: '100%', fontSize: '12px', padding: '6px 10px', marginTop: '4px', fontWeight: '700' }}
                            onClick={() => onStartVideoCall({ ...apt, name: apt.patientName, receiptId: apt.receiptId }, 'doctor')}
                          >
                            Join Confirmed Video Room
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Today's OPD Queue</span>
              <span className="badge-primary">{doctor.todayQueue.length} Patients</span>
            </div>
            {doctor.todayQueue.map((item, idx) => (
              <div 
                key={idx} 
                className={`queue-item-card ${selectedQueuePatient?.receiptId === item.receiptId ? 'active' : ''}`}
                onClick={() => loadPatientDetails(item.receiptId)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: '#64748B' }}>
                  <span>TOKEN #{item.token}</span>
                  <span style={{ color: item.status.includes('Completed') ? 'var(--primary)' : 'var(--tn-gold)' }}>{item.status}</span>
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{item.patientName}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{item.type} (Age: {item.age})</div>
              </div>
            ))}
          </div>

          <div className="consult-workbench-card">
            {selectedQueuePatient ? (
              <div>
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>{selectedQueuePatient.name}</h3>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
                      Receipt ID: <strong>{selectedQueuePatient.receiptId}</strong> | ABHA: <strong>{selectedQueuePatient.abhaId}</strong> | Blood Group: <strong style={{ color: '#DC2626' }}>{selectedQueuePatient.bloodGroup}</strong> | Age: {selectedQueuePatient.age}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ background: '#0284C7', color: '#FFFFFF', padding: '10px 14px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      onClick={() => handleAttendPatient(selectedQueuePatient)}
                    >
                      👨‍⚕️ Attend Patient ({doctor.specialty || doctor.department || 'Specialist'})
                    </button>
                    <button className="btn btn-video" style={{ padding: '10px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => onStartVideoCall(selectedQueuePatient, 'doctor')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                      Start Video Consultation
                    </button>
                    <button className="btn btn-outline" style={{ fontSize: '12px' }} onClick={() => { onNavigateHome(); onSearch(selectedQueuePatient.receiptId); }}>
                      Full Sheet
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSave}>


                  <div className="form-group">
                    <label className="form-label">Clinical Diagnosis & Findings</label>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      value={diagnosis} 
                      onChange={(e) => setDiagnosis(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Physician Progress Clinical Notes</label>
                    <textarea 
                      className="form-control" 
                      rows="4" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <label className="form-label">Blood Pressure (mmHg)</label>
                      <input type="text" className="form-control" value={bp} onChange={(e) => setBp(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Pulse Rate (bpm)</label>
                      <input type="text" className="form-control" value={pulse} onChange={(e) => setPulse(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '16px', marginTop: '16px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Prescribe Additional Medication (Rx)</span>
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Active: {selectedQueuePatient.prescriptions.length} Meds</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Medicine Name (e.g. Tab. Azithromycin 500mg)" 
                        value={medName}
                        onChange={(e) => setMedName(e.target.value)}
                      />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Dosage (e.g. 1 - 0 - 1)" 
                        value={medFreq}
                        onChange={(e) => setMedFreq(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '14.5px' }}>
                      Save & Update Patient Record
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}>
                <img src={LOGO_SRC} alt="Emblem" style={{ width: '64px', height: '64px', opacity: 0.5, marginBottom: '14px' }} /><br/>
                Select a patient from the OPD Queue to begin consultation.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// 5. LOGIN MODAL
function LoginModal({ isOpen, mode, onClose, onClientLoginSuccess, onDoctorLoginSuccess, onToast }) {
  const [authMode, setAuthMode] = useState(mode === 'register' ? 'register' : 'login');
  const [tab, setTab] = useState('abha');
  const [authInput, setAuthInput] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [regNo, setRegNo] = useState('');
  const [doctorPin, setDoctorPin] = useState('');

  // New Patient Account Registration State - Minimal Personal Details
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('1996-08-15');
  const [regAge, setRegAge] = useState('30');
  const [regGender, setRegGender] = useState('Male');
  const [regBlood, setRegBlood] = useState('O +ve');
  const [regGuardian, setRegGuardian] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDistrict, setRegDistrict] = useState('Chennai');
  const [regAddress, setRegAddress] = useState('');
  const [regPincode, setRegPincode] = useState('600001');
  const [regAllergies, setRegAllergies] = useState('None Reported');
  const [regPreExisting, setRegPreExisting] = useState('None');
  const [regPin, setRegPin] = useState('1234');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDobChange = (e) => {
    const val = e.target.value;
    setRegDob(val);
    if (val) {
      const birthYear = new Date(val).getFullYear();
      const currYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1900 && birthYear <= currYear) {
        setRegAge(String(currYear - birthYear));
      }
    }
  };

  useEffect(() => {
    if (mode === 'register') {
      setAuthMode('register');
    } else {
      setAuthMode('login');
    }
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: authInput })
      });
      const data = await res.json();
      if (data.success) {
        onToast(`Welcome, ${data.patient.name}! Accessing Patient Portal...`);
        onClientLoginSuccess(data.patient);
      } else {
        onToast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      onToast('Server error during login', 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      onToast('Full Name and Mobile Number are required', 'error');
      return;
    }
    setIsSubmitting(true);
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
          guardianName: regGuardian.trim(),
          emergencyPhone: regEmergencyPhone.trim(),
          email: regEmail.trim(),
          district: regDistrict,
          pincode: regPincode.trim(),
          address: regAddress.trim(),
          allergies: regAllergies.trim(),
          preExistingConditions: regPreExisting.trim(),
          centerName: `Government Multi Super Speciality Hospital, ${regDistrict} Apex Wing`,
          pin: regPin
        })
      });
      const data = await res.json();
      if (data.success) {
        onToast(`Account created! Receipt: ${data.patient.receiptId} • ABHA: ${data.patient.abhaId}`);
        onClientLoginSuccess(data.patient);
      } else {
        onToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      onToast('Server error during patient registration', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo, pin: doctorPin })
      });
      const data = await res.json();
      if (data.success) {
        onToast(`Welcome Dr. ${data.doctor.name}! Redirecting to Doctor Workbench...`);
        onDoctorLoginSuccess(data.doctor);
      } else {
        onToast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      onToast('Server error during login', 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window" style={{ maxWidth: (mode === 'client' && authMode === 'register') ? '660px' : '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO_SRC} alt="Emblem" style={{ width: '38px', height: '38px' }} />
            <div>
              <div style={{ fontSize: '10.5px', color: '#046A38', fontWeight: '800', textTransform: 'uppercase' }}>
                தமிழ்நாடு அரசு • HEALTH PORTAL
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>
                {mode === 'doctor' 
                  ? 'Doctor & Specialist Clinical Login' 
                  : authMode === 'register' 
                    ? 'Citizen Health Account Registration' 
                    : 'Patient & Citizen Health Portal'}
              </h3>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="modal-body">
          {mode === 'client' ? (
            <div>
              {/* Toggle Between Sign In and Register */}
              <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '18px' }}>
                <button 
                  className={`modal-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                  style={{ flex: 1, padding: '10px', fontSize: '13.5px', fontWeight: '700', textAlign: 'center' }}
                >
                  Sign In Existing Account
                </button>
                <button 
                  className={`modal-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthMode('register')}
                  style={{ flex: 1, padding: '10px', fontSize: '13.5px', fontWeight: '700', textAlign: 'center' }}
                >
                  Create New Account (ABHA)
                </button>
              </div>

              {authMode === 'register' ? (
                /* NEW PATIENT REGISTRATION FORM - MINIMAL PERSONAL DETAILS */
                <div>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px 14px', marginBottom: '18px', fontSize: '12.5px', color: '#166534', lineHeight: '1.5' }}>
                    <strong>Official Health Locker Enrollment:</strong> Enter your basic personal details to generate your official 14-digit Ayushman Bharat (ABHA) Health ID and OPD digital record stored securely in the Government database.
                  </div>

                  <form onSubmit={handleRegisterSubmit}>
                    {/* SECTION 1: PERSONAL DEMOGRAPHICS */}
                    <div style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F4C81', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F4C81" strokeWidth="2.5"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
                        1. Personal Identity & Demographics
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                          Full Name (as per Aadhaar / Government ID) *
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. S. Vignesh Kumar"
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Date of Birth *
                          </label>
                          <input 
                            type="date" 
                            className="form-control" 
                            value={regDob}
                            onChange={handleDobChange}
                            required
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Age
                          </label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={regAge}
                            onChange={(e) => setRegAge(e.target.value)}
                            min="1"
                            max="120"
                            required
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Gender *
                          </label>
                          <select 
                            className="form-control"
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Transgender">Transgender</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Blood Group *
                          </label>
                          <select 
                            className="form-control"
                            value={regBlood}
                            onChange={(e) => setRegBlood(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          >
                            <option value="O +ve">O +ve</option>
                            <option value="A +ve">A +ve</option>
                            <option value="B +ve">B +ve</option>
                            <option value="AB +ve">AB +ve</option>
                            <option value="O -ve">O -ve</option>
                            <option value="A -ve">A -ve</option>
                            <option value="B -ve">B -ve</option>
                            <option value="AB -ve">AB -ve</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Father / Spouse / Guardian Name
                          </label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={regGuardian}
                            onChange={(e) => setRegGuardian(e.target.value)}
                            placeholder="e.g. K. Subramanian"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: CONTACT & RESIDENTIAL DETAILS */}
                    <div style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F4C81', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F4C81" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        2. Contact & Residential Details
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Primary Mobile (for OTP / Health SMS) *
                          </label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="e.g. 98401 23456"
                            required
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Emergency Contact Phone
                          </label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            value={regEmergencyPhone}
                            onChange={(e) => setRegEmergencyPhone(e.target.value)}
                            placeholder="e.g. 94440 98765"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Email Address (Optional)
                          </label>
                          <input 
                            type="email" 
                            className="form-control" 
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="e.g. citizen@gmail.com"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            District / City *
                          </label>
                          <select 
                            className="form-control"
                            value={regDistrict}
                            onChange={(e) => setRegDistrict(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          >
                            <option value="Chennai">Chennai (State Apex Centre)</option>
                            <option value="Madurai">Madurai (Southern Hub)</option>
                            <option value="Coimbatore">Coimbatore (Western Hub)</option>
                            <option value="Tiruchirappalli">Tiruchirappalli (Central)</option>
                            <option value="Salem">Salem</option>
                            <option value="Tirunelveli">Tirunelveli</option>
                            <option value="Vellore">Vellore</option>
                            <option value="Thanjavur">Thanjavur</option>
                            <option value="Erode">Erode</option>
                            <option value="Tiruppur">Tiruppur</option>
                            <option value="Dindigul">Dindigul</option>
                            <option value="Kanyakumari">Kanyakumari</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Street / Door / Area Address
                          </label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={regAddress}
                            onChange={(e) => setRegAddress(e.target.value)}
                            placeholder="e.g. No. 12, 3rd Cross Street, Gandhinagar"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Pincode
                          </label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={regPincode}
                            onChange={(e) => setRegPincode(e.target.value)}
                            placeholder="e.g. 600001"
                            maxLength="6"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: CLINICAL BASELINE & SECURITY */}
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F4C81', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F4C81" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        3. Clinical Baseline & Account Security
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Known Drug / Food Allergies
                          </label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={regAllergies}
                            onChange={(e) => setRegAllergies(e.target.value)}
                            placeholder="e.g. None Reported, Penicillin, etc."
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                            Pre-Existing Health Conditions
                          </label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={regPreExisting}
                            onChange={(e) => setRegPreExisting(e.target.value)}
                            placeholder="e.g. None, Diabetes, Asthma, BP"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '4px' }}>
                          Create 4-Digit Security PIN (used to sign into your Health Locker) *
                        </label>
                        <input 
                          type="password" 
                          className="form-control" 
                          value={regPin}
                          onChange={(e) => setRegPin(e.target.value)}
                          placeholder="e.g. 1234"
                          maxLength="6"
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={isSubmitting}
                      style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                      {isSubmitting ? 'Registering into Database & Generating ABHA...' : 'Register Account & Issue Health Locker'}
                    </button>
                  </form>

                  <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12.5px', color: '#64748B' }}>
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('login')}
                      style={{ background: 'none', border: 'none', color: '#0F4C81', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Sign In Here
                    </button>
                  </div>
                </div>
              ) : (
                /* EXISTING PATIENT LOGIN FORM */
                <div>
                  <div className="modal-tabs">
                    <button className={`modal-tab-btn ${tab === 'abha' ? 'active' : ''}`} onClick={() => setTab('abha')}>
                      Login via ABHA ID
                    </button>
                    <button className={`modal-tab-btn ${tab === 'mobile' ? 'active' : ''}`} onClick={() => setTab('mobile')}>
                      Mobile OTP
                    </button>
                  </div>

                  <form onSubmit={handleClientSubmit}>
                    <div className="form-group">
                      <label className="form-label">{tab === 'abha' ? 'ABHA ID / Receipt Number' : 'Registered Mobile Number'}</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={authInput}
                        onChange={(e) => setAuthInput(e.target.value)}
                        placeholder={tab === 'abha' ? 'Enter 14-digit ABHA ID or Receipt ID' : 'Enter 10-digit Mobile Number'}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">PIN / Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={authPin}
                        onChange={(e) => setAuthPin(e.target.value)}
                        placeholder="Enter 4-digit Security PIN"
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                      Login & Open Patient Portal
                    </button>
                  </form>

                  <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#64748B', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                    First time visiting or need a new health card?{' '}
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('register')}
                      style={{ background: 'none', border: 'none', color: '#0F4C81', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Create Patient Account (ABHA)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <form onSubmit={handleDoctorSubmit}>
                <div className="form-group">
                  <label className="form-label">Medical Council Registration No (TMC / NMC)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. TMC-XXXXX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIN / Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={doctorPin}
                    onChange={(e) => setDoctorPin(e.target.value)}
                    placeholder="Enter Security PIN"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-doctor" style={{ width: '100%', padding: '12px' }}>
                  Login & Open Doctor Workbench
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 6. HERO SEARCH SECTION
function HeroSearch({ onSearch, onOpenLoginModal, searchInput, setSearchInput }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchInput);
    }
  };

  return (
    <section className="hero-section" id="hero-search">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1>
              Unified Healthcare & <br/>
              <span className="highlight">Pan-India Medical Centre</span>
            </h1>

            <p className="hero-lead">
              A state-of-the-art tertiary care and unified health records portal connecting patients, clinicians, and multi-super speciality medical centres nationwide.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => {
                const el = document.getElementById('record-result-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Lookup Patient Record
              </button>
              <a 
                href="/client"
                className="btn btn-outline" 
                style={{ background: '#F0FDF4', borderColor: '#86EFAC', color: '#166534', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Create Patient Account (ABHA)
              </a>
              <a href="/client" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Patient Sign In
              </a>
              <a href="/doctor" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Doctor Portal
              </a>
              <a href="/lis" className="btn btn-outline" style={{ background: '#F0FDFA', borderColor: '#99F6E4', color: '#0D9488', fontWeight: '700', textDecoration: 'none' }}>
                🔬 LIS Lab
              </a>
              <a href="/pis" className="btn btn-outline" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#046A38', fontWeight: '700', textDecoration: 'none' }}>
                💊 PIS Pharmacy
              </a>
              <a href="/ris" className="btn btn-outline" style={{ background: '#F0F9FF', borderColor: '#BAE6FD', color: '#0284C7', fontWeight: '700', textDecoration: 'none' }}>
                ☢️ RIS Scans
              </a>
            </div>
          </div>

          <div>
            <div className="search-card-hero">
              <div className="search-header">
                <h2>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Patient Record Verification
                </h2>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
                Enter your hospital <strong>Receipt ID</strong> or 14-digit <strong>ABHA / ABHI ID</strong> to immediately retrieve diagnostics, vitals, doctor notes, and digital prescriptions.
              </p>

              <div className="search-input-group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Receipt ID or 14-digit ABHA ID"
                />
              </div>

              <div className="search-hint">
                <span>Receipt ID, Discharge Number, or ABHA</span>
                <button className="btn btn-primary" style={{ padding: '8px 18px' }} onClick={() => onSearch(searchInput)}>
                  Search Record
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 7. PATIENT RECORD VIEW
function PatientRecordView({ patient, onDownload, onStartVideoCall, onLaunchPACS }) {
  if (!patient) return null;

  return (
    <section className="record-result-section" id="record-result-section">
      <div className="container">
        <div className="section-head" style={{ marginBottom: '24px' }}>
          <span className="section-tag">OFFICIAL CLINICAL RECORD SYSTEM</span>
          <h2 className="section-title">Verified Patient Medical Record</h2>
          <p className="section-sub">Digital clinical case sheet, laboratory diagnostics, and certified pharmacotherapy regimen.</p>
        </div>

        <div className="record-container" id="printable-record-sheet">
          <div className="record-header-strip">
            <div className="hospital-emblem-badge">
              <div style={{ width: '48px', height: '48px', background: '#FFFFFF', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                <img 
                  src={LOGO_SRC} 
                  alt="Medical Emblem" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
              <div className="rec-title-wrap">
                <h3>{patient.centerName}</h3>
                <p>Department of {patient.department} | Ayushman Bharat Health Account (ABHA) Compliant</p>
              </div>
            </div>
            <div className="record-meta-right">
              <span className="rec-id-tag">RECEIPT: {patient.receiptId}</span>
              <span className="rec-id-tag">ABHA: {patient.abhaId}</span>
              <span className="rec-status-badge">{patient.status}</span>
            </div>
          </div>

          <div className="record-patient-banner">
            <div className="patient-avatar-box">
              {patient.name.charAt(0)}
            </div>
            <div className="patient-basic-info">
              <h4>{patient.name}</h4>
              <div className="patient-chips">
                <span className="patient-chip">Age: {patient.age} Yrs</span>
                <span className="patient-chip">Gender: {patient.gender}</span>
                <span className="patient-chip blood-chip">Blood Group: {patient.bloodGroup}</span>
                <span className="patient-chip">ABHA Address: {patient.abhaAddress}</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px' }}>
                <strong>Residential Address:</strong> {patient.address}
              </p>
            </div>
            <div className="patient-meta-details">
              <p><strong>Admission / Visit:</strong> {patient.admissionDate}</p>
              <p><strong>Discharge / Review:</strong> {patient.dischargeDate}</p>
              <p><strong>Consulting Specialist:</strong> {patient.consultingDoctor}</p>
              <p><strong>Medical Reg No:</strong> {patient.doctorRegNo}</p>
            </div>
          </div>

          <div className="vitals-grid-row">
            <div className="vital-card">
              <div className="vital-label">Blood Pressure</div>
              <div className="vital-value">{patient.vitals.bp}</div>
              <div className="vital-status">Controlled</div>
            </div>
            <div className="vital-card">
              <div className="vital-label">Pulse Rate</div>
              <div className="vital-value">{patient.vitals.pulse}</div>
              <div className="vital-status">Normal Rhythm</div>
            </div>
            <div className="vital-card">
              <div className="vital-label">SpO2 (Oxygen)</div>
              <div className="vital-value">{patient.vitals.spo2}</div>
              <div className="vital-status">Adequate</div>
            </div>
            <div className="vital-card">
              <div className="vital-label">Temperature</div>
              <div className="vital-value">{patient.vitals.temp}</div>
              <div className="vital-status">Afebrile</div>
            </div>
            <div className="vital-card">
              <div className="vital-label">Blood Sugar (F)</div>
              <div className="vital-value">{patient.vitals.bloodSugarFasting}</div>
              <div className="vital-status">Fasting</div>
            </div>
            <div className="vital-card">
              <div className="vital-label">Body Mass Index</div>
              <div className="vital-value">{patient.vitals.bmi || '24.2'}</div>
              <div className="vital-status">Wt: {patient.vitals.weight}</div>
            </div>
          </div>

          <div className="record-body">
            <div className="record-section-block">
              <div className="sec-head">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Clinical Assessment & Diagnosis
              </div>
              <div className="clinical-notes-card">
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Primary Diagnosis: <span style={{ color: 'var(--primary)' }}>{patient.clinicalSummary.diagnosis}</span>
                </div>
                <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Chief Complaints:</strong> {patient.clinicalSummary.chiefComplaints}
                </p>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
                  <strong>Clinical Assessment Notes:</strong> {patient.clinicalSummary.clinicalNotes}
                </p>
                <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#DC2626', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>Drug Allergies: {patient.clinicalSummary.allergies || 'None Reported'}</span>
                </div>
              </div>
            </div>

            <div className="record-section-block">
              <div className="sec-head">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                Diagnostic Investigations & Laboratory Findings
              </div>
              <div className="table-wrapper">
                <table className="medical-table">
                  <thead>
                    <tr>
                      <th>Investigation / Test Name</th>
                      <th>Date</th>
                      <th>Observed Value</th>
                      <th>Reference Range</th>
                      <th>Clinical Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.labReports.map((lab, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '600', color: '#0F172A' }}>{lab.testName}</td>
                        <td>{lab.date}</td>
                        <td><strong>{lab.result}</strong></td>
                        <td>{lab.normalRange}</td>
                        <td>
                          <span className={`status-badge ${
                            lab.status.toLowerCase().includes('high') ? 'status-alert' :
                            lab.status.toLowerCase().includes('danger') ? 'status-danger' : 'status-normal'
                          }`}>
                            {lab.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="record-section-block">
              <div className="sec-head">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                Prescribed Medications & Treatment Regimen (Rx)
              </div>
              <div className="table-wrapper">
                <table className="medical-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Medicine Name</th>
                      <th>Strength</th>
                      <th>Dosage (M-A-N)</th>
                      <th>Food Instruction</th>
                      <th>Duration</th>
                      <th>Doctor Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.prescriptions.map((rx, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: '700', color: '#0F172A' }}>{rx.medicine}</td>
                        <td>{rx.dosage}</td>
                        <td><span className="status-badge status-normal" style={{ fontWeight: '700' }}>{rx.frequency}</span></td>
                        <td>{rx.timing}</td>
                        <td>{rx.duration}</td>
                        <td style={{ fontSize: '12px', color: '#475569' }}>{rx.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DIGITAL RADIOLOGY & PACS SCANS */}
            {patient.radiologyStudies && patient.radiologyStudies.length > 0 && (
              <div className="record-section-block">
                <div className="sec-head">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="5"/>
                  </svg>
                  Radiology Information System (RIS) & Digital PACS Scans ({patient.radiologyStudies.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {patient.radiologyStudies.map((study, sIdx) => (
                    <div key={sIdx} style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '10px', padding: '16px', border: '1px solid #1E293B', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ background: '#0284C7', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                            {study.modality} • {study.body_part || study.study_type}
                          </span>
                          <span style={{ color: '#38BDF8', fontSize: '11px', fontWeight: '700' }}>
                            Acc: {study.accessionNo}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px' }}>
                          {study.studyTitle}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 8px', lineHeight: '1.4' }}>
                          "{study.impression || study.findings}"
                        </p>
                      </div>
                      <button
                        onClick={() => onLaunchPACS && onLaunchPACS(study)}
                        style={{ background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="5"/></svg>
                        Launch PACS DICOM Viewer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="insurance-banner">
              <div>
                <strong style={{ color: '#0F172A', fontSize: '13.5px' }}>{patient.billing.insuranceScheme}</strong>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>
                  Total Hospital Bill: {patient.billing.totalAmount} | Approved Scheme Coverage: {patient.billing.schemeApproved}
                </div>
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--primary-dark)' }}>
                Patient Payable: {patient.billing.patientPayable} ({patient.billing.paymentStatus})
              </div>
            </div>
          </div>

          <div className="record-footer-actions">
            <div>
              <strong>Next Review:</strong> {patient.followUp} <br/>
              Authorized Medical Officer: <strong>{patient.consultingDoctor}</strong> ({patient.doctorRegNo})
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-video" onClick={() => onStartVideoCall(patient, 'patient')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                Teleconsultation Video Call
              </button>
              <button className="btn btn-outline" onClick={() => window.print()}>
                Print Record
              </button>
              <button className="btn btn-primary" onClick={() => onDownload(patient)}>
                Save Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 8. LIVE TELECONSULTATION VIDEO CALL MODAL
function VideoConsultationModal({ room, onClose, onToast }) {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const [doctorNote, setDoctorNote] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCallSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let streamTrack = null;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        streamTrack = stream;
        onToast('Camera and microphone connected');
      })
      .catch(err => {
        onToast('Simulation Mode: Camera permission not granted or device not present');
      });

    return () => {
      if (streamTrack) {
        streamTrack.getTracks().forEach(t => t.stop());
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
    onToast(isAudioMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setIsVideoOff(!isVideoOff);
    onToast(isVideoOff ? 'Camera turned on' : 'Camera turned off');
  };

  return (
    <div className="video-consult-modal">
      <div className="video-consult-window">
        <div className="video-consult-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO_SRC} alt="Medical Emblem" style={{ width: '36px', height: '36px' }} />
            <div>
              <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase' }}>
                TELEMEDICINE CONSULTATION ROOM
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>
                  {room.role === 'patient' ? `Consultation with ${room.doctorName || 'Dr. S. K. Aravind'}` : `Consultation with Patient ${room.patientName || 'Karthikeyan S.'}`}
                </h3>
                <span className="video-status-indicator">
                  <span className="status-dot-pulse"></span>
                  Connected ({formatTimer(callSeconds)})
                </span>
              </div>
            </div>
          </div>
          <button className="close-btn" style={{ color: '#FFFFFF' }} onClick={onClose} aria-label="End Consultation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="video-body-grid">
          <div className="video-stream-container">
            <div className="simulated-remote-feed">
              <div className="clinician-avatar-pulse">
                {room.role === 'patient' ? (
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                ) : (
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px', color: '#FFFFFF' }}>
                {room.role === 'patient' ? (room.doctorName || 'Attending Physician') : (room.patientName || 'Registered Patient')}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#94A3B8', maxWidth: '440px', lineHeight: '1.5', margin: '0 auto' }}>
                {room.role === 'patient'
                  ? (room.department ? `${room.department} Consultation` : 'Specialist Tele-Consultation')
                  : (room.receiptId ? `Receipt ID: ${room.receiptId}` : 'Patient Consultation')
                }
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
              <span className="pip-label">{room.role === 'patient' ? 'You (Patient)' : 'You (Doctor)'}</span>
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
                {room.doctorName && <div><span style={{ color: '#94A3B8' }}>Doctor:</span> <strong>{room.doctorName}</strong></div>}
                {room.patientName && <div><span style={{ color: '#94A3B8' }}>Patient:</span> <strong>{room.patientName}</strong></div>}
                {room.receiptId && <div><span style={{ color: '#94A3B8' }}>Receipt:</span> <strong>{room.receiptId}</strong></div>}
                {room.department && <div><span style={{ color: '#94A3B8' }}>Department:</span> {room.department}</div>}
              </div>
            </div>

            <div className="in-call-card">
              <div style={{ color: '#94A3B8', fontSize: '11px', marginBottom: '4px', fontWeight: '700' }}>CONSULTATION NOTES</div>
              {room.issueDescription ? (
                <div style={{ fontSize: '12.5px', color: '#F1F5F9', lineHeight: '1.5', background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '6px', border: '1px solid #334155' }}>
                  "{room.issueDescription}"
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>Live tele-consultation session active.</div>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            )}
          </button>
          <button 
            className={`control-circle-btn ${isVideoOff ? 'active-off' : ''}`} 
            onClick={toggleVideo}
            title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
            aria-label="Toggle Camera"
          >
            {isVideoOff ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="m16 16 5 3V8l-5 3"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            )}
          </button>
          <button 
            className="control-circle-btn" 
            onClick={() => onToast('Screen sharing initialized')}
            title="Share Screen"
            aria-label="Share Screen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </button>
          <button 
            className="control-circle-btn end-call" 
            onClick={onClose}
            title="End Call"
            aria-label="End Call"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// 9. PAN INDIA NETWORK & SPECIALTIES
function PanIndiaSection() {
  const centres = [
    { city: "Chennai (Apex Centre)", hospital: "Govt Multi Super Speciality Hospital (Omandurar)", beds: 500, emergency: "044-2566 5000", badge: "Apex Centre" },
    { city: "Madurai", hospital: "Rajaji Hospital & Pan-India Medical Centre", beds: 1400, emergency: "0452-253 2535", badge: "Southern Hub" },
    { city: "Coimbatore", hospital: "Coimbatore Medical College Hospital & Trauma Centre", beds: 1250, emergency: "0422-230 1393", badge: "Western Hub" },
    { city: "Tiruchirappalli", hospital: "K.A.P. Viswanatham Medical College Hospital", beds: 850, emergency: "0431-240 1011", badge: "Central Hub" },
    { city: "New Delhi", hospital: "National Healthcare Facilitation & AIIMS Liaison", beds: 120, emergency: "011-2419 3100", badge: "Pan-India Northern Cell" },
    { city: "Bengaluru", hospital: "Pan-India Inter-State Patient Care & Referral Wing", beds: 200, emergency: "080-2227 4444", badge: "Southern Inter-State Cell" },
    { city: "Mumbai", hospital: "Apex Healthcare Support Desk (KEM / Tata Memorial)", beds: 150, emergency: "022-2410 7000", badge: "Oncology Liaison Wing" },
    { city: "Kolkata", hospital: "Inter-State Healthcare Facilitation Cell (Eastern Region)", beds: 160, emergency: "033-2287 5500", badge: "Eastern Inter-State Cell" }
  ];

  return (
    <section className="section-padding" id="pan-india-section" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
      <div className="container">
        <div className="section-head">
          <span className="section-tag">HEALTHCARE INFRASTRUCTURE</span>
          <h2 className="section-title">National & Pan-India Medical Network</h2>
          <p className="section-sub">Comprehensive multi-super speciality tertiary hospitals, medical college hospitals, and inter-state patient facilitation desks.</p>
        </div>

        <div className="centres-grid">
          {centres.map((c, i) => (
            <div className="centre-card" key={i}>
              <div>
                <h4 className="centre-city">{c.city}</h4>
                <p className="centre-hospital">{c.hospital}</p>
              </div>
              <div className="centre-meta">
                <span className="centre-meta-pill" title="Inpatient Bed Capacity">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>
                  <strong>{c.beds}</strong> Beds
                </span>
                <span className="centre-meta-pill emergency" title="24/7 Emergency Line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <strong>{c.emergency}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialtiesSection() {
  const specs = [
    { 
      name: "Cardiology & CTVS", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h4.28"/>
        </svg>
      )
    },
    { 
      name: "Neurology & Neuro Surgery", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z"/>
        </svg>
      )
    },
    { 
      name: "Medical & Surgical Oncology", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="4"/>
          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
        </svg>
      )
    },
    { 
      name: "Orthopaedics & Joint Replacement", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 10c.7-.7 1.69-1 2.5-1a2.5 2.5 0 1 1 0 5c-.81 0-1.8-.3-2.5-1l-7 7c-.7.7-1 1.69-1 2.5a2.5 2.5 0 1 1-5 0c0-.81.3-1.8 1-2.5l7-7c.7-.7 1-1.69 1-2.5a2.5 2.5 0 1 1 5 0c0 .81-.3 1.8-1 2.5Z"/>
        </svg>
      )
    },
    { 
      name: "Endocrinology & Diabetology", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      )
    },
    { 
      name: "Emergency & Level-1 Trauma", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      )
    },
    { 
      name: "Nephrology & Renal Transplant", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      )
    },
    { 
      name: "Pediatrics & Neonatal Care", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="5"/>
          <path d="M20 21a8 8 0 0 0-16 0"/>
        </svg>
      )
    }
  ];

  return (
    <section className="section-padding" id="specialties-section">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">CENTRES OF CLINICAL EXCELLENCE</span>
          <h2 className="section-title">Tertiary Super Speciality Departments</h2>
          <p className="section-sub">Round-the-clock emergency, advanced diagnostic imaging, and cutting-edge surgical infrastructure.</p>
        </div>

        <div className="specialties-grid">
          {specs.map((s, i) => (
            <div className="specialty-card" key={i}>
              <div className="specialty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                {s.icon}
              </div>
              <div className="specialty-name" style={{ fontWeight: '700' }}>{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 10. SITE FOOTER
function SiteFooter({ onOpenLoginModal }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <img src={LOGO_SRC} alt="Medical Emblem" style={{ width: '44px', height: '44px' }} />
              <div>
                <h4 style={{ color: '#FFFFFF', margin: 0, fontSize: '17px' }}>Health Care Portal</h4>
                <span style={{ fontSize: '11px', color: '#38BDF8' }}>Pan-India Medical Centre Network</span>
              </div>
            </div>
            <p>
              A unified digital health initiative integrating tertiary care hospitals with the national digital health ecosystem.
            </p>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              National Health Authority (NHA) • ABDM Ayushman Bharat Digital Mission • Cashless Health Schemes
            </div>
          </div>

          <div className="footer-col">
            <h5>Emergency Hotlines</h5>
            <ul className="footer-links">
              <li><a href="tel:108">108 - Emergency Ambulance</a></li>
              <li><a href="tel:104">104 - Medical Advisory</a></li>
              <li><a href="tel:14416">14416 - Tele-MANAS (Mental Health)</a></li>
              <li><a href="tel:18004253993">1800-425-3993 - Health Insurance Helpline</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Apex Hospitals</h5>
            <ul className="footer-links">
              <li><a href="#pan-india-section">Govt Multi Super Speciality, Chennai</a></li>
              <li><a href="#pan-india-section">Rajaji Hospital, Madurai</a></li>
              <li><a href="#pan-india-section">Coimbatore Medical College Hospital</a></li>
              <li><a href="#pan-india-section">Pan-India Referral Liaison Cell</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Portals & Services</h5>
            <ul className="footer-links">
              <li><a href="#record-result-section">Patient Record Verification</a></li>
              <li><a href="/client">Client Health Locker (Separate Page)</a></li>
              <li><a href="/doctor">Doctor OPD Workbench (Separate Page)</a></li>
              <li><a href="javascript:void(0)">Teleconsultation Video Services</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © 2026 Health Care Portal • Pan-India Medical Centre Network.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ===========================================================================
// ROOT APPLICATION COMPONENT
// Dedicated views: 'home' | 'client-portal' | 'doctor-portal'
// ===========================================================================
function App() {
  const [currentView, setCurrentView] = useState('home');
  const [searchInput, setSearchInput] = useState('');
  const [patientRecord, setPatientRecord] = useState(null);
  
  // Theme state: 'default' (Royal Navy) | 'theme-emerald' | 'theme-teal'
  const [currentTheme, setCurrentTheme] = useState('default');

  // Login Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('client');

  // Sessions
  const [clientSession, setClientSession] = useState(() => {
    try {
      const s = localStorage.getItem('tn_patient_session');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });
  const [doctorSession, setDoctorSession] = useState(null);

  // Video Room & PACS
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

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    document.body.className = newTheme === 'default' ? '' : newTheme;
    addToast(`Theme switched to ${newTheme === 'default' ? 'Royal Medical Navy' : newTheme === 'theme-emerald' ? 'Emerald Medical' : 'Clinical Ocean Cyan'}`);
  };

  const searchPatient = useCallback(async (query) => {
    if (!query) {
      addToast('Please enter a Receipt ID or ABHA ID', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success) {
        setPatientRecord(data.patient);
        addToast(`Medical record loaded for ${data.patient.name}`);
        const el = document.getElementById('record-result-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        addToast(data.message || `No record found for '${query}'`, 'error');
      }
    } catch (err) {
      addToast('Error querying backend server', 'error');
    }
  }, [addToast]);

  const handleClientLoginSuccess = (patient) => {
    try {
      localStorage.setItem('tn_patient_session', JSON.stringify(patient));
    } catch (e) {}
    setClientSession(patient);
    setIsLoginModalOpen(false);
    window.location.href = '/client';
  };

  const handleDoctorLoginSuccess = (doctor) => {
    try {
      sessionStorage.setItem('doctorSession', JSON.stringify(doctor));
    } catch (e) {}
    setDoctorSession(doctor);
    setIsLoginModalOpen(false);
    window.location.href = '/doctor';
  };

  const handleStartVideoCall = async (patient, role) => {
    try {
      const res = await fetch('/api/teleconsult/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: patient.receiptId,
          patientName: patient.name,
          doctorName: patient.consultingDoctor,
          doctorRegNo: patient.doctorRegNo,
          role
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveVideoRoom({ ...data.room, role });
        addToast(`Entering Teleconsultation Video Room: ${data.room.roomId}`);
      }
    } catch (e) {
      addToast('Error creating video consultation room', 'error');
    }
  };

  const handleDownload = (patient) => {
    const content = `HEALTH CARE & PAN-INDIA MEDICAL CENTRE\nOFFICIAL RECORD SUMMARY\nReceipt ID: ${patient.receiptId}\nPatient: ${patient.name}\nDiagnosis: ${patient.clinicalSummary.diagnosis}\nVitals: ${patient.vitals.bp}, Pulse: ${patient.vitals.pulse}\nDoctor: ${patient.consultingDoctor}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Medical_Record_${patient.receiptId}.txt`;
    link.click();
    addToast('Medical record summary saved');
  };

  const openLoginModal = (mode) => {
    if (mode === 'client' || mode === 'register') {
      window.location.href = '/client';
      return;
    }
    if (mode === 'doctor') {
      window.location.href = '/doctor';
      return;
    }
    setLoginModalMode(mode);
    setIsLoginModalOpen(true);
  };

  return (
    <div>
      <ToastList toasts={toasts} />

      {/* VIEW 1: DEDICATED SEPARATE CLIENT PORTAL PAGE */}
      {currentView === 'client-portal' && clientSession ? (
        <DedicatedClientPortalPage 
          patient={clientSession}
          onLogout={() => {
            setClientSession(null);
            setCurrentView('home');
            addToast('Signed out of Patient Health Locker');
          }}
          onNavigateHome={() => setCurrentView('home')}
          onStartVideoCall={handleStartVideoCall}
          onToast={addToast}
        />
      ) : currentView === 'doctor-portal' && doctorSession ? (
        /* VIEW 2: DEDICATED SEPARATE DOCTOR PORTAL PAGE */
        <DedicatedDoctorPortalPage 
          doctor={doctorSession}
          onLogout={() => {
            setDoctorSession(null);
            setCurrentView('home');
            addToast('Doctor signed out');
          }}
          onNavigateHome={() => setCurrentView('home')}
          onStartVideoCall={handleStartVideoCall}
          onToast={addToast}
          onSearch={searchPatient}
        />
      ) : (
        /* VIEW 3: MAIN PUBLIC HOSPITAL PORTAL PAGE */
        <div>
          <Header 
            onNavigate={(view) => setCurrentView(view)} 
            clientSession={clientSession}
            doctorSession={doctorSession}
            onOpenLoginModal={openLoginModal}
          />
          <HeroSearch 
            onSearch={searchPatient}
            onOpenLoginModal={openLoginModal}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
          <PatientRecordView 
            patient={patientRecord}
            onDownload={handleDownload}
            onStartVideoCall={handleStartVideoCall}
            onLaunchPACS={(study) => setActivePACSStudy(study)}
          />
          <PanIndiaSection />
          <SpecialtiesSection />
          <SiteFooter onOpenLoginModal={openLoginModal} />
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        mode={loginModalMode}
        onClose={() => setIsLoginModalOpen(false)}
        onClientLoginSuccess={handleClientLoginSuccess}
        onDoctorLoginSuccess={handleDoctorLoginSuccess}
        onToast={addToast}
      />

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

// Mount React Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
