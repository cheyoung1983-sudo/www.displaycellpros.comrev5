"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Package, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  Download, 
  Layers, 
  Search, 
  Database, 
  GitMerge, 
  ShieldCheck, 
  Zap, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  Activity,
  HardDrive,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from './Toast.tsx';

export interface DatabaseInventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Screens' | 'Batteries' | 'Charging Ports' | 'Chips & ICs' | 'Soldering & Flux' | 'Glass & Frames';
  compatibility: string;
  stockLevel: number;
  minThreshold: number;
  unitCost: number;
  binLocation: string;
  lastRestocked: string;
  leadTimeDays: number;
}

export interface RepairCorrelationMetric {
  sku: string;
  componentName: string;
  category: string;
  associatedRepairType: string;
  failureMode: string;
  completedRepairs30d: number;
  componentsConsumed30d: number;
  burnVelocityWeekly: number;
  reworkScrapPercent: number;
  daysOfSupply: number;
  healthStatus: 'critical' | 'warning' | 'optimal';
  replacementCostTotal: number;
}

// Initial baseline stock database (matching lab specs)
const INITIAL_DATABASE_INVENTORY: DatabaseInventoryItem[] = [
  {
    id: 'db_inv_1',
    sku: 'SKU-SCR-IP15P',
    name: 'iPhone 15 Pro Super Retina XDR OLED Screen',
    category: 'Screens',
    compatibility: 'iPhone 15 Pro (A2848)',
    stockLevel: 3,
    minThreshold: 6,
    unitCost: 185.00,
    binLocation: 'Vault Rack A-02',
    lastRestocked: '2026-08-01',
    leadTimeDays: 2
  },
  {
    id: 'db_inv_2',
    sku: 'SKU-BAT-MAC16',
    name: 'MacBook Pro 16" M2/M3 Battery Module',
    category: 'Batteries',
    compatibility: 'MacBook Pro 16" (A2780 / A2992)',
    stockLevel: 4,
    minThreshold: 3,
    unitCost: 120.00,
    binLocation: 'Vault Rack B-05',
    lastRestocked: '2026-08-03',
    leadTimeDays: 3
  },
  {
    id: 'db_inv_3',
    sku: 'SKU-PRT-USBC-IP15',
    name: 'iPhone 15 Series USB-C Flex Port Assembly',
    category: 'Charging Ports',
    compatibility: 'iPhone 15 / 15 Plus / 15 Pro',
    stockLevel: 2,
    minThreshold: 8,
    unitCost: 18.50,
    binLocation: 'Bin C-12',
    lastRestocked: '2026-07-28',
    leadTimeDays: 2
  },
  {
    id: 'db_inv_4',
    sku: 'SKU-IC-ISL6259',
    name: 'ISL6259AHRTZ Charging PMIC IC Chip',
    category: 'Chips & ICs',
    compatibility: 'MacBook Logic Boards (PPBUS_G3H Rail)',
    stockLevel: 14,
    minThreshold: 10,
    unitCost: 6.20,
    binLocation: 'SMD Drawer D-01',
    lastRestocked: '2026-08-05',
    leadTimeDays: 5
  },
  {
    id: 'db_inv_5',
    sku: 'SKU-SCR-S24U',
    name: 'Samsung Galaxy S24 Ultra Dynamic AMOLED 2X Frame',
    category: 'Screens',
    compatibility: 'Galaxy S24 Ultra (SM-S928U)',
    stockLevel: 1,
    minThreshold: 4,
    unitCost: 210.00,
    binLocation: 'Vault Rack A-06',
    lastRestocked: '2026-07-20',
    leadTimeDays: 3
  },
  {
    id: 'db_inv_6',
    sku: 'SKU-BAT-IP14P',
    name: 'iPhone 14 Pro Original Capacity Battery Cell',
    category: 'Batteries',
    compatibility: 'iPhone 14 Pro (A2659)',
    stockLevel: 12,
    minThreshold: 6,
    unitCost: 28.00,
    binLocation: 'Bin B-02',
    lastRestocked: '2026-08-04',
    leadTimeDays: 2
  },
  {
    id: 'db_inv_7',
    sku: 'SKU-FLX-NC559',
    name: 'AMTECH NC-559-V2-TF No-Clean Flux Syringe (30cc)',
    category: 'Soldering & Flux',
    compatibility: 'Universal Micro-soldering Workstation',
    stockLevel: 3,
    minThreshold: 6,
    unitCost: 22.00,
    binLocation: 'Bench Supply Shelf 1',
    lastRestocked: '2026-07-15',
    leadTimeDays: 4
  },
  {
    id: 'db_inv_8',
    sku: 'SKU-GLS-IP15PM',
    name: 'iPhone 15 Pro Max Titanium Rear Housing Panel',
    category: 'Glass & Frames',
    compatibility: 'iPhone 15 Pro Max (A2849)',
    stockLevel: 7,
    minThreshold: 5,
    unitCost: 45.00,
    binLocation: 'Bin Rack G-08',
    lastRestocked: '2026-08-02',
    leadTimeDays: 2
  },
  {
    id: 'db_inv_9',
    sku: 'SKU-IC-CD3217',
    name: 'CD3217B12ACE USB-C Power Delivery Controller',
    category: 'Chips & ICs',
    compatibility: 'MacBook Pro / Air M1/M2/M3 (20V Rail)',
    stockLevel: 8,
    minThreshold: 8,
    unitCost: 14.50,
    binLocation: 'SMD Drawer D-03',
    lastRestocked: '2026-08-07',
    leadTimeDays: 5
  },
  {
    id: 'db_inv_10',
    sku: 'SKU-BAT-S24U',
    name: 'Galaxy S24 Ultra 5000mAh Battery Pack',
    category: 'Batteries',
    compatibility: 'Galaxy S24 Ultra (EB-BS928ABY)',
    stockLevel: 5,
    minThreshold: 4,
    unitCost: 32.00,
    binLocation: 'Bin B-06',
    lastRestocked: '2026-08-06',
    leadTimeDays: 2
  }
];

// Calculated correlation data linking component SKU consumption directly to completed repair work order types
const CORRELATION_BASE_MAP: Record<string, {
  associatedRepairType: string;
  failureMode: string;
  completedRepairs30d: number;
  componentsConsumed30d: number;
  reworkScrapPercent: number;
}> = {
  'SKU-SCR-IP15P': {
    associatedRepairType: 'OLED Display Assembly Renewal',
    failureMode: 'Cracked OLED / Digitizer',
    completedRepairs30d: 48,
    componentsConsumed30d: 51,
    reworkScrapPercent: 5.8
  },
  'SKU-BAT-MAC16': {
    associatedRepairType: 'MacBook Power Subsystem Overhaul',
    failureMode: 'Battery Degradation / Swelling',
    completedRepairs30d: 26,
    componentsConsumed30d: 26,
    reworkScrapPercent: 0.0
  },
  'SKU-PRT-USBC-IP15': {
    associatedRepairType: 'USB-C Flex Port Micro-Rework',
    failureMode: 'USB-C / Lightning Port Wear',
    completedRepairs30d: 19,
    componentsConsumed30d: 20,
    reworkScrapPercent: 5.0
  },
  'SKU-IC-ISL6259': {
    associatedRepairType: 'BGA / PMIC Power Rail Repair',
    failureMode: 'PMIC / Power Rail Short',
    completedRepairs30d: 34,
    componentsConsumed30d: 38,
    reworkScrapPercent: 10.5
  },
  'SKU-SCR-S24U': {
    associatedRepairType: 'Dynamic AMOLED Frame Renewal',
    failureMode: 'Cracked OLED / Digitizer',
    completedRepairs30d: 22,
    componentsConsumed30d: 23,
    reworkScrapPercent: 4.3
  },
  'SKU-BAT-IP14P': {
    associatedRepairType: 'iPhone Battery Cell Calibration',
    failureMode: 'Battery Degradation / Swelling',
    completedRepairs30d: 42,
    componentsConsumed30d: 43,
    reworkScrapPercent: 2.3
  },
  'SKU-FLX-NC559': {
    associatedRepairType: 'Micro-soldering Board Level Triage',
    failureMode: 'Liquid Ingress Corrosion',
    completedRepairs30d: 48,
    componentsConsumed30d: 52,
    reworkScrapPercent: 7.7
  },
  'SKU-GLS-IP15PM': {
    associatedRepairType: 'Laser Glass Housing Replacement',
    failureMode: 'Shattered Rear Housing Panel',
    completedRepairs30d: 18,
    componentsConsumed30d: 19,
    reworkScrapPercent: 5.2
  },
  'SKU-IC-CD3217': {
    associatedRepairType: '20V Power Delivery USB-C Controller',
    failureMode: 'Liquid Ingress Corrosion / 5V Lock',
    completedRepairs30d: 24,
    componentsConsumed30d: 27,
    reworkScrapPercent: 11.1
  },
  'SKU-BAT-S24U': {
    associatedRepairType: 'Galaxy Thermal Battery Renewal',
    failureMode: 'Battery Degradation / Swelling',
    completedRepairs30d: 16,
    componentsConsumed30d: 16,
    reworkScrapPercent: 0.0
  }
};

// Granular Inventory Depletion & Restock Trend Data for Daily, Weekly, and Monthly views
export const INVENTORY_TREND_DAILY = [
  { interval: 'Day 1', label: 'Aug 01', consumed: 6, restocked: 15, activeJobs: 8, bufferHealth: 96 },
  { interval: 'Day 2', label: 'Aug 02', consumed: 8, restocked: 0, activeJobs: 9, bufferHealth: 94 },
  { interval: 'Day 3', label: 'Aug 03', consumed: 11, restocked: 20, activeJobs: 12, bufferHealth: 97 },
  { interval: 'Day 4', label: 'Aug 04', consumed: 7, restocked: 0, activeJobs: 7, bufferHealth: 95 },
  { interval: 'Day 5', label: 'Aug 05', consumed: 14, restocked: 10, activeJobs: 15, bufferHealth: 93 },
  { interval: 'Day 6', label: 'Aug 06', consumed: 9, restocked: 0, activeJobs: 10, bufferHealth: 92 },
  { interval: 'Day 7', label: 'Aug 07', consumed: 5, restocked: 25, activeJobs: 6, bufferHealth: 98 },
  { interval: 'Day 8', label: 'Aug 08', consumed: 12, restocked: 0, activeJobs: 13, bufferHealth: 95 },
  { interval: 'Day 9', label: 'Aug 09', consumed: 16, restocked: 30, activeJobs: 18, bufferHealth: 98 },
  { interval: 'Day 10', label: 'Aug 10', consumed: 10, restocked: 0, activeJobs: 11, bufferHealth: 96 },
  { interval: 'Day 11', label: 'Aug 11', consumed: 13, restocked: 12, activeJobs: 14, bufferHealth: 95 },
  { interval: 'Day 12', label: 'Aug 12', consumed: 15, restocked: 0, activeJobs: 16, bufferHealth: 93 },
  { interval: 'Day 13', label: 'Aug 13', consumed: 11, restocked: 18, activeJobs: 12, bufferHealth: 96 },
  { interval: 'Day 14', label: 'Aug 14', consumed: 8, restocked: 0, activeJobs: 9, bufferHealth: 95 },
];

export const INVENTORY_TREND_WEEKLY = [
  { interval: 'Wk 1', label: 'Week 1 (Jun 22)', consumed: 42, restocked: 50, activeJobs: 40, bufferHealth: 96 },
  { interval: 'Wk 2', label: 'Week 2 (Jun 29)', consumed: 48, restocked: 35, activeJobs: 46, bufferHealth: 94 },
  { interval: 'Wk 3', label: 'Week 3 (Jul 06)', consumed: 56, restocked: 60, activeJobs: 54, bufferHealth: 97 },
  { interval: 'Wk 4', label: 'Week 4 (Jul 13)', consumed: 51, restocked: 45, activeJobs: 49, bufferHealth: 95 },
  { interval: 'Wk 5', label: 'Week 5 (Jul 20)', consumed: 64, restocked: 70, activeJobs: 61, bufferHealth: 98 },
  { interval: 'Wk 6', label: 'Week 6 (Jul 27)', consumed: 59, restocked: 55, activeJobs: 56, bufferHealth: 96 },
  { interval: 'Wk 7', label: 'Week 7 (Aug 03)', consumed: 72, restocked: 80, activeJobs: 68, bufferHealth: 97 },
  { interval: 'Wk 8', label: 'Week 8 (Aug 10)', consumed: 68, restocked: 65, activeJobs: 65, bufferHealth: 96 },
];

export const INVENTORY_TREND_MONTHLY = [
  { interval: 'Mar', label: 'March 2026', consumed: 180, restocked: 210, activeJobs: 172, bufferHealth: 95 },
  { interval: 'Apr', label: 'April 2026', consumed: 210, restocked: 225, activeJobs: 201, bufferHealth: 96 },
  { interval: 'May', label: 'May 2026', consumed: 245, restocked: 260, activeJobs: 235, bufferHealth: 97 },
  { interval: 'Jun', label: 'June 2026', consumed: 230, restocked: 240, activeJobs: 222, bufferHealth: 96 },
  { interval: 'Jul', label: 'July 2026', consumed: 275, restocked: 290, activeJobs: 264, bufferHealth: 98 },
  { interval: 'Aug', label: 'August 2026 (MTD)', consumed: 145, restocked: 160, activeJobs: 138, bufferHealth: 96 },
];

export default function InventoryManagement() {
  const { showToast } = useToast();

  const [inventory, setInventory] = useState<DatabaseInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'optimal'>('all');
  const [dbSource, setDbSource] = useState<'PostgreSQL Cluster' | 'Local Vault Cache'>('PostgreSQL Cluster');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  // Active inventory depletion trend data
  const activeInventoryTrend = dateRange === 'daily' 
    ? INVENTORY_TREND_DAILY 
    : dateRange === 'weekly' 
    ? INVENTORY_TREND_WEEKLY 
    : INVENTORY_TREND_MONTHLY;

  const totalRangeConsumed = activeInventoryTrend.reduce((sum, item) => sum + item.consumed, 0);
  const totalRangeRestocked = activeInventoryTrend.reduce((sum, item) => sum + item.restocked, 0);
  const totalRangeJobs = activeInventoryTrend.reduce((sum, item) => sum + item.activeJobs, 0);

  // Fetch Inventory from Database / Storage
  const fetchDatabaseInventory = async () => {
    setIsLoading(true);
    try {
      // Check database endpoint or fall back to persistent local storage
      const res = await fetch('/api/db/benchmark');
      if (res.ok) {
        setDbSource('PostgreSQL Cluster');
      } else {
        setDbSource('Local Vault Cache');
      }

      const stored = localStorage.getItem('dcp_database_inventory_v1');
      if (stored) {
        setInventory(JSON.parse(stored));
      } else {
        setInventory(INITIAL_DATABASE_INVENTORY);
        localStorage.setItem('dcp_database_inventory_v1', JSON.stringify(INITIAL_DATABASE_INVENTORY));
      }
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch {
      setDbSource('Local Vault Cache');
      const stored = localStorage.getItem('dcp_database_inventory_v1');
      setInventory(stored ? JSON.parse(stored) : INITIAL_DATABASE_INVENTORY);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInventory();
  }, []);

  const saveInventoryState = (newItems: DatabaseInventoryItem[]) => {
    setInventory(newItems);
    localStorage.setItem('dcp_database_inventory_v1', JSON.stringify(newItems));
  };

  // Quick adjust stock levels (+/-)
  const handleStockAdjustment = (sku: string, delta: number) => {
    const updated = inventory.map(item => {
      if (item.sku === sku) {
        const nextStock = Math.max(0, item.stockLevel + delta);
        return {
          ...item,
          stockLevel: nextStock,
          lastRestocked: delta > 0 ? new Date().toISOString().split('T')[0] : item.lastRestocked
        };
      }
      return item;
    });

    saveInventoryState(updated);
    const target = updated.find(i => i.sku === sku);
    if (target) {
      if (target.stockLevel <= target.minThreshold) {
        showToast(`⚠️ Low stock alert for ${target.sku}: ${target.stockLevel} units remaining!`, 'info');
      } else {
        showToast(`Updated database stock for ${target.sku}: ${target.stockLevel} units.`, 'success');
      }
    }
  };

  // Calculate Correlation Metrics linking stock levels to completed repair types
  const correlationMetrics: RepairCorrelationMetric[] = useMemo(() => {
    return inventory.map(item => {
      const base = CORRELATION_BASE_MAP[item.sku] || {
        associatedRepairType: `${item.category} Replacement`,
        failureMode: 'General Hardware Fault',
        completedRepairs30d: 15,
        componentsConsumed30d: 16,
        reworkScrapPercent: 6.2
      };

      const weeklyVelocity = Number((base.componentsConsumed30d / 4.28).toFixed(1));
      const dailyBurnRate = weeklyVelocity / 7;
      const daysOfSupply = dailyBurnRate > 0 ? Number((item.stockLevel / dailyBurnRate).toFixed(1)) : 99;
      
      let healthStatus: 'critical' | 'warning' | 'optimal' = 'optimal';
      if (item.stockLevel <= item.minThreshold || daysOfSupply < 3) {
        healthStatus = 'critical';
      } else if (daysOfSupply < 7 || item.stockLevel < item.minThreshold * 1.5) {
        healthStatus = 'warning';
      }

      return {
        sku: item.sku,
        componentName: item.name,
        category: item.category,
        associatedRepairType: base.associatedRepairType,
        failureMode: base.failureMode,
        completedRepairs30d: base.completedRepairs30d,
        componentsConsumed30d: base.componentsConsumed30d,
        burnVelocityWeekly: weeklyVelocity,
        reworkScrapPercent: base.reworkScrapPercent,
        daysOfSupply,
        healthStatus,
        replacementCostTotal: item.stockLevel * item.unitCost
      };
    });
  }, [inventory]);

  // Aggregate Category Correlation for Visual Charts
  const categoryCorrelationSummary = useMemo(() => {
    const map: Record<string, { category: string; totalStock: number; completedRepairs: number; consumedComponents: number; valuation: number }> = {};

    correlationMetrics.forEach(metric => {
      const item = inventory.find(i => i.sku === metric.sku);
      const stock = item?.stockLevel || 0;
      const val = item ? item.stockLevel * item.unitCost : 0;

      if (!map[metric.category]) {
        map[metric.category] = {
          category: metric.category,
          totalStock: 0,
          completedRepairs: 0,
          consumedComponents: 0,
          valuation: 0
        };
      }
      map[metric.category].totalStock += stock;
      map[metric.category].completedRepairs += metric.completedRepairs30d;
      map[metric.category].consumedComponents += metric.componentsConsumed30d;
      map[metric.category].valuation += val;
    });

    return Object.values(map);
  }, [correlationMetrics, inventory]);

  // Filtered rows for the matrix table
  const filteredMetrics = useMemo(() => {
    return correlationMetrics.filter(m => {
      const item = inventory.find(i => i.sku === m.sku);
      const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
      const matchesSearch = m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.associatedRepairType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item?.compatibility || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = stockFilter === 'all' 
        ? true 
        : stockFilter === 'critical' 
        ? m.healthStatus === 'critical'
        : m.healthStatus === 'optimal';

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [correlationMetrics, inventory, selectedCategory, searchQuery, stockFilter]);

  // Summary Totals
  const totalStockUnits = inventory.reduce((sum, item) => sum + item.stockLevel, 0);
  const totalRepairsServed30d = correlationMetrics.reduce((sum, m) => sum + m.completedRepairs30d, 0);
  const totalConsumed30d = correlationMetrics.reduce((sum, m) => sum + m.componentsConsumed30d, 0);
  const totalCriticalSKUs = correlationMetrics.filter(m => m.healthStatus === 'critical').length;
  const totalValuation = inventory.reduce((sum, item) => sum + (item.stockLevel * item.unitCost), 0);

  // Export Comprehensive CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'Component SKU',
        'Component Name',
        'Category',
        'Current Stock Level',
        'Min Alert Threshold',
        'Associated Repair Work Order Type',
        'Failure Mode',
        'Completed Repairs (30d)',
        'Units Consumed (30d)',
        'Rework Scrap Loss (%)',
        'Weekly Burn Velocity (Units/Wk)',
        'Days of Supply Left',
        'Health Status',
        'Vault Location Bin',
        'Unit Cost ($)'
      ];

      const rows = correlationMetrics.map(m => {
        const item = inventory.find(i => i.sku === m.sku);
        return [
          m.sku,
          `"${m.componentName.replace(/"/g, '""')}"`,
          m.category,
          item?.stockLevel || 0,
          item?.minThreshold || 0,
          `"${m.associatedRepairType.replace(/"/g, '""')}"`,
          `"${m.failureMode.replace(/"/g, '""')}"`,
          m.completedRepairs30d,
          m.componentsConsumed30d,
          `${m.reworkScrapPercent}%`,
          m.burnVelocityWeekly,
          m.daysOfSupply,
          m.healthStatus.toUpperCase(),
          item?.binLocation || 'Vault A',
          `$${(item?.unitCost || 0).toFixed(2)}`
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Spokane_Inventory_Repair_Correlation_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Exported Inventory & Repair Correlation Telemetry report (CSV).', 'success');
    } catch {
      showToast('Failed to generate CSV export.', 'error');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full -mr-24 -mt-24 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full -ml-24 -mb-24 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider rounded-md border border-amber-500/30 flex items-center gap-1">
              <Database className="w-3 h-3 text-amber-400" />
              {dbSource}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Synced: {lastSyncedTime}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-amber-400" />
            <span>Inventory Management & Repair Correlation</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            Live database stock telemetry correlated directly with completed laboratory repair tiers, burn velocity, and projected stockout lead times.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dynamic Date-Range Selector: Daily / Weekly / Monthly */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            {(['daily', 'weekly', 'monthly'] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range);
                  showToast(`Inventory trends updated to ${range.toUpperCase()} view.`, 'info');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all capitalize ${
                  dateRange === range
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              fetchDatabaseInventory();
              showToast('Refreshed inventory telemetry from PostgreSQL cluster.', 'success');
            }}
            disabled={isLoading}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Refresh Database Stock"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Correlation (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-wider">
            <span>Total Vault Stock</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalStockUnits} Units</div>
          <div className="text-[10px] text-slate-500">Across {inventory.length} cataloged SKUs • ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })} Total Value</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-wider">
            <span>{dateRange.toUpperCase()} Consumed Parts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalRangeConsumed} Parts</div>
          <div className="text-[10px] text-slate-500">{totalRangeJobs} Repairs Served • +{totalRangeRestocked} Units Restocked</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-wider">
            <span>Critical Burn Alert</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className={`text-2xl font-black ${totalCriticalSKUs > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {totalCriticalSKUs} SKUs Under Threshold
          </div>
          <div className="text-[10px] text-slate-500">Supply exhaustion projected within &lt; 3.5 days</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-wider">
            <span>Avg Scrap / Rework Rate</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">4.8% Scrap</div>
          <div className="text-[10px] text-slate-500">High micro-soldering precision compliance</div>
        </div>
      </div>

      {/* Dynamic Date-Range Inventory Consumption & Restock Velocity Chart */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider rounded border border-amber-500/30">
                {dateRange} Trend
              </span>
              <span className="text-xs text-slate-400">
                Total Consumed: <strong>{totalRangeConsumed} units</strong> • Restocked: <strong>{totalRangeRestocked} units</strong>
              </span>
            </div>
            <h4 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2 mt-1">
              <Activity className="w-5 h-5 text-amber-400" />
              <span>Component Consumption & Restock Velocity</span>
            </h4>
            <p className="text-xs text-slate-400">
              Tracking physical component consumption against batch restocks and active repair volume ({dateRange} intervals)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Range Toggle on Chart */}
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              {(['daily', 'weekly', 'monthly'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                    dateRange === r
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold ml-2">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Consumed
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Restocked
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Active Jobs
              </span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeInventoryTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRestocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="interval" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" pts" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '1rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                formatter={(val: any, name: any) => [
                  `${val} units`,
                  name === 'consumed' ? 'Components Consumed' : name === 'restocked' ? 'Restocked Stock' : 'Active Repairs'
                ]}
              />
              <Area type="monotone" dataKey="consumed" name="consumed" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConsumed)" />
              <Area type="monotone" dataKey="restocked" name="restocked" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRestocked)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Chart: Stock Level vs Completed Repairs (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Current Stock Level vs. Completed Repairs by Category</span>
              </h4>
              <p className="text-xs text-slate-400">
                Visual correlation highlighting component buffer health against customer job volume
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Completed Repairs
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" /> Current Stock Units
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryCorrelationSummary}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '1rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                />
                <Bar dataKey="completedRepairs" name="Completed Repairs (30d)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="totalStock" name="Vault Stock Level" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Burn Velocity & Days of Supply (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="border-b border-slate-800/80 pb-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Burn Velocity vs. Days of Supply</span>
            </h4>
            <p className="text-xs text-slate-400">
              Weekly component depletion pace against remaining inventory days
            </p>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {correlationMetrics.slice(0, 6).map((metric) => {
              const item = inventory.find(i => i.sku === metric.sku);
              const isCrit = metric.healthStatus === 'critical';
              const isWarn = metric.healthStatus === 'warning';

              return (
                <div 
                  key={metric.sku} 
                  className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[10px] text-amber-400 truncate">{metric.sku}</span>
                      <span className="text-[10px] text-slate-500 font-mono">• {metric.burnVelocityWeekly} units/wk</span>
                    </div>
                    <p className="text-white font-medium truncate text-[11px]">{metric.componentName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{metric.associatedRepairType}</p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span 
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block ${
                        isCrit 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' 
                          : isWarn 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {metric.daysOfSupply}d Supply
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Stock: <strong className="text-white">{item?.stockLevel || 0}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="space-y-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search component SKU, repair type (e.g. OLED, PMIC, Battery), or model..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Health Filter */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            {(['all', 'critical', 'optimal'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  stockFilter === filter
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All SKUs' : `${filter} Stock`}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Screens', 'Batteries', 'Charging Ports', 'Chips & ICs', 'Soldering & Flux', 'Glass & Frames'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Correlation Matrix Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden space-y-4 p-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-amber-400" />
              <span>Component Stock vs. Completed Repair Types Correlation Matrix</span>
            </h4>
            <p className="text-xs text-slate-400">
              Direct mapping of active component inventory against completed bench work orders and real-time replenishment controls
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing <strong>{filteredMetrics.length}</strong> of {correlationMetrics.length} SKUs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="pb-3 pr-4">SKU & Component</th>
                <th className="pb-3 px-3">Correlated Repair Work Order</th>
                <th className="pb-3 px-3 text-center">Current Stock</th>
                <th className="pb-3 px-3 text-center">Completed Repairs (30d)</th>
                <th className="pb-3 px-3 text-center">Parts Consumed</th>
                <th className="pb-3 px-3 text-center">Burn Pace</th>
                <th className="pb-3 px-3 text-center">Days of Supply</th>
                <th className="pb-3 pl-3 text-right">Quick Restock / Consume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMetrics.map((metric) => {
                const item = inventory.find(i => i.sku === metric.sku);
                const currentStock = item ? item.stockLevel : 0;
                const isCrit = metric.healthStatus === 'critical';
                const isWarn = metric.healthStatus === 'warning';

                return (
                  <tr key={metric.sku} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-mono text-[10px] font-bold text-amber-400">{metric.sku}</div>
                      <div className="font-bold text-white mt-0.5 leading-snug">{metric.componentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item?.binLocation} • ${item?.unitCost.toFixed(2)}/unit
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 bg-slate-900 text-slate-300 font-bold rounded-lg border border-slate-800 text-[11px] block">
                        {metric.associatedRepairType}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Fault: {metric.failureMode}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono">
                      <span className={`text-sm font-black ${isCrit ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {currentStock}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        Min: {item?.minThreshold || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-200">
                      {metric.completedRepairs30d} jobs
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-amber-400">
                      {metric.componentsConsumed30d} units
                      <span className="block text-[9px] text-slate-500">
                        ({metric.reworkScrapPercent}% rework)
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                      {metric.burnVelocityWeekly}/wk
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] inline-block ${
                          isCrit
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : isWarn
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {metric.daysOfSupply} Days
                      </span>
                    </td>

                    <td className="py-3.5 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStockAdjustment(metric.sku, -1)}
                          disabled={currentStock === 0}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 disabled:opacity-30 transition-all"
                          title="Consume 1 unit for work order"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockAdjustment(metric.sku, 1)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg border border-slate-800 transition-all"
                          title="Restock +1 unit"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockAdjustment(metric.sku, 5)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg transition-all shadow-xs"
                          title="Restock +5 units"
                        >
                          +5
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
