import React from 'react';
import { ChevronRight, Cpu, MapPin, ShieldCheck } from 'lucide-react';

interface HomeViewProps {
  onBookClick: () => void;
  onLabClick: () => void;
}

export function HomeView({ onBookClick, onLabClick }: HomeViewProps) {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-850">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=1920&q=80"
            alt="Mobile Repair Tech"
            className="w-full h-full object-cover opacity-25"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Mobile Lab Currently Deploying in Spokane
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              We bring the repair lab <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">to your driveway.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed">
              Don't waste your day in a waiting room. Display & Cell Pros delivers military-grade, Right-to-Repair compliant technical restorations directly to your home or office.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onBookClick}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                Get an Instant Quote <ChevronRight size={20} />
              </button>
              <button
                onClick={onLabClick}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                Open Lab Portal <Cpu size={20} className="text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">The D&CP Advantage</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">We combine premium parts with unparalleled convenience, operating entirely out of our mobile diagnostic laboratory.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MapPin className="text-blue-400 w-10 h-10 mb-4" />}
            title="Zero Travel Time"
            desc="You book. We drive. Our technicians perform the surgery securely inside our mobile workshop parked outside your location."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-blue-400 w-10 h-10 mb-4" />}
            title="Data Security Guarantee"
            desc="Your device never leaves your sight. Avoid the massive cybersecurity risks associated with mail-in or drop-off retail repairs."
          />
          <FeatureCard
            icon={<Cpu className="text-blue-400 w-10 h-10 mb-4" />}
            title="Right-to-Repair Compliant"
            desc="We use only genuine-sourced and premium aftermarket components, backed by strict quality control and a robust warranty."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-705 p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
      <div className="group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
