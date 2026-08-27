"use client";

import React from "react";

export function ProgressBar({ value = 0, max = 100, showLabel = false, size = "md", className = "" }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full rounded-full bg-surface overflow-hidden">
        <div style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
