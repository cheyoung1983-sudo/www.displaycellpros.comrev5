"use client";

import React, { useState } from 'react';
import { 
  User, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ChevronDown, 
  Sparkles, 
  Lock, 
  Loader2,
  Shield,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSafeAuth0 } from './Auth0ProviderWithConfig.tsx';
import { useToast } from './Toast.tsx';
import { evaluateUserRbac } from '../lib/auth0Rbac.ts';
import Auth0RbacModal from './Auth0RbacModal.tsx';
import Auth0TenantAuditReport from './Auth0TenantAuditReport.tsx';
import GitHubOAuthModal from './GitHubOAuthModal.tsx';
import { Github } from 'lucide-react';

export default function Auth0UserButton() {
  const { 
    isConfigured, 
    isAuthenticated, 
    isLoading, 
    user, 
    loginWithRedirect, 
    loginWithPopup, 
    logout 
  } = useSafeAuth0();
  
  const { showToast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showRbacModal, setShowRbacModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const authProfile = evaluateUserRbac(user);

  const handleLogin = async (usePopup = false) => {
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }

    try {
      setIsLoggingIn(true);
      if (usePopup) {
        await loginWithPopup();
        showToast('Successfully authenticated via Auth0 Universal Login', 'success');
      } else {
        await loginWithRedirect();
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication encountered an error', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (!isConfigured) return;
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    showToast('Signed out of Spokane Lab Auth0 Session', 'info');
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
        <span>Authenticating...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Authenticated State */}
      {isAuthenticated && user ? (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all border border-slate-800 shadow-md group"
          >
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name || 'Lab Technician'} 
                className="w-7 h-7 rounded-xl object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {(user.name || user.email || 'T')[0].toUpperCase()}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <div className="text-[11px] font-black leading-none truncate max-w-[110px] flex items-center gap-1">
                <span>{user.name || user.email?.split('@')[0]}</span>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                {authProfile.isSuperAdmin ? (
                  <span className="text-amber-400 font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    SuperAdmin
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Auth0 Verified
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border border-slate-800 z-50 space-y-3"
              >
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-2xl border border-slate-700 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black">
                      {(user.name || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className="font-black text-sm text-white truncate flex items-center gap-1.5">
                      <span>{user.name || 'Lab Engineer'}</span>
                      {authProfile.isSuperAdmin && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-mono text-[9px] rounded font-bold">
                          Root
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider flex items-center justify-between">
                      <span>RBAC Access Role</span>
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {authProfile.groups.join(', ') || 'SuperAdmin'}
                      {authProfile.hasDcpPermission && (
                        <span className="text-blue-400 text-[10px] font-mono">({authProfile.permissions.join(', ')})</span>
                      )}
                    </div>
                    {user.sub && (
                      <div className="text-[9px] text-slate-500 font-mono truncate pt-0.5">
                        SUB: {user.sub}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-1 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowRbacModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auth0 RBAC Extension Config</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowAuditModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-blue-300 hover:text-blue-200 hover:bg-slate-800 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                    <span>Auth0 Tenant Security Audit</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowGitHubModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-300" />
                    <span>GitHub Hub & Sync Automation</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowConfigModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    <span>Domain & Client Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Auth0</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Unauthenticated or Unconfigured Trigger */
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGitHubModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-800 shadow-sm"
            title="Connect GitHub OAuth"
          >
            <Github className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">GitHub</span>
          </button>
          <button
            onClick={() => handleLogin(false)}
            disabled={isLoggingIn}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 border border-slate-800"
          >
            {isLoggingIn ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>{isConfigured ? 'Sign In' : 'Auth0 Login'}</span>
          </button>
        </div>
      )}

      {/* GitHub OAuth Modal */}
      <GitHubOAuthModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
      />

      {/* Auth0 RBAC Extension Modal */}
      <Auth0RbacModal
        isOpen={showRbacModal}
        onClose={() => setShowRbacModal(false)}
      />

      {/* Auth0 Tenant Audit Report Modal */}
      <Auth0TenantAuditReport
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
      />

      {/* Auth0 Setup & Info Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Auth0 Identity Platform</h3>
                    <p className="text-xs text-slate-400">Universal Login, MFA & RBAC for Laboratory Technicians</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Environment Status</span>
                    {isConfigured ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Configured
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pending Domain & Client ID
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Auth0 Single Sign-On handles OAuth2 / OIDC authentication for Spokane Bench Technicians and customer account verification with PKCE security.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="text-slate-500"># Required Auth0 Environment Settings</div>
                  <div className="text-blue-300">VITE_AUTH0_DOMAIN=<span className="text-slate-400">your-tenant.us.auth0.com</span></div>
                  <div className="text-blue-300">VITE_AUTH0_CLIENT_ID=<span className="text-slate-400">your_spa_client_id</span></div>
                  <div className="text-slate-500">VITE_AUTH0_AUDIENCE=<span className="text-slate-400">https://api.dcp-spokane.com</span> (optional)</div>
                </div>

                <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-blue-200 text-[11px] flex items-center justify-between">
                  <span>Standard Reference: <code className="font-mono text-white">auth0.com/llms.txt</code></span>
                  <a
                    href="https://auth0.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold ml-2"
                  >
                    <span>Auth0 Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
                {isConfigured && !isAuthenticated && (
                  <button
                    onClick={() => {
                      setShowConfigModal(false);
                      handleLogin(false);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
                  >
                    Proceed to Auth0 Login
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
