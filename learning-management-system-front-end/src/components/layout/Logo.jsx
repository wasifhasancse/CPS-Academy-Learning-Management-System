"use client";

import React from "react";
import Link from "next/link";
import { HiCommandLine } from "react-icons/hi2";

/**
 * Clean Terminal Logo Icon using React-Icons
 * Adheres strictly to the 4-color design system (#4A628A, #7AB2D3, #B9E5E8, #DFF2EB)
 */
export function LogoIcon({ size = "md", className = "" }) {
  const containerSizes = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-11 h-11 rounded-2xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const containerClass = containerSizes[size] || containerSizes.md;
  const iconClass = iconSizes[size] || iconSizes.md;

  return (
    <div
      className={`${containerClass} bg-[#4A628A] text-[#DFF2EB] dark:bg-[#7AB2D3] dark:text-[#1E2A3A] border border-[#B9E5E8]/40 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#7AB2D3] dark:group-hover:bg-[#B9E5E8] transition-colors ${className}`}
      aria-hidden="true"
    >
      <HiCommandLine className={`${iconClass} transition-transform duration-200 group-hover:scale-105`} />
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
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-lg ${
                variant === "footer"
                  ? "text-[#DFF2EB]"
                  : "text-foreground group-hover:text-[#7AB2D3] dark:group-hover:text-[#B9E5E8] transition-colors"
              }`}
            >
              CPS
            </span>
            <span
              className={`font-bold text-lg ${
                variant === "footer"
                  ? "text-[#B9E5E8]"
                  : "text-[#7AB2D3] dark:text-[#B9E5E8]"
              }`}
            >
              Academy
            </span>
          </div>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
              variant === "footer" ? "text-[#DFF2EB]/70" : "text-muted"
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
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7AB2D3] rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
