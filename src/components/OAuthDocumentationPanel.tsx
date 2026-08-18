import React, { useState } from "react";
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Terminal, 
  Globe,
  Search, 
  CheckCircle2,
  AlertTriangle, 
  ListTodo,
  ShieldCheck,
  Zap,
  Server,
  Cloud
} from "lucide-react";

interface OAuthDocumentationPanelProps {
  projectId: string;
  devUrl: string;
  prodUrl: string;
}

export function OAuthDocumentationPanel({ projectId, devUrl, prodUrl }: OAuthDocumentationPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Interactive checklist state
  const [checklist, setChecklist] = useState({
    siteVerification: true,
    vercelDns: true,
    netlifyOwnership: false,
    openaiAuthorized: false,
    recaptchaSetup: false,
    androidSigning: true,
    clientIdSafelisting: false,
    vercelOAuthRegistered: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Professional Redundancy catalog
  const redundancyProviders = [
    {
      name: "Auth0 Dashboard",
      status: "Verified",
      purpose: "Trust & Safety review for reCAPTCHA and OAuth handshakes.",
      icon: <Globe className="w-4 h-4 text-blue-400" />
    },
    {
      name: "Vercel (Production)",
      status: "Active",
      purpose: "Edge-native serverless functions and primary diagnostic API.",
      icon: <Zap className="w-4 h-4 text-emerald-400" />
    },
    {
      name: "Netlify (Redundancy)",
      status: "Active",
      purpose: "Global CDN failover and site reliability mirror.",
      icon: <img src="https://api.netlify.com/api/v1/badges/010e7c28-bc7a-4735-b252-d4da98c9c9f3/deploy-status" alt="Netlify Status" className="w-16 h-4" />
    },
    {
      name: "OpenAI (Verification)",
      status: "Authorized",
      purpose: "GPT-4o Triage Core and plugin domain authorization.",
      icon: <Cloud className="w-4 h-4 text-purple-400" />
    },
    {
      name: "Vercel (OAuth)",
      status: "Pending",
      purpose: "Partner integration and multi-tenant SSO handshakes.",
      icon: <Server className="w-4 h-4 text-slate-400" />
    }
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-6 font-mono text-xs text-slate-300">
      
      {/* Header section with Professional Redundancy Gauge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Compliance Lab: Multi-Platform Ownership
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Verified redundancy across Auth0, OpenAI, Vercel, and Netlify for professional-grade stability.
          </p>
        </div>
        
        {/* Progress Gauge */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-[200px] flex flex-col justify-center">
          <div className="flex justify-between items-center text-[10px] mb-1">
            <span className="text-slate-400 uppercase font-bold tracking-wider">Redundancy Health</span>
            <span className={`font-bold ${completionPercentage === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                completionPercentage === 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,184,129,0.5)]" : "bg-gradient-to-r from-amber-500 to-blue-500"
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-500 mt-1.5 text-center">
            {completedCount} of {totalCount} platform checks completed
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Professional Redundancy (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
            <Zap className="w-4 h-4" />
            Verified Infrastructure
          </h4>
          <div className="space-y-2.5">
            {redundancyProviders.map((provider, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors group">
                <div className="mt-0.5">{provider.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200 text-[11px]">{provider.name}</span>
                    <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-black border ${
                      provider.status === "Verified" || provider.status === "Active" || provider.status === "Authorized"
                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                        : "bg-amber-950/40 border-amber-500/30 text-amber-400"
                    }`}>
                      {provider.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                    {provider.purpose}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Step-by-Step Task Panel (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase">
            <ListTodo className="w-4 h-4" />
            Ownership & Verification Tasks
          </h4>

          <div className="space-y-3">
            {/* Task 1: Auth0 Dashboard */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.siteVerification ? "bg-slate-950/40 border-slate-800 shadow-inner" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("siteVerification")} 
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.siteVerification ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.siteVerification && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-200 text-xs">Verify Domain (Auth0 Dashboard)</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    Fulfill Auth0 Trust & Safety requirements. Serving <code className="text-blue-300 font-bold bg-slate-900 px-1 rounded">/auth0verification.html</code> dynamically for verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Task 2: Netlify Ownership */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.netlifyOwnership ? "bg-slate-950/40 border-slate-800 shadow-inner" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("netlifyOwnership")}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.netlifyOwnership ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.netlifyOwnership && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-200 text-xs">Authorize Netlify Mirror</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    Provde ownership for Netlify redundany by creating a DNS TXT record or serving <code className="text-cyan-400 font-bold bg-slate-900 px-1 rounded">/.well-known/netlify-verification</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Task 3: OpenAI Plugin Auth */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.openaiAuthorized ? "bg-slate-950/40 border-slate-800 shadow-inner" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("openaiAuthorized")}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.openaiAuthorized ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.openaiAuthorized && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-200 text-xs">Authorize OpenAI Core</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    Authorize GPT-4o Triage Core by verifying <code className="text-purple-400 font-bold bg-slate-900 px-1 rounded">openai-verification.txt</code> on the root domain.
                  </p>
                </div>
              </div>
            </div>

            {/* Task 4: reCAPTCHA Enterprise Integration */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.recaptchaSetup ? "bg-slate-950/40 border-slate-800 shadow-inner" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleCheck("recaptchaSetup")}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.recaptchaSetup ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.recaptchaSetup && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-200 text-xs">reCAPTCHA Enterprise Integration</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    Activated Enterprise protection using Legacy Secret Key. Load <code className="text-amber-400 font-bold bg-slate-900 px-1 rounded">enterprise.js</code> and use Site Key <code className="text-blue-400 font-bold bg-slate-900 px-1 rounded">6LcIwSUt...6Gw</code>.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Status:</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30 font-bold uppercase tracking-widest">Active Pair Locked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 5: Mobile Readiness (Android Signing) */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.androidSigning ? "bg-slate-950/40 border-slate-800 shadow-inner" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleCheck("androidSigning")}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.androidSigning ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.androidSigning && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs uppercase tracking-tight">Android Self-Signing Verification</span>
                    <span className="text-[8px] bg-blue-900/40 text-blue-300 px-1.5 py-0.2 rounded border border-blue-800/30 font-bold uppercase tracking-widest">Mandatory for Auth0 SSO</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    To enable Auth0 Sign-In for Android, you must provide the <b>SHA-1 release fingerprint</b> in <b>Project Settings &gt; Your apps</b>.
                  </p>

                  <div className="mt-3 space-y-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-850/60 font-mono text-[9px] text-slate-500">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-blue-400 font-bold block"># EXTRACT SHA-1 (WINDOWS):</span>
                        <span className="text-[8px] text-slate-600 font-medium italic">Hint: Use full path if keytool not found</span>
                      </div>
                      <code className="select-all block break-all mb-2">
                        keytool -list -v -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore
                      </code>
                      <div className="pt-1.5 border-t border-slate-900">
                        <span className="text-slate-600 font-bold block mb-1"># ANDROID STUDIO FALLBACK:</span>
                        <code className="select-all block break-all text-slate-400 opacity-60 hover:opacity-100 transition-opacity mb-2">
                          & "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore
                        </code>
                        <span className="text-amber-600/80 font-bold block mb-1"># IF KEYSTORE MISSING (GENERATE):</span>
                        <code className="select-all block break-all text-amber-400/60 opacity-80 hover:opacity-100 transition-opacity">
                          & "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkey -v -keystore "%USERPROFILE%\.android\debug.keystore" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
                        </code>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[8px] font-bold text-slate-500 uppercase">SHA-1 (DEBUG)</label>
                        <input
                          type="text"
                          defaultValue="F8:EC:58:A4:D1:D4:AB:00:59:E6:93:45:44:1B:5A:CD:CD:86:64:0E"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[9px] text-emerald-400 font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[8px] font-bold text-slate-500 uppercase">SHA-1 (RELEASE)</label>
                        <input
                          type="text"
                          placeholder="Register production key here..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[9px] text-slate-300 font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 6: External Client ID Safelisting (Optional) */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.clientIdSafelisting ? "bg-slate-950/40 border-slate-800 shadow-inner" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleCheck("clientIdSafelisting")}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.clientIdSafelisting ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.clientIdSafelisting && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-200 text-xs uppercase tracking-tight">External Client ID Safelisting</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    (Optional) Safelist client IDs from external projects to enable cross-platform resource sharing or multi-tenant SSO handshakes.
                  </p>

                  <div className="mt-2.5">
                    <label className="text-[8px] font-bold text-slate-500 uppercase mb-1 block">External Project Client ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="1046067704682-..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-[9px] text-blue-400 font-mono focus:outline-none focus:border-blue-600"
                      />
                      <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-colors border border-slate-700">
                        Whitelist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 7: Vercel OAuth App Registration */}
            <div className={`p-3.5 rounded-lg border transition-all ${checklist.vercelOAuthRegistered ? "bg-slate-950/40 border-slate-800 shadow-inner" : "bg-slate-950/20 border-slate-900"}`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleCheck("vercelOAuthRegistered")}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${checklist.vercelOAuthRegistered ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 hover:border-slate-500"}`}
                >
                  {checklist.vercelOAuthRegistered && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-200 text-xs uppercase tracking-tight">Register Vercel OAuth Client</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    Register a new Vercel App to enable partner integrations and SSO. Requires <code className="text-emerald-400 font-bold">Vercel CLI 56.4.0+</code>.
                  </p>

                  <div className="mt-3 space-y-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-850/60 font-mono text-[9px] text-slate-500">
                      <span className="text-blue-400 font-bold block mb-1"># REGISTER NEW OAUTH CLIENT:</span>
                      <code className="select-all block break-all mb-2">
                        vercel oauth-apps register --name "D&CP Lab" --slug dcp-lab --redirect-uri {prodUrl}/api/auth/callback
                      </code>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[8px] font-bold text-slate-500 uppercase">Vercel Client ID</label>
                        <input
                          type="text"
                          placeholder="cl_abc123..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[9px] text-slate-300 font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                      <button className="self-end bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/20 active:scale-95">
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
