"use client";

import React, { useState } from 'react';
import { 
  Database, 
  FileText, 
  Search, 
  Cpu, 
  Wrench, 
  Plus, 
  Folder, 
  Globe, 
  Upload, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  BookOpen, 
  Terminal, 
  Code2, 
  Sparkles,
  RefreshCw,
  Trash2,
  Server,
  CloudSun,
  ShieldCheck,
  PhoneOff,
  Languages,
  ArrowRightLeft,
  PhoneForwarded,
  SkipForward,
  PhoneCall,
  Voicemail,
  PenLine
} from 'lucide-react';
import { useToast } from './Toast.tsx';

interface KnowledgeDoc {
  id: string;
  name: string;
  type: 'text' | 'url' | 'file' | 'folder';
  usageMode: 'auto' | 'prompt';
  sizeOrChars: string;
  status: 'indexed' | 'indexing' | 'prompt_only';
  ragEnabled: boolean;
}

interface AgentTool {
  id: string;
  name: string;
  description: string;
  type: 'client' | 'webhook' | 'mcp' | 'system';
  expectsResponse: boolean;
  url?: string;
  method?: 'GET' | 'POST';
  approvalMode?: 'always_ask' | 'fine_grained' | 'no_approval';
  parameters: { id: string; type: string; required: boolean; description: string }[];
}

const initialDocuments: KnowledgeDoc[] = [
  {
    id: 'doc_dcp_specs_01',
    name: 'D&CP LLC Micro-Soldering Technical Manual & PMIC Fault Guide',
    type: 'file',
    usageMode: 'auto',
    sizeOrChars: '4.8 MB (PDF / MD)',
    status: 'indexed',
    ragEnabled: true
  },
  {
    id: 'doc_eleven_docs_02',
    name: 'ElevenLabs Conversational AI Agents & Tool Calling Documentation',
    type: 'url',
    usageMode: 'auto',
    sizeOrChars: '1.2 MB (Crawled HTML)',
    status: 'indexed',
    ragEnabled: true
  },
  {
    id: 'doc_pricing_03',
    name: 'PostgreSQL Pricing & Tier 1-4 Board Repair Matrix',
    type: 'text',
    usageMode: 'prompt',
    sizeOrChars: '45,200 characters',
    status: 'prompt_only',
    ragEnabled: false
  }
];

const initialTools: AgentTool[] = [
  {
    id: 'tool_get_weather',
    name: 'get_weather',
    description: 'Gets the current weather forecast for a location using latitude and longitude coordinates.',
    type: 'webhook',
    expectsResponse: true,
    url: 'https://api.open-meteo.com/v1/forecast?current=temperature_2m,wind_speed_10m',
    method: 'GET',
    parameters: [
      { id: 'latitude', type: 'string', required: true, description: 'The latitude coordinate for the requested location' },
      { id: 'longitude', type: 'string', required: true, description: 'The longitude coordinate for the requested location' }
    ]
  },
  {
    id: 'tool_zapier_mcp',
    name: 'Zapier MCP Server',
    description: 'Model Context Protocol server connecting ElevenAgents to Zapier workflows and automated triggers.',
    type: 'mcp',
    expectsResponse: true,
    approvalMode: 'always_ask',
    parameters: [
      { id: 'action_name', type: 'string', required: true, description: 'Zapier action or workflow identifier' }
    ]
  },
  {
    id: 'tool_end_call',
    name: 'end_call',
    description: 'Automatically terminate conversations when appropriate conditions are met or task completes.',
    type: 'system',
    expectsResponse: false,
    parameters: [
      { id: 'reason', type: 'string', required: true, description: 'Reason for ending the call' },
      { id: 'message', type: 'string', required: false, description: 'Farewell message to send to user' }
    ]
  },
  {
    id: 'tool_language_detection',
    name: 'language_detection',
    description: 'Automatically switch to the user\'s detected language during conversations.',
    type: 'system',
    expectsResponse: false,
    parameters: [
      { id: 'reason', type: 'string', required: true, description: 'Reason for language switch' },
      { id: 'language', type: 'string', required: true, description: 'Language code to switch to (e.g., es, fr, en)' }
    ]
  },
  {
    id: 'tool_update_state',
    name: 'update_state',
    description: 'Let the agent update one or more dynamic variables based on conversation without external API call.',
    type: 'system',
    expectsResponse: false,
    parameters: [
      { id: 'should_escalate', type: 'boolean', required: false, description: 'Escalation flag for complex tickets' }
    ]
  },
  {
    id: 'tool_log_msg',
    name: 'logMessage',
    description: 'Use this client-side tool to log a diagnostic message to the technician console.',
    type: 'client',
    expectsResponse: false,
    parameters: [
      { id: 'message', type: 'string', required: true, description: 'The message to log in the console.' }
    ]
  }
];

export default function ElevenKnowledgeAndToolsHub() {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'knowledge' | 'rag' | 'tools' | 'mcp'>('tools');
  const [documents, setDocuments] = useState<KnowledgeDoc[]>(initialDocuments);
  const [tools, setTools] = useState<AgentTool[]>(initialTools);
  
  // RAG settings
  const [ragConfig, setRagConfig] = useState({
    enabled: true,
    embeddingModel: 'e5_mistral_7b_instruct',
    maxVectorDistance: 0.6,
    maxDocumentsLength: 50000,
    maxChunksCount: 20
  });

  const [isIndexing, setIsIndexing] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<'text' | 'url' | 'file'>('text');
  const [newDocContent, setNewDocContent] = useState('');

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      showToast('Please provide a document name.', 'error');
      return;
    }
    const newDoc: KnowledgeDoc = {
      id: `doc_${Date.now()}`,
      name: newDocName,
      type: newDocType,
      usageMode: 'auto',
      sizeOrChars: newDocType === 'text' ? `${newDocContent.length || 1500} characters` : '2.1 MB',
      status: ragConfig.enabled ? 'indexed' : 'prompt_only',
      ragEnabled: ragConfig.enabled
    };
    setDocuments([newDoc, ...documents]);
    setNewDocName('');
    setNewDocContent('');
    showToast('Knowledge document added and synchronized successfully!', 'success');
  };

  const handleTriggerRagIndex = (id: string) => {
    setIsIndexing(true);
    setTimeout(() => {
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: 'indexed', ragEnabled: true } : d));
      setIsIndexing(false);
      showToast('RAG indexing successfully completed for document!', 'success');
    }, 1200);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(docs => docs.filter(d => d.id !== id));
    showToast('Document removed from knowledge base.', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-inner">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-playfair font-black text-white">Knowledge Base, Webhooks & MCP Tools Hub</h2>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold rounded-md border border-indigo-500/30 uppercase">
                ElevenLabs v3
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Manage custom domain documents, RAG embeddings, Webhook APIs (Open-Meteo), Model Context Protocol (MCP) servers, and System tools.
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1">
          <button
            onClick={() => setActiveSubTab('tools')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'tools'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Tools & Webhooks</span>
          </button>
          <button
            onClick={() => setActiveSubTab('mcp')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'mcp'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>MCP Servers</span>
          </button>
          <button
            onClick={() => setActiveSubTab('knowledge')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'knowledge'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Documents</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rag')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'rag'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>RAG</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 3: TOOLS & WEBHOOKS & SYSTEM TOOLS */}
      {activeSubTab === 'tools' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-playfair font-bold text-xl text-white">Agent Tools: Webhooks, Client, & System Functions</h3>
              <p className="text-xs text-slate-400 mt-1">Equip your conversational agent with Open-Meteo weather APIs, client browser execution, and internal state system tools</p>
            </div>
            <button
              onClick={() => showToast('New tool configuration modal opened.', 'info')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Tool</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => (
              <div key={tool.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tool.type === 'webhook' && <CloudSun className="w-4 h-4 text-amber-400" />}
                      {tool.type === 'mcp' && <Server className="w-4 h-4 text-purple-400" />}
                      {tool.type === 'system' && <Cpu className="w-4 h-4 text-emerald-400" />}
                      {tool.type === 'client' && <Terminal className="w-4 h-4 text-blue-400" />}
                      <span className="font-mono font-bold text-white text-base">{tool.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      tool.type === 'webhook' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      tool.type === 'mcp' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      tool.type === 'system' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {tool.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>

                  {tool.url && (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 truncate">
                      <strong className="text-slate-500 uppercase text-[9px] block">Endpoint URL ({tool.method || 'GET'})</strong>
                      {tool.url}
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Parameters ({tool.parameters.length})</span>
                    {tool.parameters.length === 0 ? (
                      <span className="text-slate-500 italic">No parameters required</span>
                    ) : (
                      tool.parameters.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-slate-300 bg-slate-950 p-2 rounded-xl">
                          <span className="text-indigo-400 font-bold">{p.id} ({p.type})</span>
                          <span className="text-[10px] text-slate-500">{p.required ? 'required' : 'optional'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Expects Response: <strong className={tool.expectsResponse ? 'text-emerald-400' : 'text-slate-400'}>{tool.expectsResponse ? 'YES' : 'NO'}</strong></span>
                  <span className="text-indigo-400 hover:underline cursor-pointer">Configure</span>
                </div>
              </div>
            ))}
          </div>

          {/* System Tools Reference Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-playfair font-bold text-lg text-white">System Tools & State Management</h4>
                <p className="text-xs text-slate-400">System tools modify internal conversational state without making external web requests.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>end_call</span>
                </div>
                <p className="text-[11px] text-slate-400">Terminates call when task completes.</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Languages className="w-3.5 h-3.5 text-indigo-400" />
                  <span>language_detection</span>
                </div>
                <p className="text-[11px] text-slate-400">Switches language dynamically.</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <PenLine className="w-3.5 h-3.5 text-amber-400" />
                  <span>update_state</span>
                </div>
                <p className="text-[11px] text-slate-400">Updates dynamic variables mid-call.</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <SkipForward className="w-3.5 h-3.5 text-blue-400" />
                  <span>skip_turn</span>
                </div>
                <p className="text-[11px] text-slate-400">Pauses agent response when processing.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: MCP SERVERS */}
      {activeSubTab === 'mcp' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl flex items-center justify-center">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-xl text-white">Model Context Protocol (MCP) Integrations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Connect external MCP servers (SSE & HTTP Streamable) to power your conversational agents</p>
                </div>
              </div>
              <button
                onClick={() => showToast('MCP workspace connection dialog opened.', 'success')}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom MCP Server</span>
              </button>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs text-amber-200">
                <span className="font-bold">User Responsibility:</span> You are responsible for the security, compliance, and behavior of any third-party MCP server integrated with ElevenLabs.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Zapier MCP Server</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">SSE Transport</span>
                </div>
                <p className="text-xs text-slate-400">An MCP server with access to Zapier's 5,000+ tools and automation services.</p>
                <div className="space-y-1 font-mono text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div>URL: <span className="text-indigo-300">https://mcp.zapier.com/api/mcp/...</span></div>
                  <div>Approval Policy: <strong className="text-amber-400">Always Ask (Recommended)</strong></div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">PostgreSQL Vector MCP</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">HTTP Streamable</span>
                </div>
                <p className="text-xs text-slate-400">Secure connection to D&CP Cloud SQL repair tables for live inventory queries.</p>
                <div className="space-y-1 font-mono text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div>URL: <span className="text-indigo-300">https://db.displaycellpros.com/mcp</span></div>
                  <div>Approval Policy: <strong className="text-emerald-400">Fine-Grained Tool Approval</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: KNOWLEDGE BASE DOCUMENTS */}
      {activeSubTab === 'knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Add Document Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="font-playfair font-bold text-lg text-white">Add Knowledge Source</h3>
            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">Source Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['text', 'url', 'file'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewDocType(t)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                        newDocType === t
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">Document Title / Name</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={e => setNewDocName(e.target.value)}
                  placeholder="e.g., iPhone 15 Pro Logic Board Schematic Guide"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 font-bold block mb-1.5">
                  {newDocType === 'url' ? 'Webpage or Sitemap URL' : newDocType === 'file' ? 'File Upload (PDF/DOCX/MD)' : 'Plain Text Content'}
                </label>
                <textarea
                  rows={4}
                  value={newDocContent}
                  onChange={e => setNewDocContent(e.target.value)}
                  placeholder={newDocType === 'url' ? 'https://docs.displaycellpros.com/repair-manual' : 'Paste manual text, policy rules, or FAQ content here...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload & Index Document</span>
              </button>
            </form>
          </div>

          {/* Right: Document List & Usage Modes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-playfair font-bold text-lg text-white">Active Knowledge Documents ({documents.length})</h3>
              <span className="text-xs text-slate-400 font-mono">Max RAG Workspace: 1GB (Pro Tier)</span>
            </div>

            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                      {doc.type === 'url' ? <Globe className="w-5 h-5" /> : doc.type === 'file' ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{doc.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          doc.usageMode === 'auto' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          mode: {doc.usageMode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>{doc.sizeOrChars}</span>
                        <span>•</span>
                        <span className={doc.status === 'indexed' ? 'text-emerald-400' : 'text-amber-400'}>
                          {doc.status === 'indexed' ? 'RAG Indexed & Active' : 'Prompt Context Only'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {doc.status !== 'indexed' && (
                      <button
                        onClick={() => handleTriggerRagIndex(doc.id)}
                        disabled={isIndexing}
                        className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? 'animate-spin' : ''}`} />
                        <span>Index RAG</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RAG CONFIGURATION */}
      {activeSubTab === 'rag' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-playfair font-bold text-xl text-white">Retrieval-Augmented Generation (RAG) Settings</h3>
              <p className="text-xs text-slate-400 mt-1">Configure vector embeddings, distance thresholds, and chunk retrieval limits (~250ms latency)</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Enable RAG</span>
              <input
                type="checkbox"
                checked={ragConfig.enabled}
                onChange={e => setRagConfig({ ...ragConfig, enabled: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Embedding Model</label>
              <select
                value={ragConfig.embeddingModel}
                onChange={e => setRagConfig({ ...ragConfig, embeddingModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="e5_mistral_7b_instruct">e5_mistral_7b_instruct (Recommended High Accuracy)</option>
                <option value="text_embedding_3_small">text_embedding_3_small (Fast & Lightweight)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Max Vector Distance Threshold ({ragConfig.maxVectorDistance})</label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={ragConfig.maxVectorDistance}
                onChange={e => setRagConfig({ ...ragConfig, maxVectorDistance: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Max Retrieved Chunks Count</label>
              <input
                type="number"
                value={ragConfig.maxChunksCount}
                onChange={e => setRagConfig({ ...ragConfig, maxChunksCount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Max Documents Length (Characters)</label>
              <input
                type="number"
                value={ragConfig.maxDocumentsLength}
                onChange={e => setRagConfig({ ...ragConfig, maxDocumentsLength: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div className="text-xs text-indigo-200">
                <span className="font-bold">RAG Pipeline Status:</span> Active and synchronized with PostgreSQL vector store for D&CP repair diagnostics.
              </div>
            </div>
            <button
              onClick={() => showToast('RAG configuration saved successfully!', 'success')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Save RAG Config
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
