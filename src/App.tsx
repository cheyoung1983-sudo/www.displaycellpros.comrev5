import { useState, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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
  Instagram,
  Linkedin,
  Twitter,
  ArrowUpRight,
  GraduationCap,
  Calendar,
  BarChart3,
  Cpu,
  Loader2,
  Terminal,
  Mic,
  Workflow,
  Sliders,
  Bot,
  FileCode,
  Sparkles,
  Key,
  Database,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Zap,
  RotateCcw
} from 'lucide-react';
import LocalLabBanner from './components/LocalLabBanner.tsx';
import SEO from './components/SEO.tsx';
import OfflineStatusBanner from './components/OfflineStatusBanner.tsx';
import A11yInspector from './components/A11yInspector.tsx';
import Auth0UserButton from './components/Auth0UserButton.tsx';
import { ToastProvider } from './components/Toast.tsx';
import LabBenchParticles from './components/LabBenchParticles.tsx';
import VoiceIntakeModal, { VoiceIntakeTicket } from './components/VoiceIntakeModal.tsx';
import { useFounderAnimationSpeed } from './hooks/useFounderAnimationSpeed.ts';
import ryanYoungImage from './assets/images/regenerated_image_1786855135392.jpg';
import { lazyWithRetry } from './utils/lazyRetry.ts';

// Code-split dynamic views with React.lazy and resilient chunk load retry
const IntakeForm = lazyWithRetry(() => import('./components/IntakeForm.tsx'));
const HardwareDiagnosticTool = lazyWithRetry(() => import('./components/HardwareDiagnosticTool.tsx'));
const FeaturedProducts = lazyWithRetry(() => import('./components/FeaturedProducts.tsx'));
const AboutUs = lazyWithRetry(() => import('./components/AboutUs.tsx'));
const Reviews = lazyWithRetry(() => import('./components/Reviews.tsx'));
const RepairStatusTracker = lazyWithRetry(() => import('./components/RepairStatusTracker.tsx'));
const RepairEstimateCalculator = lazyWithRetry(() => import('./components/RepairEstimateCalculator.tsx'));
const ContactSupport = lazyWithRetry(() => import('./components/ContactSupport.tsx'));
const RepairAcademy = lazyWithRetry(() => import('./components/RepairAcademy.tsx'));
const ServiceBooking = lazyWithRetry(() => import('./components/ServiceBooking.tsx'));
const RepairAnalytics = lazyWithRetry(() => import('./components/RepairAnalytics.tsx'));
const SupportedDevicesDatabase = lazyWithRetry(() => import('./components/SupportedDevicesDatabase.tsx'));
const CompanyBlueprintGovernance = lazyWithRetry(() => import('./components/CompanyBlueprintGovernance.tsx'));
const ElevenLabsVoiceGenerator = lazyWithRetry(() => import('./components/ElevenLabsVoiceGenerator.tsx'));
const ElevenLabsProceduresManager = lazyWithRetry(() => import('./components/ElevenLabsProceduresManager.tsx'));
const ElevenLabsConversationFlow = lazyWithRetry(() => import('./components/ElevenLabsConversationFlow.tsx'));
const ElevenLabsVoiceStudioSettings = lazyWithRetry(() => import('./components/ElevenLabsVoiceStudioSettings.tsx'));
const VoiceToCircuitAgentHub = lazyWithRetry(() => import('./components/VoiceToCircuitAgentHub.tsx'));
const ElevenAgentInspector = lazyWithRetry(() => import('./components/ElevenAgentInspector.tsx'));
const Auth0FlowsHub = lazyWithRetry(() => import('./components/Auth0FlowsHub.tsx'));
const ElevenKnowledgeAndToolsHub = lazyWithRetry(() => import('./components/ElevenKnowledgeAndToolsHub.tsx'));
const ClassyOverviewView = lazyWithRetry(() => import('./components/ClassyOverviewView.tsx'));

function TabLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/10 animate-bounce">
        <ShieldCheck className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>Loading Laboratory Module...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'classy_hub' | 'intake' | 'hardware_diag' | 'matrix' | 'calc' | 'track' | 'booking' | 'analytics' | 'academy' | 'support' | 'about' | 'blueprint' | 'eleven_tts' | 'eleven_procedures' | 'eleven_flow' | 'eleven_voice_studio' | 'voice_to_circuit' | 'eleven_inspector' | 'auth0_flows' | 'eleven_kb_tools'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFounderBioExpanded, setIsFounderBioExpanded] = useState(false);
  const [isVoiceIntakeOpen, setIsVoiceIntakeOpen] = useState(false);
  const { speedPreset, setSpeedPreset, resetToDefault, duration, isOff, presets } = useFounderAnimationSpeed();

  const tabs = [
    { id: 'home', label: 'Laboratory Store', icon: Smartphone },
    { id: 'classy_hub', label: 'Federal & Enterprise Hub', icon: Award },
    { id: 'intake', label: 'Device Intake', icon: Microscope },
    { id: 'hardware_diag', label: 'Hardware Diag Port', icon: Terminal },
    { id: 'eleven_tts', label: 'Voice AI Studio', icon: Mic },
    { id: 'eleven_procedures', label: 'AI Procedures', icon: Workflow },
    { id: 'eleven_flow', label: 'Conversation Flow', icon: Sliders },
    { id: 'eleven_voice_studio', label: 'Voice & Dictionaries', icon: Sparkles },
    { id: 'voice_to_circuit', label: 'V2C Agent Hub', icon: Bot },
    { id: 'eleven_inspector', label: 'Agent Config Inspector', icon: FileCode },
    { id: 'auth0_flows', label: 'Auth0 Flows', icon: Key },
    { id: 'eleven_kb_tools', label: 'Knowledge Base & Tools', icon: Database },
    { id: 'matrix', label: 'Board Database', icon: Cpu },
    { id: 'booking', label: 'Book Drop-Off', icon: Calendar },
    { id: 'calc', label: 'Price Guide', icon: Calculator },
    { id: 'track', label: 'Repair Status', icon: Activity },
    { id: 'analytics', label: 'Telemetry & Analytics', icon: BarChart3 },
    { id: 'academy', label: 'Repair Academy', icon: GraduationCap },
    { id: 'blueprint', label: 'Company Blueprint', icon: ShieldCheck },
    { id: 'support', label: 'Lab Support', icon: MessageSquare },
    { id: 'about', label: 'Engineering Protocol', icon: Info },
  ];

  return (
    <ToastProvider>
      <SEO activeTab={activeTab} />
      <div className="min-h-screen bg-[#FAFAFA] selection:bg-slate-900 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <OfflineStatusBanner />
        <LocalLabBanner onBookDropOff={() => setActiveTab('booking')} />
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-playfair font-black text-slate-900 block leading-none">D&CP LLC</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Spokane • WA</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${isActive 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('track')}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Query Repair Status"
            >
              <Search className="w-5 h-5" />
              <span>Tracker</span>
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <button 
              onClick={() => setActiveTab('intake')}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
            >
              Start Intake
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <Auth0UserButton />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Auth0UserButton />
            <button 
              className="p-2"
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
              className="absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 md:hidden space-y-4"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold ${activeTab === tab.id ? 'bg-slate-50 text-slate-900' : 'text-slate-400'}`}
                >
                  {tab.label}
                  <tab.icon className="w-5 h-5" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>      {/* Main Content */}
      <main className="pt-32 pb-20">
        <Suspense fallback={<TabLoadingSkeleton />}>
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-32"
              >
                <section className="max-w-7xl mx-auto px-6 text-center space-y-12">
                  <div className="space-y-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      Now Accepting Tier 3 Board Repairs
                    </div>
                    <h1 className="text-7xl md:text-8xl font-playfair font-black text-slate-900 tracking-tight leading-[1.05]">
                      The Laboratory for <br />
                      <span className="text-slate-400">Mobile Recovery.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                      D&CP LLC provides mission-critical hardware restoration and data extraction 
                      services backed by precision telemetry.
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setActiveTab('intake')}
                      className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      Initiate Triage
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('about')}
                      className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
                    >
                      Laboratory Protocol
                    </button>
                  </div>
                </section>

                {/* Founder's Note Card */}
                <section className="max-w-5xl mx-auto px-6">
                  <div 
                    id="home-founder-note"
                    style={{
                      '--animation-speed': duration,
                      '--founder-glow-speed': duration,
                      ...(isOff ? { animation: 'none' } : {})
                    } as React.CSSProperties}
                    className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-[2.5rem] p-6 md:p-8 border border-slate-800/80 shadow-xl hover:shadow-[0_20px_50px_-10px_rgba(37,99,235,0.28)] hover:border-blue-500/40 transition-all duration-300 ease-out"
                  >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 group-hover:bg-blue-600/25 blur-[100px] rounded-full pointer-events-none transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 group-hover:bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none transition-all duration-500" />
                    <LabBenchParticles paused={isOff} />
                    
                    <div className="relative z-10 space-y-6">
                      {/* Top Header & Core Summary */}
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                        <div className="relative shrink-0">
                          <div 
                            className="founder-img-wrapper w-24 sm:w-28 md:w-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-800 ring-1 ring-white/10 hover:border-blue-400/50 hover:ring-blue-500/30 transition-all duration-500"
                            style={{ aspectRatio: '4/5' }}
                          >
                            <img 
                              src={ryanYoungImage} 
                              alt="Ryan Young - Founder & Lead Systems Engineer" 
                              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500 will-change-transform"
                              referrerPolicy="no-referrer"
                              loading="eager"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300";
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md border border-white/20">
                            Founder
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-3">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                              Founder's Note
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Ryan Young • Spokane, WA
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-white/10 text-emerald-300 rounded-full font-mono font-bold border border-white/15">
                              Combat Veteran
                            </span>
                          </div>

                          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug">
                            "At D&CP, we reject throwaway culture. Every circuit board that enters our Spokane laboratory receives precision diagnostics and military-grade integrity."
                          </h2>

                          <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            Founder & Lead Systems Engineer • Enrolled Tribal Member • Master Micro-Soldering Specialist
                          </p>

                          {/* Quick Action Buttons & Animation Speed Controls */}
                          <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <button
                              id="home-founder-mic-trigger"
                              type="button"
                              onClick={() => setIsVoiceIntakeOpen(true)}
                              className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-950/40 border border-rose-400/40 hover:scale-105 active:scale-95 group"
                              title="Speak your device issue to instantly record and convert into an intake ticket via ElevenLabs"
                            >
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-200"></span>
                              </span>
                              <Mic className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
                              <span>Voice Intake (ElevenLabs)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsFounderBioExpanded(prev => !prev)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-blue-500/30 shadow-sm"
                              aria-expanded={isFounderBioExpanded}
                            >
                              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                              <span>{isFounderBioExpanded ? 'Show Less' : 'Read Founder Bio & Story'}</span>
                              {isFounderBioExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-blue-300" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-blue-300" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('about');
                                setTimeout(() => {
                                  const el = document.getElementById('leadership');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }, 120);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10 shadow-sm"
                            >
                              <span>Leadership Section</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Biographical Detail Section */}
                      <AnimatePresence>
                        {isFounderBioExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 border-t border-slate-800/80 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                <div className="md:col-span-8 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">
                                      Background & Engineering Philosophy
                                    </span>
                                  </div>
                                  <p>
                                    Founded in Spokane, Washington, <strong className="text-white font-bold">Display & Cell Pros LLC</strong> was created to deliver an uncompromising level of electronic repair. Drawing from intensive military discipline as a combat veteran and rooted in tribal heritage, Ryan established an engineering-first facility that tackles catastrophic board-level failures other repair shops turn away.
                                  </p>
                                  <p>
                                    From high-density BGA rework and microscope trace surgery to federal institutional hardware maintenance, every device is serviced under strict electrostatic discharge (ESD) safe protocols and IPC-A-610 soldering standards.
                                  </p>
                                </div>

                                <div className="md:col-span-4 bg-slate-950/60 rounded-2xl p-4 border border-white/10 space-y-3">
                                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Verified Credentials
                                  </div>
                                  <div className="space-y-2 text-xs font-mono">
                                    <div className="flex justify-between items-center text-slate-300">
                                      <span className="text-slate-500">SAM.gov UEI:</span>
                                      <span className="text-emerald-400 font-bold">VAJXG5MNYQK8</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300">
                                      <span className="text-slate-500">Standard:</span>
                                      <span className="text-blue-300">IPC-A-610 Class 3</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300">
                                      <span className="text-slate-500">Status:</span>
                                      <span className="text-amber-300 font-bold">Combat Vet Owned</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300">
                                      <span className="text-slate-500">Facility:</span>
                                      <span className="text-slate-200">Spokane Lab Bench #1</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Animation Speed Preferences & Socials Row */}
                      <div className="pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
                        {/* Speed preference selector */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                          <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
                            <Zap className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Pulse Speed:
                            </span>
                          </div>
                          <div className="inline-flex bg-slate-950/80 p-1 rounded-xl border border-white/10 gap-1 shadow-inner items-center">
                            {presets.map((preset) => {
                              const isActive = speedPreset === preset.id;
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSpeedPreset(preset.id);
                                  }}
                                  aria-pressed={isActive}
                                  title={`Set pulse animation speed to ${preset.label} (persists across reloads)`}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                    isActive
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400/40'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                                  }`}
                                >
                                  {preset.shortLabel}
                                </button>
                              );
                            })}
                            
                            <button
                              id="home-founder-reset-settings"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                resetToDefault();
                              }}
                              title="Reset animation speed and founder card preferences to factory default"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all ml-1"
                            >
                              <RotateCcw className="w-3 h-3 text-slate-400 hover:text-amber-300" />
                              <span className="hidden sm:inline">Reset Settings</span>
                              <span className="sm:hidden">Reset</span>
                            </button>
                          </div>
                        </div>

                        {/* Socials Link Row */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-400 text-xs hidden sm:inline-block mr-1">
                            Connect:
                          </span>
                          <a
                            href="https://www.linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Connect with Ryan Young on LinkedIn (opens in new tab)"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-blue-600/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 hover:border-blue-500/40 transition-all shadow-sm group/link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Linkedin className="w-4 h-4 text-blue-400 group-hover/link:scale-110 transition-transform" />
                            <span>LinkedIn</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover/link:text-blue-300 transition-colors" />
                          </a>

                          <a
                            href="https://www.instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Follow Display & Cell Pros on Instagram (opens in new tab)"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-pink-600/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 hover:border-pink-500/40 transition-all shadow-sm group/insta"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Instagram className="w-4 h-4 text-pink-400 group-hover/insta:scale-110 transition-transform" />
                            <span>Instagram</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover/insta:text-pink-300 transition-colors" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <FeaturedProducts />
                <Reviews />
              </motion.div>
            )}

            {activeTab === 'classy_hub' && (
              <motion.div
                key="classy_hub"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-7xl mx-auto px-4"
              >
                <ClassyOverviewView 
                  onNavigateToIntake={() => setActiveTab('intake')}
                  onNavigateToBooking={() => setActiveTab('booking')}
                />
              </motion.div>
            )}

            {activeTab === 'intake' && (
              <motion.div
                key="intake"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <IntakeForm />
              </motion.div>
            )}

            {activeTab === 'hardware_diag' && (
              <motion.div
                key="hardware_diag"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-6xl mx-auto px-4"
              >
                <HardwareDiagnosticTool standalone />
              </motion.div>
            )}

            {activeTab === 'eleven_tts' && (
              <motion.div
                key="eleven_tts"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto px-4 py-8"
              >
                <ElevenLabsVoiceGenerator />
              </motion.div>
            )}

            {activeTab === 'eleven_procedures' && (
              <motion.div
                key="eleven_procedures"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <ElevenLabsProceduresManager />
              </motion.div>
            )}

            {activeTab === 'eleven_flow' && (
              <motion.div
                key="eleven_flow"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <ElevenLabsConversationFlow />
              </motion.div>
            )}

            {activeTab === 'eleven_voice_studio' && (
              <motion.div
                key="eleven_voice_studio"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <ElevenLabsVoiceStudioSettings />
              </motion.div>
            )}

            {activeTab === 'voice_to_circuit' && (
              <motion.div
                key="voice_to_circuit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <VoiceToCircuitAgentHub />
              </motion.div>
            )}

            {activeTab === 'eleven_inspector' && (
              <motion.div
                key="eleven_inspector"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <ElevenAgentInspector />
              </motion.div>
            )}

            {activeTab === 'auth0_flows' && (
              <motion.div
                key="auth0_flows"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Auth0FlowsHub />
              </motion.div>
            )}

            {activeTab === 'eleven_kb_tools' && (
              <motion.div
                key="eleven_kb_tools"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <ElevenKnowledgeAndToolsHub />
              </motion.div>
            )}

            {activeTab === 'matrix' && (
              <motion.div
                key="matrix"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <SupportedDevicesDatabase
                  onSelectDeviceForIntake={() => setActiveTab('intake')}
                  onOpenPriceCalculator={() => setActiveTab('calc')}
                />
              </motion.div>
            )}

            {activeTab === 'calc' && (
              <motion.div
                key="calc"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RepairEstimateCalculator />
              </motion.div>
            )}

            {activeTab === 'track' && (
              <motion.div
                key="track"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RepairStatusTracker />
              </motion.div>
            )}

            {activeTab === 'booking' && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <ServiceBooking onSelectTracker={(id) => setActiveTab('track')} />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <RepairAnalytics />
              </motion.div>
            )}

            {activeTab === 'academy' && (
              <motion.div
                key="academy"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <RepairAcademy onSelectIntake={() => setActiveTab('intake')} />
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AboutUs onOpenBlueprint={() => setActiveTab('blueprint')} />
              </motion.div>
            )}

            {activeTab === 'blueprint' && (
              <motion.div
                key="blueprint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CompanyBlueprintGovernance />
              </motion.div>
            )}

            {activeTab === 'support' && (
              <motion.div
                key="support"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <ContactSupport />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer */}
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
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('home')}>Store</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('classy_hub')}>Federal & Enterprise Hub</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('intake')}>Intake</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('booking')}>Book Drop-Off</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('analytics')}>Repair Telemetry</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('academy')}>Repair Academy</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('blueprint')}>Master Blueprint</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('support')}>Support</li>
                <li className="hover:text-slate-900 cursor-pointer transition-colors" onClick={() => setActiveTab('about')}>Protocol</li>
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
              <A11yInspector activeTab={activeTab} />
            </div>
            <div className="flex flex-wrap gap-6 items-center">
              <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-900 cursor-pointer">WA RCW 19.415 Disclosure</span>
            </div>
          </div>
        </div>
      </footer>
      {import.meta.env.PROD && typeof window !== 'undefined' && window.location.hostname.includes('vercel') && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}

      {/* ElevenLabs Voice Intake Modal */}
      <VoiceIntakeModal
        isOpen={isVoiceIntakeOpen}
        onClose={() => setIsVoiceIntakeOpen(false)}
        onApplyToIntakeForm={(ticket: VoiceIntakeTicket) => {
          localStorage.setItem('dcp_pending_voice_intake', JSON.stringify(ticket));
          setActiveTab('intake');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
    </ToastProvider>
  );
}
