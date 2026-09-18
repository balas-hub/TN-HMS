/* ==========================================================================
   TAMIL NADU HEALTH CARE • RADIOLOGY INFORMATION SYSTEM (RIS) & SCAN WARD
   Dedicated React Application Logic (ris-page.jsx)
   ========================================================================== */

const { useState, useEffect, useRef, useMemo } = React;

// Sample predefined quick ABHA IDs for instant test clicks
const QUICK_ABHA_SAMPLES = [
  { abhaId: '91-4820-1940-5821', name: 'K. Rajesh', hint: 'CT Chest Requisition' },
  { abhaId: '91-6204-8831-9012', name: 'S. Meena', hint: 'Brain MRI Requisition' },
  { abhaId: '91-7712-4091-3321', name: 'Dr. A. Suresh', hint: 'Renal Ultrasound' },
  { abhaId: '91-3390-1120-4491', name: 'M. Anand', hint: 'Knee Digital X-Ray' }
];

function RISApplication() {
  // Authentication State
  const [radiologist, setRadiologist] = useState(() => {
    try {
      const saved = localStorage.getItem('tn_ris_radiologist');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });
  
  // Login Form State
  const [loginRegNo, setLoginRegNo] = useState('TMC-RAD-38910');
  const [loginPin, setLoginPin] = useState('1234');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab View: 'requisitions' | 'machines' | 'workers' | 'abha_lookup'
  const [activeTab, setActiveTab] = useState('requisitions');
  const [requisitionFilter, setRequisitionFilter] = useState('all');
  const [modalityFilter, setModalityFilter] = useState('all');

  // Ward Data State
  const [wardStatus, setWardStatus] = useState({
    totalMachines: 6,
    freeMachines: 4,
    occupiedMachines: 2,
    maintenanceMachines: 0,
    totalWorkers: 8,
    pendingRequestsCount: 0
  });
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [requests, setRequests] = useState([]);

  // ABHA Lookup State
  const [abhaSearchQuery, setAbhaSearchQuery] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [isSearchingAbha, setIsSearchingAbha] = useState(false);
  const [abhaSearchError, setAbhaSearchError] = useState('');

  // Modals State
  const [acceptModalReq, setAcceptModalReq] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedTech, setSelectedTech] = useState('');

  const [completeModalReq, setCompleteModalReq] = useState(null);
  const [reportFindings, setReportFindings] = useState('');
  const [reportImpression, setReportImpression] = useState('');

  // PACS Viewer Modal
  const [pacsModalStudy, setPacsModalStudy] = useState(null);

  // Status Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all Ward & RIS Data
  const fetchRISData = async () => {
    try {
      // 1. Ward Status
      const statusRes = await fetch('/api/ris/ward-status');
      const statusData = await statusRes.json();
      if (statusData.success) {
        setWardStatus({
          totalMachines: statusData.totalMachines,
          freeMachines: statusData.freeMachines,
          occupiedMachines: statusData.occupiedMachines,
          maintenanceMachines: statusData.maintenanceMachines,
          totalWorkers: statusData.totalWorkers,
          pendingRequestsCount: statusData.pendingRequestsCount
        });
      }

      // 2. Machines
      const machRes = await fetch('/api/ris/machines');
      const machData = await machRes.json();
      if (machData.success) setMachines(machData.machines || []);

      // 3. Workers
      const workRes = await fetch('/api/ris/workers');
      const workData = await workRes.json();
      if (workData.success) setWorkers(workData.workers || []);

      // 4. Requests
      const reqRes = await fetch('/api/ris/requests');
      const reqData = await reqRes.json();
      if (reqData.success) setRequests(reqData.requests || []);
    } catch (err) {
      console.error('[RIS Fetch Error]:', err);
    }
  };

  // Initial fetch and 10s auto-refresh
  useEffect(() => {
    if (radiologist) {
      fetchRISData();
      const interval = setInterval(fetchRISData, 10000);
      return () => clearInterval(interval);
    }
  }, [radiologist]);

  // Handle Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/ris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo: loginRegNo, pin: loginPin })
      });
      const data = await res.json();
      if (data.success && data.radiologist) {
        setRadiologist(data.radiologist);
        localStorage.setItem('tn_ris_radiologist', JSON.stringify(data.radiologist));
        showToast(`Welcome ${data.radiologist.name} to RIS Scan Ward Console`);
      } else {
        setLoginError(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setLoginError('Server connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setRadiologist(null);
    localStorage.removeItem('tn_ris_radiologist');
    showToast('Logged out of RIS Console securely.', 'info');
  };

  // Handle ABHA ID Search
  const handleSearchABHA = async (queryToSearch) => {
    const q = (queryToSearch || abhaSearchQuery).trim();
    if (!q) {
      setAbhaSearchError('Please enter an ABHA ID or Receipt ID');
      return;
    }
    setAbhaSearchError('');
    setIsSearchingAbha(true);
    setSearchedPatient(null);
    try {
      const res = await fetch('/api/ris/patient-abha/' + encodeURIComponent(q));
      const data = await res.json();
      if (data.success && data.patient) {
        setSearchedPatient(data);
        setActiveTab('abha_lookup');
        showToast(`Patient profile loaded for ABHA ID: ${data.patient.abhaId || q}`);
      } else {
        setAbhaSearchError(data.message || 'No patient record found for this ABHA ID.');
      }
    } catch (err) {
      setAbhaSearchError('Error querying ABHA registry. Check network connection.');
    } finally {
      setIsSearchingAbha(false);
    }
  };

  // Accept Scan Request
  const handleAcceptRequest = async () => {
    if (!acceptModalReq) return;
    try {
      const res = await fetch(`/api/ris/requests/${acceptModalReq.id}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedMachine: selectedMachine || 'SOMATOM Force 128-Slice CT (Room 101)',
          assignedTechnician: selectedTech || 'R. Sivakumar, B.Sc RT'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Request ${acceptModalReq.id} accepted. Assigned to ${selectedMachine || 'Room 101'}.`);
        setAcceptModalReq(null);
        fetchRISData();
      } else {
        alert(data.message || 'Failed to accept scan request.');
      }
    } catch (err) {
      alert('Error updating request status.');
    }
  };

  // Complete Scan Request & Push to PACS
  const handleCompleteRequest = async () => {
    if (!completeModalReq) return;
    try {
      const res = await fetch(`/api/ris/requests/${completeModalReq.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          findings: reportFindings || 'Digital diagnostic scan acquired under standard protocol. Anatomical structures clearly delineated without motion artifact.',
          impression: reportImpression || `Completed ${completeModalReq.modality} examination of ${completeModalReq.bodyPart}. Archiving into PACS repository.`,
          radiologistName: radiologist ? radiologist.name : 'Dr. R. Vijayakumar, MD, DNB'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Scan ${completeModalReq.id} completed! Diagnostic study pushed to PACS.`);
        setCompleteModalReq(null);
        setReportFindings('');
        setReportImpression('');
        fetchRISData();
      } else {
        alert(data.message || 'Failed to complete scan request.');
      }
    } catch (err) {
      alert('Error completing scan.');
    }
  };

  // Toggle Machine Status (Free <-> Maintenance)
  const toggleMachineMaintenance = async (mach) => {
    const newStatus = mach.status === 'Maintenance' ? 'Free' : 'Maintenance';
    try {
      const res = await fetch(`/api/ris/machines/${mach.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Machine ${mach.name} status updated to ${newStatus}`);
        fetchRISData();
      }
    } catch (e) {
      alert('Error updating machine status.');
    }
  };

  // Filtered Requisitions
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesStatus = requisitionFilter === 'all' ? true : r.status === requisitionFilter;
      const matchesModality = modalityFilter === 'all' ? true : (r.modality || '').toUpperCase() === modalityFilter.toUpperCase();
      return matchesStatus && matchesModality;
    });
  }, [requests, requisitionFilter, modalityFilter]);

  // Available Free Machines
  const freeMachinesList = useMemo(() => {
    return machines.filter(m => m.status === 'Free');
  }, [machines]);

  // -------------------------------------------------------------------------
  // 1. RENDER: LOGIN GATE MODAL IF NOT AUTHENTICATED
  // -------------------------------------------------------------------------
  if (!radiologist) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0B1329',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#131E3A',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(14, 165, 233, 0.15)',
          padding: '36px 32px',
          color: '#F1F5F9',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Glow Orb */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} />

          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '20px', backgroundColor: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '16px' }}>
              <span style={{ fontSize: '34px' }}>☢️</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.12em', color: '#38BDF8', textTransform: 'uppercase', marginBottom: '4px' }}>
              DEPARTMENT OF RADIOLOGY & IMAGING SERVICES
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Radiology Information System (RIS)
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
              Scan Ward Resource & Modality Management Portal
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>⚠️</span>
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#CBD5E1', marginBottom: '6px' }}>
                Radiologist Medical Council Reg No.
              </label>
              <input
                type="text"
                value={loginRegNo}
                onChange={(e) => setLoginRegNo(e.target.value)}
                placeholder="e.g. TMC-RAD-38910"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  backgroundColor: '#0B1329',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#CBD5E1', marginBottom: '6px' }}>
                Security PIN / Radiologist Passcode
              </label>
              <input
                type="password"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                placeholder="e.g. 1234"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  backgroundColor: '#0B1329',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  letterSpacing: '0.2em',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
            </div>

            {/* Quick Demo Credentials Autofill */}
            <div style={{
              backgroundColor: 'rgba(14, 165, 233, 0.08)',
              border: '1px dashed rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => {
              setLoginRegNo('TMC-RAD-38910');
              setLoginPin('1234');
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase' }}>Demo Chief Radiologist</div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'monospace' }}>TMC-RAD-38910 (Dr. R. Vijayakumar) / PIN: 1234</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '700', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '4px 8px', borderRadius: '6px' }}>Autofill</span>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              {isLoggingIn ? 'Authenticating Radiologist...' : 'Access Scan Ward & RIS Console →'}
            </button>
          </form>

          {/* Quick links to other portals */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(148, 163, 184, 0.15)', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.8rem' }}>
            <a href="/doctor" style={{ color: '#38BDF8', textDecoration: 'none' }}>🩺 Doctor OPD Workbench</a>
            <span style={{ color: '#475569' }}>•</span>
            <a href="/client" style={{ color: '#34D399', textDecoration: 'none' }}>👤 Patient Portal</a>
            <span style={{ color: '#475569' }}>•</span>
            <a href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>🏠 Hospital Home</a>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. RENDER: MAIN RIS SCAN WARD WORKSTATION CONSOLE
  // -------------------------------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090F1E', color: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: toastMessage.type === 'info' ? '#0284C7' : '#059669',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{toastMessage.type === 'info' ? 'ℹ️' : '✅'}</span>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* TOP APEX HEADER */}
      <header style={{
        backgroundColor: '#0E172A',
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: Brand & Department */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(14, 165, 233, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px'
          }}>
            ☢️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', color: '#38BDF8', textTransform: 'uppercase' }}>
                DEPARTMENT OF RADIOLOGY & IMAGING SERVICES
              </span>
              <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                ONLINE LIVE
              </span>
            </div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              RIS & Scan Ward Management Console
            </h1>
          </div>
        </div>

        {/* Center: Live Ward Clock & Sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#131E3A', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            Ward Feed Syncing
          </div>
          <div style={{ fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: '700', color: '#38BDF8' }}>
            {currentTime.toLocaleTimeString('en-IN')} IST
          </div>
        </div>

        {/* Right: Radiologist Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#F1F5F9' }}>
              {radiologist.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace' }}>
              {radiologist.regNo} • {radiologist.qualification || 'Chief Radiologist'}
            </div>
          </div>
          <button
            onClick={fetchRISData}
            title="Refresh Ward Live Status"
            style={{
              padding: '8px 12px',
              backgroundColor: '#1E293B',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🔄 Refresh
          </button>
          <a
            href="/doctor"
            style={{
              padding: '8px 14px',
              backgroundColor: 'rgba(2, 132, 199, 0.2)',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              borderRadius: '8px',
              color: '#38BDF8',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}
          >
            🩺 Doctor OPD
          </a>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#F87171',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}
          >
            Exit Console
          </button>
        </div>
      </header>

      {/* SUB-HEADER: WARD KPI DASHBOARD */}
      <div style={{
        backgroundColor: '#0F1A30',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Card 1: Workers in Scan Ward */}
          <div style={{
            backgroundColor: '#16223F',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Workers in Scan Ward
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                {wardStatus.totalWorkers || 8} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#34D399' }}>Staff on Duty</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              👥
            </div>
          </div>

          {/* Card 2: Total Machines in Ward */}
          <div style={{
            backgroundColor: '#16223F',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Ward Machines
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                {wardStatus.totalMachines || 6} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#C084FC' }}>Modality Suites</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              🏥
            </div>
          </div>

          {/* Card 3: Free (Ready) Machines */}
          <div style={{
            backgroundColor: '#16223F',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Free (Ready) Machines
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>
                {wardStatus.freeMachines} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6EE7B7' }}>Available</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              ⚡
            </div>
          </div>

          {/* Card 4: Occupied (Scanning) Machines */}
          <div style={{
            backgroundColor: '#16223F',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Occupied Machines
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#F59E0B', marginTop: '2px' }}>
                {wardStatus.occupiedMachines} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#FCD34D' }}>In Active Scan</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              🔬
            </div>
          </div>

          {/* Card 5: Pending Doctor Requests */}
          <div style={{
            backgroundColor: '#16223F',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Doctor Requisitions
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#EF4444', marginTop: '2px' }}>
                {wardStatus.pendingRequestsCount} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#FCA5A5' }}>Pending Queue</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              📋
            </div>
          </div>
        </div>
      </div>

      {/* ABHA ID SEARCH / COLLECTOR BAR */}
      <div style={{
        backgroundColor: '#0B1428',
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🆔</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ABHA ID Patient Clinical Collector & History Registry
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Instant retrieval of Patient Demographics, Vitals, Allergies & Previous Scans
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
              <input
                type="text"
                value={abhaSearchQuery}
                onChange={(e) => setAbhaSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchABHA(); }}
                placeholder="Input 14-digit ABHA ID (e.g. 91-4820-1940-5821) or Receipt ID (TN-REC-8902)..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 18px',
                  backgroundColor: '#131E3A',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
              />
            </div>
            <button
              onClick={() => handleSearchABHA()}
              disabled={isSearchingAbha}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: '700',
                cursor: isSearchingAbha ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSearchingAbha ? 'Querying ABHA...' : '🔍 Fetch Patient Details'}
            </button>
          </div>

          {/* Quick Click Samples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Quick Test ABHA:</span>
            {QUICK_ABHA_SAMPLES.map(sample => (
              <button
                key={sample.abhaId}
                onClick={() => {
                  setAbhaSearchQuery(sample.abhaId);
                  handleSearchABHA(sample.abhaId);
                }}
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '6px',
                  color: '#BAE6FD',
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
              >
                {sample.name} ({sample.abhaId})
              </button>
            ))}
          </div>

          {/* Search Error */}
          {abhaSearchError && (
            <div style={{ marginTop: '10px', color: '#F87171', fontSize: '0.82rem' }}>
              ⚠️ {abhaSearchError}
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{
        backgroundColor: '#0E172A',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '0 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('requisitions')}
            style={{
              padding: '14px 20px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'requisitions' ? '3px solid #38BDF8' : '3px solid transparent',
              color: activeTab === 'requisitions' ? '#38BDF8' : '#94A3B8',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'requisitions' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            📋 Doctor Scan Requisitions
            <span style={{
              backgroundColor: wardStatus.pendingRequestsCount > 0 ? '#EF4444' : '#1E293B',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              {wardStatus.pendingRequestsCount} Pending
            </span>
          </button>

          <button
            onClick={() => setActiveTab('machines')}
            style={{
              padding: '14px 20px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'machines' ? '3px solid #38BDF8' : '3px solid transparent',
              color: activeTab === 'machines' ? '#38BDF8' : '#94A3B8',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'machines' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            ⚡ Scan Ward Machines ({machines.length || 6})
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            style={{
              padding: '14px 20px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'workers' ? '3px solid #38BDF8' : '3px solid transparent',
              color: activeTab === 'workers' ? '#38BDF8' : '#94A3B8',
              fontSize: '0.92rem',
              fontWeight: activeTab === 'workers' ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            👥 Ward Duty Staff ({workers.length || 8})
          </button>

          {searchedPatient && (
            <button
              onClick={() => setActiveTab('abha_lookup')}
              style={{
                padding: '14px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'abha_lookup' ? '3px solid #10B981' : '3px solid transparent',
                color: activeTab === 'abha_lookup' ? '#10B981' : '#6EE7B7',
                fontSize: '0.92rem',
                fontWeight: activeTab === 'abha_lookup' ? '700' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              👤 Patient ABHA Profile ({searchedPatient.patient.patientName || searchedPatient.patient.name})
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
        
        {/* ===================================================================
            TAB 1: DOCTOR SCAN REQUISITIONS WORKLIST
            =================================================================== */}
        {activeTab === 'requisitions' && (
          <div>
            {/* Header & Filter Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>
                  Doctor Scan Requisitions Worklist
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                  Incoming scan orders from Doctor OPD Workbench with embedded Patient ABHA ID
                </p>
              </div>

              {/* Status Filter Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'Pending', label: '⏳ Pending' },
                  { id: 'Accepted', label: '🔄 In-Progress / Scanning' },
                  { id: 'Completed', label: '✅ Completed & Pushed to PACS' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRequisitionFilter(tab.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: requisitionFilter === tab.id ? '1px solid #38BDF8' : '1px solid rgba(148, 163, 184, 0.2)',
                      backgroundColor: requisitionFilter === tab.id ? 'rgba(56, 189, 248, 0.2)' : '#16223F',
                      color: requisitionFilter === tab.id ? '#38BDF8' : '#CBD5E1',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Requisitions Grid / List */}
            {filteredRequests.length === 0 ? (
              <div style={{
                backgroundColor: '#131E3A',
                border: '1px dashed rgba(148, 163, 184, 0.25)',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#94A3B8'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', margin: '0 0 6px 0' }}>No Requisitions Found</h3>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>There are no scan requests matching the selected filter ({requisitionFilter}).</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredRequests.map(req => {
                  const isPending = req.status === 'Pending';
                  const isAccepted = req.status === 'Accepted' || req.status === 'In-Progress';
                  const isCompleted = req.status === 'Completed';

                  return (
                    <div
                      key={req.id}
                      style={{
                        backgroundColor: '#131E3A',
                        border: isPending ? '1px solid rgba(239, 68, 68, 0.4)' : (isAccepted ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'),
                        borderRadius: '16px',
                        padding: '18px 22px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }}
                    >
                      {/* Top Row: Patient Info & Priority */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FFFFFF' }}>
                              {req.patientName}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#94A3B8', backgroundColor: '#0B1329', padding: '2px 8px', borderRadius: '6px' }}>
                              {req.age} Y / {req.gender}
                            </span>
                            {/* ABHA ID BADGE */}
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              fontFamily: 'monospace',
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              border: '1px solid rgba(56, 189, 248, 0.4)',
                              color: '#38BDF8',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              🆔 ABHA: {req.abhaId}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                              OPD: {req.receiptId}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span>👨‍⚕️ Ordered by: <strong style={{ color: '#F1F5F9' }}>{req.doctorName}</strong> ({req.department})</span>
                            <span>•</span>
                            <span>🕒 {req.createdAt ? new Date(req.createdAt).toLocaleString('en-IN') : 'Recent'}</span>
                          </div>
                        </div>

                        {/* Status & Urgency Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            backgroundColor: req.priority === 'Emergency STAT' ? 'rgba(239, 68, 68, 0.25)' : (req.priority === 'Urgent' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(148, 163, 184, 0.2)'),
                            color: req.priority === 'Emergency STAT' ? '#F87171' : (req.priority === 'Urgent' ? '#FCD34D' : '#CBD5E1'),
                            border: req.priority === 'Emergency STAT' ? '1px solid rgba(239, 68, 68, 0.5)' : 'none'
                          }}>
                            {req.priority || 'Routine'}
                          </span>

                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            backgroundColor: isPending ? 'rgba(239, 68, 68, 0.2)' : (isAccepted ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                            color: isPending ? '#EF4444' : (isAccepted ? '#F59E0B' : '#10B981'),
                            border: isPending ? '1px solid rgba(239, 68, 68, 0.4)' : (isAccepted ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)')
                          }}>
                            {isPending ? '⏳ Awaiting Acceptance' : (isAccepted ? '🔄 In-Scan Ward' : '✅ Completed & Pushed')}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Scan Details & Clinical Indication */}
                      <div style={{
                        backgroundColor: '#0B1329',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase' }}>
                            Modality & Examination
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                            {req.modality} Scan • {req.bodyPart}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px' }}>
                            🩺 <em>Indication:</em> {req.clinicalIndication || 'Diagnostic evaluation requested by consulting physician'}
                          </div>
                        </div>

                        {/* Machine & Tech assignment if in progress */}
                        {isAccepted && (
                          <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(148, 163, 184, 0.2)', paddingLeft: '16px' }}>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Assigned Machine:</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#34D399' }}>{req.assignedMachine || 'SOMATOM 128 CT'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Tech: {req.assignedTechnician || 'On Duty'}</div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <button
                          onClick={() => {
                            setAbhaSearchQuery(req.abhaId);
                            handleSearchABHA(req.abhaId);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '8px',
                            color: '#38BDF8',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🔍 View Complete ABHA Record
                        </button>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          {isPending && (
                            <button
                              onClick={() => {
                                setAcceptModalReq(req);
                                setSelectedMachine(freeMachinesList[0] ? freeMachinesList[0].name : 'SOMATOM Force 128-Slice CT (Room 101)');
                                setSelectedTech('R. Sivakumar, B.Sc RT');
                              }}
                              style={{
                                padding: '8px 18px',
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.88rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)'
                              }}
                            >
                              ⚡ Accept Scan Request & Assign Machine
                            </button>
                          )}

                          {isAccepted && (
                            <button
                              onClick={() => {
                                setCompleteModalReq(req);
                                setReportFindings(`Standard ${req.modality} acquisition completed. High-definition multi-planar reconstruction demonstrates clear anatomical structures without significant acute lesion.`);
                                setReportImpression(`Normal ${req.modality} appearance of ${req.bodyPart}. Correlate clinically.`);
                              }}
                              style={{
                                padding: '8px 18px',
                                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.88rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
                              }}
                            >
                              ✅ Complete Scan & Push to PACS
                            </button>
                          )}

                          {isCompleted && (
                            <button
                              onClick={() => {
                                setPacsModalStudy({
                                  id: req.studyId || 'RAD-PREV',
                                  studyTitle: `${req.modality} Scan (${req.bodyPart})`,
                                  modality: req.modality,
                                  bodyPart: req.bodyPart,
                                  patientName: req.patientName,
                                  patientId: req.patientId || req.receiptId,
                                  receiptId: req.receiptId,
                                  accessionNo: 'ACC-RAD-LATEST',
                                  studyDate: new Date().toLocaleDateString('en-GB'),
                                  status: 'Reported & Verified',
                                  radiologistName: radiologist.name,
                                  referringDoctor: req.doctorName,
                                  findings: 'Diagnostic scan successfully completed and verified.',
                                  impression: `Completed ${req.modality} examination of ${req.bodyPart}.`
                                });
                              }}
                              style={{
                                padding: '8px 18px',
                                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                borderRadius: '8px',
                                color: '#38BDF8',
                                fontSize: '0.88rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              🖼️ View in PACS DICOM Viewer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 2: SCAN WARD MACHINES & MODALITY SUITES OVERVIEW
            =================================================================== */}
        {activeTab === 'machines' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>
                  Scan Ward Modality Suites & Machine Status
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                  Real-time occupancy status: <strong>{wardStatus.freeMachines} Free (Ready)</strong>, <strong>{wardStatus.occupiedMachines} Occupied (Scanning)</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
              {machines.map(mach => {
                const isFree = mach.status === 'Free';
                const isOccupied = mach.status === 'Occupied';
                const isMaint = mach.status === 'Maintenance';

                return (
                  <div
                    key={mach.id}
                    style={{
                      backgroundColor: '#131E3A',
                      border: isFree ? '1px solid rgba(16, 185, 129, 0.4)' : (isOccupied ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(239, 68, 68, 0.4)'),
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.05em' }}>
                            {mach.roomNo || 'Room 101'} • {mach.modality}
                          </span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFFFFF', margin: '2px 0 0 0' }}>
                            {mach.name}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          backgroundColor: isFree ? 'rgba(16, 185, 129, 0.2)' : (isOccupied ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                          color: isFree ? '#10B981' : (isOccupied ? '#F59E0B' : '#EF4444'),
                          border: isFree ? '1px solid rgba(16, 185, 129, 0.4)' : (isOccupied ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)')
                        }}>
                          {isFree ? '⚡ FREE / READY' : (isOccupied ? '🔬 OCCUPIED / IN SCAN' : '🔧 MAINTENANCE')}
                        </span>
                      </div>

                      {/* Current Patient / Occupant Details */}
                      {isOccupied ? (
                        <div style={{
                          backgroundColor: '#0B1329',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          marginBottom: '14px',
                          border: '1px solid rgba(245, 158, 11, 0.25)'
                        }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#FCD34D', textTransform: 'uppercase' }}>
                            Current Scan In Progress
                          </div>
                          <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#FFFFFF', marginTop: '2px' }}>
                            {mach.currentPatientName || 'Patient'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#38BDF8', fontFamily: 'monospace', marginTop: '2px' }}>
                            🆔 ABHA: {mach.currentAbhaId || '14-0000-0000'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                            Protocol: <strong>{mach.currentScanType || mach.modality}</strong>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: '#0B1329',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          marginBottom: '14px',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          color: '#6EE7B7',
                          fontSize: '0.82rem'
                        }}>
                          ✨ Modality calibrated and idle. Ready to receive next patient immediately.
                        </div>
                      )}

                      {/* Assigned Tech & Shift */}
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(148, 163, 184, 0.15)', paddingTop: '10px' }}>
                        <span>Lead Radiographer:</span>
                        <span style={{ color: '#F1F5F9', fontWeight: '600' }}>{mach.assignedTechnician || 'Roster Specialist'}</span>
                      </div>
                    </div>

                    {/* Machine Status Action Buttons */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleMachineMaintenance(mach)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: isMaint ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: isMaint ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          color: isMaint ? '#34D399' : '#FCA5A5',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {isMaint ? 'Mark Machine Ready' : 'Mark Maintenance'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: SCAN WARD STAFF & WORKERS ROSTER
            =================================================================== */}
        {activeTab === 'workers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>
                  Scan Ward Duty Staff Roster
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                  Active Radiographers, CT/MRI Technologists, Radiology Nurses, and Medical Physicists on duty
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#131E3A',
              borderRadius: '16px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0B1329', color: '#94A3B8', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                    <th style={{ padding: '12px 16px' }}>Staff ID</th>
                    <th style={{ padding: '12px 16px' }}>Name</th>
                    <th style={{ padding: '12px 16px' }}>Role / Designation</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Suite</th>
                    <th style={{ padding: '12px 16px' }}>Duty Shift</th>
                    <th style={{ padding: '12px 16px' }}>Contact</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w, idx) => (
                    <tr
                      key={w.id}
                      style={{
                        borderBottom: idx === workers.length - 1 ? 'none' : '1px solid rgba(148, 163, 184, 0.1)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#38BDF8' }}>{w.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#FFFFFF' }}>{w.name}</td>
                      <td style={{ padding: '14px 16px', color: '#CBD5E1' }}>{w.role}</td>
                      <td style={{ padding: '14px 16px', color: '#34D399' }}>{w.assignedRoom || 'Scan Ward Central'}</td>
                      <td style={{ padding: '14px 16px', color: '#FCD34D' }}>{w.shift || '08:00 - 16:00'}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#94A3B8' }}>{w.phone || '+91 98401 22910'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}>
                          ● Active on Duty
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: SEARCHED PATIENT ABHA CLINICAL PROFILE
            =================================================================== */}
        {activeTab === 'abha_lookup' && searchedPatient && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>
                  Ayushman Bharat Health Account (ABHA) Clinical Record
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                  Centralized Patient Demographics, Vitals, Clinical Summary & Radiology Studies
                </p>
              </div>
              <button
                onClick={() => setActiveTab('requisitions')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#CBD5E1',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ← Back to Requisitions
              </button>
            </div>

            {/* Patient Hero Card */}
            <div style={{
              backgroundColor: '#131E3A',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    👤
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                        {searchedPatient.patient.patientName || searchedPatient.patient.name}
                      </h3>
                      <span style={{ fontSize: '0.78rem', backgroundColor: '#0B1329', color: '#38BDF8', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                        {searchedPatient.patient.age} Y • {searchedPatient.patient.gender}
                      </span>
                      <span style={{ fontSize: '0.78rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                        🩸 {searchedPatient.patient.bloodGroup || 'O+'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.85rem', color: '#94A3B8', flexWrap: 'wrap' }}>
                      <span style={{ color: '#38BDF8', fontFamily: 'monospace', fontWeight: '700' }}>
                        🆔 ABHA: {searchedPatient.patient.abhaId}
                      </span>
                      <span>•</span>
                      <span style={{ fontFamily: 'monospace' }}>
                        📧 {searchedPatient.patient.abhaAddress}
                      </span>
                      <span>•</span>
                      <span>📱 {searchedPatient.patient.phone}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Hospital OPD Receipt No:</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#FCD34D', fontFamily: 'monospace' }}>
                    {searchedPatient.patient.receiptId}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                    {searchedPatient.patient.district || 'Chennai'}, Tamil Nadu
                  </div>
                </div>
              </div>

              {/* Vitals Bar */}
              {searchedPatient.patient.vitals && (
                <div style={{
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(148, 163, 184, 0.15)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px'
                }}>
                  <div style={{ backgroundColor: '#0B1329', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Blood Pressure</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF' }}>{searchedPatient.patient.vitals.bp || '120/80 mmHg'}</div>
                  </div>
                  <div style={{ backgroundColor: '#0B1329', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Pulse Rate</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#34D399' }}>{searchedPatient.patient.vitals.pulse || '74 bpm'}</div>
                  </div>
                  <div style={{ backgroundColor: '#0B1329', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Oxygen SpO2</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38BDF8' }}>{searchedPatient.patient.vitals.spo2 || '99%'}</div>
                  </div>
                  <div style={{ backgroundColor: '#0B1329', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Temperature</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FCD34D' }}>{searchedPatient.patient.vitals.temp || '98.4 °F'}</div>
                  </div>
                  <div style={{ backgroundColor: '#0B1329', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Weight</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#C084FC' }}>{searchedPatient.patient.vitals.weight || '68 kg'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Summary & Allergies */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '18px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#131E3A', borderRadius: '16px', padding: '18px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F87171', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚠️ Allergies & Medical Alerts
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(searchedPatient.patient.clinicalSummary && searchedPatient.patient.clinicalSummary.allergies && searchedPatient.patient.clinicalSummary.allergies.length > 0) ? (
                    searchedPatient.patient.clinicalSummary.allergies.map((alg, i) => (
                      <span key={i} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {alg}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#10B981', fontSize: '0.82rem' }}>No known drug/contrast allergies documented</span>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: '#131E3A', borderRadius: '16px', padding: '18px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#38BDF8', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🩺 Active OPD Diagnosis & Notes
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#F1F5F9' }}>
                  {searchedPatient.patient.clinicalSummary && searchedPatient.patient.clinicalSummary.diagnosis ? (
                    <div>
                      <strong>Diagnosis:</strong> {searchedPatient.patient.clinicalSummary.diagnosis}
                      <div style={{ color: '#94A3B8', marginTop: '4px' }}>
                        <em>Notes:</em> {searchedPatient.patient.clinicalSummary.clinicalNotes || 'Under routine diagnostic investigation.'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#94A3B8' }}>OPD consultation in progress</span>
                  )}
                </div>
              </div>
            </div>

            {/* Past Radiology Studies */}
            {searchedPatient.pastStudies && (
              <div style={{ backgroundColor: '#131E3A', borderRadius: '16px', padding: '20px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🖼️ Completed Radiology & PACS Studies for this Patient ({searchedPatient.pastStudies.length})
                </h4>
                {searchedPatient.pastStudies.length === 0 ? (
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No historical imaging studies on file for this ABHA ID.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {searchedPatient.pastStudies.map(s => (
                      <div
                        key={s.id}
                        style={{
                          backgroundColor: '#0B1329',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#FFFFFF' }}>{s.studyTitle || s.modality}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                            Accession: <span style={{ fontFamily: 'monospace', color: '#38BDF8' }}>{s.accessionNo}</span> • Date: {s.studyDate} • Rad: {s.radiologistName}
                          </div>
                        </div>
                        <button
                          onClick={() => setPacsModalStudy(s)}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: 'rgba(56, 189, 248, 0.2)',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            borderRadius: '6px',
                            color: '#38BDF8',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          View PACS DICOM
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* =====================================================================
          MODAL: ACCEPT SCAN REQUEST & ASSIGN MACHINE / TECH
          ===================================================================== */}
      {acceptModalReq && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: '#131E3A',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            padding: '28px',
            color: '#F1F5F9',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px 0' }}>
              ⚡ Accept Scan Requisition & Assign Ward Machine
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 20px 0' }}>
              Allocating patient to modality suite updates live ward occupancy status.
            </p>

            <div style={{ backgroundColor: '#0B1329', padding: '14px', borderRadius: '12px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF' }}>{acceptModalReq.patientName} ({acceptModalReq.age} Y / {acceptModalReq.gender})</div>
              <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontFamily: 'monospace', marginTop: '2px' }}>🆔 ABHA: {acceptModalReq.abhaId}</div>
              <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '6px' }}><strong>Modality:</strong> {acceptModalReq.modality} Scan ({acceptModalReq.bodyPart})</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                  Select Free / Ready Ward Machine:
                </label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#0B1329',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.roomNo}) — [{m.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                  Assign On-Duty Radiographer / Technologist:
                </label>
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#0B1329',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.name}>
                      {w.name} ({w.role}) — {w.assignedRoom || 'Ward'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAcceptModalReq(null)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '10px',
                  color: '#CBD5E1',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptRequest}
                style={{
                  padding: '10px 22px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Confirm Allocation & Set In-Progress →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: COMPLETE SCAN & PUSH TO PACS
          ===================================================================== */}
      {completeModalReq && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: '#131E3A',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '620px',
            padding: '28px',
            color: '#F1F5F9',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px 0' }}>
              ✅ Complete Diagnostic Scan & Push to PACS Archive
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 18px 0' }}>
              Submitting the diagnostic report creates the PACS DICOM record and frees the allocated machine.
            </p>

            <div style={{ backgroundColor: '#0B1329', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF' }}>{completeModalReq.patientName}</div>
              <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontFamily: 'monospace' }}>🆔 ABHA: {completeModalReq.abhaId} • Study: {completeModalReq.modality} ({completeModalReq.bodyPart})</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                  Radiological Findings:
                </label>
                <textarea
                  rows="3"
                  value={reportFindings}
                  onChange={(e) => setReportFindings(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    backgroundColor: '#0B1329',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                  Radiologist Impression:
                </label>
                <input
                  type="text"
                  value={reportImpression}
                  onChange={(e) => setReportImpression(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    backgroundColor: '#0B1329',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setCompleteModalReq(null)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '10px',
                  color: '#CBD5E1',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRequest}
                style={{
                  padding: '10px 22px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Verify Report & Push to PACS Archive →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: PACS DICOM VIEWER
          ===================================================================== */}
      {pacsModalStudy && typeof PACSViewerModal !== 'undefined' && (
        <PACSViewerModal
          study={pacsModalStudy}
          onClose={() => setPacsModalStudy(null)}
        />
      )}
    </div>
  );
}

// Mount React Root
const rootElement = document.getElementById('ris-root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RISApplication />);
}
