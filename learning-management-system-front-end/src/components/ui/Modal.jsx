"use client";

import React, { useEffect } from "react";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-5xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth,
  size = "md",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = maxWidth || sizeClasses[size] || sizeClasses.md;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering Viewport Wrapper with Safe Margins */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        {/* Modal Card Container */}
        <div
          role="dialog"
          aria-modal="true"
          className={`relative w-full ${widthClass} rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-1 z-10 text-left my-auto flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] transition-all`}
        >
          {/* Pinned Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border pb-3.5 shrink-0">
            <div>
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-muted mt-1 leading-normal">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-muted hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-surface shrink-0 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto pr-1 -mr-1 pt-3.5 pb-1 flex-1 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
