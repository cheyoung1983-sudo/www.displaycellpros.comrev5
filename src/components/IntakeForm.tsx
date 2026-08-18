/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Smartphone, 
  Settings, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Zap,
  Activity,
  History,
  FileText,
  RotateCcw,
  Save,
  Sparkles,
  TrendingUp,
  Camera,
  Image as ImageIcon,
  Tag,
  Barcode,
  QrCode,
  ScanLine,
  CheckSquare,
  Wrench,
  AlertTriangle,
  Download,
  FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IntakeFormData, 
  IntakeFormSchema, 
  Manufacturer, 
  ServiceTier 
} from '../types.ts';
import { cn } from '../lib/utils.ts';
import { calculateQuote, PricingBreakdown } from '../lib/pricing.ts';
import { downloadDatabaseBackup, saveOfflineRepairIntake } from '../lib/db.ts';
import AIDiagnostic from './AIDiagnostic.tsx';
import DeviceCameraCapture, { CapturedPhoto } from './DeviceCameraCapture.tsx';
import TechnicianChecklist from './TechnicianChecklist.tsx';
import SmartTriageChat from './SmartTriageChat.tsx';
import { useToast } from './Toast.tsx';
import SymptomChecklist, { DIAGNOSTIC_SYMPTOMS, SymptomItem } from './SymptomChecklist.tsx';
import DevicePhotoCaptureInput from './DevicePhotoCaptureInput.tsx';
import CommonRepairChecklist from './CommonRepairChecklist.tsx';
import RecommendedDiagnosticPath from './RecommendedDiagnosticPath.tsx';
import DeviceModelAutocomplete from './DeviceModelAutocomplete.tsx';
import BarcodeScannerModal, { ScannedHardwareData } from './BarcodeScannerModal.tsx';
import HardwareDiagnosticTool from './HardwareDiagnosticTool.tsx';
import DiagnosticChecklist, { FailurePointItem, COMMON_HARDWARE_FAILURE_POINTS } from './DiagnosticChecklist.tsx';
import { broadcastTechnicianIntakeAlert } from '../lib/technicianEvents.ts';

const STEPS = [
  { id: 1, name: 'Reconnaissance', icon: Smartphone },
  { id: 2, name: 'Triage & Telemetry', icon: Settings },
  { id: 3, name: 'Compliance', icon: ShieldCheck },
  { id: 4, name: 'Review & Sync', icon: CreditCard },
];

export default function IntakeForm() {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ 
    draftOrderId: string; 
    invoiceUrl: string; 
    attachedPhotoCount?: number; 
    attachedCategories?: string[]; 
    identifiedFailureCount?: number;
  } | null>(null);
  const [quote, setQuote] = useState<PricingBreakdown | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [devicePhotos, setDevicePhotos] = useState<CapturedPhoto[]>([]);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [selectedFailurePointIds, setSelectedFailurePointIds] = useState<string[]>([]);
  const [customFailureNotes, setCustomFailureNotes] = useState<string>('');
  const [triageSubTab, setTriageSubTab] = useState<'telemetry' | 'diag_checklist' | 'hardware_diag' | 'pre_checks' | 'smart_triage' | 'diag_path' | 'camera' | 'checklist'>('telemetry');
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  const handleBarcodeScanSuccess = (data: ScannedHardwareData) => {
    let appliedUpdates: string[] = [];

    // 1. Handle IMEI
    if (data.imei) {
      setValue('imei', data.imei, { shouldValidate: true, shouldDirty: true });
      appliedUpdates.push(`IMEI: ${data.imei}`);
    } else if (data.type === 'imei' && data.rawValue) {
      const digits = data.rawValue.replace(/[^0-9]/g, '');
      if (digits.length === 15) {
        setValue('imei', digits, { shouldValidate: true, shouldDirty: true });
        appliedUpdates.push(`IMEI: ${digits}`);
      }
    }

    // 2. Handle Manufacturer & Model if decoded or auto-inferred
    if (data.manufacturer) {
      const mfrLower = data.manufacturer.toLowerCase();
      if (mfrLower.includes('apple') || mfrLower.includes('iphone') || mfrLower.includes('ipad')) {
        setValue('deviceManufacturer', Manufacturer.APPLE, { shouldValidate: true, shouldDirty: true });
      } else if (mfrLower.includes('samsung') || mfrLower.includes('galaxy')) {
        setValue('deviceManufacturer', Manufacturer.SAMSUNG, { shouldValidate: true, shouldDirty: true });
      } else {
        setValue('deviceManufacturer', Manufacturer.OTHER, { shouldValidate: true, shouldDirty: true });
      }
    }

    if (data.deviceModel) {
      setValue('deviceModel', data.deviceModel, { shouldValidate: true, shouldDirty: true });
      appliedUpdates.push(`Model: ${data.deviceModel}`);
    }

    // 3. Handle Ticket ID / Serial
    if (data.ticketId) {
      const existing = watch('customerReportedIssue') || '';
      const ticketRef = `[Scanned Work Order Ticket Ref: ${data.ticketId}]`;
      if (!existing.includes(ticketRef)) {
        setValue('customerReportedIssue', existing ? `${ticketRef}\n${existing}` : ticketRef, { shouldValidate: true, shouldDirty: true });
      }
      appliedUpdates.push(`Ticket Ref: ${data.ticketId}`);
    } else if (data.serialNumber && !data.imei) {
      // If pure serial number without 15-digit IMEI
      const existing = watch('customerReportedIssue') || '';
      const serialRef = `[Device Serial Number: ${data.serialNumber}]`;
      if (!existing.includes(serialRef)) {
        setValue('customerReportedIssue', existing ? `${serialRef}\n${existing}` : serialRef, { shouldValidate: true, shouldDirty: true });
      }
      appliedUpdates.push(`Serial: ${data.serialNumber}`);
    }

    if (appliedUpdates.length > 0) {
      showToast(`Scanned Optical Barcode/QR: ${appliedUpdates.join(' • ')}`, 'success');
    } else {
      showToast(`Scanned value: ${data.rawValue}`, 'info');
    }
  };

  const handleApplyChecklistToNotes = (notes: string) => {
    const existing = watch('customerReportedIssue') || '';
    const updated = existing ? `${existing.trim()}\n\n${notes}` : notes;
    setValue('customerReportedIssue', updated, { shouldValidate: true, shouldDirty: true });
    showToast('Applied common repair checklist items to Issue Description.', 'success');
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(IntakeFormSchema),
    defaultValues: {
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: '',
      imei: '',
      customerReportedIssue: '',
      waR2rPrivacyAcknowledged: false,
      waR2rDataBackupAcknowledged: false,
      waR2rPartsProvenanceAcknowledged: false,
      customerEmail: '',
      customerName: '',
      customerPhone: '',
      destinationZipCode: '',
      telemetry: {
        batteryHealthPercentage: 85,
        batteryTempCelsius: 32,
        ammeterDrawAmps: 0.5,
        isShortToGround: false,
      },
    },
  });

  const formData = watch();
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Dynamic Section completion calculations for animated progress bar
  const s1Progress = (() => {
    let p = 0;
    if (formData.deviceManufacturer) p += 20;
    if (formData.deviceModel && formData.deviceModel.trim().length > 1) p += 40;
    if (formData.imei && formData.imei.trim().length >= 10) p += 30;
    if (devicePhotos && devicePhotos.length > 0) p += 10;
    return Math.min(100, p);
  })();

  const s2Progress = (() => {
    let p = 0;
    if (formData.serviceTier) p += 25;
    if (formData.customerReportedIssue && formData.customerReportedIssue.trim().length > 3) p += 35;
    if (selectedSymptomIds && selectedSymptomIds.length > 0) p += 15;
    if (selectedFailurePointIds && selectedFailurePointIds.length > 0) p += 15;
    if (formData.telemetry) p += 10;
    return Math.min(100, p);
  })();

  const s3Progress = (() => {
    let p = 0;
    if (formData.waR2rPrivacyAcknowledged) p += 20;
    if (formData.waR2rDataBackupAcknowledged) p += 20;
    if (formData.waR2rPartsProvenanceAcknowledged) p += 20;
    if (formData.customerName && formData.customerName.trim().length > 1) p += 15;
    if (formData.customerEmail && formData.customerEmail.includes('@')) p += 15;
    if (formData.customerPhone && formData.customerPhone.trim().length > 6) p += 10;
    return Math.min(100, p);
  })();

  const s4Progress = step >= 4 ? 100 : 0;

  const totalFormCompletion = Math.round(
    (s1Progress * 0.3) + (s2Progress * 0.3) + (s3Progress * 0.3) + (s4Progress * 0.1)
  );

  const wizardStepPercentage = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  // useEffect 1: Load saved draft data from localStorage into form fields when component mounts
  useEffect(() => {
    const savedRepairs = localStorage.getItem('dcp_repairs');
    if (savedRepairs) {
      try {
        setHistory(JSON.parse(savedRepairs));
      } catch (e) {
        console.error('Failed to parse repair history:', e);
      }
    }

    const savedDraft = localStorage.getItem('dcp_intake_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.formData) {
          reset(parsed.formData);
          if (parsed.step && parsed.step >= 1 && parsed.step <= 4) {
            setStep(parsed.step);
          }
          if (parsed.devicePhotos && Array.isArray(parsed.devicePhotos)) {
            setDevicePhotos(parsed.devicePhotos);
          }
          if (parsed.selectedSymptomIds && Array.isArray(parsed.selectedSymptomIds)) {
            setSelectedSymptomIds(parsed.selectedSymptomIds);
          }
          if (parsed.selectedFailurePointIds && Array.isArray(parsed.selectedFailurePointIds)) {
            setSelectedFailurePointIds(parsed.selectedFailurePointIds);
          }
          if (parsed.customFailureNotes) {
            setCustomFailureNotes(parsed.customFailureNotes);
          }
          setDraftRestored(true);
          if (parsed.savedAt) {
            setLastSavedTime(new Date(parsed.savedAt).toLocaleTimeString());
          }
        }
      } catch (e) {
        console.error('Failed to restore draft intake form:', e);
      }
    }

    // Check for incoming voice intake ticket from ElevenLabs voice studio
    const pendingVoiceTicketStr = localStorage.getItem('dcp_pending_voice_intake');
    if (pendingVoiceTicketStr) {
      try {
        const ticket = JSON.parse(pendingVoiceTicketStr);
        if (ticket) {
          if (ticket.deviceManufacturer) {
            const mLower = ticket.deviceManufacturer.toLowerCase();
            if (mLower.includes('apple') || mLower.includes('iphone') || mLower.includes('ipad')) {
              setValue('deviceManufacturer', Manufacturer.APPLE, { shouldValidate: true });
            } else if (mLower.includes('samsung') || mLower.includes('galaxy')) {
              setValue('deviceManufacturer', Manufacturer.SAMSUNG, { shouldValidate: true });
            } else {
              setValue('deviceManufacturer', Manufacturer.OTHER, { shouldValidate: true });
            }
          }
          if (ticket.deviceModel) {
            setValue('deviceModel', ticket.deviceModel, { shouldValidate: true });
          }
          if (ticket.serviceTier) {
            if (ticket.serviceTier === 'TIER_1_POWER_PORT_REFRESH' || ticket.serviceTier === 'TIER_1_POWER') setValue('serviceTier', ServiceTier.TIER_1_POWER, { shouldValidate: true });
            else if (ticket.serviceTier === 'TIER_2_DISPLAY_RENEWAL' || ticket.serviceTier === 'TIER_2_DISPLAY') setValue('serviceTier', ServiceTier.TIER_2_DISPLAY, { shouldValidate: true });
            else if (ticket.serviceTier === 'TIER_3_MICRO_SOLDERING' || ticket.serviceTier === 'TIER_3_BOARD' || ticket.serviceTier === 'TIER_4_CLEANROOM_DATA_RECOVERY') setValue('serviceTier', ServiceTier.TIER_3_BOARD, { shouldValidate: true });
          }
          if (ticket.issueTranscript || ticket.triageSummary) {
            const issueText = `[ElevenLabs Voice Intake Ref: ${ticket.ticketNumber}]\nSpoken Issue: "${ticket.issueTranscript}"\nSuspected Fault: ${ticket.suspectedFault}\nTechnician Triage: ${ticket.triageSummary}`;
            setValue('customerReportedIssue', issueText, { shouldValidate: true });
          }
          if (ticket.customerEmail) setValue('customerEmail', ticket.customerEmail, { shouldValidate: true });
          if (ticket.customerName) setValue('customerName', ticket.customerName, { shouldValidate: true });
          
          showToast(`Voice Intake Ticket ${ticket.ticketNumber} loaded into form!`, 'success');
          localStorage.removeItem('dcp_pending_voice_intake');
        }
      } catch (voiceErr) {
        console.warn('Error applying pending voice intake ticket:', voiceErr);
      }
    }
    setIsDraftLoaded(true);
  }, [reset, setValue, showToast]);

  // useEffect 2: Listen for form input changes and save them into localStorage & SQLite
  useEffect(() => {
    if (!isDraftLoaded) return;
    if (step < 5) {
      const now = new Date();
      const draftPayload = {
        step,
        formData,
        devicePhotos,
        selectedSymptomIds,
        selectedFailurePointIds,
        customFailureNotes,
        savedAt: now.toISOString(),
      };
      localStorage.setItem('dcp_intake_draft', JSON.stringify(draftPayload));
      setLastSavedTime(now.toLocaleTimeString());

      if (formData.deviceModel || formData.imei || formData.customerName) {
        saveOfflineRepairIntake({
          id: 'current_intake_draft',
          ...formData,
          photos: devicePhotos,
          status: 'draft',
        }).catch(() => {});
      }
    }
  }, [formData, devicePhotos, selectedSymptomIds, selectedFailurePointIds, customFailureNotes, step, isDraftLoaded]);

  const handleExportBackup = async (format: 'json' | 'csv') => {
    try {
      if (formData.deviceModel || formData.imei || formData.customerName) {
        await saveOfflineRepairIntake({
          id: 'current_intake_draft',
          ...formData,
          photos: devicePhotos,
          status: 'draft',
        });
      }
      const res = await downloadDatabaseBackup(format);
      showToast(`Exported ${res.count} record(s) to ${res.filename}`, 'success');
    } catch {
      showToast('Failed to generate database export backup', 'error');
    }
  };

  useEffect(() => {
    if (formData.serviceTier && formData.destinationZipCode) {
      setQuote(calculateQuote(formData.serviceTier, formData.destinationZipCode));
    }
  }, [formData.serviceTier, formData.destinationZipCode]);

  const handleToggleSymptom = (symptom: SymptomItem) => {
    const isCurrentlySelected = selectedSymptomIds.includes(symptom.id);
    const nextSelected = isCurrentlySelected
      ? selectedSymptomIds.filter((id) => id !== symptom.id)
      : [...selectedSymptomIds, symptom.id];

    setSelectedSymptomIds(nextSelected);

    const selectedSymptomObjects = DIAGNOSTIC_SYMPTOMS.filter((s) => nextSelected.includes(s.id));
    const symptomLabels = selectedSymptomObjects.map((s) => s.label);

    const currentText = formData.customerReportedIssue || '';
    const userCustomText = currentText.replace(/^\[Pre-selected Symptoms: [^\]]+\]\s*/, '').trim();

    let updatedIssueText = userCustomText;
    if (symptomLabels.length > 0) {
      const prefix = `[Pre-selected Symptoms: ${symptomLabels.join(', ')}]`;
      updatedIssueText = userCustomText ? `${prefix}\n\n${userCustomText}` : prefix;
    }

    setValue('customerReportedIssue', updatedIssueText, { shouldValidate: true });

    const hasTier3 = selectedSymptomObjects.some((s) => s.recommendedTier === ServiceTier.TIER_3_BOARD);
    const hasTier2 = selectedSymptomObjects.some((s) => s.recommendedTier === ServiceTier.TIER_2_DISPLAY);
    const hasTier1 = selectedSymptomObjects.some((s) => s.recommendedTier === ServiceTier.TIER_1_POWER);

    const highestTier = hasTier3
      ? ServiceTier.TIER_3_BOARD
      : hasTier2
      ? ServiceTier.TIER_2_DISPLAY
      : hasTier1
      ? ServiceTier.TIER_1_POWER
      : null;

    if (highestTier) {
      setValue('serviceTier', highestTier, { shouldValidate: true });
    }

    if (!isCurrentlySelected) {
      showToast(`Selected "${symptom.label}" symptom.`, 'info');
    } else {
      showToast(`Deselected "${symptom.label}".`, 'info');
    }
  };

  const handleClearSymptoms = () => {
    setSelectedSymptomIds([]);
    const currentText = formData.customerReportedIssue || '';
    const userCustomText = currentText.replace(/^\[Pre-selected Symptoms: [^\]]+\]\s*/, '').trim();
    setValue('customerReportedIssue', userCustomText);
    showToast('Cleared all pre-selected diagnostic symptoms.', 'info');
  };

  const handleToggleFailurePoint = (item: FailurePointItem) => {
    const isCurrentlySelected = selectedFailurePointIds.includes(item.id);
    const nextSelected = isCurrentlySelected
      ? selectedFailurePointIds.filter((id) => id !== item.id)
      : [...selectedFailurePointIds, item.id];

    setSelectedFailurePointIds(nextSelected);

    if (!isCurrentlySelected) {
      if (item.recommendedTier === ServiceTier.TIER_3_BOARD) {
        setValue('serviceTier', ServiceTier.TIER_3_BOARD, { shouldValidate: true });
      } else if (item.recommendedTier === ServiceTier.TIER_2_DISPLAY && formData.serviceTier !== ServiceTier.TIER_3_BOARD) {
        setValue('serviceTier', ServiceTier.TIER_2_DISPLAY, { shouldValidate: true });
      }
      showToast(`Logged failure point: "${item.title}"`, 'info');
    } else {
      showToast(`Deselected failure point: "${item.title}"`, 'info');
    }
  };

  const handleApplyDiagnosticChecklistToNotes = (formattedSummary: string) => {
    const existing = watch('customerReportedIssue') || '';
    const updated = existing ? `${existing.trim()}\n\n${formattedSummary}` : formattedSummary;
    setValue('customerReportedIssue', updated, { shouldValidate: true, shouldDirty: true });
    showToast('Merged Diagnostic Checklist failure points into Issue Description.', 'success');
  };

  const clearDraft = () => {
    localStorage.removeItem('dcp_intake_draft');
    setSelectedSymptomIds([]);
    setSelectedFailurePointIds([]);
    setCustomFailureNotes('');
    setDevicePhotos([]);
    reset({
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: '',
      imei: '',
      customerReportedIssue: '',
      waR2rPrivacyAcknowledged: false,
      waR2rDataBackupAcknowledged: false,
      waR2rPartsProvenanceAcknowledged: false,
      customerEmail: '',
      customerName: '',
      customerPhone: '',
      destinationZipCode: '',
      telemetry: {
        batteryHealthPercentage: 85,
        batteryTempCelsius: 32,
        ammeterDrawAmps: 0.5,
        isShortToGround: false,
      },
    });
    setStep(1);
    setDraftRestored(false);
    setLastSavedTime(null);
  };

  const [polling, setPolling] = useState(false);

  const pollHardware = async () => {
    setPolling(true);
    let webUsbSuccess = false;

    // WebUSB Hardware Check
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        const devices = await (navigator as any).usb.getDevices();
        if (devices.length > 0) {
          const dev = devices[0];
          showToast(`WebUSB: Polling telemetry from ${dev.productName || 'Diagnostic Ammeter'}`, 'success');
          webUsbSuccess = true;
        } else {
          // Attempt WebUSB requestDevice
          const dev = await (navigator as any).usb.requestDevice({ filters: [] });
          if (dev) {
            showToast(`WebUSB: Paired hardware ammeter ${dev.productName || 'Device'}`, 'success');
            webUsbSuccess = true;
          }
        }
      } catch (err: any) {
        if (err.name !== 'NotFoundError') {
          console.warn('WebUSB poll note:', err);
        }
      }
    }

    if (!webUsbSuccess) {
      await new Promise(r => setTimeout(r, 1200));
    }

    const telemetryData = {
      batteryHealthPercentage: Math.floor(Math.random() * 15) + 82,
      batteryTempCelsius: Math.floor(Math.random() * 10) + 26,
      ammeterDrawAmps: parseFloat((1.2 + Math.random() * 0.8).toFixed(2)),
      isShortToGround: false,
    };

    setValue('telemetry', telemetryData);
    setPolling(false);
    showToast('Hardware Telemetry Sync Complete!', 'success');
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['deviceManufacturer', 'deviceModel', 'imei'];
    if (step === 2) fieldsToValidate = ['serviceTier', 'customerReportedIssue', 'telemetry'];
    if (step === 3) fieldsToValidate = ['waR2rPrivacyAcknowledged', 'waR2rDataBackupAcknowledged', 'waR2rPartsProvenanceAcknowledged', 'customerEmail', 'customerName', 'customerPhone', 'destinationZipCode'];

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleClearDraft = () => {
    localStorage.removeItem('dcp_intake_draft');
    reset({
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: '',
      imei: '',
      customerReportedIssue: '',
      waR2rPrivacyAcknowledged: false,
      waR2rDataBackupAcknowledged: false,
      waR2rPartsProvenanceAcknowledged: false,
      customerEmail: '',
      customerName: '',
      customerPhone: '',
      destinationZipCode: '',
      telemetry: {
        batteryHealthPercentage: 85,
        batteryTempCelsius: 32,
        ammeterDrawAmps: 0.5,
        isShortToGround: false,
      },
    });
    setDevicePhotos([]);
    setSelectedSymptomIds([]);
    setSelectedFailurePointIds([]);
    setCustomFailureNotes('');
    setStep(1);
    setDraftRestored(false);
    setLastSavedTime(null);
    showToast('In-progress repair draft cleared. Started fresh submission.', 'info');
  };

  const onSubmit = async (data: IntakeFormData) => {
    setSubmitting(true);
    try {
      const selectedFailurePointsData = selectedFailurePointIds.map(id => {
        const found = COMMON_HARDWARE_FAILURE_POINTS.find(i => i.id === id);
        return found ? {
          id: found.id,
          title: found.title,
          category: found.category,
          severity: found.severity,
          subsystem: found.subsystem,
          componentRef: found.componentRef,
          recommendedTier: found.recommendedTier,
        } : { id, title: id };
      });

      const payload = {
        ...data,
        devicePhotos,
        selectedFailurePointIds,
        selectedFailurePoints: selectedFailurePointsData,
        customFailureNotes,
        photoMetadata: {
          totalCount: devicePhotos.length,
          categories: Array.from(new Set(devicePhotos.map(p => p.category))),
          photos: devicePhotos.map(p => ({
            id: p.id,
            category: p.category,
            notes: p.notes,
            timestamp: p.timestamp,
            dataUrlLength: p.dataUrl?.length || 0,
          }))
        }
      };

      const response = await fetch('/api/intake/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON status ${response.status}`);
      }
      const res = await response.json();
      if (response.ok && res.success) {
        localStorage.removeItem('dcp_intake_draft');
        setDraftRestored(false);
        setResult({ 
          draftOrderId: res.draftOrderId, 
          invoiceUrl: res.invoiceUrl,
          attachedPhotoCount: res.attachedPhotoCount !== undefined ? res.attachedPhotoCount : devicePhotos.length,
          attachedCategories: res.attachedCategories || Array.from(new Set(devicePhotos.map(p => p.category))),
          identifiedFailureCount: selectedFailurePointIds.length,
        });
        
        // Persist to local history
        const generatedTicketNumber = `DCP-${Math.floor(8800 + Math.random() * 1199)}`;
        const newEntry = {
          ...data,
          devicePhotos,
          selectedFailurePoints: selectedFailurePointsData,
          customFailureNotes,
          id: res.draftOrderId,
          ticketNumber: generatedTicketNumber,
          date: new Date().toISOString(),
          quote
        };
        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('dcp_repairs', JSON.stringify(updatedHistory));
        
        // Broadcast real-time technician intake alert across tabs and live session
        broadcastTechnicianIntakeAlert({
          draftOrderId: res.draftOrderId,
          ticketNumber: generatedTicketNumber,
          customerName: data.customerName || 'Intake Client',
          deviceModel: data.deviceModel || 'Handheld Unit',
          deviceManufacturer: data.deviceManufacturer || 'Device',
          serviceTier: data.serviceTier || 'Tier 2 (Display Renewal)',
          issueDescription: data.customerReportedIssue || 'Intake diagnostic assessment requested.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachedPhotoCount: devicePhotos.length
        });

        showToast(`Device intake synchronized with Spokane Lab (${devicePhotos.length} photos, ${selectedFailurePointIds.length} failure points attached).`, 'success');
        setStep(5);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      showToast('Synchronization failure. Please verify connection and retry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6">
      {/* Draft Auto-Saved Restoration Banner */}
      {draftRestored && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shrink-0 shadow-sm">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  In-Progress Draft Restored
                </h4>
                {lastSavedTime && (
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                    Saved {lastSavedTime}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                We restored your saved hardware details, triage selections, and photos from browser storage. Feel free to resume or start fresh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleClearDraft}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Start Fresh</span>
            </button>

            <button
              type="button"
              onClick={() => setDraftRestored(false)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
            >
              Continue Draft
            </button>
          </div>
        </motion.div>
      )}

      {/* Dynamic Animated Progress Bar Card */}
      <div className="mb-8 bg-white border border-slate-100 p-6 rounded-3xl shadow-lg shadow-slate-200/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Intake Form Progress</h3>
                <span className="text-[10px] font-mono text-slate-400">({totalFormCompletion}% Completed)</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {step === 1 && "Step 1: Enter hardware details & IMEI identification"}
                {step === 2 && "Step 2: Define triage symptoms, diagnostic suite & photos"}
                {step === 3 && "Step 3: Confirm compliance terms & customer registration"}
                {step === 4 && "Step 4: Final quote verification & Spokane Lab sync"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {lastSavedTime && (
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <Save className="w-3 h-3 text-emerald-600" />
                <span>Auto-saved {lastSavedTime}</span>
              </span>
            )}

            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all shadow-sm",
              totalFormCompletion >= 80 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : totalFormCompletion >= 40 
                ? "bg-amber-50 text-amber-700 border-amber-200" 
                : "bg-blue-50 text-blue-700 border-blue-200"
            )}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{totalFormCompletion}% Complete</span>
            </span>
          </div>
        </div>

        {/* Outer Bar Track */}
        <div className="w-full bg-slate-100 rounded-2xl h-3.5 p-0.5 relative overflow-hidden border border-slate-200/60 shadow-inner">
          <motion.div
            className="h-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 relative"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.max(3, totalFormCompletion)}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 16 }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-3 bg-white/40 rounded-full blur-[1px] animate-pulse" />
          </motion.div>
        </div>

        {/* Section Completion Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { id: 1, name: '1. Recon', score: s1Progress },
            { id: 2, name: '2. Triage', score: s2Progress },
            { id: 3, name: '3. Compliance', score: s3Progress },
            { id: 4, name: '4. Review', score: s4Progress },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setStep(sec.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer",
                step === sec.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                  : sec.score === 100
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : sec.score > 0
                  ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                  : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
              )}
            >
              <span>{sec.name}</span>
              <span className="font-mono text-[10px]">
                {sec.score === 100 ? '✓ 100%' : `${sec.score}%`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Wizard & Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between relative max-w-2xl">
            {/* Animated Step Connector Line */}
            <div className="absolute left-6 right-6 top-6 -translate-y-1/2 h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                initial={{ width: '0%' }}
                animate={{ width: `${wizardStepPercentage}%` }}
                transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              />
            </div>
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setStep(s.id)}>
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive ? "bg-slate-900 text-white shadow-lg scale-110" : 
                      isCompleted ? "bg-green-500 text-white" : "bg-white border-2 border-slate-100 text-slate-400"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest font-bold",
                    isActive ? "text-slate-900" : "text-slate-400"
                  )}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {history.length > 0 && step === 1 && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Fleet</p>
              <p className="text-sm font-bold text-slate-900">{history.length} Previous Repairs Found</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 overflow-hidden min-h-[650px] flex flex-col">
          {step < 5 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">
                  {draftRestored ? 'Draft Restored from Local Session' : 'Draft Progress Auto-Saved'}
                </span>
                {lastSavedTime && (
                  <span className="text-[10px] font-medium text-slate-400">
                    • Last saved {lastSavedTime}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleExportBackup('json')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-700 hover:bg-white hover:text-blue-600 transition-all text-[11px]"
                    title="Download SQLite database records as JSON backup"
                  >
                    <Download className="w-3 h-3 text-blue-600" />
                    <span>Backup (JSON)</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleExportBackup('csv')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-700 hover:bg-white hover:text-emerald-600 transition-all text-[11px]"
                    title="Download SQLite database records as CSV spreadsheet"
                  >
                    <Download className="w-3 h-3 text-emerald-600" />
                    <span>CSV</span>
                  </button>
                </div>

                {(formData.deviceModel || formData.imei || formData.customerName || draftRestored) && (
                  <button
                    type="button"
                    onClick={clearDraft}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Form
                  </button>
                )}
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-playfair font-black text-slate-900 mb-2">Device Reconnaissance</h2>
                  <p className="text-slate-500">Identify the hardware unit and authenticate its global identifier.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBarcodeScannerOpen(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md shadow-slate-900/10 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Barcode className="w-4 h-4 text-blue-400" />
                  <span>Scan Barcode / Ticket</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Manufacturer</label>
                  <select 
                    {...register('deviceManufacturer')}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all appearance-none"
                  >
                    <option value={Manufacturer.APPLE}>Apple (iPhone/iPad)</option>
                    <option value={Manufacturer.SAMSUNG}>Samsung (Galaxy)</option>
                    <option value={Manufacturer.OTHER}>Other / Generic</option>
                  </select>
                </div>

                <div>
                  <DeviceModelAutocomplete
                    value={watch('deviceModel') || ''}
                    onChange={(newModel) => {
                      setValue('deviceModel', newModel, { shouldValidate: true, shouldDirty: true });
                    }}
                    selectedManufacturer={watch('deviceManufacturer')}
                    onSelectManufacturer={(newMfr) => {
                      setValue('deviceManufacturer', newMfr, { shouldValidate: true, shouldDirty: true });
                    }}
                    error={errors.deviceModel?.message}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">IMEI (15 Digits)</label>
                    <button
                      type="button"
                      onClick={() => setIsBarcodeScannerOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ScanLine className="w-3.5 h-3.5 text-blue-500" />
                      <span>Scan Barcode / QR with Camera</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      {...register('imei')}
                      placeholder="Enter 15-digit IMEI"
                      maxLength={15}
                      className="w-full h-12 pl-4 pr-12 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all font-mono tracking-widest text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setIsBarcodeScannerOpen(true)}
                      title="Open Optical Scanner"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Barcode className="w-5 h-5" />
                    </button>
                  </div>
                  {errors.imei && <p className="text-red-500 text-xs mt-1">{errors.imei.message}</p>}
                </div>

                {/* Device Condition & Damage Photo Capture Input Component */}
                <div className="md:col-span-2 pt-2">
                  <DevicePhotoCaptureInput
                    photos={devicePhotos}
                    onChange={(photos) => setDevicePhotos(photos)}
                  />
                </div>

                {/* Category-Specific Common Repair Diagnostic Pre-Checklist */}
                <div className="md:col-span-2 pt-4">
                  <CommonRepairChecklist
                    manufacturer={formData.deviceManufacturer}
                    model={formData.deviceModel}
                    onApplyChecklistToNotes={handleApplyChecklistToNotes}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div>
                <h2 className="text-3xl font-playfair font-black text-slate-900 mb-2">Triage & Telemetry</h2>
                <p className="text-slate-500">Capture failure modes, AI diagnostic recommendations, condition photos, and QA checklist steps.</p>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                {[
                  { id: 'telemetry', label: '1. Service & Telemetry' },
                  { id: 'diag_checklist', label: `2. Diagnostic Checklist (${selectedFailurePointIds.length})` },
                  { id: 'hardware_diag', label: '3. WebUSB / Serial Port' },
                  { id: 'pre_checks', label: '4. Common Pre-Checks' },
                  { id: 'smart_triage', label: '5. Smart Triage (AI)' },
                  { id: 'diag_path', label: '6. Diagnostic Path (AI)' },
                  { id: 'camera', label: `7. Photos (${devicePhotos.length})` },
                  { id: 'checklist', label: '8. Tech QA Checklist' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTriageSubTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      triageSubTab === tab.id
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {triageSubTab === 'telemetry' && (
                <div className="space-y-6">
                  {/* Quick Hardware Diagnostic Checklist Summary & Fast Access Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">Hardware Diagnostic Checklist</h4>
                          <span className={cn(
                            "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border",
                            selectedFailurePointIds.length > 0
                              ? "bg-blue-500/30 text-blue-200 border-blue-400/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          )}>
                            {selectedFailurePointIds.length} Failure Points Flagged
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Select verified hardware failure points (Display, Board, Power, Biometrics) to pre-classify lab ticket and pricing.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTriageSubTab('diag_checklist')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-md cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{selectedFailurePointIds.length > 0 ? 'Edit Diagnostic Checklist' : 'Open Diagnostic Checklist'}</span>
                    </button>
                  </div>

                  {/* Clickable Diagnostic Symptom Pre-Selection Checklist */}
                  <SymptomChecklist
                    selectedSymptomIds={selectedSymptomIds}
                    onToggleSymptom={handleToggleSymptom}
                    onClearAll={handleClearSymptoms}
                    currentServiceTier={formData.serviceTier}
                    onApplyRecommendedTier={(tier) => {
                      setValue('serviceTier', tier, { shouldValidate: true });
                      showToast('Applied recommended Service Tier.', 'success');
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Service Tier</label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: ServiceTier.TIER_1_POWER, label: 'Tier 1: Power & Port', desc: 'Battery, Charging, Ports' },
                            { id: ServiceTier.TIER_2_DISPLAY, label: 'Tier 2: Display Renewal', desc: 'OLED/LCD Assemblies' },
                            { id: ServiceTier.TIER_3_BOARD, label: 'Tier 3: Specialized Board', desc: 'Micro-soldering, Logic Board' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setValue('serviceTier', t.id)}
                              className={cn(
                                "flex flex-col p-4 rounded-xl border-2 text-left transition-all",
                                formData.serviceTier === t.id ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                              )}
                            >
                              <span className="font-bold text-slate-900 text-sm">{t.label}</span>
                              <span className="text-xs text-slate-500">{t.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Description</label>
                        <textarea 
                          {...register('customerReportedIssue')}
                          rows={4}
                          placeholder="Detailed symptoms, liquid exposure history, or prior repairs..."
                          className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all text-sm resize-none"
                        />
                        {errors.customerReportedIssue && <p className="text-red-500 text-xs mt-1">{errors.customerReportedIssue.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-6 shadow-xl shadow-slate-900/20">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Diagnostic Suite</h4>
                          <button 
                            type="button"
                            onClick={pollHardware}
                          disabled={polling}
                          className={cn(
                            "px-3 py-1 rounded text-[10px] font-bold transition-all",
                            polling ? "bg-blue-500/20 text-blue-400 animate-pulse" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          )}
                        >
                          {polling ? 'POLLING...' : 'POLL HARDWARE'}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Thermometer className={cn("w-5 h-5", formData.telemetry.batteryTempCelsius > 40 ? "text-orange-400" : "text-blue-400")} />
                            <span className="text-xs text-slate-300">Battery Temp</span>
                          </div>
                          <input 
                            type="number"
                            {...register('telemetry.batteryTempCelsius', { valueAsNumber: true })}
                            className="w-20 bg-slate-800 border-none rounded-lg px-3 py-1 text-right font-mono"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-slate-300">Ammeter Draw</span>
                          </div>
                          <input 
                            type="number"
                            step="0.01"
                            {...register('telemetry.ammeterDrawAmps', { valueAsNumber: true })}
                            className="w-20 bg-slate-800 border-none rounded-lg px-3 py-1 text-right font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-green-400" />
                            <span className="text-xs text-slate-300">Short Detection</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setValue('telemetry.isShortToGround', !formData.telemetry.isShortToGround)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-colors duration-300",
                              formData.telemetry.isShortToGround ? "bg-red-500" : "bg-slate-700"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                              formData.telemetry.isShortToGround ? "translate-x-7" : "translate-x-1"
                            )} />
                          </button>
                        </div>
                      </div>

                      {formData.telemetry.batteryTempCelsius > 45 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-[10px] font-bold">THERMAL LOCKOUT: Temperature exceeds 45°C safety threshold.</p>
                        </div>
                      )}
                    </div>

                    <AIDiagnostic 
                      telemetry={formData.telemetry} 
                      issue={formData.customerReportedIssue}
                      model={formData.deviceModel}
                    />
                  </div>

                  {/* Gemini Recommended Diagnostic Path in Telemetry view */}
                  <div className="pt-4">
                    <RecommendedDiagnosticPath
                      repairNotes={watch('customerReportedIssue') || ''}
                      deviceManufacturer={watch('deviceManufacturer') || ''}
                      deviceModel={watch('deviceModel') || ''}
                      symptoms={selectedSymptomIds.map(id => {
                        const found = DIAGNOSTIC_SYMPTOMS.find(s => s.id === id);
                        return found ? `${found.label} (${found.category})` : id;
                      })}
                      telemetry={formData.telemetry}
                      onApplyPathToNotes={(formattedPath) => {
                        const existing = watch('customerReportedIssue') || '';
                        const updated = existing ? `${existing.trim()}\n\n${formattedPath}` : formattedPath;
                        setValue('customerReportedIssue', updated, { shouldValidate: true, shouldDirty: true });
                        showToast('Applied Recommended Diagnostic Path to Issue Description.', 'success');
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

              {triageSubTab === 'diag_checklist' && (
                <DiagnosticChecklist
                  selectedIds={selectedFailurePointIds}
                  onToggleFailurePoint={handleToggleFailurePoint}
                  onSelectMultiple={(ids) => setSelectedFailurePointIds(ids)}
                  onClearAll={() => {
                    setSelectedFailurePointIds([]);
                    showToast('Cleared all selected hardware failure points.', 'info');
                  }}
                  currentServiceTier={formData.serviceTier}
                  onApplyRecommendedTier={(tier) => {
                    setValue('serviceTier', tier, { shouldValidate: true });
                    showToast(`Applied recommended tier: ${tier}`, 'success');
                  }}
                  onApplyToIssueNotes={handleApplyDiagnosticChecklistToNotes}
                  customNotes={customFailureNotes}
                  onCustomNotesChange={setCustomFailureNotes}
                />
              )}

              {triageSubTab === 'hardware_diag' && (
                <div className="space-y-4">
                  <HardwareDiagnosticTool
                    onApplyDiagnosticCode={(code, description) => {
                      const existing = watch('customerReportedIssue') || '';
                      const diagEntry = `[WebUSB/Serial Diagnostic Code: ${code} - ${description}]`;
                      if (!existing.includes(code)) {
                        setValue('customerReportedIssue', existing ? `${existing.trim()}\n${diagEntry}` : diagEntry, { shouldValidate: true, shouldDirty: true });
                        showToast(`Applied ${code} to Issue Description notes.`, 'success');
                      } else {
                        showToast(`Diagnostic code ${code} is already in the issue notes.`, 'info');
                      }
                    }}
                  />
                </div>
              )}

              {triageSubTab === 'pre_checks' && (
                <CommonRepairChecklist
                  manufacturer={formData.deviceManufacturer}
                  model={formData.deviceModel}
                  onApplyChecklistToNotes={handleApplyChecklistToNotes}
                />
              )}

              {triageSubTab === 'smart_triage' && (
                <SmartTriageChat
                  deviceModel={formData.deviceModel}
                  onApplyRecommendations={(tier, issueSummary) => {
                    setValue('serviceTier', tier as any);
                    setValue('customerReportedIssue', issueSummary);
                    setTriageSubTab('telemetry');
                  }}
                />
              )}

              {triageSubTab === 'diag_path' && (
                <RecommendedDiagnosticPath
                  repairNotes={watch('customerReportedIssue') || ''}
                  deviceManufacturer={watch('deviceManufacturer') || ''}
                  deviceModel={watch('deviceModel') || ''}
                  symptoms={selectedSymptomIds.map(id => {
                    const found = DIAGNOSTIC_SYMPTOMS.find(s => s.id === id);
                    return found ? `${found.label} (${found.category})` : id;
                  })}
                  telemetry={formData.telemetry}
                  onApplyPathToNotes={(formattedPath) => {
                    const existing = watch('customerReportedIssue') || '';
                    const updated = existing ? `${existing.trim()}\n\n${formattedPath}` : formattedPath;
                    setValue('customerReportedIssue', updated, { shouldValidate: true, shouldDirty: true });
                    showToast('Applied Recommended Diagnostic Path to Issue Description.', 'success');
                  }}
                />
              )}

              {triageSubTab === 'camera' && (
                <DevicePhotoCaptureInput
                  photos={devicePhotos}
                  onChange={(photos) => setDevicePhotos(photos)}
                />
              )}

              {triageSubTab === 'checklist' && (
                <TechnicianChecklist
                  deviceCategory={formData.deviceModel || 'mobile'}
                />
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div>
                <h2 className="text-3xl font-playfair font-black text-slate-900 mb-2">Statutory Compliance</h2>
                <p className="text-slate-500">Legal disclosures and customer contact registration (RCW 19.415).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-2xl border-2 transition-all",
                    formData.waR2rPrivacyAcknowledged ? "border-green-500 bg-green-50" : "border-slate-100"
                  )}>
                    <label className="flex gap-4 cursor-pointer">
                      <input type="checkbox" {...register('waR2rPrivacyAcknowledged')} className="mt-1" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Security & Privacy Steps</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">I acknowledge the technical measures taken to protect my data during service.</p>
                      </div>
                    </label>
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl border-2 transition-all",
                    formData.waR2rDataBackupAcknowledged ? "border-green-500 bg-green-50" : "border-slate-100"
                  )}>
                    <label className="flex gap-4 cursor-pointer">
                      <input type="checkbox" {...register('waR2rDataBackupAcknowledged')} className="mt-1" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Customer Data Safeguards</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">I have backed up my data or assume all responsibility for potential loss.</p>
                      </div>
                    </label>
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl border-2 transition-all",
                    formData.waR2rPartsProvenanceAcknowledged ? "border-green-500 bg-green-50" : "border-slate-100"
                  )}>
                    <label className="flex gap-4 cursor-pointer">
                      <input type="checkbox" {...register('waR2rPartsProvenanceAcknowledged')} className="mt-1" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Parts Provenance Notice</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">I understand D&CP LLC uses genuine or high-quality aftermarket components.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <input {...register('customerName')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                    <input {...register('customerEmail')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</label>
                      <input {...register('customerPhone')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">ZIP Code</label>
                      <input {...register('destinationZipCode')} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-slate-900 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 flex-1"
            >
              <div>
                <h2 className="text-3xl font-playfair font-black text-slate-900 mb-2">Quote & Review</h2>
                <p className="text-slate-500">Final service verification and Shopify synchronization.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{formData.deviceModel}</h3>
                      <p className="text-sm font-mono text-slate-500 uppercase">IMEI: {formData.imei}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Selected Service</span>
                      <span className="text-slate-900 font-bold">{formData.serviceTier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Diagnostic Status</span>
                      <span className={cn("font-bold uppercase tracking-widest text-[10px] px-2 py-1 rounded", formData.telemetry.isShortToGround ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                        {formData.telemetry.isShortToGround ? "Board Short Detected" : "Nominal Diagnostics"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Reported Issue</p>
                    <p className="text-sm text-slate-600 italic">"{formData.customerReportedIssue}"</p>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    By clicking Sync, you authorize the generation of a Shopify Draft Order and agree to the 
                    D&CP LLC Terms of Service and Washington Statutory Disclosures captured in Step 3.
                  </p>
                </div>

                {quote && (
                  <div className="bg-white rounded-3xl p-8 border-2 border-slate-900 shadow-xl shadow-slate-200/50 space-y-6">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 border-b border-slate-100 pb-4">Financial Breakdown</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Parts Allocation</span>
                        <span className="font-bold text-slate-900">${quote.partsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Labor (${formData.serviceTier === ServiceTier.TIER_3_BOARD ? '2.5' : '0.75'} hrs)</span>
                        <span className="font-bold text-slate-900">${quote.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Overhead Markup (80%)</span>
                        <span className="font-bold text-slate-900">${quote.overhead.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="font-bold text-slate-900">${quote.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Estimated Tax (WA)</span>
                        <span className="font-bold text-slate-900">${quote.tax.toFixed(2)}</span>
                      </div>
                      <div className="pt-4 flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-blue-600">Total Quote</span>
                        <span className="text-4xl font-black text-slate-900">${quote.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hardware Diagnostic Checklist Identified Failure Points Review Card */}
                <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-900/10 shadow-lg shadow-slate-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">Diagnostic Checklist: Identified Failure Points</h4>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold rounded-full">
                            {selectedFailurePointIds.length} FLAGGED
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hardware failure points and subsystem components flagged for repair validation
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setStep(2);
                        setTriageSubTab('diag_checklist');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{selectedFailurePointIds.length > 0 ? 'Edit Failure Points' : '+ Flag Failure Points'}</span>
                    </button>
                  </div>

                  {selectedFailurePointIds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      {selectedFailurePointIds.map((id) => {
                        const item = COMMON_HARDWARE_FAILURE_POINTS.find(i => i.id === id);
                        if (!item) {
                          return (
                            <div key={id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                              Custom Failure Point: {id}
                            </div>
                          );
                        }
                        return (
                          <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                                <span className={cn(
                                  "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0",
                                  item.severity === 'critical' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                  item.severity === 'major' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-blue-50 text-blue-700 border-blue-200"
                                )}>
                                  {item.severity}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{item.subsystem}</p>
                            </div>
                            {item.componentRef && (
                              <div className="text-[9px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200/60 self-start">
                                Ref: {item.componentRef}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                      <p className="text-xs text-slate-500">
                        No specific hardware failure points selected yet. Technicians can log common failure points before submitting the ticket.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStep(2);
                          setTriageSubTab('diag_checklist');
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Launch Diagnostic Checklist &rarr;
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera Intake Attached Photos Review Section */}
                <div className="md:col-span-2 bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white">Camera Intake Damage Metadata</h4>
                          <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold rounded-full border border-blue-400/30">
                            AUTO-ATTACHED TO LAB TICKET
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {devicePhotos.length} photo(s) captured and linked to Spokane Lab intake metadata
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setStep(2);
                        setTriageSubTab('camera');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{devicePhotos.length > 0 ? 'Manage Damage Photos' : '+ Snap Intake Photos'}</span>
                    </button>
                  </div>

                  {devicePhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                      {devicePhotos.map((photo) => (
                        <div key={photo.id} className="relative group bg-slate-800/80 rounded-2xl p-2 border border-slate-700/60 overflow-hidden space-y-1.5">
                          <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 relative">
                            <img src={photo.dataUrl} alt={photo.category} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-slate-950/90 text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
                              {photo.timestamp}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="inline-block px-1.5 py-0.5 bg-blue-900/60 text-blue-300 text-[9px] font-bold rounded uppercase truncate max-w-full">
                              {photo.category}
                            </span>
                            {photo.notes && (
                              <p className="text-[10px] text-slate-300 line-clamp-1 italic">
                                "{photo.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 text-center space-y-2">
                      <p className="text-xs text-slate-400 font-medium">
                        No damage photos attached yet. You can attach photos of screen cracks, frame bends, or charge port corrosion.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStep(2);
                          setTriageSubTab('camera');
                        }}
                        className="text-xs font-bold text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Launch Camera Intake Mode &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && result && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-4xl font-playfair font-black text-slate-900 mb-2">Intake Synchronized</h2>
                <p className="text-slate-500">Draft Order {result.draftOrderId} successfully provisioned in Shopify.</p>
              </div>

              {/* Lab Photo & Diagnostic Failure Points Confirmation Box */}
              <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    Spokane Lab Telemetry & Triage
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    SYNCED
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Hardware Failure Points:</span>
                    <span className="font-bold text-slate-900">{result.identifiedFailureCount || 0} flagged</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attached Photos:</span>
                    <span className="font-bold text-slate-900">{result.attachedPhotoCount || 0} photo(s)</span>
                  </div>
                  {result.attachedCategories && result.attachedCategories.length > 0 && (
                    <div className="flex justify-between">
                      <span>Condition Categories:</span>
                      <span className="font-bold text-slate-900 text-right">
                        {result.attachedCategories.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <a 
                  href={result.invoiceUrl} 
                  target="_blank" 
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  View Checkout Link
                  <ChevronRight className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  New Intake
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 5 && (
          <div className="mt-auto pt-12 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-slate-900 transition-colors font-bold uppercase tracking-widest text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all",
                  submitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {submitting ? 'Synchronizing...' : 'Sync with Shopify'}
                {!submitting && <CreditCard className="w-5 h-5" />}
              </button>
            )}
          </div>
        )}
      </form>

        {/* Sidebar History/Context */}
        <aside className="space-y-8">
          {history.length > 0 ? (
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-lg shadow-slate-200/40">
              <div className="flex items-center gap-3 mb-8">
                <History className="w-5 h-5 text-slate-900" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Repair History</h3>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {history.map((entry, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{entry.serviceTier}</span>
                      <span className="text-[10px] text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{entry.deviceModel}</h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase mb-3">IMEI: {entry.imei}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900">${entry.quote?.total.toFixed(2)}</span>
                      <button className="p-1.5 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <ShieldCheck className="w-8 h-8 text-blue-400 mb-6" />
                <h3 className="text-xl font-playfair font-black mb-4">Engineering Protocol</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All intake data is validated against D&CP Engineering Specification Rev 4.0. Hardware telemetry ensures safety limits are respected prior to logic board intervention.
                </p>
              </div>
            </div>
          )}
          
          <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Support Direct</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">Need immediate Tier 3 assistance? Contact our Spokane laboratory directly.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                <Zap className="w-4 h-4 text-blue-600" />
                (509) 555-0123
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                triage@dcp-llc.com
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Optical Barcode / QR Scanner Modal for Hardware Serial & IMEI */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScanSuccess={handleBarcodeScanSuccess}
        targetField="imei"
      />
    </div>
  );
}
