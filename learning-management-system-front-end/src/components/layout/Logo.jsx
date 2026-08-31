"use client";

import React from "react";
import Link from "next/link";

/**
 * Modern SVG Logo Mark for CPS Academy
 * Represents the fusion of code terminal brackets & academic graduation symbol.
 */
export function LogoIcon({ size = "md", className = "" }) {
  const containerSizes = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  const svgSizes = {
    sm: "w-4.5 h-4.5",
    md: "w-5.5 h-5.5",
    lg: "w-7 h-7",
  };

  const containerClass = containerSizes[size] || containerSizes.md;
  const svgClass = svgSizes[size] || svgSizes.md;

  return (
    <div
      className={`${containerClass} bg-[#309255] text-white dark:bg-[#309255] dark:text-white border border-[#309255]/30 flex items-center justify-center shrink-0 shadow-1 group-hover:bg-[#267544] dark:group-hover:bg-[#267544] transition-all duration-300 ${className}`}
      aria-hidden="true"
    >
      <svg
        className={`${svgClass} transition-transform duration-300 group-hover:scale-[1.02]`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Terminal Brackets & Academic Shield Paths */}
        <path
          d="M7 8L3 12L7 16"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 8L21 12L17 16"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 4L10 20"
          stroke="#E7F8EE"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Full CPS Academy Brand Logo with Typography
 */
export function Logo({
  href = "/",
  size = "md",
  showText = true,
  className = "",
  variant = "default", // 'default' | 'footer'
}) {
  const content = (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight text-lg sm:text-xl ${
                variant === "footer"
                  ? "text-white"
                  : "text-foreground group-hover:text-[#309255] transition-colors duration-200"
              }`}
            >
              CPS
            </span>
            <span
              className={`font-extrabold text-lg sm:text-xl ${
                variant === "footer"
                  ? "text-[#E7F8EE]"
                  : "text-[#309255] dark:text-[#E7F8EE]"
              }`}
            >
              Academy
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#309255] shrink-0" />
          </div>
          <span
            className={`text-[8.5px] font-extrabold uppercase tracking-[0.18em] ${
              variant === "footer" ? "text-white/70" : "text-muted"
            }`}
          >
            Engineering & Algorithms
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#309255] rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
