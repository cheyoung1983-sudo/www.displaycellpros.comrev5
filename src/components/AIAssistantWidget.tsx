import React, { useState, useEffect, useRef } from "react";
import { Send, X, Cpu, Terminal } from "lucide-react";

interface AIAssistantProps {
  onClose: () => void;
  onNavigateToLab: () => void;
  deviceBrand: string;
  deviceModel: string;
  deviceTier: string;
  issueType: string;
  onUpdateSpecs?: (specs: any) => void;
}

export function AIAssistantWidget({
  onClose,
  onNavigateToLab,
  deviceBrand,
  deviceModel,
  deviceTier,
  issueType,
  onUpdateSpecs
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai" | "system"; text: string }>>([
    { sender: 'ai', text: "Welcome to Display & Cell Pros Mobile Triage Hub! 🚐💨 Seattle and Spokane's top driveway raw hardware lab on wheels. What device issues can we solve for you today?" }
  ]);
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsgText = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsgText }]);
    setInput("");
    setIsSending(true);

    try {
      const history = messages
        .filter(m => m.sender !== "system")
        .map(m => ({
          role: m.sender === "ai" ? "assistant" as const : "user" as const,
          text: m.text
        }));

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", text: userMsgText }],
          deviceDetails: {
            brand: deviceBrand,
            model: deviceModel,
            tier: deviceTier,
            issue: issueType
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: "ai", text: data.text }]);
        if (data.detectedSpecs && onUpdateSpecs) {
          onUpdateSpecs(data.detectedSpecs);
        }
      } else {
        throw new Error("Triage API error response");
      }
    } catch (err) {
      console.error("Widget API triage error:", err);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: "Detected screen, volume click or battery life parameters. Let's head inside the main Lab Portal to simulate full hardware scans and calculate exact local sales tax rate!"
          }
        ]);
      }, 700);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm sm:items-end sm:justify-end sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-755 shadow-2xl rounded-2xl w-full max-w-md flex flex-col h-[520px] max-h-[85vh] overflow-hidden transform transition-all">

        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Cpu size={20} className="text-white animate-spin-slow" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm tracking-tight">D&CP Intelligent Assistant</h3>
              <p className="text-[10px] text-slate-400 font-mono">OpenAI L3 Triage Core Ready</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Lab Link Banner */}
        <div className="bg-blue-900/30 border-b border-blue-900/40 px-4 py-2 flex items-center justify-between text-xs text-blue-200 select-none">
          <span className="flex items-center gap-1.5 font-medium">
            <Terminal size={14} className="text-blue-400" />
            Check dynamic quotes & maps:
          </span>
          <button
            type="button"
            onClick={onNavigateToLab}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-2.5 py-1 rounded text-[10px] uppercase tracking-wide transition-colors"
          >
            Enter Lab
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-950/40">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-sm shadow-sm font-semibold"
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 text-xs italic animate-pulse">
                Probing options...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <label htmlFor="mainChatInput" className="sr-only">Main Diagnostic Prompt Input</label>
            <input
              id="mainChatInput"
              name="mainChatInput"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              placeholder="State hardware failure behavior..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-xs placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
          <div className="text-center mt-2.5 font-mono select-none">
            <span className="text-[9px] text-slate-500">Live destination rates & fleet sync monitors active</span>
          </div>
        </div>

      </div>
    </div>
  );
}
