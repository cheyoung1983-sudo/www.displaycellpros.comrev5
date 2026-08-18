/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sparkles, Brain, Loader2, Github, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { TelemetryData } from '../types.ts';
import { useToast } from './Toast.tsx';

interface AIDiagnosticProps {
  telemetry: TelemetryData;
  issue: string;
  model: string;
}

export default function AIDiagnostic({ telemetry, issue, model }: AIDiagnosticProps) {
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [githubSyncedUrl, setGithubSyncedUrl] = useState<string | null>(null);

  const handleSyncToGithub = async () => {
    try {
      setIsSyncingGithub(true);
      const token = localStorage.getItem('dcp_github_token_stored') || undefined;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/github/sync/issue', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `[Triage] ${model} - ${issue.slice(0, 50)}`,
          body: `### Diagnostic Analysis\n\n${analysis}\n\n### Customer Stated Issue\n${issue}`,
          deviceModel: model,
          ticketId: `DCP-${Math.floor(Math.random() * 8999 + 1000)}`,
          telemetry: {
            ammeterDrawAmps: telemetry?.ammeterDrawAmps,
            isShortToGround: telemetry?.isShortToGround,
            batteryTempCelsius: telemetry?.batteryTempCelsius,
          }
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGithubSyncedUrl(data.htmlUrl);
        showToast(data.message || 'Synced diagnostic issue to GitHub repository', 'success');
      } else {
        throw new Error(data.error || 'Failed to sync to GitHub');
      }
    } catch (err: any) {
      showToast(err.message || 'Error syncing to GitHub', 'error');
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry, customerReportedIssue: issue, deviceModel: model }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      if (response.ok && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to retrieve analysis');
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setErrorMsg(error.message || 'Diagnostic service unavailable. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI Diagnostic Assistant</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">OpenAI GPT-4o • Telemetry Triage</p>
          </div>
        </div>
        {!analysis && !loading && (
          <button
            onClick={runAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Brain className="w-4 h-4" />
            Analyze Telemetry
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 text-sm animate-pulse">Consulting technical specification & logic board schematics...</p>
          </motion.div>
        ) : errorMsg ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 px-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3"
          >
            <p className="text-amber-800 text-sm font-medium">{errorMsg}</p>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-bold hover:bg-amber-900 transition-colors"
            >
              Retry Diagnostic
            </button>
          </motion.div>
        ) : analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-slate prose-sm max-w-none"
          >
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-inner overflow-y-auto max-h-[400px]">
              <Markdown>{analysis}</Markdown>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setGithubSyncedUrl(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Reset Analysis
              </button>

              <div className="flex items-center gap-2">
                {githubSyncedUrl ? (
                  <a
                    href={githubSyncedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>View Synced Issue on GitHub</span>
                  </a>
                ) : (
                  <button
                    onClick={handleSyncToGithub}
                    disabled={isSyncingGithub}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSyncingGithub ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                    <span>Sync to GitHub Repo Issue</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500 text-sm">Perform a telemetry sweep to enable AI diagnostic triage.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
