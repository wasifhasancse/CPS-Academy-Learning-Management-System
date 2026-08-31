"use client";

import React from "react";

const SEGMENT_COLORS = [
  "#309255",
  "#48BB78",
  "#212832",
  "#10B981",
  "#38A169",
  "#68D391",
  "#1F2937",
  "#059669",
];

export function DistributionDonutChart({
  title = "Distribution",
  subtitle = "",
  items = [],
  categories = [],
  groupBy = "category",
  className = "",
}) {
  // Build distribution from real items grouped by category or course title
  const distributionMap = {};
  items.forEach((item) => {
    let groupKey = "Uncategorized";
    if (groupBy === "course") {
      groupKey = item.course?.title || item.title || "Course Track";
    } else {
      groupKey = item.category?.name || item.name || "Uncategorized";
    }
    if (!distributionMap[groupKey]) {
      distributionMap[groupKey] = 0;
    }
    distributionMap[groupKey] += 1;
  });

  const segments = Object.entries(distributionMap).map(([label, value], idx) => ({
    label,
    value,
    color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
  }));

  const totalValue = segments.reduce((acc, s) => acc + s.value, 0);

  const size = 170;
  const strokeWidth = 24;
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
    <div className={`p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col justify-between shadow-1 ${className}`}>
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-extrabold text-foreground tracking-tight">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 text-center my-auto">
          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-muted mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-foreground">No distribution data</p>
          <p className="text-[11px] text-muted mt-1">Categories and records will appear as content is added</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 my-auto">
          {/* SVG Donut Ring */}
          <div className="relative flex items-center justify-center py-1">
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
              <span className="text-2xl font-black text-foreground leading-none">
                {totalValue}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted mt-1">Total</span>
            </div>
          </div>

          {/* Vertical scroll list - Exactly 5 items visible at a time */}
          <div className="w-full space-y-1.5 pt-3 border-t border-border max-h-[148px] overflow-y-auto scrollbar-thin pr-1">
            {computed.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-2 max-w-[70%]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted font-medium truncate" title={item.label}>
                    {item.label}
                  </span>
                </div>
                <span className="font-bold text-foreground font-mono shrink-0">
                  {item.value} <span className="text-[10px] text-muted font-normal">({item.percent}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
