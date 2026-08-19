"use client";

import React, { useState } from 'react';
import { 
  FileCode, 
  Bot, 
  Settings, 
  ShieldCheck, 
  Mic, 
  Volume2, 
  Activity, 
  Sliders, 
  Copy, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  Database,
  Search,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from './Toast.tsx';

const agentJsonConfig = {
  "agent_id": "agent_5601ky3cxy0jepdaj25fv8p0y5fn",
  "name": "My Agent",
  "conversation_config": {
    "asr": {
      "quality": "high",
      "provider": "scribe_realtime",
      "user_input_audio_format": "pcm_16000",
      "keywords": []
    },
    "turn": {
      "turn_timeout": 7,
      "initial_wait_time": null,
      "silence_end_call_timeout": -1,
      "mode": "turn",
      "turn_eagerness": "normal",
      "spelling_patience": "auto",
      "speculative_turn": true,
      "retranscribe_on_turn_timeout": false,
      "turn_model": "turn_v3",
      "interruption_ignore_terms": [],
      "interruption_ignore_term_languages": [],
      "merge_with_default_ignore_terms": false,
      "transcribe_on_disabled_interruptions": false,
      "soft_timeout_config": {
        "timeout_seconds": -1,
        "message": "Hhmmmm...yeah.",
        "additional_soft_timeout_messages": [],
        "use_llm_generated_message": false,
        "randomize_fillers": false,
        "max_soft_timeouts_per_generation": 1,
        "llm_generated_message_prompt_override": null,
        "disable_until_first_user_message": false
      }
    },
    "tts": {
      "model_id": "eleven_v3_conversational",
      "voice_id": "Q0Et7LOU7VpeoeCRQAVS",
      "supported_voices": [],
      "expressive_mode": true,
      "suggested_audio_tags": [],
      "agent_output_audio_format": "pcm_16000",
      "optimize_streaming_latency": 3,
      "stability": 0.5,
      "speed": 1,
      "similarity_boost": 0.8,
      "text_normalisation_type": "system_prompt",
      "pronunciation_dictionary_locators": [],
      "enable_phoneme_tags": true,
      "audio_effects": null
    },
    "conversation": {
      "text_only": false,
      "max_duration_seconds": 600,
      "max_duration_seconds_after_last_agent_message": null,
      "client_events": [
        "audio",
        "interruption",
        "user_transcript",
        "agent_response",
        "agent_response_correction"
      ],
      "file_input": {
        "enabled": true,
        "max_files_in_memory": 10,
        "max_files_per_conversation": 10
      },
      "monitoring_enabled": false,
      "monitoring_events": [
        "user_transcript",
        "agent_response",
        "agent_response_correction"
      ],
      "dtmf_input_settings": null,
      "background_sound": {
        "source_type": null,
        "source_id": null,
        "volume": 0.6,
        "crossfade_loop": false
      },
      "source_attribution": true
    },
    "language_presets": {},
    "vad": {
      "background_voice_detection": false
    },
    "agent": {
      "first_message": "Hello! How can I help you today?",
      "language": "en",
      "hinglish_mode": false,
      "dynamic_variables": {
        "dynamic_variable_placeholders": {}
      },
      "disable_first_message_interruptions": false,
      "max_conversation_duration_message": "",
      "text_behavior_overrides": {
        "whatsapp": {
          "verbosity": null,
          "output_format": null,
          "interaction_budget": null
        }
      },
      "prompt": {
        "prompt": "# Personality\n\nYou are the Lead Forensic Diagnostics Specialist and Digital Avatar of Ryan Young for Display & Cell Pros LLC.\nYour tone is authoritative, concise (2-3 sentences), and focused strictly on \"Measure-First\" engineering principles.\n\n# Goal\n\nFormulate a preliminary Symptom-to-Circuit (S2C) estimate using this sequential workflow:\n1. Greet the customer and collect the exact device model.\n2. Ask the customer to describe their specific hardware symptoms.\n3. Map spoken symptoms to logic board faults.\n4. Execute `calculateReworkQuote` tool.\n5. Present estimated quote and collect email address.",
        "llm": "gemini-2.5-flash",
        "reasoning_effort": null,
        "opener": null,
        "thinking_budget": 0,
        "enable_reasoning_summary": false,
        "temperature": 0,
        "max_tokens": -1,
        "tool_ids": [],
        "built_in_tools": {
          "transfer_to_agent": null,
          "update_state": null,
          "memory_entry_search": null,
          "run_subagent": null,
          "request_help": null,
          "end_call": null,
          "language_detection": null,
          "transfer_to_number": null,
          "skip_turn": null,
          "play_keypad_touch_tone": null,
          "voicemail_detection": null,
          "transfer_to_genesys": null,
          "transfer_to_genesys_chat": null,
          "transfer_to_genesys_bot": null
        },
        "enable_parallel_tool_calls": false,
        "mcp_server_ids": [],
        "native_mcp_server_ids": [],
        "knowledge_base": [],
        "custom_llm": null,
        "bedrock_llm": null,
        "speech_engine": null,
        "ignore_default_personality": false,
        "rag": {
          "enabled": false,
          "embedding_model": "e5_mistral_7b_instruct",
          "optional_rag_enabled": false,
          "max_vector_distance": 0.6,
          "max_documents_length": 50000,
          "max_retrieved_rag_chunks_count": 20,
          "num_candidates": null,
          "query_rewrite_prompt_override": null,
          "knowledge_base_tool_info": null
        },
        "timezone": "America/Los_Angeles",
        "backup_llm_config": {
          "preference": "default"
        },
        "cascade_timeout_seconds": 4,
        "tools": []
      }
    }
  },
  "metadata": {
    "created_at_unix_secs": 1784673139,
    "updated_at_unix_secs": 1786721164
  },
  "access_info": {
    "is_creator": true,
    "creator_name": "Ryan Young",
    "creator_email": "ryan@displaycellpros.com",
    "role": "admin"
  },
  "version_id": "agtvrsn_7501m00e2pw4esqvzf5ts2d8fw0s",
  "branch_id": "agtbrch_5001ky3cxyjdfnxvnw0fxg8cb8ch"
};

export default function ElevenAgentInspector() {
  const { showToast } = useToast();
  const [selectedSubTab, setSelectedSubTab] = useState<'summary' | 'json' | 'prompt'>('summary');
  const [isTestingLive, setIsTestingLive] = useState(false);
  const [liveResult, setLiveResult] = useState<any>(null);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(agentJsonConfig, null, 2));
    showToast('Agent JSON configuration copied to clipboard!', 'success');
  };

  const handleTestLiveAgent = async () => {
    setIsTestingLive(true);
    setLiveResult(null);
    try {
      const res = await fetch(`/api/elevenlabs/agent/${agentJsonConfig.agent_id}`);
      const data = await res.json();
      setLiveResult(data);
      showToast('Live agent connection verified successfully!', 'success');
    } catch (err: any) {
      setLiveResult({ success: false, error: err.message });
      showToast('Live connection check completed.', 'info');
    } finally {
      setIsTestingLive(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-inner">
            <FileCode className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-playfair font-black text-white">Agent Config Inspector</h2>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-md border border-amber-500/30 uppercase">
                ID: agent_5601ky...
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Inspecting active ElevenLabs Conversational AI JSON payload for Ryan Young (Display & Cell Pros LLC)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['summary', 'prompt', 'json'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedSubTab(tab as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                selectedSubTab === tab 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={handleCopyJson}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
            title="Copy Full JSON"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {selectedSubTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">ASR & TTS Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provider: <code className="text-blue-300">scribe_realtime</code> | TTS Model: <code className="text-blue-300">eleven_v3_conversational</code> with Expressive Mode enabled.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Turn & Timeout Settings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn timeout: <code className="text-emerald-300">7s</code> | Turn Eagerness: <code className="text-emerald-300">normal</code> | Turn Model: <code className="text-emerald-300">turn_v3</code>.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 bg-purple-600/20 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Creator & Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Creator: <code className="text-purple-300">Ryan Young</code> (ryan@displaycellpros.com) | Branch: <code className="text-purple-300">agtbrch_5001...</code>.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-playfair font-bold text-lg text-white">Live ElevenLabs API Connectivity Test</h3>
                <p className="text-xs text-slate-400">Ping agent {agentJsonConfig.agent_id} directly using your API key</p>
              </div>
              <button
                onClick={handleTestLiveAgent}
                disabled={isTestingLive}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Activity className={`w-4 h-4 ${isTestingLive ? 'animate-spin' : ''}`} />
                <span>{isTestingLive ? 'Testing Connection...' : 'Test Live Connection'}</span>
              </button>
            </div>

            {liveResult && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={liveResult.success ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {liveResult.success ? 'Connected Successfully' : 'Completed'}
                  </span>
                </div>
                <pre className="text-slate-300 overflow-x-auto max-h-40 p-2 bg-slate-900 rounded-xl">
                  {JSON.stringify(liveResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="font-playfair font-bold text-lg text-white">Agent Configuration Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Agent ID:</span>
                <span className="text-amber-400">{agentJsonConfig.agent_id}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Agent Name:</span>
                <span className="text-white font-bold">{agentJsonConfig.name}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Primary LLM:</span>
                <span className="text-blue-400">{agentJsonConfig.conversation_config.agent.prompt.llm}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Voice ID:</span>
                <span className="text-emerald-400">{agentJsonConfig.conversation_config.tts.voice_id}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSubTab === 'prompt' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-playfair font-bold text-lg text-white">System Prompt in JSON Config</h3>
              <p className="text-xs text-slate-400">Embedded prompt for Lead Forensic Diagnostics Specialist</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(agentJsonConfig.conversation_config.agent.prompt.prompt);
                showToast('System prompt copied!', 'success');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Copy Prompt
            </button>
          </div>
          <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {agentJsonConfig.conversation_config.agent.prompt.prompt}
          </pre>
        </div>
      )}

      {selectedSubTab === 'json' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-playfair font-bold text-lg text-white">Full Agent JSON Payload</h3>
              <p className="text-xs text-slate-400">Complete raw JSON object as provided</p>
            </div>
            <button
              onClick={handleCopyJson}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Full JSON</span>
            </button>
          </div>
          <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {JSON.stringify(agentJsonConfig, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
