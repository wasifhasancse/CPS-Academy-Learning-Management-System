"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from "react-icons/hi2";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title = "", message = "", duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep up to 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (message, title = "Success") =>
        showToast({ type: "success", title, message }),
      error: (message, title = "Error") =>
        showToast({ type: "error", title, message }),
      info: (message, title = "Information") =>
        showToast({ type: "info", title, message }),
      warning: (message, title = "Attention") =>
        showToast({ type: "warning", title, message }),
      custom: showToast,
      dismiss: removeToast,
    }),
    [showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return safe fallback so components can call toast without throwing outside provider
    return {
      toast: {
        success: () => {},
        error: () => {},
        info: () => {},
        warning: () => {},
        custom: () => {},
        dismiss: () => {},
      },
      showToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4 sm:p-0"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { type, title, message } = toast;

  const config = {
    success: {
      icon: <HiOutlineCheckCircle className="w-5 h-5 text-[#309255] shrink-0" />,
      container:
        "bg-[#E7F8EE] dark:bg-[#181E27] border-[#309255]/40 text-[#212832] dark:text-[#F5FBF7]",
      titleColor: "text-[#309255] dark:text-[#E7F8EE]",
    },
    error: {
      icon: <HiOutlineXCircle className="w-5 h-5 text-red-500 shrink-0" />,
      container:
        "bg-red-50 dark:bg-[#181E27] border-red-500/30 text-[#212832] dark:text-[#F5FBF7]",
      titleColor: "text-red-600 dark:text-red-400",
    },
    warning: {
      icon: <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      container:
        "bg-amber-50 dark:bg-[#181E27] border-amber-500/30 text-[#212832] dark:text-[#F5FBF7]",
      titleColor: "text-amber-600 dark:text-amber-400",
    },
    info: {
      icon: <HiOutlineInformationCircle className="w-5 h-5 text-[#309255] dark:text-[#E7F8EE] shrink-0" />,
      container:
        "bg-[#F8FAF9] dark:bg-[#181E27] border-border text-[#212832] dark:text-[#F5FBF7]",
      titleColor: "text-foreground",
    },
  }[type] || {
    icon: <HiOutlineInformationCircle className="w-5 h-5 text-secondary shrink-0" />,
    container:
      "bg-card border-border text-foreground",
    titleColor: "text-foreground",
  };

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${config.container}`}
    >
      <div className="mt-0.5">{config.icon}</div>

      <div className="flex-1 min-w-0 space-y-0.5">
        {title && (
          <h5 className={`text-xs font-bold leading-tight ${config.titleColor}`}>
            {title}
          </h5>
        )}
        {message && (
          <p className="text-xs text-foreground/80 dark:text-foreground/90 leading-relaxed break-words">
            {message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 -mr-1 -mt-1"
        aria-label="Dismiss notification"
      >
        <HiOutlineXMark className="w-4 h-4" />
      </button>
    </div>
  );
}
