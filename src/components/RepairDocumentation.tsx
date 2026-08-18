import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Upload,
  Download,
  Share2,
  Wrench,
  Cpu,
  Thermometer,
  Zap,
  Microscope,
  ShieldCheck,
  User,
  Smartphone,
  Eye,
  X,
  Sparkles,
  Save,
  Check,
  RotateCw,
  Video,
  SwitchCamera,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Filter,
  Copy
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export type DiagnosticStepStatus = 'pass' | 'fault' | 'remediated' | 'in_progress';

export interface DiagnosticStepItem {
  id: string;
  stepNumber: number;
  title: string;
  toolUsed: string;
  measuredReading: string;
  status: DiagnosticStepStatus;
  notes: string;
  componentDesignator?: string;
  timestamp: string;
  technicianName: string;
}

export interface DiagnosticPhotoItem {
  id: string;
  url: string;
  category: 'Intake Inspection' | 'Thermal Heat Map' | 'Microscope Defect' | 'Solder Joint Rework' | 'QA Verification';
  caption: string;
  timestamp: string;
  stageName: string;
  linkedStepNumber?: number;
}

export interface RepairDocumentationData {
  ticketNumber: string;
  deviceModel: string;
  customerName: string;
  serviceTier: string;
  leadTechnician: string;
  overallDiagnosis: string;
  steps: DiagnosticStepItem[];
  photos: DiagnosticPhotoItem[];
  lastUpdated: string;
  qaApproved: boolean;
}

interface RepairDocumentationProps {
  initialTicketNumber?: string;
  customerName?: string;
  deviceModel?: string;
  serviceTier?: string;
  onClose?: () => void;
  onSyncNotesToTracker?: (updatedNotes: string) => void;
}

// Pre-seeded standard lab tickets
const DEFAULT_DOCS: Record<string, Partial<RepairDocumentationData>> = {
  'DCP-8842': {
    ticketNumber: 'DCP-8842',
    deviceModel: 'iPhone 15 Pro Max',
    customerName: 'Alex Mercer',
    serviceTier: 'Tier 3 (Board Rework)',
    leadTechnician: 'Ryan Young (Master Lead Tech)',
    overallDiagnosis: 'High-current VDD_MAIN short-circuit localized to ceramic filter capacitor C3104 near U3100 PMIC power distribution.',
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        title: 'DC Bench Power Supply Current Profiling',
        toolUsed: 'DC Bench Power Supply (4.2V / 1.0A Limit)',
        measuredReading: '4.80A Instant Current Clamp (Overcurrent Protection Triggered)',
        status: 'fault',
        notes: 'Immediate dead short to ground detected across main battery terminal rail.',
        componentDesignator: 'BATT_VCC_IN',
        timestamp: '10:14 AM',
        technicianName: 'Ryan Young'
      },
      {
        id: 'step_2',
        stepNumber: 2,
        title: 'Thermal Camera Heat Map Localization',
        toolUsed: 'Seek Thermal CompactPRO (LWIR 320x240)',
        measuredReading: '84.2°C Thermal Hot Spot over U3100 PMIC perimeter',
        status: 'fault',
        notes: 'Thermal bloom localized to capacitor C3104 decoupling pad on top board layer.',
        componentDesignator: 'C3104 / U3100',
        timestamp: '10:35 AM',
        technicianName: 'Ryan Young'
      },
      {
        id: 'step_3',
        stepNumber: 3,
        title: 'Defective SMD Capacitor Removal & Rail Isolation',
        toolUsed: 'Quick 861DW Hot Air Station (365°C) & Micro-Tweezers',
        measuredReading: 'Resistance to GND restored from 0.012Ω to 0.445V diode drop',
        status: 'remediated',
        notes: 'Lifted shorted 0402 ceramic capacitor. Diode mode reading on PP_VDD_MAIN returned to normal baseline.',
        componentDesignator: 'C3104',
        timestamp: '11:15 AM',
        technicianName: 'Ryan Young'
      },
      {
        id: 'step_4',
        stepNumber: 4,
        title: 'Post-Rework Boot & Current Curve Audit',
        toolUsed: 'USB-C Inline Power Meter & Logic Analyzer',
        measuredReading: '0.85A - 1.65A Dynamic Boot Sequence (Lockscreen Rendered)',
        status: 'pass',
        notes: 'Device boots completely to OS without thermal runaway. Ready for QA display stress bench.',
        componentDesignator: 'SYS_PWR',
        timestamp: '11:45 AM',
        technicianName: 'Ryan Young'
      }
    ],
    photos: [
      {
        id: 'photo_1',
        url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
        category: 'Thermal Heat Map',
        caption: '84.2°C Hot spot bloom localized near PMIC rail decoupling circuit before rework.',
        timestamp: '10:36 AM',
        stageName: 'Stage 1: Triage Diagnostic',
        linkedStepNumber: 2
      },
      {
        id: 'photo_2',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        category: 'Microscope Defect',
        caption: 'Stereo microscope view (45x) showing isolated C3104 pad cleaned with leaded solder wick.',
        timestamp: '11:16 AM',
        stageName: 'Stage 3: Bench Rework',
        linkedStepNumber: 3
      }
    ],
    qaApproved: true
  },
  'DCP-9012': {
    ticketNumber: 'DCP-9012',
    deviceModel: 'Samsung Galaxy S24 Ultra',
    customerName: 'Sarah Jenkins',
    serviceTier: 'Tier 2 (Display Renewal)',
    leadTechnician: 'Elena Rostova (Senior Micro-Soldering Tech)',
    overallDiagnosis: 'Cracked AMOLED substrate causing display failure; digitizer matrix replacement and frame seal calibration required.',
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        title: 'Visual Micro-Inspection & OLED Flex Cable Examination',
        toolUsed: 'Trinocular Stereo Microscope (45x)',
        measuredReading: 'Hairline flex tear identified on pin 14 (MIPI DSI Lane 0)',
        status: 'fault',
        notes: 'Digitizer controller alive on I2C bus, but OLED driver ribbon damaged by frame impact.',
        componentDesignator: 'J_DISP_01',
        timestamp: '09:30 AM',
        technicianName: 'Elena Rostova'
      },
      {
        id: 'step_2',
        stepNumber: 2,
        title: 'OEM 120Hz Dynamic AMOLED Panel Fitment & Lamination',
        toolUsed: 'Heated Separation Plate & Torque Screwdriver Set',
        measuredReading: 'Full 120Hz refresh rate & 3100-nit peak brightness verified',
        status: 'pass',
        notes: 'Clean lamination completed with genuine waterproof adhesive perimeter gasket.',
        componentDesignator: 'PANEL_ASSY',
        timestamp: '10:45 AM',
        technicianName: 'Elena Rostova'
      }
    ],
    photos: [
      {
        id: 'photo_9012_1',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        category: 'QA Verification',
        caption: 'Display touch grid multi-touch calibration test passed 100% with no dead zones.',
        timestamp: '10:50 AM',
        stageName: 'Stage 4: QA Validation',
        linkedStepNumber: 2
      }
    ],
    qaApproved: false
  },
  'DCP-3109': {
    ticketNumber: 'DCP-3109',
    deviceModel: 'iPad Pro 12.9" (M2)',
    customerName: 'Marcus Vance',
    serviceTier: 'Tier 1 (Power/Port Refresh)',
    leadTechnician: 'Marcus Vance (QA Specialist)',
    overallDiagnosis: 'Oxidized USB-C CC1/CC2 lines preventing USB-PD 20V profile negotiation; port assembly replaced.',
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        title: 'USB-C Power Delivery Protocol Handshake Log',
        toolUsed: 'USB-C Inline Power Meter & Logic Analyzer',
        measuredReading: '5.0V / 0.00A (No CC pull-down detected on CC1 pin)',
        status: 'fault',
        notes: 'Micro-corrosion inside connector socket causing CC line floating state.',
        componentDesignator: 'USBC_J1',
        timestamp: '08:15 AM',
        technicianName: 'Marcus Vance'
      },
      {
        id: 'step_2',
        stepNumber: 2,
        title: 'Modular USB-C Daughterboard Replacement',
        toolUsed: 'Precision Tooling & Thermal Heat Pad',
        measuredReading: '19.8V / 2.15A (~42W Fast Charging Nominal Handshake)',
        status: 'pass',
        notes: 'Restored full USB 4.0 / Thunderbolt 40Gbps and 45W fast charging capabilities.',
        componentDesignator: 'USBC_MOD',
        timestamp: '09:00 AM',
        technicianName: 'Marcus Vance'
      }
    ],
    photos: [],
    qaApproved: true
  }
};

const STEP_MACROS = [
  {
    title: 'VDD_MAIN Short Localization',
    tool: 'DC Bench Power Supply (4.2V / 1.0A) & Thermal Camera',
    reading: '4.80A Clamp / 85°C Thermal Bloom',
    status: 'fault' as DiagnosticStepStatus,
    notes: 'Short to ground localized on primary battery distribution rail.',
    designator: 'PP_VDD_MAIN'
  },
  {
    title: 'Diode Mode Rail Audit',
    tool: 'Digital Multimeter (Diode Mode)',
    reading: '0.445V (Nominal Reference)',
    status: 'pass' as DiagnosticStepStatus,
    notes: 'All buck converter inductors measured within standard reference range.',
    designator: 'L_BUCK_ARRAY'
  },
  {
    title: 'SMD Component Micro-Soldering',
    tool: 'JBC C210 Micro-Soldering Iron & Quick 861DW (365°C)',
    reading: 'Impedance restored to 50kΩ+ baseline',
    status: 'remediated' as DiagnosticStepStatus,
    notes: 'Replaced defective 0402 ceramic capacitor with factory spec component.',
    designator: 'C3104'
  },
  {
    title: 'USB-PD Fast Charge Audit',
    tool: 'USB-C Inline Power Meter',
    reading: '20.0V / 2.25A (~45W Negotiated)',
    status: 'pass' as DiagnosticStepStatus,
    notes: 'Full Power Delivery handshake and thermal equilibrium verified.',
    designator: 'USBC_PD'
  }
];

export default function RepairDocumentation({
  initialTicketNumber = 'DCP-8842',
  customerName = 'Alex Mercer',
  deviceModel = 'iPhone 15 Pro Max',
  serviceTier = 'Tier 3 (Board Rework)',
  onClose,
  onSyncNotesToTracker
}: RepairDocumentationProps) {
  const { showToast } = useToast();

  // Active Ticket & Metadata State
  const [ticketNumber, setTicketNumber] = useState(initialTicketNumber);
  const [activeCustomer, setActiveCustomer] = useState(customerName);
  const [activeDevice, setActiveDevice] = useState(deviceModel);
  const [activeTier, setActiveTier] = useState(serviceTier);
  const [leadTech, setLeadTech] = useState('Ryan Young (Founder & Master Lead Tech)');
  const [overallDiagnosis, setOverallDiagnosis] = useState('');
  const [steps, setSteps] = useState<DiagnosticStepItem[]>([]);
  const [photos, setPhotos] = useState<DiagnosticPhotoItem[]>([]);
  const [qaApproved, setQaApproved] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'photos' | 'summary'>('steps');

  // Step Creation State
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [stepTitle, setStepTitle] = useState('');
  const [stepTool, setStepTool] = useState('Digital Multimeter (Diode Mode)');
  const [stepReading, setStepReading] = useState('');
  const [stepStatus, setStepStatus] = useState<DiagnosticStepStatus>('pass');
  const [stepNotes, setStepNotes] = useState('');
  const [stepDesignator, setStepDesignator] = useState('');

  // Photo Creation & Live Camera State
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoCategory, setPhotoCategory] = useState<DiagnosticPhotoItem['category']>('Microscope Defect');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoLinkedStep, setPhotoLinkedStep] = useState<number | undefined>(undefined);
  const [lightboxPhoto, setLightboxPhoto] = useState<DiagnosticPhotoItem | null>(null);

  // Live Camera API Controls
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Load ticket documentation from localStorage or default seed
  useEffect(() => {
    loadTicketData(ticketNumber);
  }, [ticketNumber]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  const loadTicketData = (tNum: string) => {
    const storageKey = `dcp_repair_doc_${tNum}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed: RepairDocumentationData = JSON.parse(saved);
        setOverallDiagnosis(parsed.overallDiagnosis || '');
        setSteps(parsed.steps || []);
        setPhotos(parsed.photos || []);
        setQaApproved(!!parsed.qaApproved);
        if (parsed.leadTechnician) setLeadTech(parsed.leadTechnician);
        if (parsed.customerName) setActiveCustomer(parsed.customerName);
        if (parsed.deviceModel) setActiveDevice(parsed.deviceModel);
        if (parsed.serviceTier) setActiveTier(parsed.serviceTier);
        return;
      } catch (e) {
        console.warn('Failed to parse saved repair documentation:', e);
      }
    }

    // Load predefined template if available
    const sample = DEFAULT_DOCS[tNum];
    if (sample) {
      setOverallDiagnosis(sample.overallDiagnosis || '');
      setSteps(sample.steps || []);
      setPhotos(sample.photos || []);
      setQaApproved(!!sample.qaApproved);
      if (sample.leadTechnician) setLeadTech(sample.leadTechnician);
      if (sample.customerName) setActiveCustomer(sample.customerName);
      if (sample.deviceModel) setActiveDevice(sample.deviceModel);
      if (sample.serviceTier) setActiveTier(sample.serviceTier);
    } else {
      // Initialize fresh serialized log for custom ticket
      const initialStep: DiagnosticStepItem = {
        id: `step_${Date.now()}`,
        stepNumber: 1,
        title: 'Intake Hardware Telemetry & Visual Inspection',
        toolUsed: 'Digital Multimeter & USB-C Inline Power Meter',
        measuredReading: 'Standby current clamp recorded',
        status: 'in_progress',
        notes: `Bench diagnostic intake initialized for ${activeDevice} under Ticket #${tNum}.`,
        componentDesignator: 'MAIN_RAIL',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        technicianName: leadTech.split(' ')[0]
      };
      setSteps([initialStep]);
      setPhotos([]);
      setOverallDiagnosis(`Active diagnostic investigation logged for ticket ${tNum}.`);
      setQaApproved(false);
    }
  };

  const saveDocumentation = (
    updatedSteps: DiagnosticStepItem[],
    updatedPhotos: DiagnosticPhotoItem[],
    newDiag = overallDiagnosis,
    approved = qaApproved
  ) => {
    const docData: RepairDocumentationData = {
      ticketNumber,
      deviceModel: activeDevice,
      customerName: activeCustomer,
      serviceTier: activeTier,
      leadTechnician: leadTech,
      overallDiagnosis: newDiag,
      steps: updatedSteps,
      photos: updatedPhotos,
      lastUpdated: new Date().toISOString(),
      qaApproved: approved
    };

    localStorage.setItem(`dcp_repair_doc_${ticketNumber}`, JSON.stringify(docData));
  };

  // -------------------------------------------------------------
  // Live Camera API Handlers
  // -------------------------------------------------------------
  const startLiveCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    setCameraError(null);
    stopLiveCamera(); // stop any active track
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API (getUserMedia) is not supported in this browser context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveCameraActive(true);
      showToast('Camera active. Focus microscope/board in frame.', 'info');
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Unable to access hardware camera. Please allow camera permissions or upload photos below.');
      setIsLiveCameraActive(false);
    }
  };

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const switchCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startLiveCamera(nextFacing);
  };

  const capturePhotoFromLiveCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Optional: Draw serialized timestamp watermark onto captured image
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, canvas.height - 45, 420, 35);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`D&CP [${ticketNumber}] • ${new Date().toLocaleTimeString()}`, 20, canvas.height - 20);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPreview(dataUrl);
    setPhotoUrlInput(dataUrl);
    stopLiveCamera();
    showToast('Photo captured from Camera API! Add caption to save.', 'success');
  };

  // -------------------------------------------------------------
  // Step Actions
  // -------------------------------------------------------------
  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepTitle.trim()) {
      showToast('Please enter a descriptive step title.', 'info');
      return;
    }

    const newStep: DiagnosticStepItem = {
      id: `step_${Date.now()}`,
      stepNumber: steps.length + 1,
      title: stepTitle.trim(),
      toolUsed: stepTool.trim() || 'Precision Diagnostic Bench',
      measuredReading: stepReading.trim() || 'Visual & functional check verified',
      status: stepStatus,
      notes: stepNotes.trim() || 'Action completed in accordance with Spokane Lab SOP.',
      componentDesignator: stepDesignator.trim() || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      technicianName: leadTech.split(' ')[0]
    };

    const updated = [...steps, newStep];
    setSteps(updated);
    saveDocumentation(updated, photos);

    // Reset Form
    setStepTitle('');
    setStepReading('');
    setStepNotes('');
    setStepDesignator('');
    setStepStatus('pass');
    setIsAddingStep(false);

    showToast(`Logged Diagnostic Step #${newStep.stepNumber}: ${newStep.title}`, 'success');
  };

  const handleApplyMacro = (macro: typeof STEP_MACROS[0]) => {
    setStepTitle(macro.title);
    setStepTool(macro.tool);
    setStepReading(macro.reading);
    setStepStatus(macro.status);
    setStepNotes(macro.notes);
    setStepDesignator(macro.designator);
    setIsAddingStep(true);
    showToast(`Applied macro template: ${macro.title}`, 'info');
  };

  const handleDeleteStep = (id: string) => {
    const updated = steps
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(updated);
    saveDocumentation(updated, photos);
    showToast('Diagnostic step removed from work order.', 'info');
  };

  // -------------------------------------------------------------
  // Photo Evidence Actions
  // -------------------------------------------------------------
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackImage = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    const newPhoto: DiagnosticPhotoItem = {
      id: `photo_${Date.now()}`,
      url: photoUrlInput.trim() || fallbackImage,
      category: photoCategory,
      caption: photoCaption.trim() || `${photoCategory} evidence logged by ${leadTech.split(' ')[0]}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stageName: `Bench Log Stage ${Math.min(steps.length, 4)}`,
      linkedStepNumber: photoLinkedStep
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    saveDocumentation(steps, updated);

    setPhotoUrlInput('');
    setPhotoCaption('');
    setCapturedPreview(null);
    setPhotoLinkedStep(undefined);
    setIsAddingPhoto(false);

    showToast(`Attached ${photoCategory} photo evidence to Ticket #${ticketNumber}!`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoUrlInput(result);
        setCapturedPreview(result);
        showToast('Image file loaded successfully.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    saveDocumentation(steps, updated);
    showToast('Diagnostic photo removed from evidence log.', 'info');
  };

  // -------------------------------------------------------------
  // Tracker Sync & Export
  // -------------------------------------------------------------
  const handleSyncToTracker = () => {
    const faultCount = steps.filter((s) => s.status === 'fault').length;
    const passCount = steps.filter((s) => s.status === 'pass' || s.status === 'remediated').length;

    const summaryText = `[DIAGNOSTIC LOG - ${ticketNumber}]: ${overallDiagnosis || 'Diagnostic steps logged.'} (${steps.length} serialized steps [${passCount} resolved, ${faultCount} faults logged], ${photos.length} inspection photos attached. Lead: ${leadTech}).`;

    if (onSyncNotesToTracker) {
      onSyncNotesToTracker(summaryText);
    }
    showToast(`Synchronized documentation notes with Ticket #${ticketNumber}!`, 'success');
  };

  const handleExportReport = () => {
    const reportContent = {
      spokaneFacility: 'D&CP LLC Spokane Precision Lab & Diagnostic Center',
      ticketNumber,
      deviceModel: activeDevice,
      customerName: activeCustomer,
      serviceTier: activeTier,
      leadTechnician: leadTech,
      overallDiagnosis,
      totalStepsLogged: steps.length,
      qaApproved,
      exportedAt: new Date().toISOString(),
      diagnosticSteps: steps,
      evidencePhotos: photos.map((p) => ({
        category: p.category,
        caption: p.caption,
        timestamp: p.timestamp,
        linkedStep: p.linkedStepNumber
      }))
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportContent, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `Spokane_Diagnostic_Report_${ticketNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`Exported Official Spokane Lab Work Order Diagnostic Report for ${ticketNumber}.`, 'success');
  };

  return (
    <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden max-w-5xl mx-auto">
      {/* Top Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full -ml-32 -mb-32 pointer-events-none" />

      {/* Hidden canvas for Camera snapshot processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 shadow-inner">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Spokane Bench Work Order
              </span>
              <span className="text-xs text-slate-400 font-mono">IPC-A-610 Workmanship Log</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-3">
              <span>Technician Diagnostic Documentation</span>
              <span className="text-xs font-mono font-bold text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-500/40">
                #{ticketNumber}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Ticket Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">Ticket:</span>
            {['DCP-8842', 'DCP-9012', 'DCP-3109'].map((t) => (
              <button
                key={t}
                onClick={() => setTicketNumber(t)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all text-[11px] ${
                  ticketNumber === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleSyncToTracker}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 border border-slate-700 shadow-sm"
            title="Sync diagnostic notes to Repair Status Tracker"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Sync to Tracker</span>
          </button>

          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            title="Download full diagnostic certificate & JSON report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
              title="Close Documentation Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Ticket Hardware & Diagnostic Target Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs relative z-10">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Unit Hardware</span>
          <span className="font-bold text-white block mt-0.5 truncate">{activeDevice}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Client</span>
          <span className="font-bold text-slate-300 block mt-0.5 truncate">{activeCustomer}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Tier</span>
          <span className="font-bold text-blue-400 block mt-0.5 truncate">{activeTier}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Lead Tech</span>
          <span className="font-bold text-emerald-400 block mt-0.5 truncate">{leadTech}</span>
        </div>
      </div>

      {/* Overall Diagnosis Summary Box */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Lead Technician Master Diagnosis Summary
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const updatedApproved = !qaApproved;
                setQaApproved(updatedApproved);
                saveDocumentation(steps, photos, overallDiagnosis, updatedApproved);
                showToast(
                  updatedApproved ? 'QA Sign-off Approved by Lead Tech.' : 'QA Sign-off Marked Pending.',
                  updatedApproved ? 'success' : 'info'
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                qaApproved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{qaApproved ? 'IPC Class 3 QA Signed' : 'Sign QA Approval'}</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">
              {steps.length} Steps • {photos.length} Photos Attached
            </span>
          </div>
        </div>
        <textarea
          rows={2}
          value={overallDiagnosis}
          onChange={(e) => {
            setOverallDiagnosis(e.target.value);
            saveDocumentation(steps, photos, e.target.value);
          }}
          placeholder="Enter primary technical diagnosis, identified component fault (e.g., short on PP_VDD_MAIN, cracked OLED substrate, oxidized BGA ball array)..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 outline-none leading-relaxed"
        />
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('steps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'steps'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Serialized Diagnostic Steps ({steps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'photos'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Camera API & Photo Evidence ({photos.length})</span>
        </button>
      </div>

      {/* TAB 1: SERIALIZED DIAGNOSTIC STEPS */}
      {activeTab === 'steps' && (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Serialized Diagnostic Action Trail</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Log chronological multimeter diode drops, thermal blooms, and component isolations for #{ticketNumber}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingStep(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Step</span>
              </button>
            </div>
          </div>

          {/* Quick Macro Templates Bar */}
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick SOP Diagnostic Macro Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              {STEP_MACROS.map((macro, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyMacro(macro)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-[11px] font-medium transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-blue-400" />
                  <span>{macro.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Step Form Modal / Expander */}
          <AnimatePresence>
            {isAddingStep && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddStepSubmit}
                className="bg-slate-900 border-2 border-blue-500/50 p-5 rounded-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Log Serialized Diagnostic Step #{steps.length + 1}
                  </h5>
                  <button
                    type="button"
                    onClick={() => setIsAddingStep(false)}
                    className="p-1 hover:bg-slate-800 text-slate-400 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Diagnostic Action / Step Title
                    </label>
                    <input
                      type="text"
                      value={stepTitle}
                      onChange={(e) => setStepTitle(e.target.value)}
                      placeholder="e.g. Diode Mode Resistance Probe across VDD_MAIN filter caps"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Component Silk Designator / Rail
                    </label>
                    <input
                      type="text"
                      value={stepDesignator}
                      onChange={(e) => setStepDesignator(e.target.value)}
                      placeholder="e.g. C3104, U3100, PP_VDD_MAIN"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Diagnostic Tool / Equipment Used
                    </label>
                    <select
                      value={stepTool}
                      onChange={(e) => setStepTool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                    >
                      <option value="Digital Multimeter (Diode Mode)">Digital Multimeter (Diode Mode)</option>
                      <option value="DC Bench Power Supply (4.2V / 1.0A Limit)">DC Bench Power Supply (4.2V / 1.0A)</option>
                      <option value="Thermal Imaging Camera (Seek CompactPRO LWIR)">Thermal Imaging Camera (LWIR)</option>
                      <option value="Trinocular Stereo Microscope (45x)">Trinocular Stereo Microscope (45x)</option>
                      <option value="Oscilloscope (100MHz Dual-Channel)">Oscilloscope (100MHz Dual-Channel)</option>
                      <option value="Hot Air Rework Station (Quick 861DW)">Hot Air Rework Station (Quick 861DW)</option>
                      <option value="Micro-Soldering Iron (JBC C210)">Micro-Soldering Iron (JBC C210)</option>
                      <option value="USB-C Inline Power Meter & Logic Analyzer">USB-C Inline Power Meter</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Measured Reading / Telemetry Value
                    </label>
                    <input
                      type="text"
                      value={stepReading}
                      onChange={(e) => setStepReading(e.target.value)}
                      placeholder="e.g. 0.012V (Short Detected) or 0.445V (Nominal)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step Outcome Status
                    </label>
                    <select
                      value={stepStatus}
                      onChange={(e) => setStepStatus(e.target.value as DiagnosticStepStatus)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                    >
                      <option value="pass">Pass (Nominal / Verified)</option>
                      <option value="fault">Fault / Short-Circuit Detected</option>
                      <option value="remediated">Remediated / Reworked</option>
                      <option value="in_progress">In Progress</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Technician Observation Notes
                    </label>
                    <input
                      type="text"
                      value={stepNotes}
                      onChange={(e) => setStepNotes(e.target.value)}
                      placeholder="e.g. Isolated shorted capacitor C3104; lifted with hot air."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingStep(false)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Commit Step to Log
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step) => {
              const statusConfig = {
                pass: { label: 'Pass / Nominal', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: CheckCircle2 },
                fault: { label: 'Fault / Short', bg: 'bg-red-500/20 text-red-300 border-red-500/40', icon: AlertCircle },
                remediated: { label: 'Remediated', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: ShieldCheck },
                in_progress: { label: 'In Progress', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Clock }
              }[step.status];

              const StatusIcon = statusConfig.icon;
              const stepPhotos = photos.filter((p) => p.linkedStepNumber === step.stepNumber);

              return (
                <motion.div
                  key={step.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-slate-700">
                        #{step.stepNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-white">
                            {step.title}
                          </h5>
                          {step.componentDesignator && (
                            <span className="px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded font-mono text-[10px] font-bold border border-blue-700/50">
                              {step.componentDesignator}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Tool: <strong className="text-slate-300">{step.toolUsed}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1.5 ${statusConfig.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusConfig.label}</span>
                      </span>

                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                        title="Delete Step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Readings & Remarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <div className="sm:col-span-1 space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Measured Telemetry</span>
                      <span className="font-mono font-bold text-blue-300 truncate block">
                        {step.measuredReading}
                      </span>
                    </div>

                    <div className="sm:col-span-2 space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Technician Remarks</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        "{step.notes}"
                      </p>
                    </div>
                  </div>

                  {/* Attached Photos Badge */}
                  {stepPhotos.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-400" />
                        {stepPhotos.length} Photo{stepPhotos.length > 1 ? 's' : ''} Linked:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {stepPhotos.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setLightboxPhoto(p)}
                            className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 rounded text-[10px] font-mono text-emerald-400 border border-slate-800 flex items-center gap-1"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>{p.category}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                    <span>Logged at {step.timestamp} by Tech {step.technicianName}</span>
                    <span>Spokane Lab Station #3</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CAMERA API & PHOTO EVIDENCE LOG */}
      {activeTab === 'photos' && (
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Microscope & Thermal Evidence Gallery</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Live Camera API video feed, thermal snapshots, and microscope captures linked to #{ticketNumber}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setIsAddingPhoto(true);
                  startLiveCamera();
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Video className="w-4 h-4" />
                <span>Open Live Camera</span>
              </button>

              <button
                onClick={() => {
                  setIsAddingPhoto(true);
                  stopLiveCamera();
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 border border-slate-700"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </button>
            </div>
          </div>

          {/* Add / Live Camera Modal Panel */}
          <AnimatePresence>
            {isAddingPhoto && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 border-2 border-emerald-500/50 p-5 rounded-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Capture or Upload Inspection Evidence
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      setIsAddingPhoto(false);
                    }}
                    className="p-1 hover:bg-slate-800 text-slate-400 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Live Camera Stream Viewport */}
                {isLiveCameraActive && (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Live Optical Viewfinder Active
                      </span>

                      <button
                        onClick={switchCameraFacing}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                        title="Switch between front and environment lenses"
                      >
                        <SwitchCamera className="w-3.5 h-3.5" />
                        <span>Flip Lens ({cameraFacingMode})</span>
                      </button>
                    </div>

                    <div className="relative aspect-video max-h-80 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* Optical Crosshair Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-24 h-24 border border-emerald-500/40 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Stop Stream
                      </button>

                      <button
                        type="button"
                        onClick={capturePhotoFromLiveCamera}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 animate-pulse"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Microscope Photo</span>
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Photo Form Submission Details */}
                <form onSubmit={handleAddPhotoSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Evidence Category
                      </label>
                      <select
                        value={photoCategory}
                        onChange={(e) => setPhotoCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                      >
                        <option value="Intake Inspection">Intake Inspection</option>
                        <option value="Thermal Heat Map">Thermal Heat Map</option>
                        <option value="Microscope Defect">Microscope Defect (45x)</option>
                        <option value="Solder Joint Rework">Solder Joint Rework</option>
                        <option value="QA Verification">QA Verification</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Link to Diagnostic Step
                      </label>
                      <select
                        value={photoLinkedStep || ''}
                        onChange={(e) => setPhotoLinkedStep(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                      >
                        <option value="">None (General Ticket Evidence)</option>
                        {steps.map((s) => (
                          <option key={s.id} value={s.stepNumber}>
                            Step #{s.stepNumber}: {s.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Upload or Live Capture Source
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="w-full px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Observation Caption & Technical Details
                      </label>
                      <input
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="e.g. Microscopic hairline fracture on solder ball B4 underneath PMIC IC."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Image Preview if available */}
                  {capturedPreview && (
                    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <img
                        src={capturedPreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-emerald-400 block">Captured Image Ready</span>
                        <span className="text-[11px] text-slate-400">Ready to link to Ticket #{ticketNumber}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        stopLiveCamera();
                        setIsAddingPhoto(false);
                      }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      Attach to Evidence Log
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden group space-y-2 relative transition-all"
              >
                <div
                  className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
                  onClick={() => setLightboxPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1 bg-slate-900/90 text-white text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Resolution</span>
                    </span>
                  </div>

                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/90 text-emerald-400 text-[10px] font-bold rounded uppercase border border-slate-700 backdrop-blur-sm">
                    {photo.category}
                  </span>

                  {photo.linkedStepNumber && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-900/90 text-blue-300 text-[10px] font-mono font-bold rounded border border-blue-700 backdrop-blur-sm">
                      Step #{photo.linkedStepNumber}
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-all"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>{photo.stageName}</span>
                    <span>{photo.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {photos.length === 0 && (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-8 text-center text-slate-500 space-y-2">
              <Camera className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs font-semibold">No diagnostic photos attached yet.</p>
              <p className="text-[11px] text-slate-600">
                Click 'Open Live Camera' to capture directly via Camera API or upload microscope images.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setLightboxPhoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {lightboxPhoto.category}
                  </span>
                  {lightboxPhoto.linkedStepNumber && (
                    <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Step #{lightboxPhoto.linkedStepNumber}
                    </span>
                  )}
                  <h4 className="text-sm font-bold text-white">{lightboxPhoto.caption}</h4>
                </div>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                <img
                  src={lightboxPhoto.url}
                  alt={lightboxPhoto.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2">
                <span>Timestamp: {lightboxPhoto.timestamp}</span>
                <span>Stage: {lightboxPhoto.stageName}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
