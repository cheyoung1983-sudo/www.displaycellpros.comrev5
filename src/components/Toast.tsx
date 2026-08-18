"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Bell, Wrench, ArrowRight } from 'lucide-react';
import { subscribeToTechnicianAlerts, NewIntakePayload } from '../lib/technicianEvents.ts';

export type ToastType = 'success' | 'error' | 'info' | 'technician';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  meta?: NewIntakePayload;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: { title?: string; action?: ToastAction; duration?: number }) => void;
  showTechnicianAlert: (intake: NewIntakePayload) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'success',
      options?: { title?: string; action?: ToastAction; duration?: number }
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = options?.duration || (type === 'technician' ? 8000 : 5000);

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          title: options?.title,
          action: options?.action,
          duration,
        },
      ]);

      // Auto-remove after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showTechnicianAlert = useCallback(
    (intake: NewIntakePayload) => {
      const id = `tech_alert_${intake.ticketNumber}_${Date.now()}`;
      const message = `${intake.deviceManufacturer} ${intake.deviceModel} (${intake.serviceTier}) submitted for ${intake.customerName}. Assigned ticket ${intake.ticketNumber}.`;

      setToasts((prev) => {
        // Prevent duplicate alert for same ticket within list
        if (prev.some((t) => t.id.includes(intake.ticketNumber))) {
          return prev;
        }
        return [
          ...prev,
          {
            id,
            type: 'technician' as const,
            title: `🔔 New Intake Received: ${intake.ticketNumber}`,
            message,
            meta: intake,
            duration: 9000,
          },
        ];
      });

      setTimeout(() => {
        removeToast(id);
      }, 9000);
    },
    [removeToast]
  );

  // Subscribe to cross-window and in-app technician alert events
  useEffect(() => {
    const unsubscribe = subscribeToTechnicianAlerts((payload) => {
      showTechnicianAlert(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [showTechnicianAlert]);

  return (
    <ToastContext.Provider value={{ showToast, showTechnicianAlert }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none max-w-md w-full px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div
                className={`
                flex items-start gap-3.5 px-5 py-4 rounded-2xl shadow-2xl border w-full backdrop-blur-md
                ${toast.type === 'success' ? 'bg-emerald-950/95 border-emerald-800 text-emerald-50 shadow-emerald-950/50' : ''}
                ${toast.type === 'error' ? 'bg-red-950/95 border-red-900 text-red-50 shadow-red-950/50' : ''}
                ${toast.type === 'info' ? 'bg-slate-900/95 border-slate-800 text-slate-50 shadow-slate-950/50' : ''}
                ${toast.type === 'technician' ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/60 text-white shadow-blue-950/80 ring-1 ring-blue-400/20' : ''}
              `}
              >
                <div
                  className={`
                  w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                  ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                  ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                  ${toast.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
                  ${toast.type === 'technician' ? 'bg-blue-500 text-white shadow-md animate-pulse' : ''}
                `}
                >
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                  {toast.type === 'technician' && <Bell className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 opacity-90">
                      {toast.title ||
                        (toast.type === 'success'
                          ? 'Transmission Success'
                          : toast.type === 'error'
                          ? 'Laboratory Alert'
                          : toast.type === 'technician'
                          ? 'Technician Bench Alert'
                          : 'System Notice')}
                    </p>
                    {toast.type === 'technician' && (
                      <span className="text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                        LIVE INTAKE
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold leading-relaxed text-slate-200">
                    {toast.message}
                  </p>

                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <span>{toast.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white shrink-0 mt-0.5"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

