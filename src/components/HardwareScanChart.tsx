import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Zap, Battery, Activity } from "lucide-react";

interface HardwareScanChartProps {
  deviceBrand: string;
  deviceModel: string;
  issueType: "screen" | "battery" | "button";
}

export const HardwareScanChart: React.FC<HardwareScanChartProps> = ({
  deviceBrand,
  deviceModel,
  issueType
}) => {
  const [activeMetric, setActiveMetric] = useState<"voltage" | "capacity">("voltage");

  // Dynamic seed data based on device brand/model
  const getVoltageData = () => {
    switch (deviceBrand) {
      case "Apple":
        return [
          { probe: "P1", nominal: 3.82, active: 3.81, temp: 29 },
          { probe: "P2", nominal: 3.82, active: 3.80, temp: 30 },
          { probe: "P3", nominal: 3.82, active: 3.74, temp: 34 }, // peak load drop
          { probe: "P4", nominal: 3.82, active: 3.79, temp: 31 },
          { probe: "P5", nominal: 3.82, active: 3.81, temp: 29 },
          { probe: "P6", nominal: 3.82, active: 3.82, temp: 28 }
        ];
      case "Samsung":
        return [
          { probe: "P1", nominal: 3.85, active: 3.84, temp: 31 },
          { probe: "P2", nominal: 3.85, active: 3.81, temp: 33 },
          { probe: "P3", nominal: 3.85, active: 3.68, temp: 37 }, // peak load drop
          { probe: "P4", nominal: 3.85, active: 3.82, temp: 32 },
          { probe: "P5", nominal: 3.85, active: 3.84, temp: 31 },
          { probe: "P6", nominal: 3.85, active: 3.85, temp: 30 }
        ];
      default: // Google/Other
        return [
          { probe: "P1", nominal: 3.80, active: 3.79, temp: 28 },
          { probe: "P2", nominal: 3.80, active: 3.77, temp: 29 },
          { probe: "P3", nominal: 3.80, active: 3.62, temp: 35 }, // peak load drop
          { probe: "P4", nominal: 3.80, active: 3.76, temp: 31 },
          { probe: "P5", nominal: 3.80, active: 3.79, temp: 29 },
          { probe: "P6", nominal: 3.80, active: 3.80, temp: 28 }
        ];
    }
  };

  const getCapacityData = () => {
    // Capacity decay across recent cycles (representing degradation depending on issueType)
    const isBatteryIssue = issueType === "battery";
    const baseHealth = isBatteryIssue ? 76 : 94; // battery issues show deteriorated metrics

    return [
      { cycle: "C-150", capacity: baseHealth + 2.5 },
      { cycle: "C-155", capacity: baseHealth + 1.8 },
      { cycle: "C-160", capacity: baseHealth + 1.2 },
      { cycle: "C-165", capacity: baseHealth + 0.6 },
      { cycle: "C-170", capacity: baseHealth }
    ];
  };

  const voltageData = getVoltageData();
  const capacityData = getCapacityData();

  const isBatteryIssue = issueType === "battery";
  const baseHealth = isBatteryIssue ? 76 : 94;

  return (
    <div id="hardware-scan-recharts-metrics" className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3.5">
      {/* Battery Radial Meter & Status Panel */}
      <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded border border-slate-850/60 gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <span className="text-[8.5px] font-extrabold text-slate-400 tracking-wider uppercase font-mono block">
            ESTIMATED BATTERY CYCLE HEALTH
          </span>
          <p className="text-[9.5px] text-slate-350 font-semibold font-mono leading-snug">
            {isBatteryIssue 
              ? "Battery degraded under nominal current series loads. Service required."
              : "Chemistry retention retention is within acceptable tolerance levels."}
          </p>
          <div className="text-[8.5px] font-bold text-slate-400 font-mono">
            STATUS: <span className={isBatteryIssue ? "text-rose-400 font-extrabold animate-pulse" : "text-emerald-400 font-extrabold"}>
              {isBatteryIssue ? "DEGRADED" : "EXCELLENT"}
            </span>
          </div>
        </div>

        {/* Custom Radial Gauge */}
        <div className="relative flex items-center justify-center shrink-0 w-14 h-14 bg-slate-950 rounded-full border border-slate-800 shadow-inner">
          <svg className="w-12 h-12 transform -rotate-90">
            {/* Track */}
            <circle
              cx="24"
              cy="24"
              r="19"
              className="stroke-slate-800"
              strokeWidth="3.5"
              fill="transparent"
            />
            {/* Progress active segment */}
            <circle
              cx="24"
              cy="24"
              r="19"
              className={`transition-all duration-1000 ease-out ${
                isBatteryIssue 
                  ? "stroke-rose-500 drop-shadow-[0_0_3px_rgba(244,63,94,0.5)]" 
                  : "stroke-emerald-500 drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]"
              }`}
              strokeWidth="3.5"
              strokeDasharray={119.38}
              strokeDashoffset={119.38 - (baseHealth / 100) * 119.38}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className={`text-[10.5px] font-mono font-black leading-none ${isBatteryIssue ? "text-rose-400" : "text-emerald-400"}`}>
              {baseHealth}%
            </span>
            <span className="text-[6.5px] text-slate-500 font-bold tracking-widest leading-none font-mono mt-0.5">HP</span>
          </div>
        </div>
      </div>

      {/* Indicator header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider font-mono">
            Scan Real-time Telemetry
          </span>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded">
          <button
            onClick={() => setActiveMetric("voltage")}
            className={`px-2 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all uppercase ${
              activeMetric === "voltage"
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            V-Rails
          </button>
          <button
            onClick={() => setActiveMetric("capacity")}
            className={`px-2 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all uppercase ${
              activeMetric === "capacity"
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Cycles
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-[120px] w-full text-[9px] font-mono min-w-0">
        <ResponsiveContainer width="99%" height={120}>
          {activeMetric === "voltage" ? (
            <AreaChart data={voltageData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="probe" stroke="#475569" tickLine={false} />
              <YAxis stroke="#475569" domain={[3.5, 3.9]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "6px",
                  fontSize: "9px"
                }}
              />
              <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorActive)" name="Measured V" />
              <Area type="monotone" dataKey="nominal" stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Nominal V" />
            </AreaChart>
          ) : (
            <LineChart data={capacityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="cycle" stroke="#475569" tickLine={false} />
              <YAxis stroke="#475569" domain={[70, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "6px",
                  fontSize: "9px"
                }}
              />
              <Line type="monotone" dataKey="capacity" stroke={issueType === "battery" ? "#f43f5e" : "#10b981"} strokeWidth={1.5} dot={{ r: 2 }} name="Health %" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Numerical status breakdown */}
      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono select-none">
        <div className="p-1.5 bg-slate-900 border border-slate-850 rounded">
          <span className="text-slate-500 block uppercase leading-none mb-1">Max Thermal Rail</span>
          <span className="text-white font-bold">
            {activeMetric === "voltage"
              ? `${Math.max(...voltageData.map(v => v.temp))}°C (Optimal)`
              : "170 Total Cycles"}
          </span>
        </div>
        <div className="p-1.5 bg-slate-900 border border-slate-850 rounded">
          <span className="text-slate-500 block uppercase leading-none mb-1">Health State</span>
          <span className={`font-bold uppercase ${issueType === "battery" ? "text-rose-400" : "text-emerald-400"}`}>
            {activeMetric === "voltage"
              ? "STABLE"
              : issueType === "battery"
              ? "DEGRADED (SERVICE REQ)"
              : "EXCELLENT"}
          </span>
        </div>
      </div>
    </div>
  );
};
