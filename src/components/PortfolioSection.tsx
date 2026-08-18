import React, { useState } from 'react';
import { 
  Building, 
  ArrowUpRight, 
  Quote, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { CASE_STUDIES } from '../data/companyData';
import { CaseStudy, CaseStudyCategory } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface PortfolioSectionProps {
  onOpenContact: () => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ onOpenContact }) => {
  const [activeCategory, setActiveCategory] = useState<CaseStudyCategory>('all');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const { ref, isVisible } = useScrollReveal(0.05);

  const categories: { label: string; value: CaseStudyCategory }[] = [
    { label: "All Proof & Case Studies", value: "all" },
    { label: "Tier 3 Micro-Soldering", value: "micro-soldering" },
    { label: "On-Site Mobile Security", value: "mobile-security" },
    { label: "Federal Procurement (NAICS 811210)", value: "federal-gsa" },
  ];

  const filteredCaseStudies = CASE_STUDIES.filter(cs => 
    activeCategory === 'all' || cs.category === activeCategory
  );

  return (
    <section id="portfolio" className="py-24 bg-slate-950">
      <div 
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs font-bold text-cyan-300 uppercase tracking-widest">
              Validated Field Performance
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Case Studies & Field Proof
            </h2>
            <p className="text-slate-400 text-base">
              Restoring dead diagnostic tablets, protecting legal fleet data on-site, and fulfilling federal precision maintenance contracts.
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.value
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case Studies Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCaseStudies.map((cs) => (
            <div
              key={cs.id}
              onClick={() => setSelectedCaseStudy(cs)}
              className="group cursor-pointer relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              {/* Image Header with Overlay */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                <img
                  src={cs.image}
                  alt={cs.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                
                {/* Year & Industry Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-mono font-semibold text-cyan-400 border border-slate-800">
                    {cs.industry}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-slate-800">
                    {cs.year}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {cs.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {cs.summary}
                  </p>
                </div>

                {/* Impact Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                  {cs.impactMetrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-base sm:text-lg font-extrabold text-cyan-400">{m.value}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-cyan-400">
                  <span>View Technical Details</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Case Study Detail Modal */}
      {selectedCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedCaseStudy(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>{selectedCaseStudy.industry}</span> • <span>{selectedCaseStudy.clientName}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {selectedCaseStudy.title}
              </h3>
            </div>

            {/* Banner Image */}
            <div className="h-48 w-full rounded-xl overflow-hidden">
              <img
                src={selectedCaseStudy.image}
                alt={selectedCaseStudy.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Challenge & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">The Problem</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedCaseStudy.challenge}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">D&CP Precision Execution</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedCaseStudy.solution}
                </p>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Validated Impact & Unit Economics</h4>
              <div className="grid grid-cols-3 gap-4">
                {selectedCaseStudy.impactMetrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div className="text-xl sm:text-2xl font-extrabold text-cyan-400">{m.value}</div>
                    <div className="text-xs text-slate-300 font-medium">{m.label}</div>
                    {m.trend && <div className="text-[10px] text-emerald-400 mt-1">{m.trend}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial if present */}
            {selectedCaseStudy.testimonial && (
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-950 to-slate-950 p-5 rounded-xl border border-cyan-900/40 space-y-3">
                <Quote className="w-6 h-6 text-cyan-400 opacity-60" />
                <p className="text-sm italic text-slate-200">
                  "{selectedCaseStudy.testimonial.quote}"
                </p>
                <div className="text-xs font-semibold text-cyan-300">
                  {selectedCaseStudy.testimonial.author} — <span className="text-slate-400">{selectedCaseStudy.testimonial.role}, {selectedCaseStudy.testimonial.company}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedCaseStudy(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCaseStudy(null);
                  onOpenContact();
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                Dispatch Mobile Lab / Schedule
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
