"use client";

import React from "react";

const SEGMENT_COLORS = [
  "#285A48",
  "#408A71",
  "#B0E4CC",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
];

export function DistributionDonutChart({
  title = "Distribution",
  subtitle = "",
  items = [],
  categories = [],
}) {
  // Build distribution from real items grouped by category
  const categoryMap = {};
  items.forEach((item) => {
    const catName = item.category?.name || "Uncategorized";
    if (!categoryMap[catName]) {
      categoryMap[catName] = 0;
    }
    categoryMap[catName] += 1;
  });

  const segments = Object.entries(categoryMap).map(([label, value], idx) => ({
    label,
    value,
    color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
  }));

  const totalValue = segments.reduce((acc, s) => acc + s.value, 0);

  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const computed = segments.map((seg) => {
    const percent = totalValue > 0 ? seg.value / totalValue : 0;
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const strokeDashoffset = -circumference * accumulatedPercent;
    accumulatedPercent += percent;
    return {
      ...seg,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const hasData = totalValue > 0;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-card dark:bg-[#0D1C19] border border-border flex flex-col justify-between">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-extrabold text-foreground dark:text-white tracking-tight">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface dark:bg-[#122421] border border-border flex items-center justify-center text-muted mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-foreground dark:text-white">No distribution data</p>
          <p className="text-[11px] text-muted mt-1">Categories will appear as items are added</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 my-auto">
          {/* SVG Donut Ring */}
          <div className="relative flex items-center justify-center">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90"
              viewBox={`0 0 ${size} ${size}`}
            >
              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.06"
                strokeWidth={strokeWidth}
              />

              {/* Segments */}
              {computed.map((seg, idx) => (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-300"
                />
              ))}
            </svg>

            {/* Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-foreground dark:text-white leading-none">
                {totalValue}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted mt-0.5">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2 pt-2 border-t border-border">
            {computed.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted font-medium truncate">{item.label}</span>
                </div>
                <span className="font-bold text-foreground dark:text-white font-mono">
                  {item.value} ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
