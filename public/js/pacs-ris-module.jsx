// ===========================================================================
// TAMIL NADU HEALTH CARE - RIS & PACS MEDICAL IMAGING SUITE
// Picture Archiving & Communication System (PACS) DICOM Viewer &
// Radiology Information System (RIS) Modality Worklist
// ===========================================================================

// 1. HIGH-PRECISION MEDICAL IMAGING SVG / CANVAS RENDERER
function renderMedicalScanSVG(scanType, sliceIndex = 1, totalSlices = 1, windowPreset = 'Standard', zoom = 1, pan = {x: 0, y: 0}, rotation = 0, flipH = false, flipV = false, invert = false, caliper = null) {
  const normSlice = Math.max(1, Math.min(sliceIndex, totalSlices || 1));
  const sliceRatio = (normSlice - 1) / (Math.max(1, totalSlices - 1));

  // Determine filters based on window preset
  let filterStyle = '';
  if (invert) {
    filterStyle += 'invert(100%) ';
  }
  if (windowPreset === 'Bone') {
    filterStyle += 'contrast(240%) brightness(85%) ';
  } else if (windowPreset === 'Lung') {
    filterStyle += 'contrast(190%) brightness(130%) ';
  } else if (windowPreset === 'Brain') {
    filterStyle += 'contrast(160%) brightness(95%) ';
  } else if (windowPreset === 'Angio' || windowPreset === 'Soft Tissue') {
    filterStyle += 'contrast(170%) brightness(105%) ';
  } else {
    filterStyle += 'contrast(120%) brightness(100%) ';
  }

  // Common SVG dimensions
  const w = 560;
  const h = 560;

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        background: '#040711', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: caliper ? 'crosshair' : 'grab'
      }}
    >
      <div 
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
          transformOrigin: 'center center',
          transition: 'transform 0.08s ease-out',
          filter: filterStyle.trim() || 'none'
        }}
      >
        {/* ========================================================= */}
        {/* SCAN TYPE 1: CHEST X-RAY (ADULT & PEDIATRIC)              */}
        {/* ========================================================= */}
        {(scanType === 'chest_xray' || scanType === 'pediatric_chest_xray') && (
          <svg width={w} height={h} viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="lungGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0B132B" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#1C2541" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3A506B" stopOpacity="0.4" />
              </radialGradient>
              <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
            </defs>

            {/* Dark Thoracic Background */}
            <rect width="560" height="560" fill="#060913" />

            {/* Thoracic Soft Tissue Shadow */}
            <path d="M120 520 C90 350, 100 180, 190 90 Q280 60 370 90 C460 180, 470 350, 440 520 Z" fill="#141C2E" opacity="0.85" />

            {/* Right Lung Field (Anatomical Right = Left on Screen) */}
            <path d="M160 140 C140 210, 140 360, 150 430 Q210 445 250 420 C240 330, 240 200, 230 140 Q195 120 160 140 Z" fill="url(#lungGrad)" stroke="#475569" strokeWidth="1" />

            {/* Left Lung Field (Anatomical Left = Right on Screen) */}
            <path d="M400 140 C420 210, 420 360, 410 430 Q350 445 310 420 C320 310, 320 200, 330 140 Q365 120 400 140 Z" fill="url(#lungGrad)" stroke="#475569" strokeWidth="1" />

            {/* Bronchovascular Markings */}
            <g stroke="#94A3B8" strokeWidth="1.2" opacity="0.5" strokeLinecap="round">
              <path d="M230 220 Q190 240 170 280 M230 240 Q180 300 165 370 M230 260 Q210 320 200 400" />
              <path d="M330 220 Q370 240 390 280 M330 240 Q380 300 395 370 M330 260 Q350 320 360 400" />
            </g>

            {/* Cardiac Silhouette & Aortic Knob */}
            <path d="M260 180 Q290 160 315 190 Q340 240 355 330 Q345 420 280 430 Q220 430 240 340 Q250 240 260 180 Z" fill="#E2E8F0" opacity="0.65" stroke="#F1F5F9" strokeWidth="1.5" />

            {/* Diaphragmatic Domes */}
            <path d="M120 450 Q190 410 260 435" stroke="#E2E8F0" strokeWidth="3" fill="none" opacity="0.8" />
            <path d="M300 440 Q370 420 440 460" stroke="#E2E8F0" strokeWidth="3" fill="none" opacity="0.8" />

            {/* Spine Column (Vertebrae) */}
            <g stroke="#F8FAFC" strokeWidth="1.8" opacity="0.75">
              <line x1="280" y1="80" x2="280" y2="480" strokeDasharray="14 4" strokeWidth="18" stroke="#94A3B8" opacity="0.4" />
              <line x1="280" y1="80" x2="280" y2="480" strokeDasharray="8 6" strokeWidth="8" stroke="#E2E8F0" opacity="0.8" />
            </g>

            {/* Clavicles */}
            <path d="M270 120 Q200 100 140 125" stroke="#F1F5F9" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
            <path d="M290 120 Q360 100 420 125" stroke="#F1F5F9" strokeWidth="6" strokeLinecap="round" opacity="0.85" />

            {/* Ribs (Posterior & Anterior Arcs) */}
            <g stroke="#E2E8F0" strokeWidth="4.5" fill="none" opacity="0.45" strokeLinecap="round">
              {/* Right Ribs */}
              <path d="M270 160 Q180 165 145 220" />
              <path d="M270 200 Q170 210 140 270" />
              <path d="M270 240 Q160 260 135 320" />
              <path d="M270 280 Q155 310 135 370" />
              <path d="M270 320 Q160 360 145 415" />
              <path d="M270 360 Q170 400 160 440" />
              {/* Left Ribs */}
              <path d="M290 160 Q380 165 415 220" />
              <path d="M290 200 Q390 210 420 270" />
              <path d="M290 240 Q400 260 425 320" />
              <path d="M290 280 Q405 310 425 370" />
              <path d="M290 320 Q400 360 415 415" />
              <path d="M290 360 Q390 400 400 440" />
            </g>

            {/* Anatomical Marker */}
            <text x="490" y="80" fill="#E2E8F0" fontSize="26" fontWeight="900" fontFamily="sans-serif">L</text>
            <text x="70" y="80" fill="#E2E8F0" fontSize="26" fontWeight="900" fontFamily="sans-serif">R</text>
          </svg>
        )}

        {/* ========================================================= */}
        {/* SCAN TYPE 2: 3.0T BRAIN MRI (MULTI-SLICE AXIAL T1/T2/FLAIR)*/}
        {/* ========================================================= */}
        {scanType === 'brain_mri' && (
          <svg width={w} height={h} viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background */}
            <rect width="560" height="560" fill="#03050A" />

            {/* Cranial Calvarium (Skull Vault Outer & Inner Cortex) */}
            <ellipse cx="280" cy="275" rx={175 - sliceRatio * 15} ry={215 - sliceRatio * 18} fill="#111827" stroke="#94A3B8" strokeWidth="7" opacity="0.9" />
            <ellipse cx="280" cy="275" rx={164 - sliceRatio * 15} ry={204 - sliceRatio * 18} fill="#0F172A" />

            {/* Subdural & Subarachnoid Spaces */}
            <ellipse cx="280" cy="275" rx={158 - sliceRatio * 15} ry={196 - sliceRatio * 18} fill="#1E293B" opacity="0.75" />

            {/* Cerebral Hemispheres (Grey/White Matter) */}
            <path 
              d={`M280 88 C360 90, 415 180, 415 275 C415 370, 360 455, 280 460 C200 455, 145 370, 145 275 C145 180, 200 90, 280 88 Z`}
              fill="#334155"
              stroke="#64748B"
              strokeWidth="2"
            />

            {/* Interhemispheric Falx Cerebri Fissure */}
            <line x1="280" y1="88" x2="280" y2="460" stroke="#0F172A" strokeWidth="4" />

            {/* Cortical Gyri & Sulci Patterns */}
            <g stroke="#1E293B" strokeWidth="3.5" fill="none" opacity="0.8" strokeLinecap="round">
              <path d="M190 150 Q230 180 200 220 Q240 250 200 300 Q240 350 210 400" />
              <path d="M370 150 Q330 180 360 220 Q320 250 360 300 Q320 350 350 400" />
              <path d="M230 130 Q270 160 240 200" />
              <path d="M330 130 Q290 160 320 200" />
            </g>

            {/* Lateral Ventricles (Dynamic slice expansion) */}
            {sliceRatio > 0.2 && sliceRatio < 0.85 && (
              <g fill="#0B1120" stroke="#475569" strokeWidth="1.5">
                {/* Anterior Horns & Body */}
                <path d={`M274 200 Q250 220 252 280 Q270 310 274 340 Q266 270 274 200 Z`} />
                <path d={`M286 200 Q310 220 308 280 Q290 310 286 340 Q294 270 286 200 Z`} />
                {/* 3rd Ventricle & Thalamic Silhouette */}
                <ellipse cx="280" cy="275" rx="3.5" ry="24" fill="#0B1120" />
                <ellipse cx="260" cy="275" rx="14" ry="22" fill="#475569" opacity="0.4" />
                <ellipse cx="300" cy="275" rx="14" ry="22" fill="#475569" opacity="0.4" />
              </g>
            )}

            {/* Superior Sagittal Sinus */}
            <polygon points="274,88 286,88 280,102" fill="#0F172A" stroke="#475569" strokeWidth="1" />
            <polygon points="274,460 286,460 280,446" fill="#0F172A" stroke="#475569" strokeWidth="1" />

            {/* Slice Depth Indicator */}
            <text x="490" y="80" fill="#94A3B8" fontSize="16" fontWeight="700">MR T2</text>
            <text x="70" y="80" fill="#38BDF8" fontSize="14" fontWeight="800">AXIAL #{normSlice}</text>
          </svg>
        )}

        {/* ========================================================= */}
        {/* SCAN TYPE 3: 128-SLICE CT BRAIN & ANGIO                   */}
        {/* ========================================================= */}
        {scanType === 'brain_ct' && (
          <svg width={w} height={h} viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="560" height="560" fill="#020408" />

            {/* High HU Bone Ring (Dense White Skull) */}
            <ellipse cx="280" cy="275" rx={180 - sliceRatio * 12} ry={210 - sliceRatio * 14} fill="#27272A" stroke="#FFFFFF" strokeWidth="9" />
            <ellipse cx="280" cy="275" rx={166 - sliceRatio * 12} ry={196 - sliceRatio * 14} fill="#18181B" />

            {/* Brain Parenchyma CT Attenuation */}
            <ellipse cx="280" cy="275" rx={160 - sliceRatio * 12} ry={190 - sliceRatio * 14} fill="#3F3F46" />

            {/* Midline Falx & Calcified Pineal Gland */}
            <line x1="280" y1="95" x2="280" y2="455" stroke="#18181B" strokeWidth="3" />
            <circle cx="280" cy="300" r="4.5" fill="#FFFFFF" opacity="0.95" />

            {/* Ventricles on CT (Low Attenuation Dark CSF) */}
            <path d="M274 210 Q245 235 248 285 Q265 315 275 345 Z" fill="#09090B" />
            <path d="M286 210 Q315 235 312 285 Q295 315 285 345 Z" fill="#09090B" />

            {/* CT Angiography Arterial Enhancement (Circle of Willis & MCA branches) */}
            <g stroke="#F87171" strokeWidth="2.5" fill="none" opacity="0.85" strokeLinecap="round">
              <circle cx="280" cy="270" r="14" strokeDasharray="6 3" />
              <path d="M266 270 Q215 260 185 245 M266 270 Q210 280 180 300" />
              <path d="M294 270 Q345 260 375 245 M294 270 Q350 280 380 300" />
            </g>

            <text x="490" y="80" fill="#F87171" fontSize="16" fontWeight="800">CTA</text>
            <text x="70" y="80" fill="#FBBF24" fontSize="14" fontWeight="800">CT #{normSlice}/24</text>
          </svg>
        )}

        {/* ========================================================= */}
        {/* SCAN TYPE 4: BILATERAL KNEE ORTHOPAEDIC DIGITAL X-RAY     */}
        {/* ========================================================= */}
        {scanType === 'knee_xray' && (
          <svg width={w} height={h} viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="560" height="560" fill="#050811" />

            {/* RIGHT KNEE (POST-TKA IMPLANT ON SCREEN LEFT) */}
            <g>
              {/* Femur Distal Shaft */}
              <path d="M140 60 L140 200 Q105 220 95 250 L205 250 Q195 220 160 200 L160 60 Z" fill="#64748B" opacity="0.6" stroke="#94A3B8" strokeWidth="2" />
              
              {/* Titanium TKA Femoral Component (Bright Metallic) */}
              <path d="M90 230 Q150 215 210 230 L210 260 Q150 275 90 260 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="3" filter="drop-shadow(0 0 4px #FFFFFF)" />
              <rect x="142" y="195" width="16" height="35" fill="#FFFFFF" rx="2" />

              {/* Ultra-High Polyethylene Tibial Spacer Gap (Lucent) */}
              <rect x="92" y="263" width="116" height="12" fill="#0F172A" opacity="0.9" />

              {/* Cobalt-Chrome Tibial Tray Component & Stem */}
              <path d="M88 277 L212 277 L205 292 L95 292 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
              <polygon points="144,292 156,292 153,355 147,355" fill="#FFFFFF" />

              {/* Proximal Tibia & Fibula */}
              <path d="M95 295 Q105 340 135 360 L135 520 L165 520 L165 360 Q195 340 205 295 Z" fill="#64748B" opacity="0.6" stroke="#94A3B8" strokeWidth="2" />
              <path d="M80 320 Q70 410 75 520 L90 520 Q85 410 95 320 Z" fill="#475569" opacity="0.5" stroke="#64748B" strokeWidth="1.5" />
              
              <text x="110" y="40" fill="#34D399" fontSize="13" fontWeight="800">RIGHT TKA (DAY 12)</text>
            </g>

            {/* LEFT KNEE (SEVERE GRADE IV OA ON SCREEN RIGHT) */}
            <g>
              {/* Femur Distal Shaft */}
              <path d="M400 60 L400 200 Q365 220 355 250 L465 250 Q455 220 420 200 L420 60 Z" fill="#64748B" opacity="0.6" stroke="#94A3B8" strokeWidth="2" />
              
              {/* Joint Space with Medial Bone-on-Bone Sclerosis & Osteophytes */}
              <path d="M352 245 Q360 262 380 265 L380 252 Z" fill="#FFFFFF" opacity="0.9" />
              <line x1="355" y1="255" x2="400" y2="256" stroke="#FFFFFF" strokeWidth="4" />
              
              {/* Proximal Tibia */}
              <path d="M355 260 Q365 340 395 360 L395 520 L425 520 L425 360 Q455 340 465 260 Z" fill="#64748B" opacity="0.6" stroke="#94A3B8" strokeWidth="2" />
              <path d="M470 320 Q480 410 475 520 L460 520 Q465 410 455 320 Z" fill="#475569" opacity="0.5" stroke="#64748B" strokeWidth="1.5" />

              <text x="365" y="40" fill="#F87171" fontSize="13" fontWeight="800">LEFT OA (GRADE IV)</text>
            </g>

            <text x="70" y="80" fill="#E2E8F0" fontSize="22" fontWeight="900">R</text>
            <text x="490" y="80" fill="#E2E8F0" fontSize="22" fontWeight="900">L</text>
          </svg>
        )}

        {/* ========================================================= */}
        {/* SCAN TYPE 5: RENAL ULTRASOUND & COLOR DOPPLER            */}
        {/* ========================================================= */}
        {(scanType === 'renal_ultrasound' || scanType === 'ultrasound') && (
          <svg width={w} height={h} viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="560" height="560" fill="#000000" />

            {/* Curvilinear Ultrasound Sector Cone */}
            <path d="M280 40 L100 480 Q280 540 460 480 Z" fill="#0F172A" opacity="0.85" stroke="#334155" strokeWidth="1.5" />

            {/* Acoustic Speckle Simulation Lines */}
            <g stroke="#1E293B" strokeWidth="1" strokeDasharray="3 4" opacity="0.6">
              <line x1="280" y1="40" x2="160" y2="500" />
              <line x1="280" y1="40" x2="220" y2="520" />
              <line x1="280" y1="40" x2="280" y2="530" />
              <line x1="280" y1="40" x2="340" y2="520" />
              <line x1="280" y1="40" x2="400" y2="500" />
            </g>

            {/* Renal Capsule & Parenchyma (Bean-Shaped Kidney) */}
            <path d="M210 200 C170 250, 170 340, 220 400 C270 440, 340 430, 360 370 C380 310, 370 240, 320 200 C280 170, 240 170, 210 200 Z" fill="#334155" stroke="#94A3B8" strokeWidth="2.5" opacity="0.85" />

            {/* Central Hyperechoic Renal Sinus (White) */}
            <path d="M245 250 C235 280, 240 330, 270 360 C300 370, 325 350, 320 310 C315 270, 280 235, 245 250 Z" fill="#CBD5E1" opacity="0.75" />

            {/* Color Doppler Interrogation Box */}
            <rect x="230" y="240" width="100" height="120" fill="rgba(56, 189, 248, 0.08)" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" />
            
            {/* Color Doppler Flow Signals (Red: Arterial toward probe, Blue: Venous away) */}
            <path d="M255 270 Q270 260 285 275" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
            <path d="M275 310 Q290 325 310 315" stroke="#3B82F6" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
            <path d="M260 330 Q275 345 295 335" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" opacity="0.85" />

            {/* Depth Focal Markers on Side */}
            <g fill="#94A3B8" fontSize="10" fontFamily="monospace">
              <text x="85" y="150">5 cm -</text>
              <text x="85" y="250">10 cm -</text>
              <text x="85" y="350">15 cm -</text>
              <text x="85" y="450">20 cm -</text>
            </g>

            {/* Doppler Velocity Scale */}
            <g>
              <rect x="470" y="180" width="12" height="40" fill="#EF4444" />
              <rect x="470" y="220" width="12" height="40" fill="#3B82F6" />
              <text x="490" y="190" fill="#EF4444" fontSize="10" fontWeight="700">+38 cm/s</text>
              <text x="490" y="260" fill="#3B82F6" fontSize="10" fontWeight="700">-38 cm/s</text>
            </g>
          </svg>
        )}

        {/* ========================================================= */}
        {/* INTERACTIVE CALIPER MEASUREMENT OVERLAY                   */}
        {/* ========================================================= */}
        {caliper && caliper.x1 && caliper.x2 && (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Caliper Line */}
            <line x1={caliper.x1} y1={caliper.y1} x2={caliper.x2} y2={caliper.y2} stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
            {/* Endpoint Crosshairs */}
            <circle cx={caliper.x1} cy={caliper.y1} r="5" fill="none" stroke="#F59E0B" strokeWidth="2" />
            <circle cx={caliper.x2} cy={caliper.y2} r="5" fill="none" stroke="#F59E0B" strokeWidth="2" />
            {/* Measurement Label Tag */}
            <rect 
              x={(caliper.x1 + caliper.x2) / 2 - 32} 
              y={(caliper.y1 + caliper.y2) / 2 - 14} 
              width="64" 
              height="20" 
              rx="4" 
              fill="#0F172A" 
              stroke="#F59E0B" 
              strokeWidth="1" 
            />
            <text 
              x={(caliper.x1 + caliper.x2) / 2} 
              y={(caliper.y1 + caliper.y2) / 2} 
              fill="#F59E0B" 
              fontSize="11" 
              fontWeight="800" 
              textAnchor="middle" 
              dominantBaseline="middle"
            >
              {caliper.distanceMm || '18.4 mm'}
            </text>
          </svg>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. INTERACTIVE CLINICAL PACS DICOM VIEWER MODAL
// ---------------------------------------------------------------------------
function PACSViewerModal({ study, onClose, onToast }) {
  if (!study) return null;

  const [windowPreset, setWindowPreset] = useState('Standard');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [invert, setInvert] = useState(false);
  const [activeTool, setActiveTool] = useState('pan'); // 'pan' | 'caliper' | 'zoom'

  // Multi-Slice Cine Player state
  const totalSlices = study.sliceCount || 1;
  const [currentSlice, setCurrentSlice] = useState(1);
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [cineFps, setCineFps] = useState(6);

  // Caliper measurement state
  const [caliperData, setCaliperData] = useState(null);
  const [isDrawingCaliper, setIsDrawingCaliper] = useState(false);

  // Report side-drawer
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Cine Animation Loop
  useEffect(() => {
    let interval = null;
    if (isPlayingCine && totalSlices > 1) {
      interval = setInterval(() => {
        setCurrentSlice(s => (s >= totalSlices ? 1 : s + 1));
      }, 1000 / cineFps);
    }
    return () => clearInterval(interval);
  }, [isPlayingCine, totalSlices, cineFps]);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setInvert(false);
    setWindowPreset('Standard');
    setCaliperData(null);
    onToast('PACS Viewport reset to standard geometry');
  };

  const handleExportSnapshot = () => {
    onToast(`DICOM Snapshot exported for ${study.accessionNo} (${study.studyTitle})`);
  };

  const handlePrintReport = () => {
    onToast(`Radiology Report for ${study.accessionNo} sent to verified clinical printer`);
  };

  // Caliper mouse events simulation
  const handleMouseDown = (e) => {
    if (activeTool === 'caliper') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setIsDrawingCaliper(true);
      setCaliperData({ x1: x, y1: y, x2: x + 60, y2: y + 20, distanceMm: '24.6 mm' });
    }
  };

  const handleMouseUp = () => {
    if (isDrawingCaliper) {
      setIsDrawingCaliper(false);
      onToast(`Caliper measurement locked: ${caliperData?.distanceMm || '24.6 mm'}`);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#020617', zIndex: 3000, display: 'flex', flexDirection: 'column', color: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. TOP PACS COMMAND BAR */}
      <header style={{ background: '#090D1A', borderBottom: '1.5px solid #1E293B', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2">
              <rect x="2" y="2" width="20" height="20" rx="3"/>
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="2" x2="12" y2="7"/>
              <line x1="12" y1="17" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="7" y2="12"/>
              <line x1="17" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', letterSpacing: '0.6px' }}>STATE PACS • DIAGNOSTIC DICOM WORKSTATION</span>
              <span style={{ background: '#046A38', color: '#FFFFFF', fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>VERIFIED DICOM 3.0</span>
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0 0', color: '#F8FAFC' }}>
              {study.studyTitle} <span style={{ color: '#94A3B8', fontWeight: '500', fontSize: '13px' }}>({study.modality} • {study.bodyPart})</span>
            </h2>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setZoom(z => Math.min(z + 0.25, 4))} 
            style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Zoom In"
          >
            🔍+ Zoom In
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} 
            style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            title="Zoom Out"
          >
            🔍-
          </button>
          <button 
            onClick={() => setRotation(r => (r + 90) % 360)} 
            style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            title="Rotate 90 deg"
          >
            🔄 Rotate
          </button>
          <button 
            onClick={() => setFlipH(!flipH)} 
            style={{ background: flipH ? '#0284C7' : '#1E293B', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            title="Flip Horizontal"
          >
            ↔ Flip H
          </button>
          <button 
            onClick={() => setInvert(!invert)} 
            style={{ background: invert ? '#F59E0B' : '#1E293B', color: invert ? '#0F172A' : '#FFFFFF', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
            title="Invert Negative / Positive"
          >
            🌓 Invert
          </button>
          <button 
            onClick={() => {
              setActiveTool(activeTool === 'caliper' ? 'pan' : 'caliper');
              setCaliperData({ x1: 200, y1: 260, x2: 320, y2: 260, distanceMm: '38.2 mm' });
              onToast(activeTool !== 'caliper' ? 'Caliper ruler activated' : 'Pan tool active');
            }} 
            style={{ background: activeTool === 'caliper' ? '#F59E0B' : '#1E293B', color: activeTool === 'caliper' ? '#0F172A' : '#FFFFFF', border: '1px solid #334155', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
            title="Measure distance in mm"
          >
            📏 Caliper
          </button>
          <button 
            onClick={handleReset} 
            style={{ background: '#334155', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          >
            Reset
          </button>
          <button 
            onClick={() => setIsReportOpen(!isReportOpen)} 
            style={{ background: isReportOpen ? '#0284C7' : '#046A38', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📄 {isReportOpen ? 'Hide Report' : 'View Radiologist Report'}
          </button>
          <button 
            onClick={onClose} 
            style={{ background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', marginLeft: '8px' }}
          >
            ✕ Exit PACS
          </button>
        </div>
      </header>

      {/* 2. MAIN PACS WORKSPACE: VIEWPORT + CONTROLS + REPORT DRAWER */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        {/* LEFT TOOLBAR: WINDOWING PRESETS & MODALITY METRICS */}
        <aside style={{ width: '220px', background: '#070B16', borderRight: '1.5px solid #1E293B', padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
              Window / Level Presets
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { name: 'Standard', desc: 'Default WW: 400 WL: 40' },
                { name: 'Bone', desc: 'High Contrast (WW: 2000 WL: 500)' },
                { name: 'Lung', desc: 'Pulmonary Parenchyma (WW: 1500 WL: -600)' },
                { name: 'Brain', desc: 'Neuro Grey/White (WW: 80 WL: 40)' },
                { name: 'Angio', desc: 'Vascular Contrast (WW: 600 WL: 150)' }
              ].map(preset => (
                <button
                  key={preset.name}
                  onClick={() => { setWindowPreset(preset.name); onToast(`Window Level set to ${preset.name}`); }}
                  style={{
                    background: windowPreset === preset.name ? '#0284C7' : '#131D31',
                    color: '#FFFFFF',
                    border: windowPreset === preset.name ? '1px solid #38BDF8' : '1px solid #1E293B',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <div>{preset.name}</div>
                  <div style={{ fontSize: '10px', color: windowPreset === preset.name ? '#E0F2FE' : '#64748B', fontWeight: '500' }}>{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Series & Slices Navigator (If CT or MRI) */}
          {totalSlices > 1 && (
            <div style={{ background: '#0F172A', padding: '12px', borderRadius: '10px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
                Multi-Slice Cine Series
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#F8FAFC', marginBottom: '6px' }}>
                Slice {currentSlice} of {totalSlices}
              </div>
              <input
                type="range"
                min="1"
                max={totalSlices}
                value={currentSlice}
                onChange={(e) => setCurrentSlice(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#0284C7', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setIsPlayingCine(!isPlayingCine)}
                  style={{ flex: 1, background: isPlayingCine ? '#DC2626' : '#046A38', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer' }}
                >
                  {isPlayingCine ? '⏸ Pause Cine' : '▶ Play Cine'}
                </button>
                <button
                  onClick={() => setCurrentSlice(s => Math.max(1, s - 1))}
                  style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                >
                  ◀
                </button>
                <button
                  onClick={() => setCurrentSlice(s => Math.min(totalSlices, s + 1))}
                  style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '6px', padding: '6px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                >
                  ▶
                </button>
              </div>
            </div>
          )}

          {/* Quick DICOM Study Info */}
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '10px', border: '1px solid #1E293B', fontSize: '11.5px', color: '#94A3B8' }}>
            <div style={{ fontWeight: '800', color: '#F8FAFC', marginBottom: '4px' }}>DICOM Metadata</div>
            <div>Accession: <strong style={{ color: '#F8FAFC' }}>{study.accessionNo}</strong></div>
            <div>Modality: <strong style={{ color: '#F8FAFC' }}>{study.modality}</strong></div>
            <div>Matrix: <strong>512 x 512 px</strong></div>
            <div>Slice Thk: <strong>1.5 mm</strong></div>
            <div>KVp / mA: <strong>120 / 250</strong></div>
            <div>Window: <strong>{windowPreset}</strong></div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleExportSnapshot}
              style={{ background: '#1E293B', color: '#FFFFFF', border: '1px solid #334155', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              📥 Export DICOM (.dcm)
            </button>
          </div>
        </aside>

        {/* CENTRAL VIEWPORT: MEDICAL SCAN + 4-CORNER DICOM HUD */}
        <main 
          style={{ flex: 1, position: 'relative', background: '#020409', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {/* Top-Left DICOM HUD */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, fontSize: '12px', lineHeight: '1.4', pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            <div style={{ fontWeight: '900', color: '#38BDF8', fontSize: '14px' }}>{study.patientName}</div>
            <div>UHID: <strong>{study.receiptId}</strong></div>
            <div>Study: <strong>{study.studyTitle}</strong></div>
            <div>Dept: <strong>{study.department}</strong></div>
          </div>

          {/* Top-Right DICOM HUD */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, fontSize: '12px', lineHeight: '1.4', textAlign: 'right', pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            <div style={{ fontWeight: '900', color: '#34D399' }}>APEX MEDICAL & RADIOLOGY CENTRE</div>
            <div>Date: <strong>{study.studyDate}</strong></div>
            <div>Modality: <strong>{study.modality} (DICOM 3.0)</strong></div>
            <div>ACC: <strong>{study.accessionNo}</strong></div>
          </div>

          {/* Bottom-Left DICOM HUD */}
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 10, fontSize: '11.5px', lineHeight: '1.4', color: '#94A3B8', pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            <div>Windowing: <strong style={{ color: '#F8FAFC' }}>{windowPreset}</strong></div>
            <div>Zoom: <strong style={{ color: '#F8FAFC' }}>{Math.round(zoom * 100)}%</strong> | Rot: <strong style={{ color: '#F8FAFC' }}>{rotation}°</strong></div>
            <div>Thickness: <strong style={{ color: '#F8FAFC' }}>1.5 mm</strong></div>
          </div>

          {/* Bottom-Right DICOM HUD */}
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 10, fontSize: '11.5px', lineHeight: '1.4', textAlign: 'right', color: '#94A3B8', pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            <div>Series: <strong style={{ color: '#F8FAFC' }}>{study.seriesCount || 1}</strong> | Slice: <strong style={{ color: '#38BDF8' }}>{currentSlice}/{totalSlices}</strong></div>
            <div>Radiologist: <strong style={{ color: '#34D399' }}>{study.radiologistName}</strong></div>
            <div>Status: <strong style={{ color: '#F59E0B' }}>{study.status}</strong></div>
          </div>

          {/* Render the Active Medical Scan SVG */}
          {renderMedicalScanSVG(
            study.scanType || 'chest_xray',
            currentSlice,
            totalSlices,
            windowPreset,
            zoom,
            pan,
            rotation,
            flipH,
            flipV,
            invert,
            caliperData
          )}
        </main>

        {/* RIGHT DRAWER: OFFICIAL RADIOLOGY REPORT */}
        {isReportOpen && (
          <aside style={{ width: '400px', background: '#0F172A', borderLeft: '1.5px solid #1E293B', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', zIndex: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: '#34D399', fontWeight: '800', textTransform: 'uppercase' }}>OFFICIAL VERIFIED REPORT</span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#F8FAFC', margin: '2px 0 0' }}>Radiology Diagnostic Finding</h3>
              </div>
              <button onClick={() => setIsReportOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#1E293B', borderRadius: '10px', padding: '14px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Accession:</strong> {study.accessionNo}</div>
              <div><strong>Modality:</strong> {study.modality} • {study.bodyPart}</div>
              <div><strong>Referring Doctor:</strong> {study.referringDoctor || 'Attending Physician'}</div>
              <div><strong>Reporting Radiologist:</strong> <span style={{ color: '#34D399' }}>{study.radiologistName}</span></div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Clinical Indication</div>
              <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0, lineHeight: '1.45' }}>{study.clinicalIndication}</p>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Technique & Protocol</div>
              <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: 0, lineHeight: '1.45' }}>{study.technique}</p>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Findings</div>
              <p style={{ fontSize: '13px', color: '#F1F5F9', margin: 0, lineHeight: '1.5' }}>{study.findings}</p>
            </div>

            <div style={{ background: '#1E293B', borderLeft: '4px solid #34D399', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#34D399', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Impression & Diagnosis</div>
              <p style={{ fontSize: '13.5px', color: '#FFFFFF', fontWeight: '700', margin: 0, lineHeight: '1.45' }}>{study.impression}</p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePrintReport}
                style={{ flex: 1, background: '#046A38', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                🖨️ Print Signed Report
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. ORDER RADIOLOGY MODALITY MODAL (RIS ORDERING)
// ---------------------------------------------------------------------------
function OrderRadiologyModal({ patient, doctor, onClose, onToast, onOrdered }) {
  if (!patient) return null;

  const [modality, setModality] = useState('CR');
  const [studyTitle, setStudyTitle] = useState('Digital Chest Radiograph (PA View)');
  const [bodyPart, setBodyPart] = useState('Chest');
  const [priority, setPriority] = useState('Routine');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MODALITY_OPTIONS = [
    { value: 'CR', label: 'CR / DR (Digital Radiography X-Ray)', defaultTitle: 'Digital Radiograph (PA View)', bodyPart: 'Chest' },
    { value: 'CT', label: 'CT (128-Slice Helical Computed Tomography)', defaultTitle: '128-Slice Volumetric CT Scan', bodyPart: 'Brain / Neuro' },
    { value: 'MR', label: 'MRI (3.0 Tesla Multi-Planar MR Imaging)', defaultTitle: '3.0T MRI with Multi-Planar FLAIR', bodyPart: 'Brain / Spine' },
    { value: 'US', label: 'US (High-Resolution Ultrasound & Color Doppler)', defaultTitle: 'High-Resolution Ultrasound Scan', bodyPart: 'Abdomen / Pelvis' },
    { value: 'ECHO', label: '2D ECHO (Cardiovascular Doppler Echocardiography)', defaultTitle: '2D Cardiac Doppler Echocardiogram', bodyPart: 'Heart / Thorax' },
    { value: 'NM', label: 'PET-CT (Positron Emission Tomography)', defaultTitle: 'Whole Body Diagnostic PET-CT', bodyPart: 'Whole Body' }
  ];

  const handleModalityChange = (mod) => {
    setModality(mod);
    const match = MODALITY_OPTIONS.find(o => o.value === mod);
    if (match) {
      setStudyTitle(match.defaultTitle);
      setBodyPart(match.bodyPart);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clinicalIndication.trim()) {
      onToast('Please provide clinical indication/reason for study', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/radiology/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id || patient.receiptId,
          patientName: patient.name,
          receiptId: patient.receiptId,
          studyTitle,
          modality,
          bodyPart,
          department: doctor?.department || patient.department || 'General Medicine',
          referringDoctor: doctor?.name || 'Attending Specialist',
          clinicalIndication: clinicalIndication.trim(),
          priority
        })
      });
      const data = await res.json();
      if (data.success && data.study) {
        onToast(`Radiology Order (${data.study.accessionNo}) confirmed in RIS worklist!`);
        if (onOrdered) onOrdered(data.study);
        onClose();
      } else {
        onToast(data.message || 'Failed to submit radiology order', 'error');
      }
    } catch (err) {
      onToast('Network error submitting radiology order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', zIndex: 3100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #CBD5E1' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284C7', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              ☢️
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: '800', textTransform: 'uppercase' }}>RADIOLOGY INFORMATION SYSTEM (RIS)</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '2px 0 0' }}>Order Digital Medical Imaging Study</h3>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        {/* Patient Pill */}
        <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <div>Patient: <strong>{patient.name}</strong> ({patient.age} / {patient.gender})</div>
          <div>Receipt: <strong>{patient.receiptId}</strong></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>Select Imaging Modality</label>
            <select
              value={modality}
              onChange={(e) => handleModalityChange(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', color: '#0F172A', fontWeight: '600' }}
            >
              {MODALITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>Study Description</label>
            <input
              type="text"
              value={studyTitle}
              onChange={(e) => setStudyTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>Clinical Indication & Diagnosis Rationale</label>
            <textarea
              rows="3"
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              placeholder="e.g. Exertional chest pain review; evaluate cardiothoracic ratio and clear lung fields..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', lineHeight: '1.45' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontWeight: '800' }}>
              {isSubmitting ? 'Transmitting Order...' : 'Confirm RIS Modality Requisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. EMBEDDABLE RADIOLOGY STUDIES LIST & WORKLIST CARD COMPONENT
// ---------------------------------------------------------------------------
function RadiologyStudiesPanel({ studies = [], onLaunchPACS, onOrderStudy, isDoctor = false }) {
  const getModalityColor = (mod) => {
    switch ((mod || '').toUpperCase()) {
      case 'CR': return { bg: '#E0F2FE', color: '#0369A1', label: 'Digital X-Ray' };
      case 'CT': return { bg: '#FEF3C7', color: '#B45309', label: '128-Slice CT' };
      case 'MR': return { bg: '#F3E8FF', color: '#7E22CE', label: '3.0T MRI' };
      case 'US': return { bg: '#DCFCE7', color: '#15803D', label: 'Ultrasound' };
      case 'ECHO': return { bg: '#FEE2E2', color: '#B91C1C', label: '2D Echo' };
      default: return { bg: '#F1F5F9', color: '#334155', label: 'Radiology' };
    }
  };

  if (isDoctor) {
    return (
      <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2">
                <rect x="2" y="2" width="20" height="20" rx="3"/>
                <circle cx="12" cy="12" r="5"/>
              </svg>
              PACS Medical Scans & DICOM Diagnostic Viewer ({studies.length})
            </h3>
          </div>
          {onOrderStudy && (
            <button 
              onClick={onOrderStudy}
              style={{ background: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              + Order New Scan to RIS
            </button>
          )}
        </div>

        {studies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: '#F8FAFC', borderRadius: '10px', border: '1.5px dashed #CBD5E1', color: '#64748B' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🩻</div>
            <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#0F172A' }}>No PACS Scans Available for this Patient</div>
            <p style={{ fontSize: '12.5px', margin: '4px 0 0', color: '#64748B' }}>Digital X-Ray, 128-Slice CT, 3.0T MRI, and Ultrasound imaging studies will appear here once archived.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {studies.map((study, idx) => {
              const badge = getModalityColor(study.modality);
              return (
                <div
                  key={study.id || study.accessionNo || idx}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                        {study.modality} • {badge.label}
                      </span>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                        {study.status || 'Verified'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px' }}>
                      {study.studyTitle}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                      Acc: <strong style={{ color: '#0F4C81', fontFamily: 'monospace' }}>{study.accessionNo}</strong> • Date: <strong>{study.studyDate}</strong> • Slices: <strong>{study.sliceCount || 1}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155', background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontStyle: 'italic' }}>
                      "{study.impression || study.findings}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                    <button
                      onClick={() => onLaunchPACS(study)}
                      style={{
                        flex: 1,
                        background: '#0284C7',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="5"/></svg>
                      Launch PACS Viewer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.2">
              <rect x="2" y="2" width="20" height="20" rx="3"/>
              <circle cx="12" cy="12" r="5"/>
            </svg>
            PACS Medical Scans & DICOM Diagnostic Viewer ({studies.length})
          </h3>
        </div>
      </div>

      {studies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', background: '#131E3A', borderRadius: '14px', border: '1.5px dashed rgba(56, 189, 248, 0.25)', color: '#94A3B8' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🩻</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>No PACS Scans Available for this Patient</div>
          <p style={{ fontSize: '13px', margin: '4px 0 0', color: '#94A3B8' }}>Digital X-Ray, 128-Slice CT, 3.0T MRI, and Ultrasound imaging studies will appear here once archived.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {studies.map((study) => {
            const badge = getModalityColor(study.modality);
            return (
              <div
                key={study.id || study.accessionNo}
                style={{
                  background: '#131E3A',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '14px',
                  padding: '18px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                      {study.modality} • {badge.label}
                    </span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                      {study.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px' }}>
                    {study.studyTitle}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                    Acc: <strong style={{ color: '#38BDF8', fontFamily: 'monospace' }}>{study.accessionNo}</strong> • Date: <strong>{study.studyDate}</strong> • Slices: <strong>{study.sliceCount || 1}</strong>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#CBD5E1', background: '#0B1329', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.15)', fontStyle: 'italic' }}>
                    "{study.impression || study.findings}"
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                  <button
                    onClick={() => onLaunchPACS(study)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(2,132,199,0.25)'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="5"/></svg>
                    Launch PACS Viewer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Attach to window for seamless multi-page accessibility
if (typeof window !== 'undefined') {
  window.PACSViewerModal = PACSViewerModal;
  window.OrderRadiologyModal = OrderRadiologyModal;
  window.RadiologyStudiesPanel = RadiologyStudiesPanel;
  window.renderMedicalScanSVG = renderMedicalScanSVG;
}
