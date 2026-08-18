import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Clock, ShieldCheck, Lock, Truck, Award, CreditCard } from 'lucide-react';
import { FEDERAL_CREDENTIALS } from '../data/companyData';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'timelines',
    question: 'What are your typical repair turnaround times for emergency and standard dispatches?',
    answer: 'Standard depot repairs at our Spokane, WA command center have an average 48-72 hour turnaround upon receipt. For emergency municipal, medical, or legal fleet clients utilizing our Priority Triage, we offer expedited 24-hour turnaround and emergency on-site mobile lab dispatch within the Pacific Northwest region.',
    icon: <Clock className="w-5 h-5 text-cyan-400" />,
    category: 'Repair Timelines'
  },
  {
    id: 'warranty',
    question: 'What warranty is included with your micro-soldering and board-level repairs?',
    answer: 'All component-level micro-soldering, BGA reballing, and logic board repairs are backed by our comprehensive 12-Month Component Warranty. If the repaired trace, IC chip, or connector fails under normal operational use, our engineers re-service the hardware at zero additional labor cost.',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    category: 'Warranty & Guarantee'
  },
  {
    id: 'data-security',
    question: 'How does your Zero-Data-Exposure Mobile Lab Protocol work?',
    answer: 'We adhere to strict HIPAA, CJIS, and enterprise privacy standards. Devices undergoing repair can be serviced under strict chain-of-custody protocols where storage media is isolated or encrypted. For high-security government and medical clients, we offer on-site mobile lab deployment ensuring storage media never leaves your secure facility.',
    icon: <Lock className="w-5 h-5 text-amber-400" />,
    category: 'Data Security'
  },
  {
    id: 'on-site-dispatch',
    question: 'Can you service devices on-site or do they need to be shipped to Spokane?',
    answer: 'We provide both secure depot intake (via insured courier with real-time tracking) and fully equipped on-site mobile lab dispatches for fleet-wide emergencies, hospitals, law enforcement agencies, and corporate campuses across the Pacific Northwest.',
    icon: <Truck className="w-5 h-5 text-blue-400" />,
    category: 'Logistics & Dispatch'
  },
  {
    id: 'government-contracting',
    question: 'Are you SAM.gov registered for government, tribal, and municipal procurement?',
    answer: `Yes. Display & Cell Pros LLC is a certified Combat Veteran & Tribal Member owned entity. We are fully registered on SAM.gov (UEI: ${FEDERAL_CREDENTIALS.uei}, primary NAICS code ${FEDERAL_CREDENTIALS.naicsCode} - ${FEDERAL_CREDENTIALS.naicsDescription}) enabling seamless government and institutional procurement.`,
    icon: <Award className="w-5 h-5 text-purple-400" />,
    category: 'Government Procurement'
  },
  {
    id: 'payment-methods',
    question: 'What payment methods, purchase orders, and corporate invoicing options do you accept?',
    answer: 'We accept all major credit cards via secure Stripe checkout, institutional Purchase Orders (POs) with net-30 terms for verified government and healthcare accounts, ACH wire transfers, and electronic deposits.',
    icon: <CreditCard className="w-5 h-5 text-indigo-400" />,
    category: 'Billing & Payments'
  }
];

export const FAQSection: React.FC<{ onOpenContact?: () => void }> = ({ onOpenContact }) => {
  const [openId, setOpenId] = useState<string | null>('timelines');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Repair Timelines', 'Warranty & Guarantee', 'Data Security', 'Logistics & Dispatch', 'Government Procurement', 'Billing & Payments'];

  const filteredItems = selectedCategory === 'All' 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(item => item.category === selectedCategory);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-950/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
            <HelpCircle className="w-3.5 h-3.5" /> Knowledge Base & FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Questions</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about our micro-soldering precision standards, secure chain of custody, turnaround times, and institutional dispatch protocols.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div 
                key={item.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-xl shadow-cyan-950/30' 
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider block mb-0.5">
                        {item.category}
                      </span>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {item.question}
                      </h3>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400 border-cyan-500/40' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-fade-in">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help CTA Banner */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white">Have a specialized engineering or fleet question?</h4>
            <p className="text-xs text-slate-400">Our chief medical engineer and dispatch coordinators are available 24/7 for urgent inquiries.</p>
          </div>
          <button
            onClick={onOpenContact}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs tracking-wide uppercase transition-all shadow-lg shadow-cyan-500/20 shrink-0"
          >
            Contact Master Lab
          </button>
        </div>

      </div>
    </section>
  );
};
