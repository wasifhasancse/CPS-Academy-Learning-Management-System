"use client";

import React from "react";

export function DashboardStatsGrid({ stats = [] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        const isAlert = stat.isAlert;

        return (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
              isAlert
                ? "bg-[#1E2A3A] border-red-500/30 text-[#DFF2EB]"
                : "bg-card dark:bg-[#2A3D5A] border-border text-foreground"
            }`}
          >
            {/* Top Bar: Label + Top-right Icon Badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                    isAlert ? "text-red-400" : "text-muted"
                  }`}
                >
                  {stat.title}
                </span>
                {stat.badge && (
                  <span
                    className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isAlert
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-[#B9E5E8]/40 text-[#4A628A] dark:bg-[#B9E5E8]/20 dark:text-[#B9E5E8] border border-[#B9E5E8]/60 font-bold"
                    }`}
                  >
                    {stat.badge}
                  </span>
                )}
              </div>

              {stat.icon && (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isAlert
                      ? "bg-red-500/15 text-red-400 border border-red-500/20"
                      : "bg-surface dark:bg-[#1E2A3A] text-[#7AB2D3] dark:text-[#B9E5E8] border border-border"
                  }`}
                >
                  {stat.icon}
                </div>
              )}
            </div>

            {/* Main Metric Value */}
            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1 text-foreground dark:text-white">
                {stat.value}
              </div>

              {/* Subtitle description */}
              {stat.subtitle && (
                <div className="text-[11px] font-medium text-muted">{stat.subtitle}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
