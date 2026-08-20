"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Instagram, Twitter, Linkedin } from 'lucide-react';
import A11yInspector from './A11yInspector.tsx';

const SERVICE_MAP = [
  { href: '/', label: 'Store' },
  { href: '/enterprise', label: 'Federal & Enterprise Hub' },
  { href: '/intake', label: 'Intake' },
  { href: '/booking', label: 'Book Drop-Off' },
  { href: '/analytics', label: 'Repair Telemetry' },
  { href: '/academy', label: 'Repair Academy' },
  { href: '/blueprint', label: 'Master Blueprint' },
  { href: '/support', label: 'Support' },
  { href: '/about', label: 'Protocol' },
];

export function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="bg-white border-t border-slate-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xl font-playfair font-black text-slate-900">D&CP LLC</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
              Premier Tier 3 electronics restoration laboratory specializing in complex micro-soldering and logic board triage. Spokane's home for Right to Repair.
            </p>
            <div className="flex gap-4">
              <button aria-label="Follow D&CP LLC on Instagram" className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all focus:ring-2 focus:ring-slate-900">
                <Instagram className="w-5 h-5" />
              </button>
              <button aria-label="Follow D&CP LLC on Twitter" className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all focus:ring-2 focus:ring-slate-900">
                <Twitter className="w-5 h-5" />
              </button>
              <button aria-label="Follow D&CP LLC on LinkedIn" className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all focus:ring-2 focus:ring-slate-900">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Service Map</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              {SERVICE_MAP.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-slate-900 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Laboratory Info</h4>
            <div className="space-y-4 text-sm font-bold text-slate-400">
              <p>Spokane, WA 99201</p>
              <p>(509) 555-0123</p>
              <p>Mon - Fri: 9AM - 6PM</p>
              <p className="text-blue-600">triage@dcp-llc.com</p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p>© 2026 D&CP LLC. All Rights Reserved.</p>
            <A11yInspector activeTab={pathname ?? undefined} />
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-900 cursor-pointer">WA RCW 19.415 Disclosure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
