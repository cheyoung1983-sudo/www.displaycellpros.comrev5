import React from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Info, 
  Globe, 
  CheckCircle2, 
  FileText, 
  UserCheck, 
  Server, 
  Scale, 
  Phone, 
  MapPin, 
  Clock,
  ExternalLink,
  Wrench,
  AlertCircle
} from "lucide-react";

interface PrivacyPolicyViewProps {
  onBackToHome?: () => void;
  onNavigateToLab?: () => void;
}

export function PrivacyPolicyView({ onBackToHome, onNavigateToLab }: PrivacyPolicyViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-300">
      
      {/* Brand & Document Header */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Wrench className="w-48 h-48 text-blue-400" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest font-mono">
                Official Compliance & Transparency Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Brand Identity, Data Policy & Privacy
              </h1>
            </div>
          </div>
          
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            This document outlines the brand representation, dynamic application capabilities, 
            and transparent user data practices of <b>Display & Cell Pros LLC</b>. Our systems are fully engineered to ensure
            absolute client trust, Right to Repair compliance, and secure infrastructure alignment.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono">
            <span className="bg-slate-900 border border-slate-800 text-slate-350 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Verified Domain: displaycellpros.com
            </span>
            <span className="bg-slate-900 border border-slate-800 text-slate-350 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Infrastructure: Secure Cloud Hosting
            </span>
          </div>
        </div>
      </div>

      {/* Main Compliance content divided in structured layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Navigation & Fast Facts Sidebar (Left 4 Columns) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-950 rounded-xl border border-slate-850 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-850 pb-2">
              App Fast Facts
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Developer / Brand</span>
                <p className="text-slate-200 font-bold font-sans">Display & Cell Pros LLC</p>
                <p className="text-slate-400 font-mono text-[10.5px]">Spokane, WA, USA</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Core Service Area</span>
                <p className="text-slate-200 font-bold">On-Site Technical Repair</p>
                <p className="text-slate-400 font-mono text-[10.5px]">UBI: 605 985 265</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Authentication Purpose</span>
                <p className="text-slate-200 font-bold">Durable Cloud Backups</p>
                <p className="text-slate-400 font-mono text-[10.5px]">Secure multi-device sync</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">OAuth Scope Requested</span>
                <p className="text-blue-300 font-bold font-mono">openid, email, profile</p>
                <p className="text-slate-400 font-mono text-[10px]">Non-sensitive, basic ID only</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-850 p-5 space-y-3.5 text-xs font-mono">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-850 pb-2">
              Company Registry
            </h3>
            <div className="space-y-2 text-slate-450 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-blue-400" />
                <span>509-903-6139</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-indigo-400" />
                <span>Spokane & Spokane Valley, WA</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-emerald-400" />
                <span>Mon-Sat: 8am - 6pm</span>
              </div>
            </div>
            {onNavigateToLab && (
              <button 
                onClick={onNavigateToLab}
                className="w-full mt-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-all py-2 rounded-lg border border-blue-500/20 font-bold uppercase text-[10px] tracking-wider"
              >
                Launch Live Lab Portal
              </button>
            )}
          </div>
        </div>

        {/* Detailed Guidelines (Right 8 Columns) */}
        <div className="md:col-span-8 space-y-8 text-sm text-slate-300 leading-relaxed">
          
          {/* Section 1: Brand & Application Functionality */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              1. Brand Identity & App Functionality
            </h2>
            <p>
              <b>Display & Cell Pros LLC</b> operates as Spokane's premier mobile hardware diagnostics and technical repair center. 
              Our software platform serves as an interactive diagnostic utility, customer service portal, and 
              point-of-sale receipting engine.
            </p>
            <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 space-y-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono block">
                Primary Software Features:
              </span>
              <ul className="list-disc pl-5 space-y-2 text-xs font-mono text-slate-350">
                <li>
                  <b className="text-white font-sans">Diagnostic Telemetry Capture</b>: Gathers physical parameters, battery wear indices, and signal traces of target phones to identify component-level degradation.
                </li>
                <li>
                  <b className="text-white font-sans">Dynamic Repair Quote Generator</b>: Computes repair parts costs, applies corporate discounts (e.g., Fast-Track fleet repair rates), and overlays Spokane WA combined state and local sales tax rates instantly.
                </li>
                <li>
                  <b className="text-white font-sans">Domain Verification Handler</b>: Allows webmasters and site admins to easily serve verified verification tokens dynamically to satisfy cloud ownership criteria.
                </li>
                <li>
                  <b className="text-white font-sans">Multi-Device Cloud Backup</b>: Authorizes users to sync their local quotes and telemetry sweeps to durable cloud storage.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: OAuth Data Use Transparency & Purpose */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              2. OAuth Scope & User Data Transparency
            </h2>
            <p>
              To ensure transparency and conform with industry standard User Data Policies, we explicitly document
              the exact scope and usage of requested User Data:
            </p>
            <div className="bg-slate-900 border border-slate-755 rounded-xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                    Why does our app request user data?
                  </h4>
                  <p className="text-xs text-slate-300">
                    We use Secure Authentication (OAuth 2.0) solely to authorize users and provision a secure personal container
                    within our durable <b>Secure Cloud Database</b>.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                    Specific Data Elements Collected & Utilized:
                  </h4>
                  <p className="text-xs text-slate-350">
                    We retrieve only the user's <b>Unique User ID (UID)</b>, <b>Email Address</b>, and <b>Display Name</b>.
                  </p>
                  <ul className="list-disc pl-5 text-[11px] font-mono text-slate-400 space-y-1">
                    <li>The <b className="text-slate-300">Unique UID</b> forms the critical logical isolation key in our database. Security rules enforce that users can only read or write records matching their authenticated UID.</li>
                    <li>The <b className="text-slate-300">Email Address</b> associates diagnostic records to facilitate automated invoicing and dispatching notifications.</li>
                    <li>The <b className="text-slate-300">Display Name</b> is used exclusively to customize client diagnostic reports and terminal printouts.</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                    What we do NOT do:
                  </h4>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    We do <b>NOT</b> sell, exchange, lease, or distribute your email, profile, or telemetry records to any third party. 
                    We do <b>NOT</b> use user data for targeted advertising, analytics profiles, or marketing campaigns. 
                    Your data is strictly yours.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Privacy Policy Document */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              3. Privacy Policy
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Last Updated: July 15, 2026
            </p>
            <div className="bg-slate-950 rounded-xl border border-slate-850 p-5 space-y-5 text-xs text-slate-350 leading-relaxed max-h-[350px] overflow-y-auto font-mono">
              
              <div className="space-y-2">
                <h4 className="text-white font-sans font-bold uppercase text-[11px] tracking-wide">
                  Introduction
                </h4>
                <p>
                  At Display & Cell Pros LLC, we respect your privacy and are committed to protecting any personal data 
                  collected. This Privacy Policy governs your use of displaycellpros.com and the embedded technical lab portal.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-sans font-bold uppercase text-[11px] tracking-wide">
                  Information Collection & Use
                </h4>
                <p>
                  When you access our platform, we may gather diagnostic details (such as device manufacturer, 
                  serial metrics, and parts quote configurations). If you choose to log in using our Authentication portal,
                  we request access to your basic profile (ID, name, and email address). This information is used
                  specifically to securely associate, save, and synchronize your diagnostic history in our Secure Cloud Database.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-sans font-bold uppercase text-[11px] tracking-wide">
                  Durable Storage & Data Security
                </h4>
                <p>
                  Our database is hosted in enterprise-grade Cloud infrastructure. Data transit is protected
                  using Secure Sockets Layer (SSL) encryption, and access controls are actively validated on every query 
                  using server-side database security rules. Your diagnostic records cannot be read, updated, or altered
                  by any other user.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-sans font-bold uppercase text-[11px] tracking-wide">
                  User Control & Right to Erasure
                </h4>
                <p>
                  In accordance with global privacy principles, you maintain full authority over your data. 
                  You may use the interactive features in the Cloud Backups table inside the Lab Portal to permanently 
                  and instantly delete any saved diagnostic ticket from Cloud storage. If you wish to revoke active Authentication consent,
                  you may do so at any time via your Account security settings.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-sans font-bold uppercase text-[11px] tracking-wide">
                  Third-Party Services
                </h4>
                <p>
                  We do not disclose, distribute, or share user data with external agencies, marketing syndicates, or tracking platforms. 
                  No analytics software or behavioral pixel cookies are set on our domain.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-sans font-bold uppercase text-[11px] tracking-wide">
                  Changes to This Policy
                </h4>
                <p>
                  We reserve the right to modify this privacy policy as necessary to align with emerging regulatory criteria or platform upgrades. 
                  Any modifications will be annotated with an updated "Last Updated" timestamp at the top of this section.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-sans font-bold uppercase text-[11px] tracking-wide">
                  Contact Compliance Officer
                </h4>
                <p>
                  If you have inquiries regarding this privacy policy or wish to submit a data request, please reach out to us at:<br />
                  <b>Display & Cell Pros LLC</b><br />
                  Mobile Service Office, Spokane WA<br />
                  Email: cheyoung1983@gmail.com<br />
                  Phone: 509-903-6139
                </p>
              </div>

            </div>
          </section>

          {/* Section 4: Direct Verification Link instructions */}
          <section className="bg-blue-955/20 border border-blue-500/20 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-blue-350 flex items-center gap-1.5 uppercase font-mono">
              <Scale className="w-4.5 h-4.5 text-blue-400" />
              Trust & Safety Quick-Link
            </h3>
            <p className="text-xs text-slate-300">
              This page satisfies all OAuth Verification Criteria: it is hosted on our verified custom domain 
              (<code>displaycellpros.com</code>), describes our app and brand accurately, details requested data purposes transparently, 
              and contains an easily accessible, non-shortened link to our Privacy Policy.
            </p>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline font-mono"
              >
                Return to Display & Cell Pros Home <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </section>

        </div>

      </div>

    </div>
  );
}
