"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Zap, 
  Cpu, 
  Smartphone, 
  Camera, 
  Volume2, 
  Wifi, 
  Droplets, 
  Search, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Info, 
  Filter, 
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Layers,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { ServiceTier } from '../types.ts';
import { useToast } from './Toast.tsx';
import { cn } from '../lib/utils.ts';

export type FailureSeverity = 'critical' | 'major' | 'minor';

export type FailureCategory = 
  | 'display' 
  | 'power' 
  | 'board' 
  | 'biometrics' 
  | 'camera' 
  | 'audio' 
  | 'wireless' 
  | 'housing';

export interface FailurePointItem {
  id: string;
  category: FailureCategory;
  title: string;
  subsystem: string;
  description: string;
  severity: FailureSeverity;
  recommendedTier: ServiceTier;
  componentRef?: string;
}

export const COMMON_HARDWARE_FAILURE_POINTS: FailurePointItem[] = [
  // Display & Touch
  {
    id: 'fp-disp-1',
    category: 'display',
    title: 'Cracked Glass / OLED Matrix Shattered',
    subsystem: 'Front Panel Assembly',
    description: 'Physical fractures through front glass and/or OLED substrate with visible black ink spots or colored bleeding lines.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'OLED Substrate / Polarizer',
  },
  {
    id: 'fp-disp-2',
    category: 'display',
    title: 'Digitizer Touch Dead Zones / Ghost Touch',
    subsystem: 'Touch Controller & Matrix',
    description: 'Intermittent or unresponsive touch input in specific screen quadrants or erratic unauthorized phantom taps.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'Capacitive ITO Grid / Touch IC',
  },
  {
    id: 'fp-disp-3',
    category: 'display',
    title: 'Backlight Circuit Failure / Black Screen (Flashlight Visible)',
    subsystem: 'Backlight Power Delivery',
    description: 'Display renders image data (visible under high-lumen light) but LED backlight rail has 0V output.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'Backlight Driver IC / Diode / Coil',
  },
  {
    id: 'fp-disp-4',
    category: 'display',
    title: 'Green Vertical Screen Line / Display Flex Strain',
    subsystem: 'COF (Chip-on-Film) Bond',
    description: 'Permanent laser-thin vertical green/pink lines caused by stress or micro-corrosion on display driver flex.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'COF Driver / FPC Connector',
  },

  // Power, Battery & Charging
  {
    id: 'fp-pwr-1',
    category: 'power',
    title: 'Charge Port Wear / Damaged USB-C or Lightning Pins',
    subsystem: 'Dock Connector Flex',
    description: 'Physical wobble, oxidized CC pins, or burnt charging pins preventing handshake with 5V/9V/20V rails.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_1_POWER,
    componentRef: 'Dock Flex Assembly',
  },
  {
    id: 'fp-pwr-2',
    category: 'power',
    title: 'Battery Cell Swelling / High Internal Resistance',
    subsystem: 'Li-ion Chemical Pack',
    description: 'Physical pouch inflation placing upward pressure on screen; capacity degraded below 75% or high IR.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_1_POWER,
    componentRef: 'OEM Li-ion Cell & BMS Board',
  },
  {
    id: 'fp-pwr-3',
    category: 'power',
    title: 'Primary Power Rail Short to Ground (VDD_MAIN / PP_BATT)',
    subsystem: 'Main Power Distribution',
    description: '0.00Ω dead short on main power distribution rail causing immediate ammeter clamp or thermal shutoff.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'Filter Capacitors / Mosfets',
  },
  {
    id: 'fp-pwr-4',
    category: 'power',
    title: 'Charging Controller IC Burnout (Tristar / Hydra / PMIC)',
    subsystem: 'Power Management Circuit',
    description: 'Device draws static 0.00A to 0.05A from USB ammeter without boot cycling or USB accessory recognition.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'PMIC / Charging Gate IC',
  },
  {
    id: 'fp-pwr-5',
    category: 'power',
    title: 'Rapid Battery Drain / Standby Thermal Leakage',
    subsystem: 'Secondary Rail Power Leak',
    description: 'Device loses >15% battery per hour in sleep mode with detectable localized heat near RF or processor area.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_1_POWER,
    componentRef: 'Battery & Secondary Rails',
  },

  // Logic Board & Micro-Soldering
  {
    id: 'fp-brd-1',
    category: 'board',
    title: 'Baseband / Cellular Modem IC Fracture (No Service / No IMEI)',
    subsystem: 'Baseband Power & Modem',
    description: 'Device shows "Searching..." or "No Service" with *#06# failing to render modem firmware or IMEI.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'Baseband PMU / BB CPU',
  },
  {
    id: 'fp-brd-2',
    category: 'board',
    title: 'Audio IC Substrate Pad Separation (Loop Disease / Mute Voice Memos)',
    subsystem: 'Audio Codec Bus',
    description: 'Slow 3-5 minute boot time, grayed-out speakerphone button, and voice recorder failing to open.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'Audio Codec IC / I2S Bus',
  },
  {
    id: 'fp-brd-3',
    category: 'board',
    title: 'Sandwich Interposer Solder Joint Separation',
    subsystem: 'Multi-layer PCB Interposer',
    description: 'Drop shock sheared micro-solder balls connecting Top RF layer and Bottom Logic board layer.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'Interposer Middle Frame',
  },
  {
    id: 'fp-brd-4',
    category: 'board',
    title: 'NAND Flash Storage Degradation / Panic Log 0x8000',
    subsystem: 'Non-Volatile Storage',
    description: 'Kernel panic logs indicate NVMe/NAND timeout or corrupted APFS superblock table.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'NAND Flash / NVMe IC',
  },

  // Biometrics & Sensors
  {
    id: 'fp-bio-1',
    category: 'biometrics',
    title: 'Face ID TrueDepth Dot Projector / Flood Illuminator Fault',
    subsystem: 'Structured Light Sensor Array',
    description: '"Face ID has been disabled" message due to liquid ingress or mechanical shock to optical prism.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'Romeo / Juliet Dot Projector Flex',
  },
  {
    id: 'fp-bio-2',
    category: 'biometrics',
    title: 'Touch ID / Fingerprint Flex Micro-Tear',
    subsystem: 'Biometric Sensor Button',
    description: 'Capacitive fingerprint reader non-responsive; paired secure enclave key fails validation.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'Home Flex / Enclave Sensor',
  },
  {
    id: 'fp-bio-3',
    category: 'biometrics',
    title: 'Proximity / Ambient Light Sensor Blockage or Failure',
    subsystem: 'Front Sensor Module',
    description: 'Screen fails to blank during cellular calls; auto-brightness or TrueTone calibrator inactive.',
    severity: 'minor',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'ALS / Proximity Flex',
  },

  // Cameras & Optics
  {
    id: 'fp-cam-1',
    category: 'camera',
    title: 'Optical Image Stabilization (OIS) Actuator Spasm / Buzzing',
    subsystem: 'Primary Rear Camera Module',
    description: 'Electromagnetic voice coil motor violently shakes with audible acoustic rattle when camera opens.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'Rear Main Camera Voice Coil',
  },
  {
    id: 'fp-cam-2',
    category: 'camera',
    title: 'Camera Sapphire Glass Lens Puncture / Dust Ingress',
    subsystem: 'Camera Bezel & Lens Cover',
    description: 'Broken camera glass exposing bare sensor to airborne particulate, resulting in fuzzy dark halos.',
    severity: 'minor',
    recommendedTier: ServiceTier.TIER_1_POWER,
    componentRef: 'Sapphire Lens Frame',
  },
  {
    id: 'fp-cam-3',
    category: 'camera',
    title: 'Front Camera / Ultra-Wide 0.5x Sensor Blackout',
    subsystem: 'MIPI CSI Camera Bus',
    description: 'Camera app switches to black preview with frozen shutter button on 0.5x or selfie mode.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'Secondary Camera Flex',
  },

  // Acoustic & Haptics
  {
    id: 'fp-aud-1',
    category: 'audio',
    title: 'Ear Speaker Mesh Clogged / Diaphragm Ruptured',
    subsystem: 'Receiver Speaker',
    description: 'Extremely low call volume or severe buzzing distortion from ear receiver grille.',
    severity: 'minor',
    recommendedTier: ServiceTier.TIER_1_POWER,
    componentRef: 'Ear Receiver Module',
  },
  {
    id: 'fp-aud-2',
    category: 'audio',
    title: 'Lower Loudspeaker & Bottom Mic Array Crackle',
    subsystem: 'Buzzer Acoustic Enclosure',
    description: 'Distorted ringtones and media playback; bottom primary microphone produces muffled static.',
    severity: 'minor',
    recommendedTier: ServiceTier.TIER_1_POWER,
    componentRef: 'Speaker Chamber & Sub-Mic',
  },
  {
    id: 'fp-aud-3',
    category: 'audio',
    title: 'Taptic Engine / Linear Resonator Loose Screws or Coil Fail',
    subsystem: 'Haptic Feedback Actuator',
    description: 'Haptic vibration produces a sharp metallic click instead of crisp resonant tap.',
    severity: 'minor',
    recommendedTier: ServiceTier.TIER_1_POWER,
    componentRef: 'Linear Resonant Actuator',
  },

  // Wireless & Connectivity
  {
    id: 'fp-wir-1',
    category: 'wireless',
    title: 'Wi-Fi / Bluetooth Module Greyed Out in Settings',
    subsystem: 'WLAN / BT Combo Subsystem',
    description: 'Wi-Fi toggle switch is unresponsive or disabled; MAC address displays as N/A in System Info.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'Wi-Fi IC / 32kHz Clock Crystal',
  },
  {
    id: 'fp-wir-2',
    category: 'wireless',
    title: '5G / LTE High-Band Antenna Disconnect',
    subsystem: 'Cellular RF Transceiver',
    description: 'Weak cellular reception (1 bar) drops immediately indoors while Wi-Fi continues operating.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'RF Coaxial Cables / Antenna',
  },
  {
    id: 'fp-wir-3',
    category: 'wireless',
    title: 'NFC / Apple Pay / Google Wallet Induction Loop Broken',
    subsystem: 'Near Field Communication Coil',
    description: 'Contactless payment terminals fail to detect device; wireless inductive charging unaffected or intermittent.',
    severity: 'minor',
    recommendedTier: ServiceTier.TIER_1_POWER,
    componentRef: 'Rear Induction NFC Coil',
  },

  // Chassis & Liquid Ingress
  {
    id: 'fp-hou-1',
    category: 'housing',
    title: 'Liquid Contact Indicator (LDI) Tripped / Green Copper Corrosion',
    subsystem: 'Enclosure & Water Seals',
    description: 'Internal water stickers activated deep red/pink; visible galvanic corrosion on board edges or shield cans.',
    severity: 'critical',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'LDI Stickers & Ultrasonic Wash',
  },
  {
    id: 'fp-hou-2',
    category: 'housing',
    title: 'Bent Aluminum / Titanium Chassis Framing',
    subsystem: 'Structural Unibody Frame',
    description: 'Warped or bowed midframe preventing new display assembly from seating flush without risk of glass stress cracks.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_2_DISPLAY,
    componentRef: 'Chassis Midframe / Gasket',
  },
  {
    id: 'fp-hou-3',
    category: 'housing',
    title: 'Stripped Standoff Screws / Prior Third-Party Tampering',
    subsystem: 'Internal Fasteners & Grounding',
    description: 'Missing EMI shield plates, rounded Torx/Pentalobe screws, or long screw damage (LSD) through trace lines.',
    severity: 'major',
    recommendedTier: ServiceTier.TIER_3_BOARD,
    componentRef: 'Board Standoffs / Traces',
  },
];

const CATEGORY_CONFIG: Record<FailureCategory, { label: string; icon: React.ElementType; color: string }> = {
  display: { label: 'Display & Touch', icon: Smartphone, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  power: { label: 'Power & Battery', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  board: { label: 'Logic Board & ICs', icon: Cpu, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  biometrics: { label: 'Biometrics & Sensors', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  camera: { label: 'Cameras & Optics', icon: Camera, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  audio: { label: 'Acoustics & Haptics', icon: Volume2, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  wireless: { label: 'Wireless & RF', icon: Wifi, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  housing: { label: 'Housing & Liquid', icon: Droplets, color: 'text-orange-600 bg-orange-50 border-orange-200' },
};

const PRESETS = [
  {
    id: 'drop_damage',
    label: 'Drop Shock Impact',
    icon: Smartphone,
    color: 'hover:border-blue-300 hover:bg-blue-50/50',
    itemIds: ['fp-disp-1', 'fp-disp-2', 'fp-cam-1', 'fp-hou-2'],
  },
  {
    id: 'liquid_spill',
    label: 'Liquid Ingress',
    icon: Droplets,
    color: 'hover:border-purple-300 hover:bg-purple-50/50',
    itemIds: ['fp-hou-1', 'fp-pwr-3', 'fp-bio-1', 'fp-disp-3'],
  },
  {
    id: 'no_power_dead',
    label: 'No Boot / Dead Board',
    icon: Cpu,
    color: 'hover:border-rose-300 hover:bg-rose-50/50',
    itemIds: ['fp-pwr-3', 'fp-pwr-4', 'fp-pwr-1', 'fp-brd-3'],
  },
  {
    id: 'battery_degrade',
    label: 'Battery & Thermal',
    icon: Zap,
    color: 'hover:border-amber-300 hover:bg-amber-50/50',
    itemIds: ['fp-pwr-2', 'fp-pwr-5', 'fp-pwr-1'],
  },
];

interface DiagnosticChecklistProps {
  selectedIds: string[];
  onToggleFailurePoint: (item: FailurePointItem) => void;
  onSelectMultiple?: (ids: string[]) => void;
  onClearAll: () => void;
  currentServiceTier?: ServiceTier;
  onApplyRecommendedTier?: (tier: ServiceTier) => void;
  onApplyToIssueNotes?: (formattedSummary: string) => void;
  customNotes?: string;
  onCustomNotesChange?: (notes: string) => void;
  className?: string;
}

export default function DiagnosticChecklist({
  selectedIds,
  onToggleFailurePoint,
  onSelectMultiple,
  onClearAll,
  currentServiceTier,
  onApplyRecommendedTier,
  onApplyToIssueNotes,
  customNotes = '',
  onCustomNotesChange,
  className = '',
}: DiagnosticChecklistProps) {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<FailureCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | FailureSeverity>('all');
  const [customFailureText, setCustomFailureText] = useState('');
  const [customItems, setCustomItems] = useState<FailurePointItem[]>([]);

  // All combined items including custom added ones
  const allItems = useMemo(() => {
    return [...COMMON_HARDWARE_FAILURE_POINTS, ...customItems];
  }, [customItems]);

  // Filtered items based on activeCategory, searchQuery, and severityFilter
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        item.title.toLowerCase().includes(q) ||
        item.subsystem.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.componentRef && item.componentRef.toLowerCase().includes(q))
      );

      return matchesCategory && matchesSeverity && matchesSearch;
    });
  }, [allItems, activeCategory, severityFilter, searchQuery]);

  // Selected item objects
  const selectedItems = useMemo(() => {
    return allItems.filter((item) => selectedIds.includes(item.id));
  }, [allItems, selectedIds]);

  // Highest recommended tier among selected failure points
  const highestRecommendedTier = useMemo(() => {
    if (selectedItems.length === 0) return null;
    const hasTier3 = selectedItems.some((i) => i.recommendedTier === ServiceTier.TIER_3_BOARD);
    if (hasTier3) return ServiceTier.TIER_3_BOARD;
    const hasTier2 = selectedItems.some((i) => i.recommendedTier === ServiceTier.TIER_2_DISPLAY);
    if (hasTier2) return ServiceTier.TIER_2_DISPLAY;
    return ServiceTier.TIER_1_POWER;
  }, [selectedItems]);

  // Critical points count
  const criticalCount = useMemo(() => {
    return selectedItems.filter((i) => i.severity === 'critical').length;
  }, [selectedItems]);

  // Category item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; selected: number }> = {
      all: { total: allItems.length, selected: selectedItems.length },
    };
    (Object.keys(CATEGORY_CONFIG) as FailureCategory[]).forEach((cat) => {
      const catTotal = allItems.filter((i) => i.category === cat).length;
      const catSelected = selectedItems.filter((i) => i.category === cat).length;
      counts[cat] = { total: catTotal, selected: catSelected };
    });
    return counts;
  }, [allItems, selectedItems]);

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    if (onSelectMultiple) {
      const merged = Array.from(new Set([...selectedIds, ...preset.itemIds]));
      onSelectMultiple(merged);
    } else {
      preset.itemIds.forEach((id) => {
        if (!selectedIds.includes(id)) {
          const found = allItems.find((i) => i.id === id);
          if (found) onToggleFailurePoint(found);
        }
      });
    }
    showToast(`Loaded "${preset.label}" common failure checklist preset.`, 'info');
  };

  const handleSelectAllInView = () => {
    const viewIds = filteredItems.map((i) => i.id);
    if (onSelectMultiple) {
      const merged = Array.from(new Set([...selectedIds, ...viewIds]));
      onSelectMultiple(merged);
    } else {
      filteredItems.forEach((item) => {
        if (!selectedIds.includes(item.id)) {
          onToggleFailurePoint(item);
        }
      });
    }
    showToast(`Selected all ${filteredItems.length} failure points in current view.`, 'success');
  };

  const handleAddCustomFailure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFailureText.trim()) return;

    const newItem: FailurePointItem = {
      id: `custom-fp-${Date.now()}`,
      category: activeCategory === 'all' ? 'board' : activeCategory,
      title: customFailureText.trim(),
      subsystem: 'Technician Custom Inspection',
      description: 'Specific hardware fault logged during physical intake and micro-inspection.',
      severity: 'major',
      recommendedTier: ServiceTier.TIER_2_DISPLAY,
      componentRef: 'Technician Verified Fault',
    };

    setCustomItems((prev) => [...prev, newItem]);
    onToggleFailurePoint(newItem);
    setCustomFailureText('');
    showToast('Added custom failure point to diagnostic checklist.', 'success');
  };

  const handleApplyToNotes = () => {
    if (selectedItems.length === 0) {
      showToast('Please select at least one failure point first.', 'error');
      return;
    }

    const itemsSummary = selectedItems
      .map((item, idx) => {
        const sevTag = item.severity.toUpperCase();
        const refStr = item.componentRef ? ` [Ref: ${item.componentRef}]` : '';
        return `• [${sevTag}] ${item.title}${refStr} (${item.subsystem})`;
      })
      .join('\n');

    let text = `[DIAGNOSTIC FAILURE POINTS CHECKLIST - ${selectedItems.length} Faults Identified]\n${itemsSummary}`;
    if (highestRecommendedTier) {
      text += `\n[Recommended Service Tier: ${highestRecommendedTier}]`;
    }
    if (customNotes.trim()) {
      text += `\n[Tech Specific Notes: ${customNotes.trim()}]`;
    }

    if (onApplyToIssueNotes) {
      onApplyToIssueNotes(text);
      showToast('Diagnostic failure points successfully merged into ticket notes.', 'success');
    }

    if (highestRecommendedTier && onApplyRecommendedTier) {
      onApplyRecommendedTier(highestRecommendedTier);
    }
  };

  return (
    <div className={cn("bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm", className)}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-md shrink-0">
            <CheckSquare className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-playfair font-black text-slate-900">
                Diagnostic Checklist
              </h3>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-mono font-bold rounded-full border border-blue-200 uppercase tracking-wider">
                Hardware Failure Points
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select verified component failure points, board shorts, or wear markers before final ticket submission.
            </p>
          </div>
        </div>

        {/* Selected Counter & Tier Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>
              <strong className="text-slate-900 font-black">{selectedIds.length}</strong> points selected
            </span>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert Warning if critical items chosen */}
      {criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>{criticalCount} Critical Failure Mode(s) Active:</strong> High-risk logic board short, battery swelling, or IC failure detected. Board-level diagnostics mandated.
            </span>
          </div>
          {highestRecommendedTier && onApplyRecommendedTier && currentServiceTier !== highestRecommendedTier && (
            <button
              type="button"
              onClick={() => {
                onApplyRecommendedTier(highestRecommendedTier);
                showToast(`Service Tier upgraded to ${highestRecommendedTier}`, 'success');
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] shrink-0 transition-all shadow-xs"
            >
              Upgrade to {highestRecommendedTier.replace('TIER_3_', 'Tier 3 ')}
            </button>
          )}
        </motion.div>
      )}

      {/* Quick Intake Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Quick Incident Presets
          </span>
          <span className="text-[10px] text-slate-400">Click to batch select common trauma patterns</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isFullyActive = preset.itemIds.every((id) => selectedIds.includes(id));
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer",
                  isFullyActive 
                    ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                    : `bg-slate-50/70 border-slate-200 text-slate-700 ${preset.color}`
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon className={cn("w-4 h-4", isFullyActive ? "text-blue-400" : "text-slate-600")} />
                  <span className={cn(
                    "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded",
                    isFullyActive ? "bg-slate-800 text-blue-300" : "bg-white text-slate-500 border border-slate-200"
                  )}>
                    +{preset.itemIds.length} pts
                  </span>
                </div>
                <span className="text-xs font-bold tracking-tight">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters: Category Tabs + Search + Severity */}
      <div className="space-y-3 pt-2">
        {/* Category Horizontal Scrollable Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer",
              activeCategory === 'all'
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
              activeCategory === 'all' ? "bg-slate-800 text-blue-300" : "bg-slate-200 text-slate-600"
            )}>
              {categoryCounts.all.selected > 0 ? `${categoryCounts.all.selected}/${categoryCounts.all.total}` : categoryCounts.all.total}
            </span>
          </button>

          {(Object.entries(CATEGORY_CONFIG) as [FailureCategory, { label: string; icon: React.ElementType; color: string }][]).map(([key, config]) => {
            const Icon = config.icon;
            const count = categoryCounts[key] || { total: 0, selected: 0 };
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : count.selected > 0
                    ? "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{config.label}</span>
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                  isActive 
                    ? "bg-slate-800 text-blue-300" 
                    : count.selected > 0
                    ? "bg-blue-200 text-blue-900"
                    : "bg-slate-200 text-slate-600"
                )}>
                  {count.selected > 0 ? `${count.selected}/${count.total}` : count.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Severity Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search failure point, IC chip (e.g. Tristar, OLED, audio, baseband, battery, LDI)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Severity:</span>
            {(['all', 'critical', 'major', 'minor'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  severityFilter === sev
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {sev}
              </button>
            ))}

            <button
              type="button"
              onClick={handleSelectAllInView}
              className="ml-auto px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-all cursor-pointer whitespace-nowrap"
            >
              Select Shown ({filteredItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Failure Points Checklist Grid */}
      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No matching failure points found</p>
            <p className="text-[11px] text-slate-400">
              Try adjusting your search terms or severity filters, or add a custom hardware failure note below.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.board;
            const CatIcon = catConfig.icon;

            return (
              <div
                key={item.id}
                onClick={() => onToggleFailurePoint(item)}
                className={cn(
                  "p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 group relative select-none",
                  isSelected
                    ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-900 shadow-md scale-[1.005]"
                    : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/70"
                )}
              >
                {/* Checkbox Icon */}
                <div className="mt-0.5 shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className={cn(
                        "text-xs font-bold tracking-tight truncate",
                        isSelected ? "text-white" : "text-slate-900"
                      )}>
                        {item.title}
                      </h4>
                      {item.componentRef && (
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0",
                          isSelected ? "bg-slate-800 text-blue-300" : "bg-slate-100 text-slate-600 border border-slate-200"
                        )}>
                          {item.componentRef}
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Severity Badge */}
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                        item.severity === 'critical'
                          ? isSelected ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-rose-50 text-rose-700 border-rose-200"
                          : item.severity === 'major'
                          ? isSelected ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-amber-50 text-amber-700 border-amber-200"
                          : isSelected ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {item.severity}
                      </span>

                      {/* Tier Pill */}
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-md",
                        item.recommendedTier === ServiceTier.TIER_3_BOARD
                          ? isSelected ? "bg-purple-900/60 text-purple-200" : "bg-purple-100 text-purple-800"
                          : item.recommendedTier === ServiceTier.TIER_2_DISPLAY
                          ? isSelected ? "bg-blue-900/60 text-blue-200" : "bg-blue-100 text-blue-800"
                          : isSelected ? "bg-emerald-900/60 text-emerald-200" : "bg-emerald-100 text-emerald-800"
                      )}>
                        {item.recommendedTier === ServiceTier.TIER_3_BOARD ? 'Tier 3 (Board)' : item.recommendedTier === ServiceTier.TIER_2_DISPLAY ? 'Tier 2 (Display)' : 'Tier 1 (Power)'}
                      </span>
                    </div>
                  </div>

                  <p className={cn(
                    "text-[11px] leading-relaxed line-clamp-2",
                    isSelected ? "text-slate-300" : "text-slate-500"
                  )}>
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className={cn(
                      "text-[10px] font-medium flex items-center gap-1",
                      isSelected ? "text-slate-400" : "text-slate-400"
                    )}>
                      <CatIcon className="w-3 h-3" />
                      {item.subsystem}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Failure Point Form */}
      <form onSubmit={handleAddCustomFailure} className="pt-2 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={customFailureText}
          onChange={(e) => setCustomFailureText(e.target.value)}
          placeholder="+ Add custom diagnostic failure point (e.g., 'C3001 capacitor shorted on PP_GPU rail')..."
          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!customFailureText.trim()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Point</span>
        </button>
      </form>

      {/* Footer Summary & Action Bar */}
      <div className="pt-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
              Identified Failure Profile:
            </span>
            <span className="text-xs font-bold text-slate-700">
              {selectedIds.length} Points Selected
            </span>
            {highestRecommendedTier && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Recommended: {highestRecommendedTier}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Apply these structured failure codes directly into the work order issue description and auto-align the service tier.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0 flex-wrap">
          {highestRecommendedTier && onApplyRecommendedTier && currentServiceTier !== highestRecommendedTier && (
            <button
              type="button"
              onClick={() => {
                onApplyRecommendedTier(highestRecommendedTier);
                showToast(`Auto-configured Service Tier to ${highestRecommendedTier}`, 'success');
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Set Tier ({highestRecommendedTier.replace('TIER_', 'T')})
            </button>
          )}

          <button
            type="button"
            onClick={handleApplyToNotes}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Apply to Ticket Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
