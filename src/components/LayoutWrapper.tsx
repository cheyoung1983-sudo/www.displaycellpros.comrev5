"use client";

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AIAssistantWidget } from './AIAssistantWidget';
import { MessageSquare } from 'lucide-react';
import { ToastContainer, Toast } from './ToastNotification';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Default specs for AIAssistant
  const [specs, setSpecs] = useState({
    brand: "Apple",
    model: "iPhone 14 Pro Max",
    tier: "flagship",
    issue: "screen"
  });

  const addToast = (title: string, message: string, type: any = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col justify-between">
      <Navbar onBookClick={() => setIsAiOpen(true)} />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      {isAiOpen && (
        <AIAssistantWidget
          onClose={() => setIsAiOpen(false)}
          onNavigateToLab={() => {
            window.location.href = '/lab';
          }}
          deviceBrand={specs.brand}
          deviceModel={specs.model}
          deviceTier={specs.tier}
          issueType={specs.issue}
          onUpdateSpecs={(newSpecs) => setSpecs(prev => ({ ...prev, ...newSpecs }))}
        />
      )}

      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:bg-blue-500 hover:scale-105 transition-all z-40 group"
        >
          <MessageSquare className="text-white h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </button>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
