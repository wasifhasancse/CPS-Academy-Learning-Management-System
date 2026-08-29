"use client";

import React from "react";

export function ProgressBar({
  progress,
  value,
  max = 100,
  showLabel = false,
  size = "md",
  className = "",
}) {
  const rawValue = progress !== undefined ? progress : (value !== undefined ? value : 0);
  const numericVal = Number(rawValue) || 0;
  const numericMax = Number(max) || 100;
  const percentage = Math.min(100, Math.max(0, Math.round((numericVal / numericMax) * 100)));

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
      <div className={`w-full rounded-full bg-surface border border-border overflow-hidden ${sizeClasses[size] || sizeClasses.md}`}>
        <div
          className="h-full bg-secondary transition-all duration-500 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: "#408A71",
          }}
          role="progressbar"
          aria-valuenow={numericVal}
          aria-valuemin={0}
          aria-valuemax={numericMax}
        />
      </div>
    </div>
  );
}
