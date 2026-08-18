import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Activity, Clock, AlertTriangle, CheckCircle2, TrendingUp, Filter, Download, 
  Cpu, Zap, ShieldCheck, RefreshCw, BarChart3, Wrench, Layers, UserCheck, GitCommit, GitMerge, FileCheck, Package,
  Database
} from 'lucide-react';
import { useToast } from './Toast.tsx';
import DiagnosticPortMonitor from './DiagnosticPortMonitor.tsx';
import ChainOfVerificationVisualizer from './ChainOfVerificationVisualizer.tsx';
import DataSanitizationCertificate from './DataSanitizationCertificate.tsx';
import AssetManager from './AssetManager.tsx';
import InventoryManagement from './InventoryManagement.tsx';
import DatabaseOptimizationPanel from './DatabaseOptimizationPanel.tsx';

// Turnaround time and repair completion volume trend datasets by granularity
export const TURNAROUND_TREND_DATA_DAILY = [
  { interval: 'Aug 01', label: 'Aug 01', target: 6.0, avgHours: 4.8, expressHours: 1.8, volume: 14, completionRate: 98.6 },
  { interval: 'Aug 02', label: 'Aug 02', target: 6.0, avgHours: 4.6, expressHours: 1.7, volume: 16, completionRate: 99.0 },
  { interval: 'Aug 03', label: 'Aug 03', target: 6.0, avgHours: 4.1, expressHours: 1.5, volume: 12, completionRate: 98.2 },
  { interval: 'Aug 04', label: 'Aug 04', target: 6.0, avgHours: 4.3, expressHours: 1.6, volume: 15, completionRate: 98.8 },
  { interval: 'Aug 05', label: 'Aug 05', target: 6.0, avgHours: 3.9, expressHours: 1.4, volume: 18, completionRate: 99.2 },
  { interval: 'Aug 06', label: 'Aug 06', target: 6.0, avgHours: 3.8, expressHours: 1.3, volume: 19, completionRate: 98.9 },
  { interval: 'Aug 07', label: 'Aug 07', target: 6.0, avgHours: 3.7, expressHours: 1.2, volume: 17, completionRate: 99.1 },
  { interval: 'Aug 08', label: 'Aug 08', target: 6.0, avgHours: 3.5, expressHours: 1.1, volume: 22, completionRate: 99.4 },
  { interval: 'Aug 09', label: 'Aug 09', target: 6.0, avgHours: 3.6, expressHours: 1.2, volume: 20, completionRate: 98.7 },
  { interval: 'Aug 10', label: 'Aug 10', target: 6.0, avgHours: 3.4, expressHours: 1.0, volume: 24, completionRate: 99.5 },
  { interval: 'Aug 11', label: 'Aug 11', target: 6.0, avgHours: 3.3, expressHours: 0.9, volume: 21, completionRate: 99.2 },
  { interval: 'Aug 12', label: 'Aug 12', target: 6.0, avgHours: 3.4, expressHours: 1.0, volume: 25, completionRate: 99.3 },
  { interval: 'Aug 13', label: 'Aug 13', target: 6.0, avgHours: 3.2, expressHours: 0.9, volume: 26, completionRate: 99.6 },
  { interval: 'Aug 14', label: 'Aug 14 (Today)', labelShort: 'Today', target: 6.0, avgHours: 3.1, expressHours: 0.8, volume: 28, completionRate: 99.7 },
];

export const TURNAROUND_TREND_DATA_WEEKLY = [
  { interval: 'W26 (Jun 22)', label: 'Week 26', target: 6.0, avgHours: 5.6, expressHours: 2.1, volume: 74, completionRate: 97.4 },
  { interval: 'W27 (Jun 29)', label: 'Week 27', target: 6.0, avgHours: 5.2, expressHours: 1.9, volume: 82, completionRate: 97.9 },
  { interval: 'W28 (Jul 06)', label: 'Week 28', target: 6.0, avgHours: 4.8, expressHours: 1.8, volume: 88, completionRate: 98.2 },
  { interval: 'W29 (Jul 13)', label: 'Week 29', target: 6.0, avgHours: 4.5, expressHours: 1.6, volume: 92, completionRate: 98.5 },
  { interval: 'W30 (Jul 20)', label: 'Week 30', target: 6.0, avgHours: 4.1, expressHours: 1.4, volume: 96, completionRate: 98.8 },
  { interval: 'W31 (Jul 27)', label: 'Week 31', target: 6.0, avgHours: 3.8, expressHours: 1.3, volume: 104, completionRate: 99.1 },
  { interval: 'W32 (Aug 03)', label: 'Week 32', target: 6.0, avgHours: 3.5, expressHours: 1.1, volume: 118, completionRate: 99.4 },
  { interval: 'W33 (Aug 10)', label: 'Week 33 (Current)', labelShort: 'W33', target: 6.0, avgHours: 3.2, expressHours: 0.9, volume: 126, completionRate: 99.6 },
];

export const TURNAROUND_TREND_DATA_MONTHLY = [
  { interval: 'Feb 2026', label: 'Feb 2026', target: 6.0, avgHours: 6.2, expressHours: 2.5, volume: 260, completionRate: 96.8 },
  { interval: 'Mar 2026', label: 'Mar 2026', target: 6.0, avgHours: 5.7, expressHours: 2.2, volume: 295, completionRate: 97.3 },
  { interval: 'Apr 2026', label: 'Apr 2026', target: 6.0, avgHours: 5.1, expressHours: 1.9, volume: 318, completionRate: 98.0 },
  { interval: 'May 2026', label: 'May 2026', target: 6.0, avgHours: 4.4, expressHours: 1.6, volume: 345, completionRate: 98.5 },
  { interval: 'Jun 2026', label: 'Jun 2026', target: 6.0, avgHours: 3.9, expressHours: 1.4, volume: 382, completionRate: 98.9 },
  { interval: 'Jul 2026', label: 'Jul 2026', target: 6.0, avgHours: 3.6, expressHours: 1.2, volume: 412, completionRate: 99.2 },
  { interval: 'Aug 2026 (MTD)', label: 'Aug 2026', labelShort: 'Aug', target: 6.0, avgHours: 3.3, expressHours: 1.0, volume: 438, completionRate: 99.5 },
];

// Common Failure Modes & Root Cause Rates
const FAILURE_RATES_DATA = [
  { name: 'Cracked OLED / Digitizer', count: 124, percentage: 36.2, category: 'Display', color: '#2563eb' },
  { name: 'Battery Degradation / Swelling', count: 86, percentage: 25.1, category: 'Power', color: '#3b82f6' },
  { name: 'Liquid Ingress Corrosion', count: 48, percentage: 14.0, category: 'Micro-Soldering', color: '#06b6d4' },
  { name: 'PMIC / Power Rail Short', count: 38, percentage: 11.1, category: 'Logic Board', color: '#10b981' },
  { name: 'USB-C / Lightning Port Wear', count: 28, percentage: 8.2, category: 'I/O Assembly', color: '#f59e0b' },
  { name: 'Audio IC / NAND Fracture', count: 18, percentage: 5.4, category: 'Logic Board', color: '#6366f1' },
];

// Turnaround Time & Volume by Device Platform
const PLATFORM_PERFORMANCE_DATA = [
  { platform: 'iPhone / iOS', avgTurnaround: 2.8, successRate: 99.1, jobs: 162 },
  { platform: 'MacBook Pro/Air', avgTurnaround: 6.4, successRate: 97.5, jobs: 84 },
  { platform: 'Android / Galaxy', avgTurnaround: 3.6, successRate: 98.2, jobs: 58 },
  { platform: 'Custom PCB / Consoles', avgTurnaround: 8.2, successRate: 95.8, jobs: 38 },
];

// Technician Bench Benchmark Performance
const TECH_BENCHMARK_DATA = [
  { name: 'Ryan Young', role: 'Founder & Lead Micro-Soldering Specialist', completed: 128, avgTime: '3.1 hrs', yieldRate: '99.2%', score: 98 },
  { name: 'Sarah Martinez', role: 'Display & Battery Lead', completed: 114, avgTime: '2.4 hrs', yieldRate: '98.8%', score: 96 },
  { name: 'Alex Rivera', role: 'Diagnostic & Triage Tech', completed: 100, avgTime: '3.8 hrs', yieldRate: '97.9%', score: 94 },
];

export default function RepairAnalytics() {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'inventory' | 'assets' | 'cove' | 'sanitization' | 'database'>('metrics');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active trend data by granularity
  const activeTrendData = granularity === 'daily' 
    ? TURNAROUND_TREND_DATA_DAILY 
    : granularity === 'weekly' 
    ? TURNAROUND_TREND_DATA_WEEKLY 
    : TURNAROUND_TREND_DATA_MONTHLY;

  const totalCompletedInView = activeTrendData.reduce((acc, curr) => acc + curr.volume, 0);
  const avgTurnaroundInView = (activeTrendData.reduce((acc, curr) => acc + curr.avgHours, 0) / activeTrendData.length).toFixed(1);
  const avgExpressInView = (activeTrendData.reduce((acc, curr) => acc + curr.expressHours, 0) / activeTrendData.length).toFixed(1);
  const avgCompletionRateInView = (activeTrendData.reduce((acc, curr) => acc + curr.completionRate, 0) / activeTrendData.length).toFixed(1);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast(`Laboratory Repair Metrics refreshed (${granularity.toUpperCase()} view from Spokane Lab DB).`, 'success');
    }, 600);
  };

  const handleExportReport = () => {
    try {
      showToast('Generating Laboratory Analytics & Telemetry Report (CSV)...', 'info');

      // 1. Build Turnaround Trends Section
      const trendHeader = ['Interval Label', 'Standard Repair (Hours)', 'Express Pass (Hours)', 'Job Volume', 'Completion Rate (%)'];
      const trendRows = activeTrendData.map(row => [
        `"${row.label}"`,
        row.avgHours,
        row.expressHours,
        row.volume,
        `${row.completionRate}%`
      ]);

      // 2. Build Failure Modes Section
      const failureHeader = ['Failure Mode / Fault', 'Category', 'Incident Count', 'Percentage (%)'];
      const failureRows = filteredFailureRates.map(row => [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.category}"`,
        row.count,
        row.percentage
      ]);

      // 3. Build Platform Benchmarks Section
      const platformHeader = ['Platform Category', 'Avg Turnaround (Hours)', 'First-Pass Yield (%)', 'Total Jobs Completed'];
      const platformRows = PLATFORM_PERFORMANCE_DATA.map(row => [
        `"${row.platform}"`,
        row.avgTurnaround,
        row.successRate,
        row.jobs
      ]);

      // 4. Build Technician Benchmark Section
      const techHeader = ['Technician Name', 'Role / Specialty', 'Completed Jobs', 'Avg Time / Job', 'Yield Rate', 'Score'];
      const techRows = TECH_BENCHMARK_DATA.map(row => [
        `"${row.name}"`,
        `"${row.role}"`,
        row.completed,
        `"${row.avgTime}"`,
        `"${row.yieldRate}"`,
        row.score
      ]);

      // Assemble CSV Content
      const csvLines = [
        `"D&CP Spokane Laboratory - Repair Telemetry & Failure Analysis Report"`,
        `"Report Generated: ${new Date().toLocaleString()}"`,
        `"Granularity: ${granularity.toUpperCase()} | Time Range Filter: ${timeRange.toUpperCase()} | Failure Category Filter: ${selectedCategory}"`,
        ``,
        `"--- SECTION 1: REPAIR VOLUME & TURNAROUND TIME VELOCITY (${granularity.toUpperCase()}) ---"`,
        trendHeader.join(','),
        ...trendRows.map(r => r.join(',')),
        ``,
        `"--- SECTION 2: FAILURE MODE DISTRIBUTION ---"`,
        failureHeader.join(','),
        ...failureRows.map(r => r.join(',')),
        ``,
        `"--- SECTION 3: PLATFORM BENCHMARKS ---"`,
        platformHeader.join(','),
        ...platformRows.map(r => r.join(',')),
        ``,
        `"--- SECTION 4: TECHNICIAN BENCH PRODUCTIVITY ---"`,
        techHeader.join(','),
        ...techRows.map(r => r.join(','))
      ];

      const csvString = csvLines.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const filename = `Spokane_Lab_Telemetry_${granularity}_${timeRange}_${selectedCategory.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Export complete: ${filename} downloaded.`, 'success');
    } catch {
      showToast('Error generating CSV export file.', 'error');
    }
  };

  const filteredFailureRates = selectedCategory === 'All' 
    ? FAILURE_RATES_DATA 
    : FAILURE_RATES_DATA.filter(item => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header & Control Bar */}
      <div className="space-y-6 border-b border-slate-100 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <BarChart3 className="w-3.5 h-3.5" />
              Spokane Laboratory Benchmark
            </div>
            <h2 className="text-4xl font-playfair font-black text-slate-900 tracking-tight">
              Repair Telemetry & Laboratory Engineering
            </h2>
            <p className="text-slate-500 text-xs font-medium max-w-xl">
              Real-time bench turnaround metrics, failure mode distribution, dynamic daily/weekly/monthly repair volume telemetry, and inventory stock correlations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Date-Range / Granularity Selector: Daily / Weekly / Monthly */}
            <div className="bg-slate-900 p-1 rounded-2xl flex items-center gap-1 shadow-md">
              {(['daily', 'weekly', 'monthly'] as const).map((gran) => (
                <button
                  key={gran}
                  onClick={() => {
                    setGranularity(gran);
                    showToast(`Switched repair analytics view to ${gran.toUpperCase()} view.`, 'info');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all capitalize ${
                    granularity === gran
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {gran}
                </button>
              ))}
            </div>

            {/* Time Filter Buttons */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    timeRange === range
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-700 transition-all shadow-sm"
              title="Refresh Bench Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              onClick={handleExportReport}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100/70 p-1.5 rounded-2xl max-w-5xl">
          <button
            onClick={() => setActiveSubTab('metrics')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] ${
              activeSubTab === 'metrics'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Telemetry & Performance</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] ${
              activeSubTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GitMerge className="w-4 h-4 text-amber-600" />
            <span>Inventory Management</span>
          </button>

          <button
            onClick={() => setActiveSubTab('assets')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] ${
              activeSubTab === 'assets'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Vault SKU Catalog</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cove')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] ${
              activeSubTab === 'cove'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GitCommit className="w-4 h-4 text-indigo-600" />
            <span>CoVe & Thermal Engine</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sanitization')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] ${
              activeSubTab === 'sanitization'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4 text-teal-600" />
            <span>NIST Data Sanitization</span>
          </button>

          <button
            onClick={() => setActiveSubTab('database')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] ${
              activeSubTab === 'database'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-600" />
            <span>Database & Indexes</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {/* Top 4 Key Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Turnaround Time</span>
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{avgTurnaroundInView} hrs</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      -18.2%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    {granularity === 'daily' ? 'Avg 14-day daily cycle' : granularity === 'weekly' ? 'Avg 8-week cycle' : 'Avg 6-month aggregate'} • Express {avgExpressInView}h
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">First-Pass Yield</span>
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{avgCompletionRateInView}%</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                      +0.6%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">RMA return rate under 1.2%</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completed Repair Volume</span>
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{totalCompletedInView}</span>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-0.5">
                      +14.5%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    {granularity === 'daily' ? `${(totalCompletedInView / activeTrendData.length).toFixed(1)} repairs / day` : granularity === 'weekly' ? `${(totalCompletedInView / activeTrendData.length).toFixed(0)} repairs / week` : `${totalCompletedInView} repairs across active range`}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Micro-Soldering Triage</span>
                  <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">24.5%</span>
                    <span className="text-xs font-bold text-amber-600">Level 3 BGA</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">PMIC / Power Rail & Liquid Rework</p>
                </div>
              </motion.div>
            </div>

            {/* WebUSB Diagnostic Port Monitor */}
            <DiagnosticPortMonitor />

            {/* Repair Completion Volume & Throughput Velocity Trend (New Dedicated Granular Chart) */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-mono font-bold text-[10px] uppercase tracking-wider rounded-md">
                      {granularity} Dynamic View
                    </span>
                    <span className="text-xs text-slate-400">
                      Total Volume: <strong>{totalCompletedInView} units completed</strong>
                    </span>
                  </div>
                  <h3 className="font-black text-xl text-slate-900 flex items-center gap-2 mt-1">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Repair Completion Volume & Throughput
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Total completed repair work orders tracked across {granularity} intervals with first-pass quality yield
                  </p>
                </div>

                {/* Granularity Toggle on Chart */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                    {(['daily', 'weekly', 'monthly'] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => setGranularity(g)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                          granularity === g
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  <div className="hidden sm:flex items-center gap-3 text-xs font-bold ml-2">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm" /> Completed Volume
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Yield %
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="interval" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit=" jobs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [
                        name === 'volume' ? `${val} completed jobs` : `${val}%`,
                        name === 'volume' ? 'Repair Volume' : 'Yield Rate'
                      ]}
                    />
                    <Bar dataKey="volume" name="volume" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Main Charts Grid: Turnaround Trend + Failure Modes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Turnaround Time Trend (7 Cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Turnaround Time Velocity (Hours)
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Average hours from intake scan to final quality pass ({granularity} view)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-blue-600">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" /> Standard Bench
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Express Pass
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="interval" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="h" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
                        formatter={(value: any) => [`${value} hrs`, '']}
                      />
                      <Area type="monotone" dataKey="avgHours" name="Standard Repair" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                      <Area type="monotone" dataKey="expressHours" name="Express Drop-off" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorExpress)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: Failure Mode Rates (5 Cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Failure Mode Breakdown
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Top hardware fault triggers logged at triage</p>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Display', 'Power', 'Micro-Soldering', 'Logic Board'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredFailureRates} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                        formatter={(val: any) => [`${val} devices`, 'Volume']}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {filteredFailureRates.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Platform Performance & Tech Bench Leaderboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Platform Velocity (6 Cols) */}
              <div className="lg:col-span-6 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    Turnaround Velocity by Device Category
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Performance breakdown per hardware platform</p>
                </div>

                <div className="space-y-4">
                  {PLATFORM_PERFORMANCE_DATA.map((plat, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900">{plat.platform}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{plat.jobs} Jobs Completed • {plat.successRate}% Yield</p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-black text-slate-900 shadow-sm">
                          {plat.avgTurnaround} hrs avg
                        </span>
                        <p className="text-[9px] text-emerald-600 font-bold">Passed QA Triage</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technician Bench Metrics (6 Cols) */}
              <div className="lg:col-span-6 bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Technician Bench Productivity
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Individual laboratory engineer throughput metrics</p>
                </div>

                <div className="space-y-4">
                  {TECH_BENCHMARK_DATA.map((tech, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <h4 className="font-bold text-sm text-white">{tech.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{tech.role}</p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-sm font-black text-blue-400">{tech.completed} Jobs</p>
                          <p className="text-[10px] text-slate-400 font-mono">{tech.avgTime} / job</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-600/20 rounded-xl border border-blue-500/30 flex items-center justify-center font-black text-xs text-blue-300">
                          {tech.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <InventoryManagement />
          </motion.div>
        )}

        {activeSubTab === 'assets' && (
          <motion.div
            key="assets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AssetManager />
          </motion.div>
        )}

        {activeSubTab === 'cove' && (
          <motion.div
            key="cove"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ChainOfVerificationVisualizer />
          </motion.div>
        )}

        {activeSubTab === 'sanitization' && (
          <motion.div
            key="sanitization"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DataSanitizationCertificate />
          </motion.div>
        )}

        {activeSubTab === 'database' && (
          <motion.div
            key="database"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DatabaseOptimizationPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
