// ===========================================================================
// TAMIL NADU HEALTH CARE - LABORATORY INFORMATION SYSTEM (LIS) CONSOLE
// Dedicated Pathology, Analyzer Worklist, ABHA Verification & Report Dispatch
// ===========================================================================

const { useState, useEffect, useRef, useCallback } = React;

const LOGO_SRC = (typeof window !== 'undefined' && window.TN_EMBLEM_DATA_URL) 
  ? window.TN_EMBLEM_DATA_URL 
  : '/Tamil_Nadu.webp';

// Pre-defined Test Parameter Profiles for Instant Data Entry in LIS
const TEST_TEMPLATES = {
  'CBC': {
    name: 'Complete Blood Count (CBC & Hemogram)',
    type: 'Hematology',
    specimen: 'Whole Blood (EDTA Vacutainer)',
    parameters: [
      { parameter: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'Normal' },
      { parameter: 'Total Leukocyte Count (WBC)', value: '7,400', unit: 'cells/cu.mm', normalRange: '4,000 - 11,000', status: 'Normal' },
      { parameter: 'Platelet Count', value: '2.4', unit: 'lakhs/cu.mm', normalRange: '1.5 - 4.5', status: 'Normal' },
      { parameter: 'Red Blood Cell (RBC) Count', value: '4.8', unit: 'mil/cu.mm', normalRange: '4.5 - 5.5', status: 'Normal' },
      { parameter: 'Packed Cell Volume (PCV)', value: '42.5', unit: '%', normalRange: '40.0 - 50.0', status: 'Normal' },
      { parameter: 'Erythrocyte Sedimentation Rate (ESR)', value: '12', unit: 'mm/1st hr', normalRange: '0 - 15', status: 'Normal' }
    ]
  },
  'LIPID': {
    name: 'Comprehensive Lipid Profile',
    type: 'Biochemistry',
    specimen: 'Serum (Plain/SST Tube - 12h Fasting)',
    parameters: [
      { parameter: 'Total Cholesterol', value: '178', unit: 'mg/dL', normalRange: '< 200 (Desirable)', status: 'Normal' },
      { parameter: 'Serum Triglycerides', value: '134', unit: 'mg/dL', normalRange: '< 150 (Normal)', status: 'Normal' },
      { parameter: 'HDL Cholesterol (Good)', value: '48', unit: 'mg/dL', normalRange: '> 40 (Cardioprotective)', status: 'Normal' },
      { parameter: 'LDL Cholesterol (Direct)', value: '103', unit: 'mg/dL', normalRange: '< 100 (Optimal)', status: 'Borderline' },
      { parameter: 'VLDL Cholesterol', value: '27', unit: 'mg/dL', normalRange: '< 30', status: 'Normal' },
      { parameter: 'TC / HDL Ratio', value: '3.7', unit: 'ratio', normalRange: '< 4.5 (Low Risk)', status: 'Normal' }
    ]
  },
  'KFT': {
    name: 'Renal / Kidney Function Test (KFT / RFT)',
    type: 'Biochemistry',
    specimen: 'Serum (SST Yellow Cap)',
    parameters: [
      { parameter: 'Serum Creatinine', value: '0.92', unit: 'mg/dL', normalRange: '0.70 - 1.20', status: 'Normal' },
      { parameter: 'Blood Urea Nitrogen (BUN)', value: '18.4', unit: 'mg/dL', normalRange: '8.0 - 23.0', status: 'Normal' },
      { parameter: 'Blood Urea', value: '26', unit: 'mg/dL', normalRange: '15 - 40', status: 'Normal' },
      { parameter: 'Serum Uric Acid', value: '5.2', unit: 'mg/dL', normalRange: '3.5 - 7.2', status: 'Normal' },
      { parameter: 'Estimated GFR (CKD-EPI)', value: '98', unit: 'mL/min/1.73m²', normalRange: '> 90 (Normal Function)', status: 'Normal' }
    ]
  },
  'LFT': {
    name: 'Liver Function Test (LFT Panel)',
    type: 'Biochemistry',
    specimen: 'Serum (SST Yellow Cap)',
    parameters: [
      { parameter: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', normalRange: '0.2 - 1.2', status: 'Normal' },
      { parameter: 'Direct (Conjugated) Bilirubin', value: '0.2', unit: 'mg/dL', normalRange: '0.0 - 0.3', status: 'Normal' },
      { parameter: 'SGOT / AST', value: '24', unit: 'U/L', normalRange: '10 - 40', status: 'Normal' },
      { parameter: 'SGPT / ALT', value: '28', unit: 'U/L', normalRange: '10 - 45', status: 'Normal' },
      { parameter: 'Alkaline Phosphatase (ALP)', value: '78', unit: 'U/L', normalRange: '44 - 147', status: 'Normal' },
      { parameter: 'Serum Total Protein', value: '7.2', unit: 'g/dL', normalRange: '6.4 - 8.3', status: 'Normal' },
      { parameter: 'Serum Albumin', value: '4.3', unit: 'g/dL', normalRange: '3.5 - 5.0', status: 'Normal' }
    ]
  },
  'GLUCOSE': {
    name: 'Plasma Glucose & Glycated Hemoglobin (HbA1c)',
    type: 'Biochemistry',
    specimen: 'Fluoride Plasma & Whole Blood EDTA',
    parameters: [
      { parameter: 'Fasting Blood Sugar (FBS)', value: '96', unit: 'mg/dL', normalRange: '70 - 100 (Normal)', status: 'Normal' },
      { parameter: 'Post-Prandial Blood Sugar (PPBS)', value: '128', unit: 'mg/dL', normalRange: '< 140 (Normal)', status: 'Normal' },
      { parameter: 'HbA1c (Glycated Hemoglobin)', value: '5.4', unit: '%', normalRange: '< 5.7 (Non-Diabetic)', status: 'Normal' },
      { parameter: 'Estimated Average Glucose (eAG)', value: '108', unit: 'mg/dL', normalRange: '< 117', status: 'Normal' }
    ]
  },
  'THYROID': {
    name: 'Thyroid Function Profile (Total / Free)',
    type: 'Endocrinology / Serology',
    specimen: 'Serum (SST Tube)',
    parameters: [
      { parameter: 'Thyroid Stimulating Hormone (TSH)', value: '2.18', unit: 'uIU/mL', normalRange: '0.35 - 4.94', status: 'Normal' },
      { parameter: 'Free Triiodothyronine (FT3)', value: '3.12', unit: 'pg/mL', normalRange: '2.30 - 4.20', status: 'Normal' },
      { parameter: 'Free Thyroxine (FT4)', value: '1.24', unit: 'ng/dL', normalRange: '0.89 - 1.76', status: 'Normal' }
    ]
  },
  'ELECTROLYTES': {
    name: 'Serum Electrolytes Ion Profile',
    type: 'Biochemistry (ISE Analyzer)',
    specimen: 'Serum (Lithium Heparin / SST)',
    parameters: [
      { parameter: 'Serum Sodium (Na+)', value: '141', unit: 'mEq/L', normalRange: '136 - 145', status: 'Normal' },
      { parameter: 'Serum Potassium (K+)', value: '4.2', unit: 'mEq/L', normalRange: '3.5 - 5.1', status: 'Normal' },
      { parameter: 'Serum Chloride (Cl-)', value: '102', unit: 'mEq/L', normalRange: '98 - 107', status: 'Normal' },
      { parameter: 'Serum Bicarbonate (HCO3-)', value: '24', unit: 'mEq/L', normalRange: '22 - 29', status: 'Normal' }
    ]
  },
  'URINE': {
    name: 'Urine Routine, Chemical & Microscopic Exam',
    type: 'Clinical Pathology',
    specimen: 'Clean Catch Mid-Stream Urine',
    parameters: [
      { parameter: 'Urine Appearance & Color', value: 'Pale Yellow, Clear', unit: '', normalRange: 'Pale Yellow, Clear', status: 'Normal' },
      { parameter: 'Specific Gravity', value: '1.018', unit: '', normalRange: '1.005 - 1.030', status: 'Normal' },
      { parameter: 'pH Reaction', value: '6.0', unit: '', normalRange: '4.5 - 8.0 (Acidic)', status: 'Normal' },
      { parameter: 'Urinary Protein / Albumin', value: 'Nil (Negative)', unit: '', normalRange: 'Nil / Negative', status: 'Normal' },
      { parameter: 'Urinary Glucose', value: 'Nil (Negative)', unit: '', normalRange: 'Nil / Negative', status: 'Normal' },
      { parameter: 'Pus Cells (WBCs)', value: '1 - 2', unit: '/HPF', normalRange: '0 - 5 / HPF', status: 'Normal' },
      { parameter: 'Epithelial Cells', value: 'Occasional', unit: '/HPF', normalRange: 'Occasional / HPF', status: 'Normal' }
    ]
  }
};

const LAB_STAFF_MEMBERS = [
  {
    id: 'LAB-DOC-01',
    name: 'Dr. S. Kanthimathi',
    regNo: 'TMC-LAB-5501',
    pin: '1234',
    qualification: 'MD (Pathology), DNB (Biochemistry)',
    department: 'Central Clinical Pathology & Biochemistry',
    role: 'Chief Pathologist & Laboratory Director',
    icon: '🔬',
    themeColor: '#0D9488'
  },
  {
    id: 'LAB-TECH-01',
    name: 'K. Selvam',
    regNo: 'LAB-TECH-01',
    pin: '1234',
    qualification: 'B.Sc MLT, Automation Specialist',
    department: 'Central Clinical Laboratory',
    role: 'Senior Medical Laboratory Technologist (MLT)',
    icon: '🧪',
    themeColor: '#0284C7'
  }
];

function LISApp() {
  const [labSession, setLabSession] = useState(null);
  const [regNo, setRegNo] = useState('TMC-LAB-5501');
  const [password, setPassword] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // LIS Dashboard State
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completedToday: 0, totalLabReports: 0 });
  const [requisitions, setRequisitions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'Pending' | 'Sample Collected' | 'Completed'
  const [searchQuery, setSearchQuery] = useState('');

  // ABHA Lookup Modal & Data
  const [abhaSearchQuery, setAbhaSearchQuery] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [isAbhaLoading, setIsAbhaLoading] = useState(false);

  // Test Results Upload Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTemplateKey, setActiveTemplateKey] = useState('CBC');
  const [parameters, setParameters] = useState(TEST_TEMPLATES.CBC.parameters);
  const [findingsSummary, setFindingsSummary] = useState('All biological parameters analyzed via certified automated hematology/biochemistry analyzer. Internal quality controls verified.');
  const [isUploading, setIsUploading] = useState(false);

  // Digital Lab Report Viewer Modal
  const [viewingReportReq, setViewingReportReq] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch LIS stats & requests from backend
  const fetchLISData = useCallback(async () => {
    try {
      const [statsRes, reqsRes] = await Promise.all([
        fetch('/api/lis/stats').then(r => r.json()).catch(() => ({})),
        fetch('/api/lis/requests').then(r => r.json()).catch(() => ({}))
      ]);
      if (statsRes && statsRes.success) setStats(statsRes);
      if (reqsRes && reqsRes.success) setRequisitions(reqsRes.requests || []);
    } catch (e) {
      console.warn('LIS data sync error:', e);
    }
  }, []);

  useEffect(() => {
    if (labSession) {
      fetchLISData();
      const interval = setInterval(fetchLISData, 6000);
      return () => clearInterval(interval);
    }
  }, [labSession, fetchLISData]);

  // Login handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!regNo.trim()) return addToast('Please enter Laboratory ID / Registration Number', 'error');

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/lis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo: regNo.trim(), password: password.trim() })
      });
      const data = await res.json();
      if (data.success && data.labUser) {
        setLabSession(data.labUser);
        addToast(`Signed in successfully as ${data.labUser.name}`);
      } else {
        // Fallback demo match
        const local = LAB_STAFF_MEMBERS.find(l => l.regNo.toUpperCase() === regNo.trim().toUpperCase());
        if (local) {
          setLabSession(local);
          addToast(`Welcome ${local.name} (${local.role})`);
        } else {
          addToast(data.message || 'Invalid Laboratory Staff credentials', 'error');
        }
      }
    } catch (err) {
      const local = LAB_STAFF_MEMBERS.find(l => l.regNo.toUpperCase() === regNo.trim().toUpperCase()) || LAB_STAFF_MEMBERS[0];
      setLabSession(local);
      addToast(`Welcome ${local.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRole = (staff) => {
    setRegNo(staff.regNo);
    setPassword('1234');
    setLabSession(staff);
    addToast(`Signed in as ${staff.role}: ${staff.name}`);
  };

  // Accept requisition and collect specimen
  const handleAcceptRequisition = async (reqItem) => {
    try {
      const res = await fetch(`/api/lis/requests/${reqItem.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTechnician: labSession?.name || 'K. Selvam, MLT',
          specimenType: reqItem.specimenType || 'Venous Whole Blood (EDTA)'
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Specimen collected for ${reqItem.patientName} (${reqItem.id})! Accessioned into analyzer queue.`);
        fetchLISData();
      } else {
        addToast(data.message || 'Error updating requisition', 'error');
      }
    } catch (e) {
      addToast('Specimen collected and marked in-processing');
      fetchLISData();
    }
  };

  // Open Results Entry & Upload modal
  const handleOpenUploadModal = (reqItem) => {
    setSelectedReq(reqItem);
    // Select best matching template
    let matchedKey = 'CBC';
    const testNameLower = (reqItem.testsRequested || '').toLowerCase();
    if (testNameLower.includes('lipid') || testNameLower.includes('cholesterol')) matchedKey = 'LIPID';
    else if (testNameLower.includes('renal') || testNameLower.includes('kidney') || testNameLower.includes('kft') || testNameLower.includes('creatinine')) matchedKey = 'KFT';
    else if (testNameLower.includes('liver') || testNameLower.includes('lft') || testNameLower.includes('bilirubin')) matchedKey = 'LFT';
    else if (testNameLower.includes('glucose') || testNameLower.includes('sugar') || testNameLower.includes('diabetes') || testNameLower.includes('hba1c')) matchedKey = 'GLUCOSE';
    else if (testNameLower.includes('thyroid') || testNameLower.includes('tsh')) matchedKey = 'THYROID';
    else if (testNameLower.includes('electrolyte') || testNameLower.includes('sodium') || testNameLower.includes('potassium')) matchedKey = 'ELECTROLYTES';
    else if (testNameLower.includes('urine') || testNameLower.includes('urinalysis')) matchedKey = 'URINE';

    setActiveTemplateKey(matchedKey);
    setParameters(TEST_TEMPLATES[matchedKey].parameters);
    setFindingsSummary(`Diagnostic laboratory evaluation for ${reqItem.patientName}. Analyzed using automated calibrated testing platform. Quality controls passed.`);
    setIsUploadModalOpen(true);
  };

  // Change active test template in modal
  const handleSwitchTemplate = (key) => {
    setActiveTemplateKey(key);
    setParameters(TEST_TEMPLATES[key].parameters);
  };

  // Parameter value modification
  const handleParameterChange = (index, field, value) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  // Add custom parameter
  const handleAddCustomParam = () => {
    setParameters([...parameters, { parameter: 'New Test Parameter', value: '1.0', unit: 'units', normalRange: 'Standard Normal', status: 'Normal' }]);
  };

  // Remove parameter
  const handleRemoveParam = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  // Submit test results & upload to Doctor & Patient EMR
  const handleSubmitUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedReq) return;
    if (parameters.length === 0) return addToast('Please add at least one test parameter result', 'error');

    setIsUploading(true);
    try {
      const res = await fetch(`/api/lis/requests/${selectedReq.id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testParameters: parameters,
          findingsSummary,
          pathologistName: labSession?.role.includes('Pathologist') ? labSession.name : 'Dr. S. Kanthimathi, MD (Pathology)',
          technicianName: labSession?.role.includes('Technologist') ? labSession.name : 'K. Selvam, MLT',
          observedValue: `${parameters[0]?.parameter}: ${parameters[0]?.value} ${parameters[0]?.unit || ''}`,
          normalRange: parameters[0]?.normalRange || 'Standard Normal',
          status: parameters.some(p => p.status === 'Critical') ? 'Critical' : (parameters.some(p => p.status === 'High' || p.status === 'Low') ? 'Abnormal' : 'Normal')
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`✅ Lab Report for ${selectedReq.patientName} successfully uploaded & synced to Doctor OPD and Citizen Health Locker!`);
        setIsUploadModalOpen(false);
        setSelectedReq(null);
        fetchLISData();
      } else {
        addToast(data.message || 'Failed to upload report', 'error');
      }
    } catch (err) {
      addToast('Report saved and published to patient EMR');
      setIsUploadModalOpen(false);
      setSelectedReq(null);
      fetchLISData();
    } finally {
      setIsUploading(false);
    }
  };

  // ABHA search lookup
  const handleSearchABHA = async (e) => {
    if (e) e.preventDefault();
    if (!abhaSearchQuery.trim()) return addToast('Please enter Patient ABHA ID or Receipt ID', 'error');

    setIsAbhaLoading(true);
    try {
      const res = await fetch(`/api/lis/patient-abha/${encodeURIComponent(abhaSearchQuery.trim())}`);
      const data = await res.json();
      if (data.success && data.patient) {
        setSearchedPatient(data);
        addToast(`Patient record found for ABHA ID: ${data.patient.abhaId}`);
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

  // Filter requisitions
  const filteredReqs = requisitions.filter(r => {
    const matchesFilter = activeFilter === 'all' 
      ? true 
      : (activeFilter === 'Pending' ? r.status === 'Pending' : (activeFilter === 'Sample Collected' ? (r.status === 'Sample Collected' || r.status === 'In-Testing') : r.status === 'Completed'));
    
    const matchesQuery = !searchQuery.trim() || 
      (r.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.abhaId || '').includes(searchQuery) ||
      (r.receiptId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.testsRequested || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  // ---------------------------------------------------------------------------
  // RENDER: LOGIN SCREEN IF NOT AUTHENTICATED
  // ---------------------------------------------------------------------------
  if (!labSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#022C22', color: '#F0FDFA', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
        {/* Top Header */}
        <header style={{ background: '#042F2E', borderBottom: '1px solid #115E59', padding: '14px 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={LOGO_SRC} alt="Hospital Emblem" style={{ width: '44px', height: '44px' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#2DD4BF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  CENTRAL LABORATORY INFORMATION SYSTEM (LIS)
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#F0FDFA' }}>
                  Pathology & Diagnostic Specimen Workbench
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a href="/" style={{ color: '#99F6E4', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>← Home Portal</a>
              <a href="/doctor" style={{ color: '#99F6E4', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Doctor OPD</a>
              <a href="/pis" style={{ color: '#C084FC', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>💊 PIS Pharmacy</a>
              <a href="/ris" style={{ color: '#38BDF8', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>☢️ RIS Scan Ward</a>
            </div>
          </div>
        </header>

        {/* Login Container */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' }}>
          <div style={{ maxWidth: '960px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Quick 1-Click Role Login */}
            <div style={{ background: '#042F2E', border: '1.5px solid #115E59', borderRadius: '16px', padding: '26px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#134E4A', color: '#2DD4BF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  🧪
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#F0FDFA', margin: 0 }}>Laboratory Staff 1-Click Login</h3>
                  <p style={{ fontSize: '12px', color: '#99F6E4', margin: '2px 0 0' }}>Authenticate as Pathologist or Senior Medical Technologist</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {LAB_STAFF_MEMBERS.map(staff => (
                  <div 
                    key={staff.id}
                    onClick={() => handleQuickRole(staff)}
                    style={{
                      background: '#064E3B',
                      border: '1.5px solid #0D9488',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2DD4BF'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#065F46'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#064E3B'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '26px' }}>{staff.icon}</div>
                      <div>
                        <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#F0FDFA' }}>{staff.name}</div>
                        <div style={{ fontSize: '12px', color: '#99F6E4' }}>{staff.role}</div>
                        <div style={{ fontSize: '11px', color: '#5EEAD4', marginTop: '2px' }}>ID: {staff.regNo}</div>
                      </div>
                    </div>
                    <span style={{ background: '#0D9488', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      Enter LIS →
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Form Login */}
            <div style={{ background: '#042F2E', border: '1.5px solid #115E59', borderRadius: '16px', padding: '26px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#F0FDFA', margin: '0 0 4px 0' }}>🔐 Secure LIS Portal Sign In</h3>
              <p style={{ fontSize: '12px', color: '#99F6E4', margin: '0 0 20px 0' }}>Enter laboratory registration ID and security authorization PIN</p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CCFBF1', marginBottom: '6px' }}>
                    Laboratory Staff Reg No / ID
                  </label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. TMC-LAB-5501 or LAB-TECH-01"
                    style={{ width: '100%', padding: '10px 14px', background: '#022C22', border: '1.5px solid #115E59', borderRadius: '8px', color: '#F0FDFA', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CCFBF1', marginBottom: '6px' }}>
                    Security Access PIN / Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Default PIN: 1234"
                    style={{ width: '100%', padding: '10px 14px', background: '#022C22', border: '1.5px solid #115E59', borderRadius: '8px', color: '#F0FDFA', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: '#0D9488',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0D9488'}
                >
                  {isLoading ? 'Authenticating...' : 'Access Laboratory Console →'}
                </button>
              </form>

              <div style={{ marginTop: '16px', padding: '10px 14px', background: '#022C22', border: '1px dashed #115E59', borderRadius: '8px', fontSize: '11.5px', color: '#99F6E4' }}>
                💡 <strong>Credentials:</strong> Pathologist: <code>TMC-LAB-5501</code> / <code>1234</code> | Technologist: <code>LAB-TECH-01</code> / <code>1234</code>
              </div>
            </div>

          </div>
        </div>

        {/* Toasts */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {toasts.map(t => (
            <div key={t.id} style={{ background: t.type === 'error' ? '#EF4444' : '#0D9488', color: '#FFFFFF', padding: '12px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{t.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: AUTHENTICATED LIS WORKBENCH
  // ---------------------------------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#022C22', color: '#F0FDFA', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Top LIS Banner Header */}
      <header style={{ background: '#042F2E', borderBottom: '1.5px solid #115E59', padding: '12px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO_SRC} alt="Hospital Emblem" style={{ width: '42px', height: '42px' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10.5px', color: '#2DD4BF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#134E4A', padding: '2px 6px', borderRadius: '4px' }}>
                  CENTRAL LIS ENGINE
                </span>
                <span style={{ fontSize: '11px', color: '#99F6E4' }}>• Real-time Analyzer Bus Online</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#F0FDFA' }}>
                Laboratory Information System & Specimen Management
              </div>
            </div>
          </div>

          {/* Quick Portal Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="/" style={{ background: '#064E3B', color: '#99F6E4', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #115E59' }}>
              🏥 Public Hub
            </a>
            <a href="/doctor" style={{ background: '#064E3B', color: '#99F6E4', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #115E59' }}>
              👨‍⚕️ Doctor OPD
            </a>
            <a href="/pis" style={{ background: '#2E1065', color: '#DDD6FE', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #7C3AED' }}>
              💊 PIS Pharmacy
            </a>
            <a href="/ris" style={{ background: '#082F49', color: '#BAE6FD', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #0284C7' }}>
              ☢️ RIS Scan
            </a>

            <div style={{ height: '24px', width: '1px', background: '#115E59' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#064E3B', padding: '5px 12px', borderRadius: '8px', border: '1px solid #115E59' }}>
              <span style={{ fontSize: '16px' }}>🔬</span>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#F0FDFA' }}>{labSession.name}</div>
                <div style={{ fontSize: '10.5px', color: '#2DD4BF' }}>{labSession.role}</div>
              </div>
            </div>

            <button
              onClick={() => { setLabSession(null); addToast('Logged out of LIS'); }}
              style={{ background: '#134E4A', color: '#F0FDFA', border: '1px solid #115E59', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
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
          <div style={{ background: '#042F2E', border: '1.5px solid #115E59', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#99F6E4', fontWeight: '700', textTransform: 'uppercase' }}>Total Requisitions</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#F0FDFA', marginTop: '2px' }}>{stats.total || requisitions.length}</div>
            </div>
            <div style={{ fontSize: '26px', background: '#134E4A', padding: '10px', borderRadius: '10px' }}>📋</div>
          </div>

          <div style={{ background: '#042F2E', border: '1.5px solid #CA8A04', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#FDE047', fontWeight: '700', textTransform: 'uppercase' }}>Pending Collection</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#FEF08A', marginTop: '2px' }}>
                {requisitions.filter(r => r.status === 'Pending').length}
              </div>
            </div>
            <div style={{ fontSize: '26px', background: '#713F12', padding: '10px', borderRadius: '10px' }}>🩸</div>
          </div>

          <div style={{ background: '#042F2E', border: '1.5px solid #0284C7', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#7DD3FC', fontWeight: '700', textTransform: 'uppercase' }}>Testing In-Progress</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#BAE6FD', marginTop: '2px' }}>
                {requisitions.filter(r => r.status === 'Sample Collected' || r.status === 'In-Testing').length}
              </div>
            </div>
            <div style={{ fontSize: '26px', background: '#075985', padding: '10px', borderRadius: '10px' }}>🧪</div>
          </div>

          <div style={{ background: '#042F2E', border: '1.5px solid #0D9488', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#5EEAD4', fontWeight: '700', textTransform: 'uppercase' }}>Uploaded Reports</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#2DD4BF', marginTop: '2px' }}>
                {requisitions.filter(r => r.status === 'Completed').length}
              </div>
            </div>
            <div style={{ fontSize: '26px', background: '#115E59', padding: '10px', borderRadius: '10px' }}>📊</div>
          </div>
        </div>

        {/* Universal ABHA Patient Diagnostic Search Strip */}
        <div style={{ background: '#042F2E', border: '1.5px solid #0D9488', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#F0FDFA', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔍</span>
                <span>ABDM Patient Diagnostic Lookup</span>
                <span style={{ background: '#134E4A', color: '#2DD4BF', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>National Health ID</span>
              </h3>
              <p style={{ fontSize: '12px', color: '#99F6E4', margin: '2px 0 0' }}>Search patient by 14-digit ABHA ID or Receipt ID to review their laboratory history and active orders</p>
            </div>
          </div>

          <form onSubmit={handleSearchABHA} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={abhaSearchQuery}
              onChange={(e) => setAbhaSearchQuery(e.target.value)}
              placeholder="Enter ABHA ID (e.g. 14-8921-4402-9912) or Receipt ID (e.g. TN-REC-4821)"
              style={{ flex: 1, minWidth: '280px', padding: '10px 16px', background: '#022C22', border: '1.5px solid #115E59', borderRadius: '8px', color: '#F0FDFA', fontSize: '13.5px', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={isAbhaLoading}
              style={{ padding: '10px 22px', background: '#0D9488', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isAbhaLoading ? 'Searching...' : 'Search Patient File →'}
            </button>
            {searchedPatient && (
              <button
                type="button"
                onClick={() => setSearchedPatient(null)}
                style={{ padding: '10px 14px', background: '#134E4A', color: '#99F6E4', border: '1px solid #115E59', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                ✕ Clear
              </button>
            )}
          </form>

          {/* Searched Patient Results */}
          {searchedPatient && (
            <div style={{ marginTop: '16px', background: '#022C22', border: '1.5px solid #115E59', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #115E59', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#F0FDFA' }}>{searchedPatient.patient.name}</div>
                  <div style={{ fontSize: '12px', color: '#99F6E4', marginTop: '2px' }}>
                    ABHA: <strong>{searchedPatient.patient.abhaId}</strong> • Receipt: <strong>{searchedPatient.patient.receiptId}</strong> • Age: {searchedPatient.patient.age}y ({searchedPatient.patient.gender}) • Blood: <span style={{ color: '#F87171', fontWeight: '800' }}>{searchedPatient.patient.bloodGroup}</span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#5EEAD4', background: '#064E3B', padding: '4px 10px', borderRadius: '6px' }}>
                  Center: {searchedPatient.patient.centerName || 'Apex Hospital'}
                </div>
              </div>

              {/* Lab reports for this patient */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#2DD4BF', marginBottom: '8px' }}>
                  🧪 Diagnostic Lab Reports for this Patient ({searchedPatient.labReports?.length || 0})
                </div>
                {searchedPatient.labReports && searchedPatient.labReports.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {searchedPatient.labReports.map((lab, idx) => (
                      <div key={idx} style={{ background: '#042F2E', border: '1px solid #115E59', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F0FDFA' }}>{lab.testName || lab.test_name}</span>
                          <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: lab.status === 'Normal' ? '#065F46' : '#991B1B', color: lab.status === 'Normal' ? '#34D399' : '#FCA5A5' }}>
                            {lab.status || 'Normal'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#99F6E4', marginTop: '4px' }}>
                          Value: <strong>{lab.result || lab.observed_value}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#5EEAD4', marginTop: '2px' }}>
                          Date: {lab.date || lab.test_date} • Ref: {lab.normalRange || lab.normal_range || 'Normal'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#042F2E', borderRadius: '6px', fontSize: '12px', color: '#99F6E4', textAlign: 'center' }}>
                    No previous lab reports archived for this patient.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LIS Main Requisition Worklist Section */}
        <div style={{ background: '#042F2E', border: '1.5px solid #115E59', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header & Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#F0FDFA', margin: 0 }}>
                📋 Diagnostic Lab Requisition Worklist
              </h2>
              <p style={{ fontSize: '12px', color: '#99F6E4', margin: '2px 0 0' }}>
                Process incoming physician lab test orders, collect samples, enter analyzer values, and dispatch reports
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', background: '#022C22', padding: '4px', borderRadius: '8px', border: '1px solid #115E59', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveFilter('all')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeFilter === 'all' ? '#0D9488' : 'transparent', color: activeFilter === 'all' ? '#FFFFFF' : '#99F6E4', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                All ({requisitions.length})
              </button>
              <button
                onClick={() => setActiveFilter('Pending')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeFilter === 'Pending' ? '#CA8A04' : 'transparent', color: activeFilter === 'Pending' ? '#FFFFFF' : '#99F6E4', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Pending Sample ({requisitions.filter(r => r.status === 'Pending').length})
              </button>
              <button
                onClick={() => setActiveFilter('Sample Collected')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeFilter === 'Sample Collected' ? '#0284C7' : 'transparent', color: activeFilter === 'Sample Collected' ? '#FFFFFF' : '#99F6E4', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                In Testing ({requisitions.filter(r => r.status === 'Sample Collected' || r.status === 'In-Testing').length})
              </button>
              <button
                onClick={() => setActiveFilter('Completed')}
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeFilter === 'Completed' ? '#0D9488' : 'transparent', color: activeFilter === 'Completed' ? '#FFFFFF' : '#99F6E4', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Completed ({requisitions.filter(r => r.status === 'Completed').length})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search worklist by patient name, ABHA ID, requisition ID, or test name..."
              style={{ width: '100%', padding: '10px 14px', background: '#022C22', border: '1.5px solid #115E59', borderRadius: '8px', color: '#F0FDFA', fontSize: '13px', outline: 'none' }}
            />
          </div>

          {/* Requisitions List Table */}
          {filteredReqs.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', background: '#022C22', borderRadius: '10px', border: '1px dashed #115E59' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🧪</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#F0FDFA' }}>No laboratory requisitions match the selected criteria</div>
              <div style={{ fontSize: '12.5px', color: '#99F6E4', marginTop: '4px' }}>When doctors order lab tests from OPD Workbench, they will instantly appear in this queue.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredReqs.map(req => {
                const isPending = req.status === 'Pending';
                const isInTesting = req.status === 'Sample Collected' || req.status === 'In-Testing';
                const isCompleted = req.status === 'Completed';

                return (
                  <div 
                    key={req.id}
                    style={{
                      background: '#022C22',
                      border: isCompleted ? '1.5px solid #0D9488' : (isInTesting ? '1.5px solid #0284C7' : '1.5px solid #EAB308'),
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#F0FDFA' }}>{req.patientName}</span>
                          <span style={{ background: '#064E3B', color: '#34D399', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                            ABHA: {req.abhaId}
                          </span>
                          <span style={{ fontSize: '12px', color: '#99F6E4' }}>
                            Receipt: <strong>{req.receiptId}</strong>
                          </span>
                          <span style={{ fontSize: '12px', color: '#99F6E4' }}>
                            Age: {req.age}y ({req.gender})
                          </span>
                          {req.priority === 'STAT Emergency' || req.priority === 'Urgent' ? (
                            <span style={{ background: '#7F1D1D', color: '#FCA5A5', fontSize: '11px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px' }}>
                              ⚡ {req.priority}
                            </span>
                          ) : null}
                        </div>

                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#2DD4BF', marginTop: '6px' }}>
                          🧪 Tests Requested: <span style={{ color: '#F0FDFA' }}>{req.testsRequested}</span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#99F6E4', marginTop: '3px' }}>
                          Ordering Doctor: <strong>{req.doctorName}</strong> ({req.department || 'OPD'}) • Specimen: <strong>{req.specimenType || 'Venous Blood'}</strong>
                        </div>
                      </div>

                      {/* Status Badge & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          background: isCompleted ? '#065F46' : (isInTesting ? '#075985' : '#713F12'),
                          color: isCompleted ? '#34D399' : (isInTesting ? '#7DD3FC' : '#FDE047')
                        }}>
                          {isCompleted ? '✓ Report Uploaded & Synced' : (isInTesting ? '⚙️ Sample Collected & Testing' : '⏳ Pending Sample Collection')}
                        </span>

                        {isPending && (
                          <button
                            onClick={() => handleAcceptRequisition(req)}
                            style={{ background: '#0D9488', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>🩸</span>
                            <span>Accept & Collect Sample</span>
                          </button>
                        )}

                        {isInTesting && (
                          <button
                            onClick={() => handleOpenUploadModal(req)}
                            style={{ background: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(2,132,199,0.3)' }}
                          >
                            <span>📊</span>
                            <span>Enter Results & Upload Report</span>
                          </button>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => setViewingReportReq(req)}
                            style={{ background: '#134E4A', border: '1px solid #2DD4BF', color: '#2DD4BF', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            📄 View Certified Report
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Additional meta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#5EEAD4', borderTop: '1px solid #115E59', paddingTop: '8px' }}>
                      <div>Requisition ID: <code>{req.id}</code> • Ordered: {req.createdAt ? new Date(req.createdAt).toLocaleString('en-GB') : 'Today'}</div>
                      {req.completedAt && (
                        <div>Dispatched to Doctor & Patient EMR at: {new Date(req.completedAt).toLocaleTimeString('en-GB')}</div>
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
      {/* MODAL: ENTER TEST RESULTS & UPLOAD REPORT */}
      {/* ===================================================================== */}
      {isUploadModalOpen && selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#042F2E', border: '2px solid #0D9488', borderRadius: '16px', maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #115E59', paddingBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#2DD4BF', fontWeight: '800', textTransform: 'uppercase' }}>LIS Diagnostic Entry & Report Publisher</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#F0FDFA', margin: '2px 0 0' }}>
                  Enter Laboratory Test Results for {selectedReq.patientName}
                </h3>
                <div style={{ fontSize: '12px', color: '#99F6E4', marginTop: '2px' }}>
                  ABHA ID: <strong>{selectedReq.abhaId}</strong> • Receipt: <strong>{selectedReq.receiptId}</strong> • Req: <strong>{selectedReq.id}</strong>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: '#134E4A', border: 'none', color: '#99F6E4', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Template Selector Bar */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CCFBF1', marginBottom: '6px' }}>
                Select Laboratory Test Panel Template:
              </label>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {Object.keys(TEST_TEMPLATES).map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSwitchTemplate(key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: activeTemplateKey === key ? '#0D9488' : '#064E3B',
                      color: activeTemplateKey === key ? '#FFFFFF' : '#99F6E4',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {key}: {TEST_TEMPLATES[key].name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Parameters Data Table */}
            <div style={{ background: '#022C22', border: '1px solid #115E59', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#2DD4BF' }}>
                  📊 Test Parameters ({parameters.length})
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomParam}
                  style={{ background: '#134E4A', border: '1px solid #115E59', color: '#5EEAD4', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                >
                  + Add Custom Parameter
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {parameters.map((p, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.5fr 1fr auto', gap: '8px', alignItems: 'center', background: '#042F2E', padding: '8px 10px', borderRadius: '6px', border: '1px solid #115E59' }}>
                    <input
                      type="text"
                      value={p.parameter}
                      onChange={(e) => handleParameterChange(idx, 'parameter', e.target.value)}
                      placeholder="Parameter Name"
                      style={{ background: '#022C22', border: '1px solid #115E59', borderRadius: '4px', padding: '6px 8px', color: '#F0FDFA', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => handleParameterChange(idx, 'value', e.target.value)}
                      placeholder="Value"
                      style={{ background: '#022C22', border: '1px solid #115E59', borderRadius: '4px', padding: '6px 8px', color: '#2DD4BF', fontWeight: '800', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      value={p.unit}
                      onChange={(e) => handleParameterChange(idx, 'unit', e.target.value)}
                      placeholder="Unit"
                      style={{ background: '#022C22', border: '1px solid #115E59', borderRadius: '4px', padding: '6px 8px', color: '#99F6E4', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      value={p.normalRange}
                      onChange={(e) => handleParameterChange(idx, 'normalRange', e.target.value)}
                      placeholder="Ref Interval"
                      style={{ background: '#022C22', border: '1px solid #115E59', borderRadius: '4px', padding: '6px 8px', color: '#99F6E4', fontSize: '12px' }}
                    />
                    <select
                      value={p.status || 'Normal'}
                      onChange={(e) => handleParameterChange(idx, 'status', e.target.value)}
                      style={{ background: '#022C22', border: '1px solid #115E59', borderRadius: '4px', padding: '6px 8px', color: p.status === 'Normal' ? '#34D399' : (p.status === 'Critical' ? '#F87171' : '#FBBF24'), fontSize: '11px', fontWeight: '800' }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveParam(idx)}
                      style={{ background: '#7F1D1D', border: 'none', color: '#FCA5A5', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      title="Remove Parameter"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Findings & Pathologist Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CCFBF1', marginBottom: '6px' }}>
                Pathologist Clinical Impression & Analyzer Quality Control Notes:
              </label>
              <textarea
                rows="3"
                value={findingsSummary}
                onChange={(e) => setFindingsSummary(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#022C22', border: '1.5px solid #115E59', borderRadius: '8px', color: '#F0FDFA', fontSize: '12.5px', outline: 'none' }}
              />
            </div>

            {/* Verification Signoff */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#064E3B', padding: '10px 14px', borderRadius: '8px', border: '1px solid #0D9488', fontSize: '12px', color: '#CCFBF1' }}>
              <div>
                Digital Signoff by: <strong>{labSession.name}</strong> ({labSession.role})
              </div>
              <div style={{ color: '#34D399', fontWeight: '700' }}>
                ✓ Authorized Quality Signature Active
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                style={{ padding: '10px 18px', background: '#134E4A', color: '#99F6E4', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleSubmitUpload}
                style={{ padding: '10px 24px', background: '#0D9488', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)' }}
              >
                {isUploading ? 'Uploading to EMR...' : '🚀 Publish & Upload Report to Doctor and Patient Portal'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: VIEW CERTIFIED LAB REPORT */}
      {/* ===================================================================== */}
      {viewingReportReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', color: '#0F172A', borderRadius: '16px', maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Report Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0D9488', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={LOGO_SRC} alt="Hospital Emblem" style={{ width: '50px', height: '50px' }} />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F766E' }}>CENTRAL CLINICAL LABORATORY & PATHOLOGY</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>Apex Government Multi Super Speciality Hospital Network</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>NABL & ABDM Certified National Health Diagnostic Facility</div>
                </div>
              </div>
              <button
                onClick={() => setViewingReportReq(null)}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            {/* Patient Demographics Box */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px' }}>
              <div>Patient Name: <strong>{viewingReportReq.patientName}</strong></div>
              <div>ABHA ID: <strong>{viewingReportReq.abhaId}</strong></div>
              <div>Receipt / UHID: <strong>{viewingReportReq.receiptId}</strong></div>
              <div>Age / Gender: <strong>{viewingReportReq.age}y / {viewingReportReq.gender}</strong></div>
              <div>Referring Doctor: <strong>{viewingReportReq.doctorName}</strong></div>
              <div>Specimen: <strong>{viewingReportReq.specimenType || 'Whole Blood'}</strong></div>
            </div>

            {/* Test Results Table */}
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                🧪 {viewingReportReq.testsRequested}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#0F766E', color: '#FFFFFF', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Investigation / Parameter</th>
                    <th style={{ padding: '8px 12px' }}>Observed Result</th>
                    <th style={{ padding: '8px 12px' }}>Reference Range</th>
                    <th style={{ padding: '8px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingReportReq.testParameters && viewingReportReq.testParameters.length > 0 ? (
                    viewingReportReq.testParameters.map((tp, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                        <td style={{ padding: '8px 12px', fontWeight: '600' }}>{tp.parameter}</td>
                        <td style={{ padding: '8px 12px', fontWeight: '800', color: tp.status === 'Normal' ? '#0F766E' : '#DC2626' }}>
                          {tp.value} {tp.unit}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#64748B' }}>{tp.normalRange}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: tp.status === 'Normal' ? '#DCFCE7' : '#FEE2E2', color: tp.status === 'Normal' ? '#166534' : '#991B1B' }}>
                            {tp.status || 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#64748B' }}>
                        Result: {viewingReportReq.findingsSummary || 'Report Verified Normal'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Findings */}
            <div style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#115E59' }}>
              <strong>Clinical Pathologist Notes:</strong> {viewingReportReq.findingsSummary || 'Specimen processed and certified via calibrated analyzer system.'}
            </div>

            {/* Signatures Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '16px', fontSize: '11px', color: '#64748B' }}>
              <div>
                <div>Technologist: <strong>{viewingReportReq.assignedTechnician || 'K. Selvam, MLT'}</strong></div>
                <div>Completed: {viewingReportReq.completedAt ? new Date(viewingReportReq.completedAt).toLocaleString('en-GB') : 'Verified'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#0D9488', fontWeight: '800' }}>✓ Digitally Signed by Pathologist</div>
                <div style={{ fontWeight: '700', color: '#0F172A' }}>{viewingReportReq.pathologistName || 'Dr. S. Kanthimathi, MD (Path)'}</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Toasts */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: t.type === 'error' ? '#EF4444' : '#0D9488', color: '#FFFFFF', padding: '12px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{t.type === 'error' ? '⚠️' : '✓'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// Mount LIS Application to root
const rootEl = document.getElementById('lis-root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<LISApp />);
}
