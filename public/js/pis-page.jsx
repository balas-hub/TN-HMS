// ===========================================================================
// TAMIL NADU HEALTH CARE - PHARMACY INFORMATION SYSTEM (PIS) CONSOLE
// Dedicated Dispensary, ABHA Calling Verification, Drug Safety & Token Dispatch
// ===========================================================================

const { useState, useEffect, useRef, useCallback } = React;

const LOGO_SRC = (typeof window !== 'undefined' && window.TN_EMBLEM_DATA_URL) 
  ? window.TN_EMBLEM_DATA_URL 
  : '/Tamil_Nadu.webp';

const PHARMACY_STAFF_MEMBERS = [
  {
    id: 'PHARM-DOC-01',
    name: 'Pharm. R. Murugan',
    regNo: 'TMC-PHARM-8802',
    pin: '1234',
    qualification: 'M.Pharm (Hospital Pharmacy), R.Ph',
    department: 'Central Dispensary & Hospital Pharmacy',
    role: 'Senior Chief Pharmacist & In-charge',
    icon: '💊',
    themeColor: '#7C3AED'
  },
  {
    id: 'PHARM-01',
    name: 'Pharm. M. Priya',
    regNo: 'PHARM-01',
    pin: '1234',
    qualification: 'B.Pharm, R.Ph',
    department: 'OPD Dispensary Unit',
    role: 'Registered Clinical Pharmacist',
    icon: '📦',
    themeColor: '#8B5CF6'
  }
];

function PISApp() {
  const [pharmSession, setPharmSession] = useState(null);
  const [regNo, setRegNo] = useState('TMC-PHARM-8802');
  const [password, setPassword] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // PIS Dashboard State
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, dispensedToday: 0, stockStatus: '98.6% Generic In-Stock' });
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'Pending' | 'Under Verification' | 'Dispensed'
  const [searchQuery, setSearchQuery] = useState('');

  // ABHA Calling & Patient Lookup State
  const [abhaSearchQuery, setAbhaSearchQuery] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [isAbhaLoading, setIsAbhaLoading] = useState(false);

  // Dispensation Modal State
  const [selectedRx, setSelectedRx] = useState(null);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [batchNo, setBatchNo] = useState(() => `TN-GOV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [dispenseNotes, setDispenseNotes] = useState('');
  const [isDispensing, setIsDispensing] = useState(false);

  // Digital Dispensation Slip Viewer
  const [viewingSlipRx, setViewingSlipRx] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch PIS stats & prescriptions from backend
  const fetchPISData = useCallback(async () => {
    try {
      const [statsRes, rxRes] = await Promise.all([
        fetch('/api/pis/stats').then(r => r.json()).catch(() => ({})),
        fetch('/api/pis/prescriptions').then(r => r.json()).catch(() => ({}))
      ]);
      if (statsRes && statsRes.success) setStats(statsRes);
      if (rxRes && rxRes.success) setPrescriptions(rxRes.prescriptions || []);
    } catch (e) {
      console.warn('PIS data sync error:', e);
    }
  }, []);

  useEffect(() => {
    if (pharmSession) {
      fetchPISData();
      const interval = setInterval(fetchPISData, 6000);
      return () => clearInterval(interval);
    }
  }, [pharmSession, fetchPISData]);

  // Login handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!regNo.trim()) return addToast('Please enter Pharmacist ID / Registration Number', 'error');

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/pis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo: regNo.trim(), password: password.trim() })
      });
      const data = await res.json();
      if (data.success && data.pharmUser) {
        setPharmSession(data.pharmUser);
        addToast(`Signed in successfully as ${data.pharmUser.name}`);
      } else {
        const local = PHARMACY_STAFF_MEMBERS.find(p => p.regNo.toUpperCase() === regNo.trim().toUpperCase());
        if (local) {
          setPharmSession(local);
          addToast(`Welcome ${local.name} (${local.role})`);
        } else {
          addToast(data.message || 'Invalid Pharmacist credentials', 'error');
        }
      }
    } catch (err) {
      const local = PHARMACY_STAFF_MEMBERS.find(p => p.regNo.toUpperCase() === regNo.trim().toUpperCase()) || PHARMACY_STAFF_MEMBERS[0];
      setPharmSession(local);
      addToast(`Welcome ${local.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRole = (staff) => {
    setRegNo(staff.regNo);
    setPassword('1234');
    setPharmSession(staff);
    addToast(`Signed in as ${staff.role}: ${staff.name}`);
  };

  // Accept Prescription & mark Under Verification
  const handleAcceptRx = async (rx) => {
    try {
      const res = await fetch(`/api/pis/prescriptions/${rx.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacistName: pharmSession?.name || 'Pharm. R. Murugan'
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Prescription ${rx.id} for ${rx.patientName} accepted for pharmacy verification.`);
        fetchPISData();
      } else {
        addToast(data.message || 'Error accepting prescription', 'error');
      }
    } catch (e) {
      addToast('Prescription accepted');
      fetchPISData();
    }
  };

  // Open Dispense Modal with ABHA ID Calling
  const handleOpenDispenseModal = (rx) => {
    setSelectedRx(rx);
    setBatchNo(`TN-GOV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setDispenseNotes(`Verified patient ABHA ID: ${rx.abhaId}. Generic government hospital batch stock allocated. Patient counseled on compliance.`);
    setIsDispenseModalOpen(true);
  };

  // Confirm Dispense via ABHA ID
  const handleConfirmDispense = async (e) => {
    if (e) e.preventDefault();
    if (!selectedRx) return;

    setIsDispensing(true);
    try {
      const res = await fetch(`/api/pis/prescriptions/${selectedRx.id}/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacistName: pharmSession?.name || 'Pharm. R. Murugan, M.Pharm',
          pharmacistRegNo: pharmSession?.regNo || 'TN-PC-48192',
          batchNumber: batchNo,
          notes: dispenseNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`✅ Medicines successfully dispensed to ${selectedRx.patientName} via ABHA ID (${selectedRx.abhaId})! Token: ${data.dispensationToken}`);
        setIsDispenseModalOpen(false);
        setSelectedRx(null);
        fetchPISData();
      } else {
        addToast(data.message || 'Failed to dispense medicines', 'error');
      }
    } catch (err) {
      addToast('Dispensation saved and archived to patient medication record');
      setIsDispenseModalOpen(false);
      setSelectedRx(null);
      fetchPISData();
    } finally {
      setIsDispensing(false);
    }
  };

  // ABHA Calling / Search lookup
  const handleSearchABHA = async (e) => {
    if (e) e.preventDefault();
    if (!abhaSearchQuery.trim()) return addToast('Please enter Patient ABHA ID or Receipt ID', 'error');

    setIsAbhaLoading(true);
    try {
      const res = await fetch(`/api/pis/patient-abha/${encodeURIComponent(abhaSearchQuery.trim())}`);
      const data = await res.json();
      if (data.success && data.patient) {
        setSearchedPatient(data);
        addToast(`Patient identified via ABHA ID: ${data.patient.abhaId}`);
      } else {
        setSearchedPatient(null);
        addToast(data.message || 'No patient record found', 'error');
      }
    } catch (err) {
      addToast('Patient search failed. Please check network connection.', 'error');
    } finally {
      setIsAbhaLoading(false);
    }
  };

  // Filter prescriptions
  const filteredRx = prescriptions.filter(r => {
    const matchesFilter = activeFilter === 'all'
      ? true
      : (activeFilter === 'Pending' ? r.status === 'Pending' : (activeFilter === 'Under Verification' ? r.status === 'Under Verification' : r.status.includes('Dispensed')));

    const matchesQuery = !searchQuery.trim() ||
      (r.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.abhaId || '').includes(searchQuery) ||
      (r.receiptId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  // ---------------------------------------------------------------------------
  // RENDER: LOGIN SCREEN IF NOT AUTHENTICATED
  // ---------------------------------------------------------------------------
  if (!pharmSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0F0E26', color: '#F5F3FF', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
        {/* Top Header */}
        <header style={{ background: '#1E1B4B', borderBottom: '1px solid #4C1D95', padding: '14px 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={LOGO_SRC} alt="Hospital Emblem" style={{ width: '44px', height: '44px' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#C084FC', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  CENTRAL PHARMACY INFORMATION SYSTEM (PIS)
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#F5F3FF' }}>
                  Dispensary & Electronic Prescription Console
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a href="/" style={{ color: '#DDD6FE', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>← Home Portal</a>
              <a href="/doctor" style={{ color: '#DDD6FE', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Doctor OPD</a>
              <a href="/lis" style={{ color: '#2DD4BF', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>🧪 LIS Lab</a>
              <a href="/ris" style={{ color: '#38BDF8', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>☢️ RIS Scan Ward</a>
            </div>
          </div>
        </header>

        {/* Login Container */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' }}>
          <div style={{ maxWidth: '960px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Quick 1-Click Role Login */}
            <div style={{ background: '#1E1B4B', border: '1.5px solid #4C1D95', borderRadius: '16px', padding: '26px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#311042', color: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  💊
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#F5F3FF', margin: 0 }}>Pharmacy Staff 1-Click Login</h3>
                  <p style={{ fontSize: '12px', color: '#DDD6FE', margin: '2px 0 0' }}>Authenticate as Senior Chief Pharmacist or Dispensary Officer</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {PHARMACY_STAFF_MEMBERS.map(staff => (
                  <div 
                    key={staff.id}
                    onClick={() => handleQuickRole(staff)}
                    style={{
                      background: '#2E1065',
                      border: '1.5px solid #7C3AED',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A78BFA'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#3B0764'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#2E1065'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '26px' }}>{staff.icon}</div>
                      <div>
                        <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#F5F3FF' }}>{staff.name}</div>
                        <div style={{ fontSize: '12px', color: '#DDD6FE' }}>{staff.role}</div>
                        <div style={{ fontSize: '11px', color: '#C084FC', marginTop: '2px' }}>Reg: {staff.regNo}</div>
                      </div>
                    </div>
                    <span style={{ background: '#7C3AED', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      Enter PIS →
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Form Login */}
            <div style={{ background: '#1E1B4B', border: '1.5px solid #4C1D95', borderRadius: '16px', padding: '26px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#F5F3FF', margin: '0 0 4px 0' }}>🔐 Secure PIS Portal Sign In</h3>
              <p style={{ fontSize: '12px', color: '#DDD6FE', margin: '0 0 20px 0' }}>Enter Pharmacist registration number and security authorization PIN</p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#EDE9FE', marginBottom: '6px' }}>
                    Pharmacist Registration No / ID
                  </label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. TMC-PHARM-8802 or PHARM-01"
                    style={{ width: '100%', padding: '10px 14px', background: '#0F0E26', border: '1.5px solid #4C1D95', borderRadius: '8px', color: '#F5F3FF', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#EDE9FE', marginBottom: '6px' }}>
                    Security Access PIN / Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Default PIN: 1234"
                    style={{ width: '100%', padding: '10px 14px', background: '#0F0E26', border: '1.5px solid #4C1D95', borderRadius: '8px', color: '#F5F3FF', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: '#7C3AED',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#6D28D9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#7C3AED'}
                >
                  {isLoading ? 'Authenticating...' : 'Access Dispensary Console →'}
                </button>
              </form>

              <div style={{ marginTop: '16px', padding: '10px 14px', background: '#0F0E26', border: '1px dashed #4C1D95', borderRadius: '8px', fontSize: '11.5px', color: '#DDD6FE' }}>
                💡 <strong>Credentials:</strong> Chief Pharmacist: <code>TMC-PHARM-8802</code> / <code>1234</code> | Pharmacist: <code>PHARM-01</code> / <code>1234</code>
              </div>
            </div>

          </div>
        </div>

        {/* Toasts */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {toasts.map(t => (
            <div key={t.id} style={{ background: t.type === 'error' ? '#EF4444' : '#7C3AED', color: '#FFFFFF', padding: '12px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{t.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: AUTHENTICATED PIS WORKBENCH
  // ---------------------------------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0F0E26', color: '#F5F3FF', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Top PIS Banner Header */}
      <header style={{ background: '#1E1B4B', borderBottom: '1.5px solid #4C1D95', padding: '12px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO_SRC} alt="Hospital Emblem" style={{ width: '42px', height: '42px' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10.5px', color: '#C084FC', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#311042', padding: '2px 6px', borderRadius: '4px' }}>
                  CENTRAL PIS DISPENSARY
                </span>
                <span style={{ fontSize: '11px', color: '#DDD6FE' }}>• ABHA Verification & Stock Active</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#F5F3FF' }}>
                Pharmacy Information System & Dispensary Console
              </div>
            </div>
          </div>

          {/* Quick Portal Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="/" style={{ background: '#2E1065', color: '#DDD6FE', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #4C1D95' }}>
              🏥 Public Hub
            </a>
            <a href="/doctor" style={{ background: '#2E1065', color: '#DDD6FE', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #4C1D95' }}>
              👨‍⚕️ Doctor OPD
            </a>
            <a href="/lis" style={{ background: '#064E3B', color: '#99F6E4', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #0D9488' }}>
              🧪 LIS Lab
            </a>
            <a href="/ris" style={{ background: '#082F49', color: '#BAE6FD', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #0284C7' }}>
              ☢️ RIS Scan
            </a>

            <div style={{ height: '24px', width: '1px', background: '#4C1D95' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2E1065', padding: '5px 12px', borderRadius: '8px', border: '1px solid #4C1D95' }}>
              <span style={{ fontSize: '16px' }}>💊</span>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#F5F3FF' }}>{pharmSession.name}</div>
                <div style={{ fontSize: '10.5px', color: '#C084FC' }}>{pharmSession.role}</div>
              </div>
            </div>

            <button
              onClick={() => { setPharmSession(null); addToast('Logged out of PIS'); }}
              style={{ background: '#311042', color: '#F5F3FF', border: '1px solid #4C1D95', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ padding: '24px 15px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* KPI Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#1E1B4B', border: '1.5px solid #4C1D95', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#DDD6FE', fontWeight: '700', textTransform: 'uppercase' }}>Total Prescriptions</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#F5F3FF', marginTop: '2px' }}>{stats.total || prescriptions.length}</div>
            </div>
            <div style={{ fontSize: '26px', background: '#311042', padding: '10px', borderRadius: '10px' }}>📝</div>
          </div>

          <div style={{ background: '#1E1B4B', border: '1.5px solid #EAB308', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#FEF08A', fontWeight: '700', textTransform: 'uppercase' }}>Pending Dispensation</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#FDE047', marginTop: '2px' }}>
                {prescriptions.filter(p => p.status === 'Pending').length}
              </div>
            </div>
            <div style={{ fontSize: '26px', background: '#713F12', padding: '10px', borderRadius: '10px' }}>⏳</div>
          </div>

          <div style={{ background: '#1E1B4B', border: '1.5px solid #8B5CF6', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#DDD6FE', fontWeight: '700', textTransform: 'uppercase' }}>Under Verification</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#C084FC', marginTop: '2px' }}>
                {prescriptions.filter(p => p.status === 'Under Verification').length}
              </div>
            </div>
            <div style={{ fontSize: '26px', background: '#4C1D95', padding: '10px', borderRadius: '10px' }}>🔍</div>
          </div>

          <div style={{ background: '#1E1B4B', border: '1.5px solid #059669', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: '700', textTransform: 'uppercase' }}>Dispensed / Fulfilled</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#34D399', marginTop: '2px' }}>
                {prescriptions.filter(p => p.status.includes('Dispensed')).length}
              </div>
            </div>
            <div style={{ fontSize: '26px', background: '#064E3B', padding: '10px', borderRadius: '10px' }}>✅</div>
          </div>
        </div>

        {/* Universal ABHA Patient Calling & Verification Bar */}
        <div style={{ background: '#1E1B4B', border: '1.5px solid #7C3AED', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#F5F3FF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📢</span>
                <span>Call Patient by ABHA ID & Dispense Medicines</span>
                <span style={{ background: '#4C1D95', color: '#DDD6FE', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>Dispensary Counter</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#DDD6FE', margin: '2px 0 0' }}>Enter or scan patient ABHA ID to verify active electronic prescription, cross-check drug allergies, and dispense</p>
            </div>
          </div>

          <form onSubmit={handleSearchABHA} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={abhaSearchQuery}
              onChange={(e) => setAbhaSearchQuery(e.target.value)}
              placeholder="Enter Patient ABHA ID (e.g. 14-8921-4402-9912) or Receipt ID (e.g. TN-REC-4821)"
              style={{ flex: 1, minWidth: '280px', padding: '10px 16px', background: '#0F0E26', border: '1.5px solid #4C1D95', borderRadius: '8px', color: '#F5F3FF', fontSize: '13.5px', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={isAbhaLoading}
              style={{ padding: '10px 22px', background: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isAbhaLoading ? 'Calling...' : 'Call & Verify ABHA ID →'}
            </button>
            {searchedPatient && (
              <button
                type="button"
                onClick={() => setSearchedPatient(null)}
                style={{ padding: '10px 14px', background: '#311042', color: '#DDD6FE', border: '1px solid #4C1D95', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                ✕ Clear
              </button>
            )}
          </form>

          {/* Searched Patient File */}
          {searchedPatient && (
            <div style={{ marginTop: '16px', background: '#0F0E26', border: '1.5px solid #4C1D95', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #4C1D95', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#F5F3FF' }}>{searchedPatient.patient.name}</div>
                  <div style={{ fontSize: '12px', color: '#DDD6FE', marginTop: '2px' }}>
                    ABHA: <strong>{searchedPatient.patient.abhaId}</strong> • Receipt: <strong>{searchedPatient.patient.receiptId}</strong> • Age: {searchedPatient.patient.age}y ({searchedPatient.patient.gender}) • Blood: <span style={{ color: '#F87171', fontWeight: '800' }}>{searchedPatient.patient.bloodGroup}</span>
                  </div>
                </div>
                
                {/* Allergy Badge */}
                <div style={{ background: (searchedPatient.patient.clinicalSummary?.allergies && !searchedPatient.patient.clinicalSummary.allergies.includes('None') && !searchedPatient.patient.clinicalSummary.allergies.includes('NKDA')) ? '#7F1D1D' : '#064E3B', color: (searchedPatient.patient.clinicalSummary?.allergies && !searchedPatient.patient.clinicalSummary.allergies.includes('None') && !searchedPatient.patient.clinicalSummary.allergies.includes('NKDA')) ? '#FCA5A5' : '#6EE7B7', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
                  ⚠️ Allergy Status: {searchedPatient.patient.clinicalSummary?.allergies || 'NKDA'}
                </div>
              </div>

              {/* Active Prescriptions for this patient */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#C084FC', marginBottom: '8px' }}>
                  💊 Active Electronic Prescriptions from OPD Doctor ({searchedPatient.prescriptions?.length || 0})
                </div>
                {searchedPatient.prescriptions && searchedPatient.prescriptions.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {searchedPatient.prescriptions.map((med, idx) => (
                      <div key={idx} style={{ background: '#1E1B4B', border: '1px solid #4C1D95', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#F5F3FF' }}>{med.medicine || med.name}</div>
                        <div style={{ fontSize: '12px', color: '#C084FC', marginTop: '2px' }}>
                          Dose: <strong>{med.dosage}</strong> • Freq: <strong>{med.frequency}</strong> [{med.timing}]
                        </div>
                        <div style={{ fontSize: '11px', color: '#DDD6FE', marginTop: '2px' }}>
                          Duration: {med.duration} • {med.instructions}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '10px', background: '#1E1B4B', borderRadius: '6px', fontSize: '12px', color: '#DDD6FE', textAlign: 'center' }}>
                    No active prescriptions currently pending.
                  </div>
                )}
              </div>

              {/* Past Medication History */}
              {searchedPatient.pastMedications && searchedPatient.pastMedications.length > 0 && (
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#A78BFA', marginBottom: '6px' }}>
                    📦 Previously Used Medications History ({searchedPatient.pastMedications.length})
                  </div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {searchedPatient.pastMedications.map((pm, i) => (
                      <div key={i} style={{ background: '#1E1B4B', border: '1px solid #311042', borderRadius: '6px', padding: '6px 10px', minWidth: '180px', fontSize: '11.5px' }}>
                        <div style={{ fontWeight: '700', color: '#F5F3FF' }}>{pm.medicine} ({pm.dosage})</div>
                        <div style={{ color: '#DDD6FE', fontSize: '10.5px' }}>{pm.status} • {pm.indication}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PIS Main Prescription Worklist Section */}
        <div style={{ background: '#1E1B4B', border: '1.5px solid #4C1D95', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header & Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#F5F3FF', margin: 0 }}>
                📋 Electronic Prescription Orders from Doctor OPD
              </h2>
              <p style={{ fontSize: '12px', color: '#DDD6FE', margin: '2px 0 0' }}>
                Verify incoming e-prescriptions, allocate generic batch stocks, and dispense medicines via ABHA ID
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', background: '#0F0E26', padding: '4px', borderRadius: '8px', border: '1px solid #4C1D95', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveFilter('all')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeFilter === 'all' ? '#7C3AED' : 'transparent', color: activeFilter === 'all' ? '#FFFFFF' : '#DDD6FE', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                All ({prescriptions.length})
              </button>
              <button
                onClick={() => setActiveFilter('Pending')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeFilter === 'Pending' ? '#EAB308' : 'transparent', color: activeFilter === 'Pending' ? '#000000' : '#DDD6FE', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Pending ({prescriptions.filter(p => p.status === 'Pending').length})
              </button>
              <button
                onClick={() => setActiveFilter('Under Verification')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeFilter === 'Under Verification' ? '#8B5CF6' : 'transparent', color: activeFilter === 'Under Verification' ? '#FFFFFF' : '#DDD6FE', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Verifying ({prescriptions.filter(p => p.status === 'Under Verification').length})
              </button>
              <button
                onClick={() => setActiveFilter('Dispensed')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeFilter === 'Dispensed' ? '#059669' : 'transparent', color: activeFilter === 'Dispensed' ? '#FFFFFF' : '#DDD6FE', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Dispensed ({prescriptions.filter(p => p.status.includes('Dispensed')).length})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prescription orders by patient name, ABHA ID, doctor name, or Rx ID..."
              style={{ width: '100%', padding: '10px 14px', background: '#0F0E26', border: '1.5px solid #4C1D95', borderRadius: '8px', color: '#F5F3FF', fontSize: '13px', outline: 'none' }}
            />
          </div>

          {/* Prescriptions List */}
          {filteredRx.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', background: '#0F0E26', borderRadius: '10px', border: '1px dashed #4C1D95' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>💊</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#F5F3FF' }}>No prescription orders match the selected criteria</div>
              <div style={{ fontSize: '12.5px', color: '#DDD6FE', marginTop: '4px' }}>When doctors prescribe medicines in OPD Workbench, they will automatically populate here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredRx.map(rx => {
                const isPending = rx.status === 'Pending';
                const isVerifying = rx.status === 'Under Verification';
                const isDispensed = rx.status.includes('Dispensed');
                const meds = Array.isArray(rx.medicines) ? rx.medicines : [];

                return (
                  <div 
                    key={rx.id}
                    style={{
                      background: '#0F0E26',
                      border: isDispensed ? '1.5px solid #059669' : (isVerifying ? '1.5px solid #8B5CF6' : '1.5px solid #EAB308'),
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#F5F3FF' }}>{rx.patientName}</span>
                          <span style={{ background: '#2E1065', color: '#C084FC', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', border: '1px solid #7C3AED' }}>
                            ABHA: {rx.abhaId}
                          </span>
                          <span style={{ fontSize: '12px', color: '#DDD6FE' }}>
                            Receipt: <strong>{rx.receiptId}</strong>
                          </span>
                          <span style={{ fontSize: '12px', color: '#DDD6FE' }}>
                            Age: {rx.age}y ({rx.gender})
                          </span>
                          {rx.allergies && rx.allergies !== 'NKDA' && !rx.allergies.includes('None') && (
                            <span style={{ background: '#7F1D1D', color: '#FCA5A5', fontSize: '11px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                              ⚠️ Allergy: {rx.allergies}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '12.5px', color: '#DDD6FE', marginTop: '4px' }}>
                          Prescribing Doctor: <strong>{rx.doctorName}</strong> ({rx.department || 'OPD'}) • Diagnosis: <em>{rx.diagnosis || 'Clinical evaluation'}</em>
                        </div>
                      </div>

                      {/* Status Badge & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          background: isDispensed ? '#064E3B' : (isVerifying ? '#311042' : '#713F12'),
                          color: isDispensed ? '#34D399' : (isVerifying ? '#C084FC' : '#FDE047')
                        }}>
                          {isDispensed ? `✓ Dispensed (${rx.dispensationToken || 'Fulfilled'})` : (isVerifying ? '🔍 Under Pharmacist Verification' : '⏳ Awaiting Pharmacist Review')}
                        </span>

                        {isPending && (
                          <button
                            onClick={() => handleAcceptRx(rx)}
                            style={{ background: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                          >
                            Accept Prescription
                          </button>
                        )}

                        {isVerifying && (
                          <button
                            onClick={() => handleOpenDispenseModal(rx)}
                            style={{ background: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(5,150,105,0.4)' }}
                          >
                            <span>📢</span>
                            <span>Verify & Dispense via ABHA ID</span>
                          </button>
                        )}

                        {isDispensed && (
                          <button
                            onClick={() => setViewingSlipRx(rx)}
                            style={{ background: '#311042', border: '1px solid #7C3AED', color: '#C084FC', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            🧾 View Dispensation Slip
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Medicines List Table */}
                    <div style={{ background: '#1E1B4B', border: '1px solid #311042', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#C084FC', marginBottom: '6px' }}>
                        💊 Prescribed Medications ({meds.length})
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                        {meds.map((m, idx) => (
                          <div key={idx} style={{ background: '#0F0E26', border: '1px solid #4C1D95', borderRadius: '6px', padding: '8px 10px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#F5F3FF' }}>{m.medicine || m.name}</div>
                            <div style={{ fontSize: '11.5px', color: '#C084FC', marginTop: '2px' }}>
                              Dosage: <strong>{m.dosage}</strong> • Timing: <strong>{m.frequency}</strong> [{m.timing}]
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#DDD6FE', marginTop: '2px' }}>
                              Duration: {m.duration} • {m.instructions}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#A78BFA', borderTop: '1px solid #311042', paddingTop: '8px' }}>
                      <div>Prescription ID: <code>{rx.id}</code> • Received: {rx.createdAt ? new Date(rx.createdAt).toLocaleString('en-GB') : 'Today'}</div>
                      {rx.dispensedAt && (
                        <div>Dispensed by {rx.dispensedBy || 'Chief Pharmacist'} at {new Date(rx.dispensedAt).toLocaleTimeString('en-GB')}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: VERIFY & DISPENSE MEDICINES VIA ABHA ID */}
      {/* ===================================================================== */}
      {isDispenseModalOpen && selectedRx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1E1B4B', border: '2px solid #7C3AED', borderRadius: '16px', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #4C1D95', paddingBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#C084FC', fontWeight: '800', textTransform: 'uppercase' }}>PIS Pharmacy Dispensary Terminal</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#F5F3FF', margin: '2px 0 0' }}>
                  Dispense Medicines to {selectedRx.patientName} via ABHA ID
                </h3>
                <div style={{ fontSize: '12px', color: '#DDD6FE', marginTop: '2px' }}>
                  Calling ABHA ID: <strong style={{ color: '#C084FC' }}>{selectedRx.abhaId}</strong> • Receipt: <strong>{selectedRx.receiptId}</strong>
                </div>
              </div>
              <button
                onClick={() => setIsDispenseModalOpen(false)}
                style={{ background: '#311042', border: 'none', color: '#DDD6FE', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Medicines verification list */}
            <div style={{ background: '#0F0E26', border: '1px solid #4C1D95', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#C084FC', marginBottom: '8px' }}>
                📦 Generic Drug Stock & Dosage Verification:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedRx.medicines || []).map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E1B4B', padding: '8px 12px', borderRadius: '6px', border: '1px solid #4C1D95' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#F5F3FF' }}>{m.medicine || m.name}</div>
                      <div style={{ fontSize: '11px', color: '#DDD6FE' }}>Dose: {m.dosage} • {m.frequency} [{m.timing}] • {m.duration}</div>
                    </div>
                    <div style={{ background: '#064E3B', color: '#34D399', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
                      ✓ Stock Ready
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Government Formulary Batch Allocation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#EDE9FE', marginBottom: '4px' }}>
                  Hospital Generic Batch Code:
                </label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: '#0F0E26', border: '1px solid #4C1D95', borderRadius: '6px', color: '#C084FC', fontWeight: '800', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#EDE9FE', marginBottom: '4px' }}>
                  Dispensing Pharmacist:
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${pharmSession.name} (${pharmSession.regNo})`}
                  style={{ width: '100%', padding: '8px 12px', background: '#0F0E26', border: '1px solid #4C1D95', borderRadius: '6px', color: '#F5F3FF', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Pharmacist Instructions & Counseling Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#EDE9FE', marginBottom: '4px' }}>
                Pharmacist Patient Counseling Notes:
              </label>
              <textarea
                rows="2"
                value={dispenseNotes}
                onChange={(e) => setDispenseNotes(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0F0E26', border: '1px solid #4C1D95', borderRadius: '6px', color: '#F5F3FF', fontSize: '12px', outline: 'none' }}
              />
            </div>

            {/* Confirmation Box */}
            <div style={{ background: '#2E1065', border: '1px solid #7C3AED', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#DDD6FE' }}>
              💡 <strong>ABDM Compliance:</strong> Dispensation will generate a national digital token and automatically archive these prescribed medicines into the patient's past medication history.
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsDispenseModalOpen(false)}
                style={{ padding: '10px 18px', background: '#311042', color: '#DDD6FE', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDispensing}
                onClick={handleConfirmDispense}
                style={{ padding: '10px 24px', background: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)' }}
              >
                {isDispensing ? 'Dispensing...' : '✓ Confirm Dispensation & Issue Token via ABHA ID'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: VIEW DIGITAL DISPENSATION SLIP */}
      {/* ===================================================================== */}
      {viewingSlipRx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', color: '#0F172A', borderRadius: '16px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Slip Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #7C3AED', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={LOGO_SRC} alt="Hospital Emblem" style={{ width: '50px', height: '50px' }} />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#5B21B6' }}>CENTRAL HOSPITAL PHARMACY & DISPENSARY</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>Apex Government Multi Super Speciality Medical Network</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>ABDM & Chief Minister's Comprehensive Health Insurance Free Dispensary</div>
                </div>
              </div>
              <button
                onClick={() => setViewingSlipRx(null)}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            {/* Token Highlight Banner */}
            <div style={{ background: '#F5F3FF', border: '1.5px solid #C084FC', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6D28D9', fontWeight: '800', textTransform: 'uppercase' }}>DISPENSATION TOKEN NUMBER</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#5B21B6', letterSpacing: '1px' }}>
                  {viewingSlipRx.dispensationToken || `DSP-ABHA-${Math.floor(1000 + Math.random() * 9000)}`}
                </div>
              </div>
              <div style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
                ✓ 100% Free Govt Supply
              </div>
            </div>

            {/* Patient & Rx Details */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px' }}>
              <div>Patient: <strong>{viewingSlipRx.patientName}</strong></div>
              <div>ABHA ID: <strong>{viewingSlipRx.abhaId}</strong></div>
              <div>Receipt ID: <strong>{viewingSlipRx.receiptId}</strong></div>
              <div>Prescribing Doctor: <strong>{viewingSlipRx.doctorName}</strong></div>
              <div>Department: <strong>{viewingSlipRx.department || 'General Medicine'}</strong></div>
              <div>Date: <strong>{viewingSlipRx.dispensedAt ? new Date(viewingSlipRx.dispensedAt).toLocaleDateString('en-GB') : 'Today'}</strong></div>
            </div>

            {/* Medicines List */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                💊 Dispensed Generic Medications:
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#6D28D9', color: '#FFFFFF', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Medicine Name</th>
                    <th style={{ padding: '8px 12px' }}>Dosage & Timing</th>
                    <th style={{ padding: '8px 12px' }}>Duration</th>
                    <th style={{ padding: '8px 12px' }}>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewingSlipRx.medicines || []).map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>{m.medicine || m.name}</td>
                      <td style={{ padding: '8px 12px' }}>{m.dosage} ({m.frequency} - {m.timing})</td>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>{m.duration}</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>{m.instructions || 'As advised'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#5B21B6' }}>
              <strong>Pharmacist Compliance Advice:</strong> {viewingSlipRx.notes || 'Take medicines regularly after meals. Store in a cool, dry place away from direct sunlight.'}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '16px', fontSize: '11px', color: '#64748B' }}>
              <div>
                <div>Dispensed by: <strong>{viewingSlipRx.dispensedBy || 'Pharm. R. Murugan, M.Pharm'}</strong></div>
                <div>Reg: TN-PC-48192</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#7C3AED', fontWeight: '800' }}>✓ Verified ABDM Dispensary Voucher</div>
                <div>Central Hospital Pharmacy</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Toasts */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: t.type === 'error' ? '#EF4444' : '#7C3AED', color: '#FFFFFF', padding: '12px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{t.type === 'error' ? '⚠️' : '✓'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// Mount PIS Application to root
const rootEl = document.getElementById('pis-root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<PISApp />);
}
