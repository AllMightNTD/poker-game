"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import React, { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 1000);
  }, [removeToast]);

  const success = useCallback((message: string) => toast("success", message), [toast]);
  const error = useCallback((message: string) => toast("error", message), [toast]);
  const info = useCallback((message: string) => toast("info", message), [toast]);
  const warning = useCallback((message: string) => toast("warning", message), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let bgColor = "bg-white/80 border-slate-200/50";
            let textColor = "text-slate-800";
            let icon = <Info className="text-blue-500" size={20} />;

            switch (t.type) {
              case "success":
                bgColor = "bg-emerald-50/90 border-emerald-200/60 backdrop-blur-md shadow-[0_8px_30px_rgb(16,185,129,0.12)]";
                textColor = "text-emerald-800";
                icon = <CheckCircle className="text-emerald-500 animate-pulse" size={20} fill="currentColor" />;
                break;
              case "error":
                bgColor = "bg-rose-50/90 border-rose-200/60 backdrop-blur-md shadow-[0_8px_30px_rgb(244,63,94,0.12)]";
                textColor = "text-rose-800";
                icon = <AlertCircle className="text-rose-500" size={20} fill="currentColor" />;
                break;
              case "warning":
                bgColor = "bg-amber-50/90 border-amber-200/60 backdrop-blur-md shadow-[0_8px_30px_rgb(245,158,11,0.12)]";
                textColor = "text-amber-800";
                icon = <AlertTriangle className="text-amber-500" size={20} fill="currentColor" />;
                break;
              case "info":
                bgColor = "bg-blue-50/90 border-blue-200/60 backdrop-blur-md shadow-[0_8px_30px_rgb(59,130,246,0.12)]";
                textColor = "text-blue-800";
                icon = <Info className="text-blue-500" size={20} fill="currentColor" />;
                break;
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`flex items-start gap-3 p-4 rounded-2xl border ${bgColor} pointer-events-auto shadow-lg relative overflow-hidden`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${t.type === "success" ? "bg-emerald-500" :
                  t.type === "error" ? "bg-rose-500" :
                    t.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                  }`} />

                <div className="flex-1 flex gap-3 pl-1">
                  <div className="mt-0.5">{icon}</div>
                  <p className={`text-xs font-semibold leading-relaxed ${textColor}`}>
                    {t.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none mt-0.5 self-start"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
