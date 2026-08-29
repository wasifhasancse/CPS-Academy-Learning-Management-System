"use client";

import React from "react";

const sizeMap = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const colorMap = {
  primary: "text-primary dark:text-highlight",
  secondary: "text-secondary",
  highlight: "text-highlight",
  white: "text-white",
  muted: "text-muted",
  current: "text-current",
};

export function Spinner({
  size = "md",
  color = "primary",
  className = "",
  label = "Loading...",
  ...props
}) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass = colorMap[color] || colorMap.primary;

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      <svg
        className={`animate-spin ${sizeClass} ${colorClass}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function LoadingScreen({
  title = "Loading...",
  description,
  minHeight = "min-h-[50vh]",
  className = "",
}) {
  return (
    <div
      className={`w-full ${minHeight} flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-xs">
          <Spinner size="lg" color="primary" />
        </div>
      </div>
      <div className="space-y-1 max-w-xs">
        <h4 className="text-sm font-bold text-foreground tracking-tight">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
