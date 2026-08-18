import React, { useState } from 'react';
import { Lock, X, CheckCircle2, FileText, Send, User, Building, Clock, Download, Cpu, ShieldCheck, Award, CreditCard, Search, Loader2 } from 'lucide-react';
import { MOCK_CLIENT_PROJECTS, MOCK_CLIENT_MESSAGES, COMPANY_INFO, FEDERAL_CREDENTIALS } from '../data/companyData';
import { ClientMessage } from '../types';
import { PaymentCheckout } from './PaymentCheckout';

interface ClientPortalModalProps {
  onClose: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'messages' | 'deliverables' | 'payments'>('tickets');
  const [messages, setMessages] = useState<ClientMessage[]>(MOCK_CLIENT_MESSAGES);
  const [newMessageText, setNewMessageText] = useState('');
  
  const [ticketSearch, setTicketSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [ticketResult, setTicketResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearch.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setTicketResult(null);
    
    try {
      const response = await fetch(`/api/repair-status/${ticketSearch.trim()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch ticket status.');
      }
      const data = await response.json();
      setTicketResult(data);
    } catch (error: any) {
      setSearchError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: ClientMessage = {
      id: `msg-${Date.now()}`,
      senderName: "Marcus Vance",
      senderRole: "Client Representative",
      timestamp: "Just now",
      content: newMessageText,
      isFromClient: true
    };

    setMessages([...messages, newMsg]);
    setNewMessageText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">D&CP Client Service Portal</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  SAM.gov UEI: {FEDERAL_CREDENTIALS.uei}
                </span>
              </div>
              <p className="text-xs text-slate-400">Encrypted device tracking, micro-soldering status & thermal imaging logs.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'tickets', label: 'Active Repair Tickets' },
            { id: 'messages', label: 'Lab Communication' },
            { id: 'deliverables', label: 'Vault & Diagnostic Reports' },
            { id: 'payments', label: 'Secure Checkout' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Active Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            
            {/* Live Tracker Search */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                Track Live Repair Status
              </h4>
              <form onSubmit={handleSearchTicket} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Dispatch Ticket # (e.g. 102)"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={isSearching || !ticketSearch.trim()}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
                </button>
              </form>

              {searchError && (
                <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-xs text-red-400 font-semibold">
                  {searchError}
                </div>
              )}

              {ticketResult && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3 animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <h5 className="text-base font-bold text-white">{ticketResult.title}</h5>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      ticketResult.state === 'open' 
                        ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {ticketResult.state === 'open' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {ticketResult.labels.map((label: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-slate-800 text-[10px] font-medium text-slate-300">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Created: {new Date(ticketResult.created_at).toLocaleDateString()}</span>
                    <a 
                      href={ticketResult.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      View Full Details
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 px-1">Recent Organization Tickets</h4>
              {MOCK_CLIENT_PROJECTS.map((proj) => (
              <div key={proj.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 font-bold">{proj.id}</span>
                      <h4 className="text-base font-bold text-white">{proj.name}</h4>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Lead Precision Engineer: {proj.leadPartner}</div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-xs font-semibold self-start sm:self-auto ${
                    proj.status === 'In Progress' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    proj.status === 'Inspection' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Repair Pipeline Progress</span>
                    <span className="text-cyan-400 font-mono">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Milestone</span>
                    <span className="text-slate-200 font-medium">{proj.nextMilestone}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Recent Deliverable</span>
                    <span className="text-emerald-400 font-medium">{proj.recentDeliverable}</span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        {/* Tab 2: Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 h-72 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`p-3.5 rounded-xl max-w-lg space-y-1 ${
                    m.isFromClient 
                      ? 'ml-auto bg-cyan-950/80 border border-cyan-800/80 text-right' 
                      : 'mr-auto bg-slate-900 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 gap-4">
                    <span className="font-bold text-cyan-300">{m.senderName} ({m.senderRole})</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200">{m.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type encrypted message to lead lab engineer..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Deliverables */}
        {activeTab === 'deliverables' && (
          <div className="space-y-3">
            {[
              { title: "FLIR_Thermal_Short_Circuit_Diagnostic_Rail1.8V.pdf", size: "3.4 MB", date: "Aug 3, 2026" },
              { title: "On-Site_Data_Zero_Exposure_Security_Certificate.pdf", size: "1.2 MB", date: "Aug 1, 2026" },
              { title: "GSA_FAR_Compliant_Maintenance_Log_NAICS811210.pdf", size: "2.1 MB", date: "Jul 28, 2026" },
            ].map((doc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">{doc.title}</div>
                    <div className="text-[10px] text-slate-400">{doc.size} • Uploaded {doc.date}</div>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-xs text-cyan-400 font-semibold flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Payments */}
        {activeTab === 'payments' && (
          <PaymentCheckout />
        )}

      </div>
    </div>
  );
};
