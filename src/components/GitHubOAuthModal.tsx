import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitBranch, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Copy, 
  Check, 
  Key, 
  LogOut, 
  RefreshCw, 
  Terminal,
  User,
  Radio,
  FileCode,
  Send,
  Trash2,
  FolderGit2,
  GitPullRequest,
  CheckCircle,
  Activity,
  Layers,
  ArrowRight,
  Bug,
  Plus
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface GitHubOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'oauth' | 'webhooks' | 'sync';
}

interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
  email?: string;
  bio?: string;
  company?: string;
  location?: string;
  public_repos?: number;
  html_url?: string;
}

interface WebhookEvent {
  id: string;
  event: string;
  action?: string;
  deliveryId: string;
  receivedAt: string;
  sender: {
    login: string;
    avatar_url?: string;
  };
  repo: {
    name: string;
    full_name: string;
  };
  summary: string;
  verified: boolean;
  payload: any;
}

interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  html_url: string;
  description: string;
  default_branch: string;
  open_issues_count: number;
  stargazers_count: number;
  pushed_at: string;
  visibility: string;
}

export default function GitHubOAuthModal({ isOpen, onClose, initialTab = 'oauth' }: GitHubOAuthModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'oauth' | 'webhooks' | 'sync'>(initialTab);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gitHubUser, setGitHubUser] = useState<GitHubUser | null>(() => {
    try {
      const saved = localStorage.getItem('dcp_github_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Webhook State
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Sync State
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [repoCommits, setRepoCommits] = useState<any[]>([]);
  const [repoIssues, setRepoIssues] = useState<any[]>([]);
  const [isSyncingBatch, setIsSyncingBatch] = useState(false);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any | null>(null);

  // Issue Form
  const [newIssueTitle, setNewIssueTitle] = useState('[Triage] iPhone 15 Pro Max No Power (0.04A DC Draw)');
  const [newIssueBody, setNewIssueBody] = useState('Observed 0.04A short to ground on VDD_MAIN rail during bench intake sweep.');
  const [newIssueModel, setNewIssueModel] = useState('iPhone 15 Pro Max (A3106)');

  const clientId = 'Ov23lifKkuO7pQzIVrlG';
  const appName = 'Dcp';
  const owner = 'cheyoung1983-sudo';
  const repoName = 'D-CP-LLC-Repair-Portal-001';

  // Derived callback and webhook URLs
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const devCallbackUrl = `${currentOrigin}/auth/github/callback`;
  const genericCallbackUrl = `${currentOrigin}/auth/callback`;
  const webhookListenerUrl = `${currentOrigin}/api/github/webhooks`;

  // Sync initial tab when changed
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Fetch Webhooks
  const fetchWebhookEvents = async () => {
    try {
      setLoadingWebhooks(true);
      const res = await fetch('/api/github/webhooks/events');
      if (res.ok) {
        const data = await res.json();
        setWebhookEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  // Fetch Repo Info & Commits
  const fetchRepoData = async () => {
    try {
      const infoRes = await fetch('/api/github/sync/repo-info');
      if (infoRes.ok) {
        const data = await infoRes.json();
        setRepoInfo(data.repo);
      }
      const commitsRes = await fetch('/api/github/sync/commits');
      if (commitsRes.ok) {
        const data = await commitsRes.json();
        setRepoCommits(data.commits || []);
      }
      const issuesRes = await fetch('/api/github/sync/issues');
      if (issuesRes.ok) {
        const data = await issuesRes.json();
        setRepoIssues(data.issues || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWebhookEvents();
      fetchRepoData();
    }
  }, [isOpen]);

  // Listen for OAuth postMessage from popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'github') {
        const user = event.data.user;
        setGitHubUser(user);
        try {
          localStorage.setItem('dcp_github_user', JSON.stringify(user));
          if (event.data.accessToken) {
            localStorage.setItem('dcp_github_token_stored', event.data.accessToken);
          }
        } catch (e) {
          console.error(e);
        }
        setIsConnecting(false);
        showToast(`Connected to GitHub account @${user.login || 'user'}!`, 'success');
        fetchRepoData();
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setIsConnecting(false);
        showToast(event.data.error || 'GitHub authorization failed', 'error');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [showToast]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast(`Copied ${fieldId} to clipboard`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConnectGitHub = async () => {
    try {
      setIsConnecting(true);
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const res = await fetch(`/api/auth/github/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (!res.ok) {
        throw new Error('Failed to retrieve GitHub OAuth authorization URL');
      }
      
      const { url } = await res.json();

      const width = 600;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        url,
        'github_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!authWindow) {
        setIsConnecting(false);
        showToast('Popup blocked. Please allow popups for this site to sign in with GitHub.', 'error');
      }
    } catch (err: any) {
      setIsConnecting(false);
      showToast(err.message || 'Encountered error initiating GitHub OAuth', 'error');
    }
  };

  const handleDisconnect = () => {
    setGitHubUser(null);
    localStorage.removeItem('dcp_github_user');
    localStorage.removeItem('dcp_github_token_stored');
    showToast('Disconnected GitHub account', 'info');
  };

  const handleSendTestPing = async () => {
    try {
      setIsTestingPing(true);
      const res = await fetch('/api/github/webhooks/test-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: gitHubUser?.login || 'cheyoung1983-sudo',
          message: 'Spokane Bench Automated Telemetry Webhook Ping',
        }),
      });
      if (res.ok) {
        showToast('Test ping webhook dispatched and logged!', 'success');
        await fetchWebhookEvents();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to dispatch ping webhook', 'error');
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleClearWebhooks = async () => {
    try {
      await fetch('/api/github/webhooks/events', { method: 'DELETE' });
      setWebhookEvents([]);
      showToast('Webhook events log cleared', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const handleBatchSyncSOPs = async () => {
    try {
      setIsSyncingBatch(true);
      const token = localStorage.getItem('dcp_github_token_stored') || undefined;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/github/sync/batch', {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (res.ok) {
        setLastSyncResult(data);
        showToast(data.message || 'Standard SOPs synced to repository docs/', 'success');
        fetchRepoData();
        fetchWebhookEvents();
      } else {
        throw new Error(data.error || 'Failed to sync SOP batch');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to auto-sync repository SOPs', 'error');
    } finally {
      setIsSyncingBatch(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingIssue(true);
      const token = localStorage.getItem('dcp_github_token_stored') || undefined;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/github/sync/issue', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newIssueTitle,
          body: newIssueBody,
          deviceModel: newIssueModel,
          ticketId: `DCP-${Math.floor(Math.random() * 9000 + 1000)}`,
          telemetry: {
            ammeterDrawAmps: 0.04,
            isShortToGround: true,
            thermalHotspotCelsius: 44.5,
          },
          labels: ['bench-triage', 'tier-3-board-rework', 'hardware-diagnostic']
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Created Issue #${data.issueNumber} on GitHub!`, 'success');
        fetchRepoData();
        fetchWebhookEvents();
      } else {
        throw new Error(data.error || 'Failed to open GitHub Issue');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to create GitHub Issue', 'error');
    } finally {
      setIsCreatingIssue(false);
    }
  };

  const handleSyncTelemetry = async () => {
    try {
      setIsSyncingTelemetry(true);
      const token = localStorage.getItem('dcp_github_token_stored') || undefined;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/github/sync/telemetry', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deviceModel: 'iPad Pro 12.9 M2',
          ammeterDrawAmps: 0.02,
          isShortToGround: true,
          thermalHotspotCelsius: 48.2,
          notes: 'Spokane Bench Sweep: VDD_MAIN short identified at C3104 decoupling MLCC',
          technician: gitHubUser?.name || 'Lead Bench Tech'
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Appended telemetry record to repository diagnostics-log.json', 'success');
        fetchRepoData();
        fetchWebhookEvents();
      } else {
        throw new Error(data.error || 'Failed to sync telemetry log');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to sync telemetry', 'error');
    } finally {
      setIsSyncingTelemetry(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-800 border border-slate-700 text-white rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">GitHub Developer Hub</h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold rounded-md border border-blue-500/30">
                  Dcp App
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected App for <span className="text-slate-200 font-bold">@{owner}/{repoName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('oauth')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'oauth' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>OAuth & Auth</span>
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'webhooks' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Webhooks ({webhookEvents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'sync' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Repo Sync</span>
            </button>
            <button
              onClick={onClose}
              className="ml-2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* TAB 1: OAUTH & AUTH */}
        {activeTab === 'oauth' && (
          <div className="space-y-6">
            {/* Live Connected Status Card */}
            {gitHubUser ? (
              <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {gitHubUser.avatar_url ? (
                      <img
                        src={gitHubUser.avatar_url}
                        alt={gitHubUser.login}
                        className="w-12 h-12 rounded-xl border border-emerald-500/50 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold">
                        <User className="w-6 h-6 text-emerald-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{gitHubUser.name || gitHubUser.login}</span>
                        <span className="text-xs text-emerald-400 font-mono">@{gitHubUser.login}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{gitHubUser.email || `${gitHubUser.public_repos ?? 0} public repositories`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <a
                    href={gitHubUser.html_url || `https://github.com/${gitHubUser.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                  >
                    <span>View GitHub Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleDisconnect}
                    className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 px-3 py-1 bg-rose-950/30 rounded-lg border border-rose-900/40 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Connect GitHub Developer Account</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Authorize your <span className="text-white font-semibold">Dcp</span> GitHub OAuth App to link repository commits, diagnostics, and issue tracking.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Ready to Connect
                  </span>
                </div>

                <button
                  onClick={handleConnectGitHub}
                  disabled={isConnecting}
                  className="w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                  ) : (
                    <Github className="w-4 h-4 text-slate-950" />
                  )}
                  <span>{isConnecting ? 'Waiting for GitHub Authorization...' : 'Sign In with GitHub (OAuth)'}</span>
                </button>
              </div>
            )}

            {/* Credentials & Developer Configuration */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>OAuth Application Settings</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Server Secrets Stored
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 block">CLIENT ID</span>
                    <span className="text-slate-200">{clientId}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(clientId, 'Client ID')}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                    title="Copy Client ID"
                  >
                    {copiedField === 'Client ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 block">CLIENT SECRET</span>
                    <span className="text-emerald-400 font-bold">•••••••• (Secured in .env)</span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1" />
                </div>
              </div>

              {/* Authorization Callback URLs */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-xs">Registered Authorization Callback URLs</span>
                  <a
                    href="https://github.com/settings/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-[10px] font-bold flex items-center gap-1"
                  >
                    <span>GitHub Developer Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ensure these exact URLs are added to your GitHub OAuth App settings under <code className="font-mono text-slate-300">Authorization callback URL</code>:
                </p>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-blue-300 truncate mr-2">{devCallbackUrl}</span>
                    <button
                      onClick={() => copyToClipboard(devCallbackUrl, 'Primary Callback URL')}
                      className="p-1 text-slate-400 hover:text-white shrink-0"
                      title="Copy Callback URL"
                    >
                      {copiedField === 'Primary Callback URL' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 truncate mr-2">{genericCallbackUrl}</span>
                    <button
                      onClick={() => copyToClipboard(genericCallbackUrl, 'Generic Callback URL')}
                      className="p-1 text-slate-400 hover:text-white shrink-0"
                      title="Copy Generic Callback URL"
                    >
                      {copiedField === 'Generic Callback URL' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEBHOOK LISTENER */}
        {activeTab === 'webhooks' && (
          <div className="space-y-5">
            {/* Listener Endpoint Config Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live Webhook Listener Endpoint</h4>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded">
                  HTTP POST Ready
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Add this URL in your GitHub App / Repo Webhook settings (<code className="text-slate-300">Payload URL</code>) to automatically receive push, issue, and workflow notifications:
              </p>

              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-emerald-300 truncate mr-2">{webhookListenerUrl}</span>
                <button
                  onClick={() => copyToClipboard(webhookListenerUrl, 'Webhook URL')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedField === 'Webhook URL' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy URL</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 font-medium">HMAC SHA-256 Signature Verification:</span>
                  <span className="text-emerald-400 font-mono font-bold">Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendTestPing}
                    disabled={isTestingPing}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isTestingPing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Test Ping Webhook</span>
                  </button>
                  <button
                    onClick={handleClearWebhooks}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                    title="Clear Log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Webhook Events Stream */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Received Webhook Events Stream ({webhookEvents.length})</span>
                </h4>
                <button
                  onClick={fetchWebhookEvents}
                  disabled={loadingWebhooks}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingWebhooks ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {webhookEvents.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  No webhook events received yet. Click "Send Test Ping Webhook" or configure GitHub to send events.
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {webhookEvents.map((evt) => {
                    const isSelected = selectedEventId === evt.id;
                    const eventColor = 
                      evt.event === 'push' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      evt.event === 'issues' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      evt.event === 'pull_request' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                      'bg-blue-500/20 text-blue-300 border-blue-500/30';

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEventId(isSelected ? null : evt.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-950 border-blue-500/60 shadow-lg' 
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded uppercase border ${eventColor}`}>
                              {evt.event}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-white leading-tight">{evt.summary}</p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                                <span>@{evt.sender.login}</span>
                                <span>•</span>
                                <span>{new Date(evt.receivedAt).toLocaleTimeString()}</span>
                                <span>•</span>
                                <span className="text-slate-500">{evt.deliveryId.slice(0, 14)}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] text-emerald-400 font-mono shrink-0 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {evt.verified ? 'Verified' : 'Accepted'}
                          </span>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-slate-800 font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto max-h-48"
                          >
                            <pre>{JSON.stringify(evt.payload, null, 2)}</pre>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REPOSITORY SYNC */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            {/* Repository Info Header */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-sm">{owner}/{repoName}</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold rounded">
                    Branch: {repoInfo?.default_branch || 'main'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {repoInfo?.description || 'D&CP LLC Repair Portal • Spokane Bench Telemetry & SOPs'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://github.com/${owner}/${repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Open in GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Automation Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Batch Sync SOPs */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sync Standard Repair SOPs</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Commits Tristar, Short-to-Ground, and Face ID Markdown SOPs to <code className="text-slate-300">docs/repairs/</code> in the repository.
                  </p>
                </div>
                <button
                  onClick={handleBatchSyncSOPs}
                  disabled={isSyncingBatch}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncingBatch ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isSyncingBatch ? 'Committing SOPs to GitHub...' : 'Auto-Sync SOP Library'}</span>
                </button>
              </div>

              {/* Sync Telemetry Log */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sync Diagnostics Log</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Appends active bench ammeter sweep & hotspot readings to <code className="text-slate-300">telemetry/diagnostics-log.json</code>.
                  </p>
                </div>
                <button
                  onClick={handleSyncTelemetry}
                  disabled={isSyncingTelemetry}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncingTelemetry ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                  <span>{isSyncingTelemetry ? 'Writing Telemetry Entry...' : 'Sync Telemetry Log'}</span>
                </button>
              </div>
            </div>

            {/* Quick Issue Creator */}
            <form onSubmit={handleCreateIssue} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-white uppercase tracking-wider">Open Triage GitHub Issue</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Labels: bench-triage, tier-3-board-rework</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Issue Title</label>
                  <input
                    type="text"
                    value={newIssueTitle}
                    onChange={(e) => setNewIssueTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Target Device Model</label>
                  <input
                    type="text"
                    value={newIssueModel}
                    onChange={(e) => setNewIssueModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Bench Notes / Telemetry Details</label>
                <textarea
                  value={newIssueBody}
                  onChange={(e) => setNewIssueBody(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingIssue}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCreatingIssue ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isCreatingIssue ? 'Creating GitHub Issue...' : 'Push Triage Ticket to GitHub Issues'}</span>
              </button>
            </form>

            {/* Commits and Issues Lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Recent Commits */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                    <span>Recent Commits</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">main</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {repoCommits.map((c, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded-xl border border-slate-800/80 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-blue-400 font-bold">{c.sha}</span>
                        <span className="text-[10px] text-slate-500">{new Date(c.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300 truncate mt-0.5">{c.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Issues */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Lab Issues</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Repo Tracker</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {repoIssues.map((iss, idx) => (
                    <a
                      key={idx}
                      href={iss.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800/80 text-[11px] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate mr-2">#{iss.number} {iss.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {iss.labels?.map((l: string, li: number) => (
                          <span key={li} className="px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded text-[9px] font-mono">
                            {l}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Spokane Bench • Repository Automation v2.4</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
