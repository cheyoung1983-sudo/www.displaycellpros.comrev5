"use client";

import React from 'react';
import { Wrench, ShieldCheck, Phone, MapPin, Clock, Wifi, Check } from 'lucide-react';

export function Footer() {
  return (
    <footer suppressHydrationWarning className="bg-slate-950 border-t border-slate-800 pt-12 pb-8 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="flex items-center mb-4">
              <Wrench className="h-6 w-6 text-blue-500 mr-2" />
              <span className="font-bold text-lg text-white">Display & Cell Pros LLC</span>
            </a>
            <p className="text-sm text-slate-400 mb-4 max-w-sm leading-relaxed">
              Spokane's premier mobile technical service laboratory. Combat-veteran owned, operating in strict compliance with Washington State's Right to Repair laws.
            </p>
            <div className="flex items-center text-sm text-slate-400 gap-2 font-medium">
              <ShieldCheck size={16} className="text-green-500"/> Fully Insured, Bonded & Certified
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-mono">Contact</h3>
            <ul className="space-y-2 text-sm text-slate-400" suppressHydrationWarning>
              <li className="flex items-center gap-2" suppressHydrationWarning>
                <Phone size={14}/>
                <a href="tel:5099036139" className="hover:text-blue-400 transition-colors" suppressHydrationWarning>
                  509-903-6139
                </a>
              </li>
              <li className="flex items-center gap-2"><MapPin size={14}/> Mobile Service: Spokane & Valley</li>
              <li className="flex items-center gap-2"><Clock size={14}/> Mon-Sat: 8am - 6pm</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-mono">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>WA UBI: 605 985 265</li>
              <li>NAICS: 811210</li>
              <li>
                <a href="#privacy" className="hover:text-blue-400 transition-colors">
                  Privacy & Data Policy
                </a>
              </li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Liability Waiver</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-850 pt-5 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Display & Cell Pros LLC. All rights reserved.
          </div>

          <div className="flex gap-4 items-center select-none font-mono text-[9.5px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              CLOUD HUB: CONNECTED
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
