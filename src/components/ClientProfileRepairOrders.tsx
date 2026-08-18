/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Client Profile & Repair Orders History View
 * Allows logged-in customers to view all current & historical repair orders
 * with an itemized summary of total repair costs and lifetime savings.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ExternalLink, 
  Wrench, 
  Smartphone, 
  Cpu, 
  RotateCw, 
  ArrowUpRight, 
  Receipt, 
  Calendar, 
  Layers, 
  Sparkles, 
  LogIn, 
  LogOut,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  Activity,
  Shield,
  CreditCard,
  Hash
} from 'lucide-react';
import { useSafeAuth0 } from './Auth0ProviderWithConfig.tsx';
import { useToast } from './Toast.tsx';
import { useDatabase } from '../lib/db.ts';
import { calculateDynamicCompletionDate } from '../utils/completionCalculator.ts';

export interface RepairOrderCost {
  partsCost: number;
  laborCost: number;
  diagnosticFee: number;
  expeditedFee?: number;
  subtotal: number;
  waTaxRate: number;
  taxAmount: number;
  totalCost: number;
  replacementSavingEstimate: number;
}

export interface ClientRepairOrder {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  deviceManufacturer: string;
  deviceModel: string;
  serviceTier: string;
  serviceCategory: string;
  status: 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  statusLabel: string;
  currentStage: number; // 1 to 4
  stageName: string;
  intakeDate: string;
  estimatedCompletionDate: string;
  completedDate: string | null;
  deliveredDate: string | null;
  assignedTech: string;
  benchLocation: string;
  issueDescription: string;
  serviceNotes: string;
  costs: RepairOrderCost;
  paymentStatus: 'paid' | 'invoiced' | 'warranty_covered';
  paymentMethod: string;
  paymentDate?: string;
  invoiceNumber: string;
  warranty: {
    status: 'active' | 'expired' | 'pending_completion';
    durationMonths: number;
    coverageType: string;
    expiresDate: string;
    daysRemaining: number;
  };
  telemetry?: {
    batteryHealthPercentage: number;
    batteryTempCelsius: number;
    ammeterDrawAmps: number;
    isShortToGround: boolean;
  };
}

export interface ClientProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  accountTier: string;
  accountBadge: string;
  totalOrdersCount: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
}

export interface CostSummaryMetrics {
  totalRepairCosts: number;
  activeRepairCosts: number;
  completedRepairCosts: number;
  totalPartsCosts: number;
  totalLaborCosts: number;
  totalReplacementSavings: number;
  netValueRetained: number;
  averageRepairCost: number;
  activeWarrantiesCount: number;
  totalOrdersCount: number;
  activeCount: number;
  completedCount: number;
}

interface ClientProfileRepairOrdersProps {
  onSelectTicket?: (ticketNumber: string) => void;
  onNavigateToIntake?: () => void;
}

const getDeviceThumbnail = (deviceModel: string): string => {
  const lower = deviceModel.toLowerCase();
  if (lower.includes('iphone 15') || lower.includes('iphone 14') || lower.includes('iphone') || lower.includes('pro max')) {
    return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=400&auto=format&fit=crop';
  }
  if (lower.includes('galaxy') || lower.includes('samsung') || lower.includes('ultra')) {
    return 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=400&auto=format&fit=crop';
  }
  if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('pro')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop';
  }
  if (lower.includes('ipad') || lower.includes('tablet')) {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop';
  }
  if (lower.includes('steam deck') || lower.includes('rog ally') || lower.includes('console')) {
    return 'https://images.unsplash.com/photo-1612287233202-b51b36619dfc?q=80&w=400&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop';
};

export default function ClientProfileRepairOrders({
  onSelectTicket,
  onNavigateToIntake
}: ClientProfileRepairOrdersProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading, loginWithRedirect, logout } = useSafeAuth0();
  const { showToast } = useToast();
  const { entries: localIntakeEntries } = useDatabase();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [orders, setOrders] = useState<ClientRepairOrder[]>([]);
  const [summary, setSummary] = useState<CostSummaryMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'warranty'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_cost' | 'lowest_cost'>('newest');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<ClientRepairOrder | null>(null);
  const [activeTabSubView, setActiveTabSubView] = useState<'orders' | 'cost_analytics'>('orders');

  // Customer email resolution: prefer logged-in Auth0 user email, fallback to default profile
  const resolvedEmail = useMemo(() => {
    return user?.email || 'cheyoung1983@gmail.com';
  }, [user]);

  const resolvedName = useMemo(() => {
    return user?.name || user?.nickname || 'Che Young';
  }, [user]);

  // Fetch client orders & cost summary
  const fetchClientProfileOrders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        email: resolvedEmail,
        name: resolvedName,
      });

      const res = await fetch(`/api/client/orders?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        let serverOrders: ClientRepairOrder[] = data.orders || [];

        // Harmonize with local offline intakes if any exist
        if (localIntakeEntries && localIntakeEntries.length > 0) {
          const localFormatted: ClientRepairOrder[] = localIntakeEntries.map((entry, idx) => {
            const isDone = entry.status === 'synced';
            const baseCost = entry.serviceTier?.includes('3') ? 320 : entry.serviceTier?.includes('2') ? 290 : 110;
            return {
              id: `local_${entry.id}`,
              ticketNumber: entry.remoteDraftOrderId?.replace(/\D/g, '').slice(-4) 
                ? `DCP-${entry.remoteDraftOrderId.replace(/\D/g, '').slice(-4)}` 
                : `DCP-LOC${idx + 1}`,
              customerName: entry.customerName || resolvedName,
              customerEmail: entry.customerEmail || resolvedEmail,
              deviceManufacturer: String(entry.deviceManufacturer || 'Apple'),
              deviceModel: entry.deviceModel || 'Client Intake Device',
              serviceTier: String(entry.serviceTier || 'Tier 2 (Display Renewal)'),
              serviceCategory: 'Hardware Diagnostics & Repair',
              status: isDone ? 'completed' : 'in_progress',
              statusLabel: isDone ? 'Completed & Synchronized' : 'Draft / Offline Staged',
              currentStage: isDone ? 4 : 1,
              stageName: isDone ? 'Quality Assurance' : 'Triage Diagnostic',
              intakeDate: entry.createdAt || new Date().toISOString(),
              estimatedCompletionDate: isDone ? 'Completed (Ready for Pickup)' : `${calculateDynamicCompletionDate({ deviceModel: entry.deviceModel || 'Client Device', serviceTier: String(entry.serviceTier || 'Tier 2'), currentStage: isDone ? 4 : 1, intakeDate: new Date(entry.createdAt || Date.now()) }).formattedDate} at ${calculateDynamicCompletionDate({ deviceModel: entry.deviceModel || 'Client Device', serviceTier: String(entry.serviceTier || 'Tier 2'), currentStage: isDone ? 4 : 1, intakeDate: new Date(entry.createdAt || Date.now()) }).formattedTime} (${calculateDynamicCompletionDate({ deviceModel: entry.deviceModel || 'Client Device', serviceTier: String(entry.serviceTier || 'Tier 2'), currentStage: isDone ? 4 : 1, intakeDate: new Date(entry.createdAt || Date.now()) }).humanizedCountdown})`,
              completedDate: isDone ? entry.updatedAt : null,
              deliveredDate: null,
              assignedTech: 'Spokane Bench Technician',
              benchLocation: 'Offline Local Cache',
              issueDescription: entry.customerReportedIssue || 'Diagnostic triage logged offline.',
              serviceNotes: 'Intake preserved in local offline storage engine.',
              costs: {
                partsCost: Number((baseCost * 0.4).toFixed(2)),
                laborCost: Number((baseCost * 0.5).toFixed(2)),
                diagnosticFee: 0,
                subtotal: baseCost,
                waTaxRate: 0.091,
                taxAmount: Number((baseCost * 0.091).toFixed(2)),
                totalCost: Number((baseCost * 1.091).toFixed(2)),
                replacementSavingEstimate: baseCost * 4,
              },
              paymentStatus: 'paid',
              paymentMethod: 'In-Store / Direct Invoice',
              invoiceNumber: `INV-LOC-${idx + 100}`,
              warranty: {
                status: isDone ? 'active' : 'pending_completion',
                durationMonths: 12,
                coverageType: '1-Year Laboratory Hardware Guarantee',
                expiresDate: '2027-08-15',
                daysRemaining: 365,
              },
              telemetry: entry.telemetry ? {
                batteryHealthPercentage: entry.telemetry.batteryHealthPercentage || 92,
                batteryTempCelsius: entry.telemetry.batteryTempCelsius || 29,
                ammeterDrawAmps: entry.telemetry.ammeterDrawAmps || 1.2,
                isShortToGround: !!entry.telemetry.isShortToGround,
              } : undefined,
            };
          });

          // Prepend local items if not already present
          const existingTickets = new Set(serverOrders.map(o => o.ticketNumber));
          const uniqueLocals = localFormatted.filter(l => !existingTickets.has(l.ticketNumber));
          serverOrders = [...uniqueLocals, ...serverOrders];
        }

        setOrders(serverOrders);
        setProfile(data.client);

        // Recalculate dynamic summary
        const totalRepairCosts = serverOrders.reduce((acc, o) => acc + o.costs.totalCost, 0);
        const activeOrders = serverOrders.filter(o => o.status === 'in_progress');
        const completedOrders = serverOrders.filter(o => o.status === 'completed');
        const activeRepairCosts = activeOrders.reduce((acc, o) => acc + o.costs.totalCost, 0);
        const completedRepairCosts = completedOrders.reduce((acc, o) => acc + o.costs.totalCost, 0);
        const totalPartsCosts = serverOrders.reduce((acc, o) => acc + o.costs.partsCost, 0);
        const totalLaborCosts = serverOrders.reduce((acc, o) => acc + o.costs.laborCost, 0);
        const totalReplacementSavings = serverOrders.reduce((acc, o) => acc + o.costs.replacementSavingEstimate, 0);
        const activeWarranties = serverOrders.filter(o => o.warranty.status === 'active').length;

        setSummary({
          totalRepairCosts: Number(totalRepairCosts.toFixed(2)),
          activeRepairCosts: Number(activeRepairCosts.toFixed(2)),
          completedRepairCosts: Number(completedRepairCosts.toFixed(2)),
          totalPartsCosts: Number(totalPartsCosts.toFixed(2)),
          totalLaborCosts: Number(totalLaborCosts.toFixed(2)),
          totalReplacementSavings: Number(totalReplacementSavings.toFixed(2)),
          netValueRetained: Number((totalReplacementSavings - totalRepairCosts).toFixed(2)),
          averageRepairCost: Number((totalRepairCosts / Math.max(serverOrders.length, 1)).toFixed(2)),
          activeWarrantiesCount: activeWarranties,
          totalOrdersCount: serverOrders.length,
          activeCount: activeOrders.length,
          completedCount: completedOrders.length,
        });
      }
    } catch (err) {
      console.error('Failed to load client profile orders:', err);
      showToast('Error synchronizing client repair orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientProfileOrders();
  }, [resolvedEmail, resolvedName, localIntakeEntries?.length]);

  // Filtered and sorted orders list
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch = 
        order.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.issueDescription.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'in_progress') return order.status === 'in_progress';
      if (statusFilter === 'completed') return order.status === 'completed' || order.status === 'delivered';
      if (statusFilter === 'warranty') return order.warranty.status === 'active';

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.intakeDate).getTime() - new Date(a.intakeDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.intakeDate).getTime() - new Date(b.intakeDate).getTime();
      }
      if (sortBy === 'highest_cost') {
        return b.costs.totalCost - a.costs.totalCost;
      }
      if (sortBy === 'lowest_cost') {
        return a.costs.totalCost - b.costs.totalCost;
      }
      return 0;
    });
  }, [orders, searchQuery, statusFilter, sortBy]);

  const repairTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const cat = o.serviceCategory || 'General Service';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({
      name,
      value: counts[name],
    }));
  }, [orders]);

  const CHART_COLORS = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Export orders summary as CSV
  const handleExportCsv = () => {
    if (orders.length === 0) return;
    const headers = ['Ticket Number', 'Device Model', 'Service Tier', 'Status', 'Intake Date', 'Parts Cost', 'Labor Cost', 'Total Cost ($)', 'Warranty Days Remaining', 'Payment Status'];
    const rows = orders.map((o) => [
      `"${o.ticketNumber}"`,
      `"${o.deviceModel}"`,
      `"${o.serviceTier}"`,
      `"${o.statusLabel}"`,
      `"${new Date(o.intakeDate).toLocaleDateString()}"`,
      o.costs.partsCost.toFixed(2),
      o.costs.laborCost.toFixed(2),
      o.costs.totalCost.toFixed(2),
      o.warranty.daysRemaining,
      `"${o.paymentStatus}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dcp_client_repairs_${resolvedEmail.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported repair orders CSV summary.', 'success');
  };

  // Print summary statement
  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-10">
      {/* 1. Client Identity & Profile Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-800 relative overflow-hidden"
      >
        {/* Background circuit glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Client Details */}
          <div className="flex items-start sm:items-center gap-5">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={resolvedName} 
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-3xl object-cover border-2 border-blue-500/40 shadow-xl shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0">
                {resolvedName[0]?.toUpperCase() || 'C'}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-2xl sm:text-3xl font-playfair font-black text-white">
                  {resolvedName}
                </h3>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  {profile?.accountTier || 'Premier Priority Fleet'}
                </span>
                {isAuthenticated && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-mono font-bold">
                    Auth0 Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{resolvedEmail}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{profile?.phone || '(509) 555-0194'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{profile?.location || 'Spokane, WA'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToIntake && (
              <button
                onClick={onNavigateToIntake}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95"
              >
                <Wrench className="w-4 h-4" />
                <span>New Repair Intake</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Download CSV Statement"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handlePrintSummary}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all"
              title="Print Summary Statement"
            >
              <Printer className="w-4 h-4 text-slate-300" />
            </button>

            <button
              onClick={fetchClientProfileOrders}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all"
              title="Refresh Orders & Telemetry"
            >
              <RotateCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Total Repair Cost & Lifetime Summary Cards */}
      {summary && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Repair Cost & Investment Summary
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive accounting across all laboratory tickets and historical restorations
              </p>
            </div>
            
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTabSubView('orders')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTabSubView === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Orders Grid
              </button>
              <button
                onClick={() => setActiveTabSubView('cost_analytics')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTabSubView === 'cost_analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cost Breakdown
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Lifetime Total Repair Spend */}
            <div className="bg-white border-2 border-blue-600/30 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                  Total Repair Spend
                </span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-playfair font-black text-slate-900">
                ${summary.totalRepairCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Parts: ${summary.totalPartsCosts.toFixed(2)}</span>
                <span>Labor: ${summary.totalLaborCosts.toFixed(2)}</span>
              </div>
            </div>

            {/* Active Repairs On Bench */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Active On Bench ({summary.activeCount})
                </span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-playfair font-black text-amber-600">
                ${summary.activeRepairCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                {summary.activeCount} active job{summary.activeCount === 1 ? '' : 's'} in progress
              </p>
            </div>

            {/* Completed Order Value */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Delivered Restorations
                </span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-playfair font-black text-emerald-600">
                ${summary.completedRepairCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                {summary.completedCount} unit{summary.completedCount === 1 ? '' : 's'} verified & delivered
              </p>
            </div>

            {/* Estimated Replacement Savings */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Replacement Value Saved
                </span>
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-playfair font-black text-emerald-400">
                ${summary.totalReplacementSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-300 font-medium pt-1 border-t border-slate-700">
                Net value retained: <span className="font-bold text-white">${summary.netValueRetained.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Cost Breakdown Analytics View (if toggled) */}
      {activeTabSubView === 'cost_analytics' && summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Itemized Cost & Component Allocation
            </h5>
            <span className="text-xs font-mono font-bold text-slate-500">
              Avg per repair: ${summary.averageRepairCost.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-black uppercase text-slate-400">OEM Parts & Donor ICs</div>
              <div className="text-2xl font-playfair font-black text-slate-900">
                ${summary.totalPartsCosts.toFixed(2)}
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (summary.totalPartsCosts / summary.totalRepairCosts) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {((summary.totalPartsCosts / summary.totalRepairCosts) * 100).toFixed(1)}% of total repair budget
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-black uppercase text-slate-400">Precision Micro-Soldering Labor</div>
              <div className="text-2xl font-playfair font-black text-slate-900">
                ${summary.totalLaborCosts.toFixed(2)}
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (summary.totalLaborCosts / summary.totalRepairCosts) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {((summary.totalLaborCosts / summary.totalRepairCosts) * 100).toFixed(1)}% of total repair budget
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-black uppercase text-slate-400">Active Lab Warranties</div>
              <div className="text-2xl font-playfair font-black text-emerald-600">
                {summary.activeWarrantiesCount} Protected Units
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-full" />
              </div>
              <p className="text-[11px] text-slate-500">
                Full 1-Year D&CP Hardware Guarantee active
              </p>
            </div>
          </div>

          {/* Repair Health & Types Breakdown Recharts Widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h6 className="font-bold text-slate-900 text-sm">Repair Health & Category Distribution</h6>
                  <p className="text-xs text-slate-500">Breakdown of restoration types across your service history</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-full">
                {orders.length} Total Units
              </span>
            </div>

            <div className="h-64 w-full">
              {repairTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repairTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {repairTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs font-medium">
                  No repair categories recorded yet.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Active & Historical Repair Orders List */}
      <div className="space-y-6">
        {/* Filters & Search Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900">
                  Repair Orders Filter & Sort
                </h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold rounded-full">
                  {filteredOrders.length} of {orders.length} shown
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Toggle between active bench jobs and completed restorations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[
                { id: 'all', label: 'All', count: orders.length },
                { id: 'in_progress', label: 'Active', count: orders.filter(o => o.status === 'in_progress').length },
                { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length },
                { id: 'warranty', label: 'Warranty', count: orders.filter(o => o.warranty.status === 'active').length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    statusFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    statusFilter === f.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
              >
                <option value="newest">Newest Intake Date</option>
                <option value="oldest">Oldest Intake Date</option>
                <option value="highest_cost">Highest Cost ($)</option>
                <option value="lowest_cost">Lowest Cost ($)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, model..."
                className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 w-40 sm:w-44"
              />
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="Download CSV Repair History"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Orders Card Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-slate-800 text-sm">No Repair Orders Match Your Filter</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search criteria or create a new repair intake for your device.
              </p>
            </div>
            {onNavigateToIntake && (
              <button
                onClick={onNavigateToIntake}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
              >
                Submit New Intake
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isActive = order.status === 'in_progress';
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white border rounded-3xl p-6 transition-all hover:shadow-md space-y-5 ${
                    isActive ? 'border-blue-200 ring-1 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shadow-xs shrink-0 bg-slate-100">
                        <img 
                          src={getDeviceThumbnail(order.deviceModel)} 
                          alt={order.deviceModel}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {order.ticketNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {order.statusLabel}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 mt-0.5">
                          {order.deviceModel}
                        </h4>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Total Repair Cost
                        </span>
                        <span className="text-xl font-playfair font-black text-slate-900">
                          ${order.costs.totalCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSelectTicket && (
                          <button
                            onClick={() => onSelectTicket(order.ticketNumber)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            title="Inspect Live Sensors & Hardware Feeds"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Live Tracker</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          title="View Invoice & Cost Details"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Service & Issue Description */}
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Service Scope & Reported Fault
                      </span>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {order.issueDescription}
                      </p>
                      {order.serviceNotes && (
                        <p className="text-slate-500 font-normal italic pt-1">
                          Technician Log: {order.serviceNotes}
                        </p>
                      )}
                    </div>

                    {/* Stage & Progress Status */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Lifecycle: Stage {order.currentStage} of 4</span>
                        <span className="text-blue-600 font-mono">{order.stageName}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                          style={{ width: `${(order.currentStage / 4) * 100}%` }}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 pt-1 gap-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Intake: {new Date(order.intakeDate).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>Est: {order.estimatedCompletionDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats & Cost Line Items */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1 font-medium">
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        <span>Parts: <strong className="text-slate-800">${order.costs.partsCost.toFixed(2)}</strong></span>
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        <span>Labor: <strong className="text-slate-800">${order.costs.laborCost.toFixed(2)}</strong></span>
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Warranty: <strong className="text-emerald-700">{order.warranty.daysRemaining} days left</strong></span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                        {order.invoiceNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Detailed Invoice & Order Modal */}
      <AnimatePresence>
        {selectedOrderForInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 border border-slate-100 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-blue-600">
                      {selectedOrderForInvoice.invoiceNumber}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">
                      {selectedOrderForInvoice.paymentStatus}
                    </span>
                  </div>
                  <h3 className="text-xl font-playfair font-black text-slate-900 mt-1">
                    Repair Statement & Invoice
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Invoice Summary Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer</span>
                  <span className="font-bold text-slate-900">{selectedOrderForInvoice.customerName}</span>
                  <span className="text-slate-500 block">{selectedOrderForInvoice.customerEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Device Unit</span>
                  <span className="font-bold text-slate-900">{selectedOrderForInvoice.deviceModel}</span>
                  <span className="text-slate-500 block">Ticket: {selectedOrderForInvoice.ticketNumber}</span>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Itemized Service Breakdown
                </span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-100 px-4 py-2 font-bold text-slate-600">
                    <span className="col-span-8">Description</span>
                    <span className="col-span-4 text-right">Amount ($)</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="grid grid-cols-12 px-4 py-2.5">
                      <span className="col-span-8 font-medium text-slate-800">
                        OEM Parts & Replacement Components ({selectedOrderForInvoice.serviceCategory})
                      </span>
                      <span className="col-span-4 text-right font-mono font-bold text-slate-900">
                        ${selectedOrderForInvoice.costs.partsCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2.5">
                      <span className="col-span-8 font-medium text-slate-800">
                        Precision Laboratory Labor & Micro-Soldering Rework
                      </span>
                      <span className="col-span-4 text-right font-mono font-bold text-slate-900">
                        ${selectedOrderForInvoice.costs.laborCost.toFixed(2)}
                      </span>
                    </div>
                    {selectedOrderForInvoice.costs.diagnosticFee > 0 && (
                      <div className="grid grid-cols-12 px-4 py-2.5">
                        <span className="col-span-8 font-medium text-slate-800">
                          Comprehensive Ultrasonic & Oscilloscope Diagnostics
                        </span>
                        <span className="col-span-4 text-right font-mono font-bold text-slate-900">
                          ${selectedOrderForInvoice.costs.diagnosticFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedOrderForInvoice.costs.expeditedFee ? (
                      <div className="grid grid-cols-12 px-4 py-2.5">
                        <span className="col-span-8 font-medium text-slate-800">
                          Expedited Bench Priority Service
                        </span>
                        <span className="col-span-4 text-right font-mono font-bold text-slate-900">
                          ${selectedOrderForInvoice.costs.expeditedFee.toFixed(2)}
                        </span>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50/50">
                      <span className="col-span-8 font-medium text-slate-600">Subtotal</span>
                      <span className="col-span-4 text-right font-mono text-slate-700">
                        ${selectedOrderForInvoice.costs.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50/50">
                      <span className="col-span-8 font-medium text-slate-600">
                        Washington State Sales Tax ({(selectedOrderForInvoice.costs.waTaxRate * 100).toFixed(1)}%)
                      </span>
                      <span className="col-span-4 text-right font-mono text-slate-700">
                        ${selectedOrderForInvoice.costs.taxAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-3 bg-slate-900 text-white font-bold text-sm">
                      <span className="col-span-8">Total Paid</span>
                      <span className="col-span-4 text-right font-mono text-emerald-400 font-black">
                        ${selectedOrderForInvoice.costs.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty Coverage Badge in Modal */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 block">
                      {selectedOrderForInvoice.warranty.coverageType}
                    </span>
                    <span className="text-emerald-700 text-[11px]">
                      Valid through {selectedOrderForInvoice.warranty.expiresDate} ({selectedOrderForInvoice.warranty.daysRemaining} days remaining)
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    const printUrl = window.location.href;
                    window.print();
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Receipt</span>
                </button>

                {onSelectTicket && (
                  <button
                    onClick={() => {
                      const tNum = selectedOrderForInvoice.ticketNumber;
                      setSelectedOrderForInvoice(null);
                      onSelectTicket(tNum);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Open in Live Tracker</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
