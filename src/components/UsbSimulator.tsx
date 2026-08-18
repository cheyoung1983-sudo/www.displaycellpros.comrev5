import React, { useState, useEffect, useRef } from "react";
import { 
  Usb, 
  Unplug, 
  Settings, 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  Terminal, 
  Activity, 
  Cpu 
} from "lucide-react";

interface UsbDevicePreset {
  id: string;
  brand: string;
  model: string;
  tier: "flagship" | "midrange" | "budget";
  issue: "screen" | "battery" | "button";
  vid: string;
  pid: string;
  serial: string;
  nominalVoltage: number;
  maxCurrent: number;
  batteryHealth: number;
  batteryCycles: number;
  firmwareVersion: string;
  ccResistance: string; // e.g. "5.1k Rd"
  customerName: string;
  email: string;
}

const PRESETS: UsbDevicePreset[] = [
  {
    id: "iphone15pm",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    tier: "flagship",
    issue: "screen",
    vid: "05AC",
    pid: "12A8",
    serial: "C39Y1X8D2NJ9",
    nominalVoltage: 3.82,
    maxCurrent: 2.5,
    batteryHealth: 88,
    batteryCycles: 312,
    firmwareVersion: "iOS 17.5.1 (21F90)",
    ccResistance: "5.1k Rd (Sink)",
    customerName: "Sarah Jenkins",
    email: "sarah.j@seattlefleet.com"
  },
  {
    id: "s24ultra",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    tier: "flagship",
    issue: "battery",
    vid: "04E8",
    pid: "6860",
    serial: "RF8X107Y9MZ",
    nominalVoltage: 3.85,
    maxCurrent: 3.0,
    batteryHealth: 74,
    batteryCycles: 689,
    firmwareVersion: "Android 14 (UP1A.231005.007)",
    ccResistance: "5.1k Rd (Sink)",
    customerName: "Alex Rivera",
    email: "alex.rivera@gmail.com"
  },
  {
    id: "pixel8pro",
    brand: "Google",
    model: "Pixel 8 Pro",
    tier: "flagship",
    issue: "button",
    vid: "18D1",
    pid: "4EE2",
    serial: "351A2B3C4D5E6F",
    nominalVoltage: 3.80,
    maxCurrent: 2.2,
    batteryHealth: 92,
    batteryCycles: 145,
    firmwareVersion: "Android 14 (AP1A.240505.001)",
    ccResistance: "5.1k Rd (Sink)",
    customerName: "David Miller",
    email: "dmiller@gmail.com"
  },
  {
    id: "midrange_moto",
    brand: "Motorola",
    model: "Moto G Stylus (2024)",
    tier: "midrange",
    issue: "battery",
    vid: "22B8",
    pid: "2E82",
    serial: "ZY32G9X8H7",
    nominalVoltage: 3.87,
    maxCurrent: 1.8,
    batteryHealth: 68,
    batteryCycles: 820,
    firmwareVersion: "Android 13",
    ccResistance: "5.1k Rd (Sink)",
    customerName: "Elena Rostova",
    email: "elena.r@hotmail.com"
  }
];

interface UsbSimulatorProps {
  onDeviceDetected: (
    brand: string,
    model: string,
    tier: "flagship" | "midrange" | "budget",
    issue: "screen" | "battery" | "button",
    customerName: string,
    email: string
  ) => void;
  onToast: (title: string, message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const UsbSimulator: React.FC<UsbSimulatorProps> = ({ onDeviceDetected, onToast }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("iphone15pm");
  const [cableQuality, setCableQuality] = useState<"poor" | "standard" | "premium">("premium");
  const [connectionState, setConnectionState] = useState<"DISCONNECTED" | "VBUS_SENSE" | "CC_DETECTION" | "PD_NEGOTIATION" | "VID_PID_READ" | "ONLINE" | "FAULT">("DISCONNECTED");
  const [voltage, setVoltage] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [ccStatus, setCcStatus] = useState<{ cc1: string; cc2: string }>({ cc1: "OPEN", cc2: "OPEN" });
  const [logs, setLogs] = useState<{ timestamp: string; text: string; type: "info" | "success" | "warning" | "error" }[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedPreset = PRESETS.find(p => p.id === selectedPresetId) || PRESETS[0];

  useEffect(() => {
    addLog("USB Physical Layer Analyzer offline. Insert virtual diagnostic cable to begin sensor scan.", "info");
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { timestamp, text, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Analyzer trace registers cleared.", "info");
  };

  const startConnectionSequence = () => {
    if (connectionState !== "DISCONNECTED") return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    clearLogs();
    
    setConnectionState("VBUS_SENSE");
    setProgress(10);
    setVoltage(5.0); // Safe initial VBUS
    setCurrent(0.1);
    setCcStatus({ cc1: "OPEN", cc2: "OPEN" });
    
    addLog(`🔌 Physical USB-C cable connector coupled. Cable tier: ${cableQuality.toUpperCase()}`, "info");
    addLog("VBUS safety sense active. Initial potential mapped: 5.04V", "success");

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setConnectionState("CC_DETECTION");
        setProgress(30);
        // CC Pin detection
        const orientation = Math.random() > 0.5 ? "CC1" : "CC2";
        if (orientation === "CC1") {
          setCcStatus({ cc1: "Rd (5.1kΩ)", cc2: "OPEN" });
          addLog(`[PHY]: Pull-down detected on CC1 pin (${selectedPreset.ccResistance}). CC2 floating.`, "info");
          addLog(`[PHY]: Host CC coupled in Up-Facing orientation on line CC1.`, "success");
        } else {
          setCcStatus({ cc1: "OPEN", cc2: "Rd (5.1kΩ)" });
          addLog(`[PHY]: Pull-down detected on CC2 pin (${selectedPreset.ccResistance}). CC1 floating.`, "info");
          addLog(`[PHY]: Host CC coupled in Up-Facing orientation on line CC2.`, "success");
        }
      } 
      else if (step === 2) {
        setConnectionState("PD_NEGOTIATION");
        setProgress(50);
        addLog("Initiating USB-PD Power Delivery contract negotiations...", "info");
        
        // Simulating voltage drop based on cable quality
        let negotiatedVolts = 9.0;
        let powerProfile = "9V @ 3A (27W)";
        
        if (cableQuality === "poor") {
          negotiatedVolts = 5.0;
          powerProfile = "5V @ 1.5A (7.5W - High resistance legacy foldback)";
          addLog("⚠️ Warning: High contact resistance sensed on VBUS rail. Limiting PD contract to legacy standard.", "warning");
        } else if (cableQuality === "premium") {
          negotiatedVolts = 15.0;
          powerProfile = "15V @ 3A (45W Fast Charging Profile)";
        }

        setVoltage(negotiatedVolts);
        setCurrent(cableQuality === "poor" ? 0.8 : 1.8);
        addLog(`[USB-PD]: Power contract accepted: ${powerProfile}`, "success");
        addLog(`VBUS matched: ${negotiatedVolts.toFixed(1)}V, Current draw: ${(cableQuality === "poor" ? 0.8 : 1.8).toFixed(2)}A`, "info");
      } 
      else if (step === 3) {
        setConnectionState("VID_PID_READ");
        setProgress(75);
        addLog(`Querying device identification registers over USB D+/D- differential lanes...`, "info");
        addLog(`[PHY]: Handshake resolved. Reading Product ROM table registers...`, "info");
        addLog(`[PHY]: VID: 0x${selectedPreset.vid} | PID: 0x${selectedPreset.pid}`, "success");
        addLog(`[ROM]: Read Serial Number: ${selectedPreset.serial}`, "success");
        addLog(`[ROM]: Read Battery Capacity State: Cycles=${selectedPreset.batteryCycles}, Health=${selectedPreset.batteryHealth}%`, "info");
      } 
      else if (step === 4) {
        clearInterval(interval);
        setConnectionState("ONLINE");
        setProgress(100);
        addLog(`🎉 USB Diagnostics link fully synced with Motherboard CPU!`, "success");
        addLog(`Model: ${selectedPreset.brand} ${selectedPreset.model}`, "success");
        addLog(`Firmware: ${selectedPreset.firmwareVersion}`, "info");

        // Call the parent state updater to sync the whole screen
        onDeviceDetected(
          selectedPreset.brand,
          selectedPreset.model,
          selectedPreset.tier,
          selectedPreset.issue,
          selectedPreset.customerName,
          selectedPreset.email
        );

        onToast(
          "USB Device Coupled",
          `Retrieved diagnostic specs for ${selectedPreset.brand} ${selectedPreset.model} over virtual USB cable link.`,
          "success"
        );
      }
    }, 1200);

    intervalRef.current = interval;
  };

  const disconnectCable = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setConnectionState("DISCONNECTED");
    setProgress(0);
    setVoltage(0);
    setCurrent(0);
    setCcStatus({ cc1: "OPEN", cc2: "OPEN" });
    addLog("🔌 Virtual USB cable disconnected. Transceiver bus is high-impedance floating.", "warning");
    onToast("USB Disconnected", "USB telemetry link severed.", "info");
  };

  const injectFault = (faultType: "cc_short" | "vbus_surge" | "ground_leak") => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setConnectionState("FAULT");
    setProgress(0);
    setCcStatus({ cc1: "SHORT", cc2: "SHORT" });

    if (faultType === "cc_short") {
      setVoltage(0);
      setCurrent(0);
      addLog("🚨 [PHY ERROR]: CC Configuration Pins Shorted to VBUS! Over-voltage Protection (OVP) tripped.", "error");
      addLog("💡 DIAGNOSTIC GUIDANCE: Likely liquid ingress inside the USB-C dock tail-assembly, bridging CC pin traces to high-voltage rails. Replace dock tail ribbon assembly.", "warning");
      onToast("CC Short Fault Sensed", "USB-PD CC pin validation failed. Port protected.", "error");
    } else if (faultType === "vbus_surge") {
      setVoltage(24.5);
      setCurrent(0.01);
      addLog("🚨 [PHY ERROR]: VBUS Surge Peak exceeding maximum transient tolerance! Sense potential: 24.50V", "error");
      addLog("💡 DIAGNOSTIC GUIDANCE: Tripped clamping TVS diode shorted to ground. Recommend removing and replacing motherboard input protection fuse F401 & protection diode D202.", "warning");
      onToast("VBUS Over-voltage Surge", "TVS clamping active. Motherboard fuse blown.", "error");
    } else {
      setVoltage(4.9);
      setCurrent(3.2); // high leak current
      addLog("🚨 [PHY ERROR]: Substantial ground impedance leakage. Current consumption spiked abnormally: 3.20A @ 4.90V", "error");
      addLog("💡 DIAGNOSTIC GUIDANCE: Sensed high power thermal dissipation on PMIC chip (U501). Audio amplifier or primary charging IC is shorted internally. Motherboard hardware micro-soldering service required.", "warning");
      onToast("Ground Thermal Leakage Sensed", "Overcurrent threshold exceeded. Thermal PMIC short detected.", "error");
    }
  };

  return (
    <div id="usb-transceiver-simulator" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg text-slate-100">
      
      {/* Simulator Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Usb className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white tracking-wider uppercase font-mono">USB Hardware Simulator</h3>
            <p className="text-[9px] text-slate-400 font-mono">Physically mimic cable pairing in safe sandbox</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[8.5px] font-mono font-bold text-emerald-400 tracking-widest bg-emerald-950 border border-emerald-900/60 px-2 py-0.5 rounded">
            TRANSCEIVER ACTIVE
          </span>
        </div>
      </div>

      {/* Simulator Controls Grid */}
      <div className="grid grid-cols-12 gap-3.5">
        
        {/* Left Control Parameters */}
        <div className="col-span-12 md:col-span-5 space-y-3">
          
          {/* Preset selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-400" />
              1. Select Virtual Device
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                if (connectionState === "ONLINE") {
                  disconnectCable();
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            >
              {PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.model} ({p.tier})
                </option>
              ))}
            </select>
          </div>

          {/* Cable Tier */}
          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
              <Settings className="w-3 h-3 text-blue-400" />
              2. Cable Integrity
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["poor", "standard", "premium"] as const).map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setCableQuality(tier)}
                  className={`py-1.5 px-2 rounded font-mono text-[9px] font-bold uppercase transition-all border ${
                    cableQuality === tier
                      ? "bg-blue-600/20 text-blue-400 border-blue-500/55 shadow-md shadow-blue-900/10"
                      : "bg-slate-950 hover:bg-slate-850 text-slate-500 border-slate-850"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Physical Buttons Action */}
          <div className="pt-2 space-y-2">
            {connectionState === "DISCONNECTED" ? (
              <button
                type="button"
                onClick={startConnectionSequence}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-900/25 text-white rounded-lg font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-blue-500/30 transition-all active:scale-98"
              >
                <Usb className="w-4 h-4" />
                Plug In Virtual Cable
              </button>
            ) : (
              <button
                type="button"
                onClick={disconnectCable}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 hover:border-rose-800 border border-slate-700 text-slate-200 rounded-lg font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Unplug className="w-4 h-4" />
                Unplug Cable
              </button>
            )}

            {/* Error Injectors */}
            <div className="pt-1.5 border-t border-slate-800/60">
              <div className="text-[8px] text-slate-500 font-extrabold tracking-widest font-mono uppercase mb-1.5">
                🧪 Hardware Diag Injectors (Fault Lab)
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => injectFault("cc_short")}
                  disabled={connectionState === "DISCONNECTED"}
                  className="py-1 px-1.5 bg-slate-950 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/60 disabled:opacity-40 rounded text-[8px] font-extrabold border border-slate-850 font-mono text-slate-400 uppercase transition-all"
                >
                  CC Short
                </button>
                <button
                  type="button"
                  onClick={() => injectFault("vbus_surge")}
                  disabled={connectionState === "DISCONNECTED"}
                  className="py-1 px-1.5 bg-slate-950 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/60 disabled:opacity-40 rounded text-[8px] font-extrabold border border-slate-850 font-mono text-slate-400 uppercase transition-all"
                >
                  VBUS Surge
                </button>
                <button
                  type="button"
                  onClick={() => injectFault("ground_leak")}
                  disabled={connectionState === "DISCONNECTED"}
                  className="py-1 px-1.5 bg-slate-950 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/60 disabled:opacity-40 rounded text-[8px] font-extrabold border border-slate-850 font-mono text-slate-400 uppercase transition-all"
                >
                  PMIC Leak
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Telemetry Readouts */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-between space-y-3 bg-slate-950 border border-slate-850 rounded-xl p-3 shadow-inner">
          
          {/* Signal Scope Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-850 flex flex-col justify-between font-mono">
              <span className="text-[7.5px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-1">
                VBUS POTENTIAL
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-sm font-black tracking-tight ${voltage > 12 ? "text-amber-400" : voltage > 0 ? "text-emerald-400" : "text-slate-550"}`}>
                  {voltage.toFixed(2)}
                </span>
                <span className="text-[8px] font-bold text-slate-500">V</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-850 flex flex-col justify-between font-mono">
              <span className="text-[7.5px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-1">
                BUS CURRENT
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-sm font-black tracking-tight ${current > 2.5 ? "text-rose-400 animate-pulse" : current > 0 ? "text-emerald-400" : "text-slate-550"}`}>
                  {current.toFixed(2)}
                </span>
                <span className="text-[8px] font-bold text-slate-500">A</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-850 flex flex-col justify-between font-mono">
              <span className="text-[7.5px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-1">
                CC PIN SENSE
              </span>
              <span className={`text-[10px] font-black ${ccStatus.cc1 !== "OPEN" || ccStatus.cc2 !== "OPEN" ? "text-blue-400" : "text-slate-550"}`}>
                {ccStatus.cc1 !== "OPEN" ? `CC1: ${ccStatus.cc1}` : ccStatus.cc2 !== "OPEN" ? `CC2: ${ccStatus.cc2}` : "Hi-Z (Float)"}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-850 flex flex-col justify-between font-mono">
              <span className="text-[7.5px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-1">
                LINK STATE
              </span>
              <span className={`text-[9.5px] font-black uppercase tracking-wide flex items-center gap-1 leading-none ${
                connectionState === "ONLINE" ? "text-emerald-400" :
                connectionState === "FAULT" ? "text-rose-400" :
                connectionState === "DISCONNECTED" ? "text-slate-500" : "text-yellow-400 animate-pulse"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  connectionState === "ONLINE" ? "bg-emerald-500" :
                  connectionState === "FAULT" ? "bg-rose-500 animate-ping" :
                  connectionState === "DISCONNECTED" ? "bg-slate-600" : "bg-yellow-500 animate-bounce"
                }`}></span>
                {connectionState}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {connectionState !== "DISCONNECTED" && connectionState !== "ONLINE" && connectionState !== "FAULT" && (
            <div className="space-y-1 font-mono">
              <div className="flex justify-between items-center text-[8.5px]">
                <span className="text-yellow-400 font-bold animate-pulse">NEGOTIATING PHYSICAL HANDSHAKE...</span>
                <span className="text-slate-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden border border-slate-850">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Terminal Logs View */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[8px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                USB-C BMC & ROM Register Stream
              </span>
              <button 
                onClick={clearLogs}
                className="hover:text-white transition-colors"
              >
                Clear Trace
              </button>
            </div>
            <div 
              ref={logContainerRef}
              className="h-28 bg-slate-950 border border-slate-850 rounded-lg p-2 overflow-y-auto font-mono text-[9px] leading-relaxed space-y-1 scrollbar-thin"
            >
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 items-start hover:bg-slate-900 px-1 py-0.5 rounded transition-all">
                  <span className="text-slate-600 font-medium shrink-0">[{log.timestamp}]</span>
                  <span className={`break-words ${
                    log.type === "success" ? "text-emerald-400 font-semibold" :
                    log.type === "warning" ? "text-amber-400" :
                    log.type === "error" ? "text-rose-400 font-black" : "text-slate-350"
                  }`}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
