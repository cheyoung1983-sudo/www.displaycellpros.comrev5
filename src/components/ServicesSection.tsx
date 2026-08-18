import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Award, 
  HardDrive, 
  ArrowRight, 
  Check, 
  X,
  Sparkles,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { SERVICES_DATA } from '../data/companyData';
import { ServiceItem, ServiceCategory } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ServicesSectionProps {
  onSelectServiceForEstimate?: (serviceId: string) => void;
  onOpenContact: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectServiceForEstimate,
  onOpenContact,
}) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const { ref, isVisible } = useScrollReveal(0.05);

  const categoryTabs: { label: string; value: ServiceCategory }[] = [
    { label: "All Capabilities", value: "all" },
    { label: "Tier 3 Micro-Soldering", value: "micro-soldering" },
    { label: "High-Velocity Express", value: "high-velocity" },
    { label: "Mobile Data Security", value: "mobile-data-security" },
    { label: "Federal GSA", value: "federal-gsa" },
    { label: "Board Diagnostics", value: "board-diagnostics" },
  ];

  const filteredServices = SERVICES_DATA.filter(s => 
    activeCategory === 'all' || s.category === activeCategory
  );

  const getIcon = (name: string) => {
    switch (name) {
      case 'Cpu': return <Cpu className="w-6 h-6 text-amber-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-cyan-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'Award': return <Award className="w-6 h-6 text-amber-400" />;
      case 'HardDrive': return <HardDrive className="w-6 h-6 text-indigo-400" />;
      default: return <Sparkles className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-slate-900 border-t border-slate-800">
      <div 
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs font-bold text-cyan-300 uppercase tracking-widest">
            Core Service Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Precision Electronics & On-Site Mobile Lab Capabilities
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            From $800 major board-level micro-soldering restorations at an 87% gross margin to zero-leak on-site corporate mobile repair labs.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === tab.value
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="space-y-4">
                {/* Icon & Category Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(service.iconName)}
                  </div>
                  {service.marginProfit && (
                    <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-900/60">
                      {service.marginProfit}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {service.shortDescription}
                </p>

                {/* Key Metrics Badges */}
                <div className="flex items-center gap-3 pt-2">
                  {service.keyMetrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{m.label}</span>
                      <span className="text-sm font-bold text-cyan-400">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setSelectedService(service)}
                  className="text-xs font-bold text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  Technical Scope <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectServiceForEstimate && onSelectServiceForEstimate(service.id)}
                  className="text-xs font-semibold text-amber-400 hover:underline"
                >
                  Calculate Economics
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                {getIcon(selectedService.iconName)}
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400">{selectedService.category}</span>
                <h3 className="text-2xl font-bold text-white">{selectedService.title}</h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedService.fullDescription}
            </p>

            {/* Key Deliverables Checklist */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Scope & Deliverables</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedService.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {selectedService.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-800 text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedService(null);
                  onOpenContact();
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
              >
                Dispatch Mobile Lab / Order
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
