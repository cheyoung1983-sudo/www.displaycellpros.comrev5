import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, Globe, ShieldCheck, Wrench, Cpu } from 'lucide-react';
import { OFFICE_LOCATIONS, SERVICES_DATA, FEDERAL_CREDENTIALS } from '../data/companyData';
import { OfficeLocation } from '../types';
import confetti from 'canvas-confetti';

interface ContactSectionProps {
  initialScopeSummary?: string;
  initialScope?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ initialScopeSummary, initialScope }) => {
  const [activeOffice, setActiveOffice] = useState<OfficeLocation>(OFFICE_LOCATIONS[0]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    serviceInterest: 'tier3-micro-soldering',
    message: initialScope || initialScopeSummary || '',
    dataSecureGuarantee: true,
    dispatchDate: '2026-10-01',
    dispatchTimeSlot: '09:00 AM - 12:00 PM (Morning Fleet Dispatch)',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);

  const handleIncrementDate = (days: number) => {
    const currentDate = new Date(formData.dispatchDate || '2026-10-01');
    currentDate.setDate(currentDate.getDate() + days);
    const minDate = new Date('2026-10-01');
    if (currentDate < minDate) {
      setFormData({ ...formData, dispatchDate: '2026-10-01' });
    } else {
      setFormData({ ...formData, dispatchDate: currentDate.toISOString().split('T')[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/repair-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.githubIssueUrl) {
          setGithubUrl(result.githubIssueUrl);
        }
        setIsSubmitted(true);
        
        // Trigger subtle success confetti flare
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b']
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          serviceInterest: 'tier3-micro-soldering',
          message: '',
          dataSecureGuarantee: true,
          dispatchDate: '2026-10-01',
          dispatchTimeSlot: '09:00 AM - 12:00 PM (Morning Fleet Dispatch)',
        });
      } else {
        console.error('Failed to submit form');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs font-bold text-cyan-300 uppercase tracking-widest">
            Dispatch & Repair Intake
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Dispatch On-Site Mobile Lab or Schedule Repair
          </h2>
          <p className="text-slate-400 text-base">
            Connect directly with Ryan Young (Founder & Lead Precision Engineer). Mobile lab dispatch available for Spokane & surrounding corporate/legal fleets.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Repair Dispatch Request Confirmed</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Thank you, <span className="text-cyan-400 font-semibold">{formData.name}</span>. Ryan Young will review your device ticket and contact <span className="text-white font-mono">{formData.email}</span> within 2 hours to confirm lab dispatch.
                </p>
                {githubUrl && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-2">Track your repair progress on our internal GitHub issue tracker:</p>
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 underline">
                      View Dispatch Ticket #{githubUrl.split('/').pop()}
                    </a>
                  </div>
                )}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Submit Additional Intake Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Contact / Client Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Medical Engineer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ryan@displaycellpros.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Organization / Fleet Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Inland Medical Center / Legal Fleet"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Required Service Category</label>
                    <select
                      value={formData.serviceInterest}
                      onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {SERVICES_DATA.map((s) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Device Symptoms / Repair Brief</label>
                  <textarea
                    rows={4}
                    placeholder="Describe device model, symptoms (e.g. liquid damage, no power, short circuit, crushed screen)..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* On-Site Mobile Lab Dispatch Schedule Starting Oct 1st */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" /> On-Site Mobile Lab Dispatch Schedule (Starts Oct 1, 2026)
                    </label>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      Incremental Scheduling
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-slate-300">Dispatch Date (Min: Oct 1, 2026)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          min="2026-10-01"
                          value={formData.dispatchDate}
                          onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleIncrementDate(1)}
                          className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold font-mono transition-colors"
                          title="Next Day (+1)"
                        >
                          +1d
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIncrementDate(7)}
                          className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold font-mono transition-colors"
                          title="Next Week (+7)"
                        >
                          +7d
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-slate-300">Preferred Time Slot / Shift</span>
                      <select
                        value={formData.dispatchTimeSlot}
                        onChange={(e) => setFormData({ ...formData, dispatchTimeSlot: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="09:00 AM - 12:00 PM (Morning Fleet Dispatch)">09:00 AM - 12:00 PM (Morning Fleet Slot)</option>
                        <option value="01:00 PM - 04:00 PM (Afternoon Lab Session)">01:00 PM - 04:00 PM (Afternoon Lab Session)</option>
                        <option value="04:30 PM - 07:00 PM (Evening Priority Window)">04:30 PM - 07:00 PM (Evening Priority Window)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dataSecureGuarantee}
                      onChange={(e) => setFormData({ ...formData, dataSecureGuarantee: e.target.checked })}
                      className="rounded accent-cyan-400"
                    />
                    <span className="text-xs text-slate-300 font-medium">Request On-Site Zero-Data-Exposure Mobile Lab Protocol</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Repair Intake / Dispatch Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Mobile Command Hub */}
          <div id="offices" className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" /> Mobile Command & Dispatch Hub
              </h3>
              <p className="text-xs text-slate-400">
                Spokane, WA headquarters serving regional municipal, medical, legal, and federal clients.
              </p>
            </div>

            {/* Selected Office Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-lg font-bold text-white">{activeOffice.city}</h4>
                  <span className="text-xs font-mono text-cyan-400">{activeOffice.country}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  MOBILE DISPATCH HUB
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{activeOffice.address}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-mono">{activeOffice.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-mono">{activeOffice.email}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 pt-1">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Lab Hours: <strong className="text-slate-200">8:00 AM – 6:00 PM PST</strong></span>
                </div>
              </div>

              {/* Federal Contract Details */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Combat Veteran & Tribal Member Entity
                </div>
                <div className="text-slate-400 text-[11px]">
                  SAM.gov UEI: <span className="text-cyan-400 font-bold">{FEDERAL_CREDENTIALS.uei}</span> | NAICS <span className="text-white font-bold">{FEDERAL_CREDENTIALS.naicsCode}</span>
                </div>
              </div>

              {/* Map Graphic */}
              <div className="h-32 w-full rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-300">Spokane WA (Lat: 47.6588, Lng: -117.4260)</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
