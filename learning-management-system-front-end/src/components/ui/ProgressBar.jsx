"use client";

import React from "react";

export function ProgressBar({ value = 0, max = 100, showLabel = false, size = "md", className = "" }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-foreground">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-surface overflow-hidden border border-border/50 ${sizeClasses[size] || sizeClasses.md}`}>
        <div
          className="h-full bg-secondary transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
