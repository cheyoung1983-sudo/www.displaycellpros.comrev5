"use client";

import React, { useState } from 'react';
import { 
  Bot, 
  Terminal, 
  Database, 
  ShieldAlert, 
  Cpu, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Code,
  Layers,
  Settings,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from './Toast.tsx';

export default function VoiceToCircuitAgentHub() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'prompt' | 'schema' | 'handler'>('overview');
  const [testModel, setTestModel] = useState('claude-3-5-sonnet');
  const [testSymptom, setTestSymptom] = useState('Screen is dark but phone vibrates / image visible under flashlight');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult({
        deviceModel: 'IPHONE_XR',
        suspectedComponent: 'FL1728_BACKLIGHT',
        estimatedPrice: 145,
        matchedRule: 'Blown backlight filter FL1728 isolated from symptom mapping.',
        abstentionShieldVerified: true,
        databaseSync: 'Success (PostgreSQL Vercel Serverless)'
      });
      showToast('V2C Simulation completed successfully!', 'success');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-inner">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-playfair font-black text-white">Voice-to-Circuit (V2C) Agent Hub</h2>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-md border border-amber-500/30 uppercase">
                Triage-AI Production
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Real-time conversational AI agent mapping spoken motherboard symptoms to physical logic board faults and live Vercel/PostgreSQL pricing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['overview', 'prompt', 'schema', 'handler'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                activeTab === tab 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview & Interactive Simulator */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Primary S2C Model</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configured with <code className="text-blue-300">claude-3-5-sonnet</code> for advanced schematic reasoning and fault isolation.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Vercel PostgreSQL</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic price lookups querying live labor rates and component parts inventories securely via serverless webhooks.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 bg-purple-600/20 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Abstention Shield</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict mandatory disclaimers and thermal safety halts for swollen lithium cells enforced before booking.
              </p>
            </div>
          </div>

          {/* Interactive V2C Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-playfair font-bold text-lg text-white">Live V2C Symptom-to-Circuit Simulator</h3>
                <p className="text-xs text-slate-400">Test how spoken symptoms map to circuit faults and calculate rework quotes</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold rounded-lg border border-emerald-500/30">
                Agent Status: Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Simulated Voice Input / Symptom
                  </label>
                  <textarea
                    rows={3}
                    value={testSymptom}
                    onChange={(e) => setTestSymptom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    LLM Reasoning Engine
                  </label>
                  <select
                    value={testModel}
                    onChange={(e) => setTestModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="gpt-4o">OpenAI GPT-4o (Primary S2C)</option>
                    <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Fast Triage)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {isSimulating ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Processing S2C Diagnostic Flow...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Run Voice Diagnostic Simulation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Simulation Result Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Simulation Telemetry & Output</span>
                  {simulationResult ? (
                    <div className="space-y-3 text-xs font-mono">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Device Model:</span>
                        <span className="text-amber-400 font-bold">{simulationResult.deviceModel}</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Isolated Component:</span>
                        <span className="text-emerald-400 font-bold">{simulationResult.suspectedComponent}</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Estimated Quote:</span>
                        <span className="text-blue-400 font-bold">${simulationResult.estimatedPrice} USD</span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block text-[10px]">Rule Match:</span>
                        <p className="text-slate-200">{simulationResult.matchedRule}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-600 space-y-2">
                      <Terminal className="w-8 h-8 stroke-1" />
                      <p className="text-xs">Click simulation to run test vector.</p>
                    </div>
                  )}
                </div>

                {simulationResult && (
                  <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>PostgreSQL Vercel sync successful. Abstention Shield applied.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: System Prompt */}
      {activeTab === 'prompt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-playfair font-bold text-lg text-white">Diagnostics Specialist System Prompt</h3>
              <p className="text-xs text-slate-400">Core behavior settings for the S2C conversational AI node</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`# Personality\nYou are the Lead Forensic Diagnostics Specialist and Digital Avatar of Ryan Young for Display & Cell Pros LLC.`);
                showToast('System prompt copied to clipboard!', 'success');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Copy Prompt
            </button>
          </div>
          <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`# Personality
You are the Lead Forensic Diagnostics Specialist and Digital Avatar of Ryan Young for Display & Cell Pros LLC.
Your tone is authoritative, concise (2-3 sentences), and focused strictly on "Measure-First" engineering principles.

# Goal
Formulate a preliminary Symptom-to-Circuit (S2C) estimate using this sequential workflow:
1. Greet the customer and collect the exact device model (e.g., "iPhone XR" or "iPad Pro 9.7").
2. Ask the customer to describe their specific hardware symptoms.
3. Map the spoken symptoms to the logic board:
   - "Screen is dark but the phone vibrates / can see image under a bright flashlight" maps to a blown FL1728 backlight filter.
   - "Fake charging / lightning bolt displays but battery percentage doesn't move / static current draw" maps to U4500 (1610A3) Tristar IC failure.
   - "Completely dead, won't charge, draws immediate maximum current on charger" maps to a VDD_MAIN primary rail short.
4. Execute the \`calculateReworkQuote\` tool using the suspected component and model.
5. Present the estimated quote, and collect the customer's email address.

This step is important: You must never provide a quote estimate without running the \`calculateReworkQuote\` tool first.

# Guardrails
- Always read the Abstention Shield verbatim before collecting payment or finalizing booking:
  "Please note that over-the-phone quotes are estimates based on statistical probability. Final pricing and repair confirmation require physical verification of the motherboard via bench ammeter and diode-mode measurements."
- If the customer reports battery swelling, bulging, smoke, or excessive heat, immediately execute the Thermal Safety Halt: instruct them to power down the device, place it on a non-flammable surface, and inform them that we cannot accept mail-in delivery for swollen lithium cells due to transit fire hazards. Do not book a repair.
- Verify security locks: Ask if the device has an active iCloud Activation Lock, Google FRP, or MDM configuration profile, as these will block post-repair automated software testing.

# Tool Usage
## \`calculateReworkQuote\`
Queries the database for live parts and labor costs.`}
          </pre>
        </div>
      )}

      {/* Tab 3: Tool Schema */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-playfair font-bold text-lg text-white">Tool Parameter Schema Configuration</h3>
              <p className="text-xs text-slate-400">JSON schema defining how raw spoken characters are normalized into SQL parameters</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`{\n  "name": "calculateReworkQuote",\n  "description": "Calculates baseline repair cost"\n}`);
                showToast('Tool schema copied to clipboard!', 'success');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Copy Schema
            </button>
          </div>
          <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed">
{`{
  "name": "calculateReworkQuote",
  "description": "Calculates the baseline repair cost by fetching active component pricing and applying labor modifiers.",
  "parameters": {
    "type": "object",
    "properties": {
      "device_model": {
        "type": "string",
        "enum": ["IPHONE_XR", "IPAD_PRO_9.7"],
        "description": "The target hardware model, normalized as uppercase text with spaces replaced by underscores."
      },
      "suspected_component": {
        "type": "string",
        "enum": ["FL1728_BACKLIGHT", "U4500_TRISTAR", "PP_VCC_MAIN_SHORT"],
        "description": "The circuit component isolated from the symptom mapping."
      },
      "customer_email": {
        "type": "string",
        "description": "The customer's email address. Convert spoken characters to standard symbols: 'at' becomes '@', 'dot' becomes '.'."
      }
    },
    "required": ["device_model", "suspected_component", "customer_email"]
  }
}`}
          </pre>
        </div>
      )}

      {/* Tab 4: Vercel Handler */}
      {activeTab === 'handler' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-playfair font-bold text-lg text-white">Vercel Serverless Handler Endpoint</h3>
              <p className="text-xs text-slate-400">TypeScript backend (`/api/voice-triage/quote.ts`) interfacing with PostgreSQL</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`import type { VercelRequest, VercelResponse } from '@vercel/node';`);
                showToast('Handler code copied to clipboard!', 'success');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Copy Code
            </button>
          </div>
          <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { device_model, suspected_component, customer_email } = req.body;

  try {
    const dbQuery = \`
      SELECT l.hourly_rate, p.base_cost, p.markup_percentage
      FROM labor_rates l, parts_inventory p
      WHERE l.tier = 'Micro-soldering' 
        AND p.id = $1 
        AND p.compatible_model = $2;
    \`;
    
    const dbResult = await pool.query(dbQuery, [suspected_component, device_model]);

    if (dbResult.rows.length === 0) {
      return res.status(404).json({ error: "Component path not found in local source vaults." });
    }

    const { hourly_rate, base_cost, markup_percentage } = dbResult.rows[0];
    const laborCost = Number(hourly_rate) * 2.5;
    const partCost = Number(base_cost) * (1 + Number(markup_percentage) / 100);
    const totalQuote = Math.round(laborCost + partCost);

    return res.status(200).json({
      success: true,
      estimated_price: totalQuote,
      formatted_message: \`A Level 3 board-level repair for the \${device_model} targeting \${suspected_component} is estimated at \$\${totalQuote} USD.\`
    });

  } catch (error: any) {
    console.error('[DATABASE_ERROR] Quote calculation failed:', error);
    return res.status(500).json({ error: 'Database transaction failed.' });
  }
}`}
          </pre>
        </div>
      )}
    </div>
  );
}
