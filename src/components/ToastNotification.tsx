import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            className="pointer-events-auto"
          >
            <ToastBody toast={toast} onClose={onClose} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastBodyProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastBody: React.FC<ToastBodyProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const colors = (() => {
    switch (toast.type) {
      case "success":
        return {
          border: "border-emerald-500/30",
          accent: "bg-emerald-500",
          shadow: "shadow-emerald-950/10"
        };
      case "error":
        return {
          border: "border-red-500/30",
          accent: "bg-red-500",
          shadow: "shadow-red-950/10"
        };
      case "warning":
        return {
          border: "border-amber-500/30",
          accent: "bg-amber-500",
          shadow: "shadow-amber-950/10"
        };
      default:
        return {
          border: "border-blue-500/30",
          accent: "bg-blue-500",
          shadow: "shadow-blue-950/10"
        };
    }
  })();

  return (
    <div className={`p-4 rounded-xl border ${colors.border} bg-slate-900/95 backdrop-blur-md shadow-2xl flex gap-3.5 items-start justify-between min-w-[300px] overflow-hidden relative`}>
      {/* Visual Accent Bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${colors.accent}`} />
      
      <div className="flex gap-2.5 items-start pl-1">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="space-y-0.5">
          <h4 className="text-[10.5px] font-extrabold uppercase tracking-widest font-mono text-white/90">
            {toast.title}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {toast.message}
          </p>
        </div>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0 button"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
