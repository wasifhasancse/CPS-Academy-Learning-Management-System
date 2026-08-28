"use client";

import React from "react";

export function DistributionDonutChart({
  title = "Moderation Health",
  subtitle = "Reports distribution by reason",
  items = [
    { label: "Spam / Unrelated", value: 45, color: "#F59E0B" },
    { label: "Offensive Content", value: 35, color: "#EC4899" },
    { label: "Copyright Issue", value: 20, color: "#8B5CF6" },
  ],
}) {
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const totalValue = items.reduce((acc, item) => acc + item.value, 0) || 100;

  // Calculate segment offsets
  let accumulatedPercent = 0;
  const segments = items.map((item) => {
    const percent = item.value / totalValue;
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const strokeDashoffset = -circumference * accumulatedPercent;
    accumulatedPercent += percent;
    return {
      ...item,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-card dark:bg-[#0D1C19] border border-border flex flex-col justify-between">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-extrabold text-foreground dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-muted mt-0.5">{subtitle}</p>
      </div>

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
            {segments.map((seg, idx) => (
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
          {segments.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted font-medium truncate">{item.label}</span>
              </div>
              <span className="font-bold text-foreground dark:text-white font-mono">
                {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
