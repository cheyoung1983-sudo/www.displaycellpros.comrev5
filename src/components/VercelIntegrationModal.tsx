import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Terminal, 
  Key, 
  RotateCw, 
  Activity,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Code
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface VercelIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VercelIntegrationModal({ isOpen, onClose }: VercelIntegrationModalProps) {
  const { showToast } = useToast();
  const [deploymentId, setDeploymentId] = useState('dpl_82kLp9XyZa910bCd4EfGhIjKlMn');
  const [integrationConfigId, setIntegrationConfigId] = useState('icfg_dcp_aurora_postgre_01');
  const [resourceId, setResourceId] = useState('res_cluster_dcp_prod_cs7wcksg2js1');
  const [action, setAction] = useState('build');
  const [customBearerToken, setCustomBearerToken] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<{ configured: boolean; projectId?: string; sdkVersion?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/vercel/status')
        .then((res) => res.json())
        .then((data) => setServerStatus(data))
        .catch(() => setServerStatus({ configured: false }));
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExecuteAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsRunning(true);
    setLastResult(null);

    try {
      const res = await fetch('/api/vercel/deployments/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deploymentId,
          integrationConfigurationId: integrationConfigId,
          resourceId,
          action,
          bearerToken: customBearerToken || undefined,
        }),
      });

      const data = await res.json();
      setLastResult(data);

      if (res.ok && data.success) {
        showToast(data.message || `Action "${action}" dispatched successfully`, 'success');
      } else {
        showToast(data.error || 'Vercel API action rejected', 'error');
      }
    } catch (err: any) {
      setLastResult({ success: false, error: err.message });
      showToast(err.message || 'Network request failed', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const codeSnippet = `import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "${customBearerToken ? customBearerToken : 'process.env.VERCEL_BEARER_TOKEN'}",
});

async function run() {
  const result = await vercel.deployments.updateIntegrationDeploymentAction({
    deploymentId: "${deploymentId}",
    integrationConfigurationId: "${integrationConfigId}",
    resourceId: "${resourceId}",
    action: "${action}",
  });

  console.log(result);
}

run();`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black border border-slate-700 text-white rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Vercel SDK Integration Engine</h3>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] font-bold rounded-md border border-slate-700">
                  @vercel/sdk
                </span>
                {serverStatus?.configured ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Token Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-md border border-amber-500/30">
                    Ready for Token
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Execute <code className="text-purple-300">vercel.deployments.updateIntegrationDeploymentAction()</code> with live SDK bindings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Config Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Action Preset:</span>
          {['build', 'deploy', 'retry', 'promote', 'cancel', 'invalidate_cache'].map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setAction(act)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all border cursor-pointer ${
                action === act
                  ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {act}
            </button>
          ))}
        </div>

        {/* Input Parameters Form */}
        <form onSubmit={handleExecuteAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Deployment ID (<code className="text-blue-400 font-mono">deploymentId</code>)</span>
              </label>
              <input
                type="text"
                value={deploymentId}
                onChange={(e) => setDeploymentId(e.target.value)}
                placeholder="e.g. dpl_82kLp9XyZa910bCd4EfGhIjKlMn"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Integration Config ID (<code className="text-purple-400 font-mono">integrationConfigurationId</code>)</span>
              </label>
              <input
                type="text"
                value={integrationConfigId}
                onChange={(e) => setIntegrationConfigId(e.target.value)}
                placeholder="e.g. icfg_dcp_aurora_postgre_01"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-purple-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Resource ID (<code className="text-emerald-400 font-mono">resourceId</code>)</span>
              </label>
              <input
                type="text"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                placeholder="e.g. res_cluster_dcp_prod_cs7wcksg2js1"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Action (<code className="text-amber-400 font-mono">action</code>)</span>
              </label>
              <input
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g. build, retry, deploy"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>Optional Bearer Token Override (<code className="text-slate-400 font-mono">bearerToken</code>)</span>
              </label>
              <span className="text-[10px] text-slate-500">Defaults to VERCEL_BEARER_TOKEN</span>
            </div>
            <input
              type="password"
              value={customBearerToken}
              onChange={(e) => setCustomBearerToken(e.target.value)}
              placeholder="Leave blank to use server environment VERCEL_BEARER_TOKEN"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => copyToClipboard(codeSnippet, 'sdk-code')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
            >
              {copiedField === 'sdk-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'sdk-code' ? 'Code Copied!' : 'Copy TypeScript'}</span>
            </button>

            <button
              type="submit"
              disabled={isRunning}
              className="px-5 py-2.5 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isRunning ? <RotateCw className="w-4 h-4 animate-spin text-black" /> : <Play className="w-4 h-4 text-black fill-current" />}
              <span>{isRunning ? 'Executing SDK...' : 'Run Integration Action'}</span>
            </button>
          </div>
        </form>

        {/* Code Snippet & Result Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-400" />
              <span>Generated @vercel/sdk Code</span>
            </span>
          </div>
          <pre className="bg-black/90 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
            {codeSnippet}
          </pre>
        </div>

        {/* Last Execution Output */}
        {lastResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Response Payload</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${lastResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                {lastResult.success ? 'HTTP 200 OK' : 'STATUS ERROR'}
              </span>
            </div>
            <pre className="bg-black/95 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-[180px]">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Vercel Deployments API • Integration Actions</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
