"use client";

import React, { useState } from "react";

const CHART_COLORS = [
  "#285A48",
  "#408A71",
  "#B0E4CC",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
];

export function GrowthLineChart({
  title = "Activity Trend",
  subtitle = "",
  dataPoints = [],
  metricLabel = "Count",
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Aggregate dataPoints by month from real dateObj values
  const monthBuckets = {};
  const now = new Date();
  // Create last 6 months buckets
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    monthBuckets[key] = { label, count: 0 };
  }

  dataPoints.forEach((pt) => {
    if (!pt.dateObj) return;
    const d = new Date(pt.dateObj);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthBuckets[key] !== undefined) {
      monthBuckets[key].count += 1;
    }
  });

  const months = Object.values(monthBuckets).map((b) => b.label);
  const values = Object.values(monthBuckets).map((b) => b.count);

  // Cumulative sum
  const cumulative = [];
  values.reduce((acc, val) => {
    const next = acc + val;
    cumulative.push(next);
    return next;
  }, 0);

  const maxValue = Math.max(...cumulative, 1);
  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = cumulative.map((val, idx) => {
    const x = paddingX + (months.length > 1 ? (idx / (months.length - 1)) * chartWidth : chartWidth / 2);
    const y = height - paddingY - (val / maxValue) * chartHeight;
    return { x, y, val, month: months[idx] };
  });

  const createPath = (pts) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    return pts.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[idx - 1];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }, "");
  };

  const createAreaPath = (pts) => {
    const linePath = createPath(pts);
    if (!linePath || pts.length === 0) return "";
    const last = pts[pts.length - 1];
    const first = pts[0];
    const bottomY = height - paddingY;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  };

  const linePath = createPath(points);
  const areaPath = createAreaPath(points);

  // Dynamic Y ticks
  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
    Math.round((maxValue / yTickCount) * (yTickCount - i))
  );

  const lineColor = CHART_COLORS[0];

  const hasData = cumulative.some((v) => v > 0);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-card dark:bg-[#0D1C19] border border-border flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground dark:text-white tracking-tight">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lineColor }} />
          <span className="text-muted font-medium">{metricLabel}</span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface dark:bg-[#122421] border border-border flex items-center justify-center text-muted mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-foreground dark:text-white">No activity data yet</p>
          <p className="text-[11px] text-muted mt-1">Activity will appear here as data accumulates</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48 sm:h-56"
            preserveAspectRatio="none"
          >
            {/* Y Axis Gridlines */}
            {yTicks.map((tick, idx) => {
              const y = height - paddingY - (tick / maxValue) * chartHeight;
              return (
                <g key={`ytick-${idx}`}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="currentColor"
                    className="text-muted opacity-60 font-mono"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill={lineColor} fillOpacity="0.12" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === idx ? "5" : "3.5"}
                fill="#FFFFFF"
                stroke={lineColor}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}

            {/* Tooltip */}
            {hoveredIdx !== null && points[hoveredIdx] && (
              <g>
                <rect
                  x={points[hoveredIdx].x - 28}
                  y={points[hoveredIdx].y - 28}
                  width="56"
                  height="20"
                  rx="4"
                  fill="#091413"
                  fillOpacity="0.9"
                />
                <text
                  x={points[hoveredIdx].x}
                  y={points[hoveredIdx].y - 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#F0F7F4"
                  className="font-mono font-bold"
                >
                  {points[hoveredIdx].val} {metricLabel}
                </text>
              </g>
            )}

            {/* X Axis Month Labels */}
            {months.map((m, idx) => {
              const x = paddingX + (months.length > 1 ? (idx / (months.length - 1)) * chartWidth : chartWidth / 2);
              return (
                <text
                  key={m + idx}
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill="currentColor"
                  className="text-muted opacity-80 font-medium"
                >
                  {m}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
