"use client";

import { useState } from "react";

export function Input({
  label,
  error,
  id,
  className = "",
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  icon: Icon,
  rightElement,
  showPasswordToggle = false,
  ...props
}) {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const [showPassword, setShowPassword] = useState(false);

  const effectiveType =
    type === "password" && showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-foreground uppercase tracking-wide"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={effectiveType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-background dark:bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/80 transition-all duration-200 focus:border-[#309255] focus:ring-2 focus:ring-[#309255]/30 focus:outline-none disabled:bg-surface disabled:cursor-not-allowed ${
            Icon ? "pl-11" : ""
          } ${showPasswordToggle || rightElement ? "pr-11" : ""} ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-border hover:border-[#309255]/60"
          } ${className}`}
          {...props}
        />

        {type === "password" && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 text-muted hover:text-foreground transition-colors p-1 cursor-pointer focus:outline-none"
          >
            {showPassword ? (
              /* Eye Off Icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              /* Eye Icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}

        {rightElement && !showPasswordToggle && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
