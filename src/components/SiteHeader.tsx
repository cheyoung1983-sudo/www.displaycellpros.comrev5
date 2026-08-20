"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Smartphone,
  Microscope,
  Info,
  ShieldCheck,
  Search,
  Activity,
  Calculator,
  MessageSquare,
  Award,
  GraduationCap,
  Calendar,
  BarChart3,
  Cpu,
  Terminal,
  Mic,
  Workflow,
  Sliders,
  Bot,
  FileCode,
  Sparkles,
  Key,
  Database,
} from 'lucide-react';
import Auth0UserButton from './Auth0UserButton.tsx';
import OfflineStatusBanner from './OfflineStatusBanner.tsx';
import LocalLabBanner from './LocalLabBanner.tsx';

export const NAV_ITEMS = [
  { href: '/', label: 'Laboratory Store', icon: Smartphone },
  { href: '/enterprise', label: 'Federal & Enterprise Hub', icon: Award },
  { href: '/intake', label: 'Device Intake', icon: Microscope },
  { href: '/hardware-diagnostics', label: 'Hardware Diag Port', icon: Terminal },
  { href: '/voice-ai/studio', label: 'Voice AI Studio', icon: Mic },
  { href: '/voice-ai/procedures', label: 'AI Procedures', icon: Workflow },
  { href: '/voice-ai/conversation-flow', label: 'Conversation Flow', icon: Sliders },
  { href: '/voice-ai/dictionaries', label: 'Voice & Dictionaries', icon: Sparkles },
  { href: '/voice-ai/v2c-hub', label: 'V2C Agent Hub', icon: Bot },
  { href: '/voice-ai/agent-inspector', label: 'Agent Config Inspector', icon: FileCode },
  { href: '/auth0-flows', label: 'Auth0 Flows', icon: Key },
  { href: '/voice-ai/knowledge-base', label: 'Knowledge Base & Tools', icon: Database },
  { href: '/board-database', label: 'Board Database', icon: Cpu },
  { href: '/booking', label: 'Book Drop-Off', icon: Calendar },
  { href: '/price-guide', label: 'Price Guide', icon: Calculator },
  { href: '/repair-status', label: 'Repair Status', icon: Activity },
  { href: '/analytics', label: 'Telemetry & Analytics', icon: BarChart3 },
  { href: '/academy', label: 'Repair Academy', icon: GraduationCap },
  { href: '/blueprint', label: 'Company Blueprint', icon: ShieldCheck },
  { href: '/support', label: 'Lab Support', icon: MessageSquare },
  { href: '/about', label: 'Engineering Protocol', icon: Info },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <OfflineStatusBanner />
      <LocalLabBanner onBookDropOff={() => router.push('/booking')} />
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group cursor-pointer">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-playfair font-black text-slate-900 block leading-none">D&CP LLC</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Spokane • WA</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl overflow-x-auto max-w-3xl">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/repair-status"
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Query Repair Status"
          >
            <Search className="w-5 h-5" />
            <span>Tracker</span>
          </Link>
          <div className="w-px h-6 bg-slate-200" />
          <Link
            href="/intake"
            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
          >
            Start Intake
          </Link>
          <div className="w-px h-6 bg-slate-200" />
          <Auth0UserButton />
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <Auth0UserButton />
          <button
            type="button"
            className="p-2"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 md:hidden space-y-4 max-h-[70vh] overflow-y-auto"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold ${isActive ? 'bg-slate-50 text-slate-900' : 'text-slate-400'}`}
                >
                  {item.label}
                  <item.icon className="w-5 h-5" />
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
