"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Users, 
  Lock, 
  CheckCircle2, 
  X, 
  Copy, 
  Sparkles, 
  Layers, 
  FileText, 
  Plus, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getAuth0RbacData, 
  saveAuth0RbacData, 
  DEFAULT_AUTH0_RBAC_DATA, 
  Auth0AuthorizationExtensionData, 
  evaluateUserRbac 
} from '../lib/auth0Rbac.ts';
import { useToast } from './Toast.tsx';
import { useSafeAuth0 } from './Auth0ProviderWithConfig.tsx';

interface Auth0RbacModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Auth0RbacModal({ isOpen, onClose }: Auth0RbacModalProps) {
  const { showToast } = useToast();
  const { user } = useSafeAuth0();
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'permissions' | 'config' | 'json'>('overview');
  const [rbacData, setRbacData] = useState<Auth0AuthorizationExtensionData>(() => getAuth0RbacData());
  const [jsonInput, setJsonInput] = useState<string>(() => JSON.stringify(getAuth0RbacData(), null, 2));

  const authProfile = evaluateUserRbac(user);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`, 'success');
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.configuration || !parsed.permissions || !parsed.groups) {
        throw new Error('JSON structure must include configuration, permissions, and groups arrays.');
      }
      setRbacData(parsed);
      saveAuth0RbacData(parsed);
      showToast('Auth0 RBAC Extension configuration saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid JSON syntax', 'error');
    }
  };

  const handleResetDefault = () => {
    setRbacData(DEFAULT_AUTH0_RBAC_DATA);
    setJsonInput(JSON.stringify(DEFAULT_AUTH0_RBAC_DATA, null, 2));
    saveAuth0RbacData(DEFAULT_AUTH0_RBAC_DATA);
    showToast('Reset to default Auth0 RBAC extension definition.', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-playfair font-black text-white">Auth0 Authorization Extension</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-md border border-emerald-500/30 uppercase">
                  RBAC Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Roles in Token, SuperAdmin Root group governance, and 'dcp' permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User RBAC Status Banner */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              Active User Authorization Level
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">
                {user?.name || user?.email || 'Authenticated User'}
              </span>
              {authProfile.isSuperAdmin ? (
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] rounded-lg shadow-sm">
                  SuperAdmin (Root)
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700">
                  Technician Member
                </span>
              )}
              {authProfile.hasDcpPermission && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold rounded-lg border border-blue-500/30">
                  dcp (dcp1)
                </span>
              )}
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">Auth0 Subject ID</span>
            <span className="font-mono text-xs text-blue-400 truncate max-w-[200px] block">
              {user?.sub || 'google-oauth2|102574138357203183279'}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview & Roles' },
            { id: 'groups', label: `Groups (${rbacData.groups.length})` },
            { id: 'permissions', label: `Permissions (${rbacData.permissions.length})` },
            { id: 'config', label: 'Extension API Config' },
            { id: 'json', label: 'Raw Payload JSON' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Roles in Token</div>
                <div className="text-emerald-400 font-mono font-black text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Enabled (True)
                </div>
                <p className="text-[11px] text-slate-400">Claims injected automatically into ID & Access Tokens.</p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Roles Passthrough</div>
                <div className="text-emerald-400 font-mono font-black text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Enabled (True)
                </div>
                <p className="text-[11px] text-slate-400">Passes Auth0 core authorization roles through seamlessly.</p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Client Target</div>
                <div className="text-blue-400 font-mono font-black text-sm truncate">
                  iHyCQzrHYenv4lrk...
                </div>
                <p className="text-[11px] text-slate-400">Bound to Spokane Electronics Laboratory Client App.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Configured Privileges Summary</span>
              </h4>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li><strong className="text-white">SuperAdmin Group:</strong> Full administrative rights over all bench telemetry, inventory reorders, pricing models, and repair certifications.</li>
                <li><strong className="text-white">dcp Permission (dcp1):</strong> Hardware diagnostic read/write, WebUSB logic analyzer control, and ticket dispatch authority.</li>
                <li><strong className="text-white">Member Accounts:</strong> Root account <code className="font-mono text-blue-300">google-oauth2|102574138357203183279</code> has persistent SuperAdmin status.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-3 text-xs">
            {rbacData.groups.map(grp => (
              <div key={grp._id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">{grp.name}</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] rounded border border-amber-500/30">
                      {grp.description}
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">ID: {grp._id}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Assigned Member Sub IDs:</span>
                  <div className="space-y-1">
                    {grp.members.map((member, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-blue-300">
                        <span>{member}</span>
                        <button
                          onClick={() => handleCopy(member, 'Member ID')}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-3 text-xs">
            {rbacData.permissions.map(perm => (
              <div key={perm._id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-700/50">
                      {perm.name}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">{perm.description}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">ID: {perm._id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                  <div>Application Type: <span className="text-white">{perm.applicationType}</span></div>
                  <div>App ID: <span className="text-blue-300 truncate">{perm.applicationId}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-3 text-xs">
            {rbacData.configuration.map(cfg => (
              <div key={cfg._id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-white">Config Engine: {cfg._id}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                    Active
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Extension API Key:</span>
                  <div className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300">
                    <span className="truncate max-w-[400px]">{cfg.apikey}</span>
                    <button
                      onClick={() => handleCopy(cfg.apikey, 'Extension API Key')}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">rolesInToken:</span>
                    <span className="text-emerald-400 font-bold">{String(cfg.rolesInToken)}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">rolesPassthrough:</span>
                    <span className="text-emerald-400 font-bold">{String(cfg.rolesPassthrough)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-3 text-xs">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-blue-200 outline-none focus:border-blue-500 leading-relaxed resize-y"
            />
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Preset</span>
              </button>

              <button
                type="button"
                onClick={handleSaveJson}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                Save & Apply RBAC Configuration
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Auth0 Extension ID: 8df20543-aa89-4ddb-aa83-cb00cab1801b
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
