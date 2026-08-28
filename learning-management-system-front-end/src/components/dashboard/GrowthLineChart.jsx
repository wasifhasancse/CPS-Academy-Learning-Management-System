"use client";

import React, { useState } from "react";

export function GrowthLineChart({
  title = "Monthly Platform Growth",
  subtitle = "User registrations vs enrollments",
  seriesA = { name: "New Users", data: [350, 480, 620, 810, 990, 1150, 1380], color: "#3B82F6" },
  seriesB = { name: "Course Enrollments", data: [120, 210, 310, 450, 600, 720, 890], color: "#EF4444" },
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxValue = Math.max(...seriesA.data, ...seriesB.data, 1400);
  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate points
  const pointsA = seriesA.data.map((val, idx) => {
    const x = paddingX + (idx / (seriesA.data.length - 1)) * chartWidth;
    const y = height - paddingY - (val / maxValue) * chartHeight;
    return { x, y, val, month: months[idx] };
  });

  const pointsB = seriesB.data.map((val, idx) => {
    const x = paddingX + (idx / (seriesB.data.length - 1)) * chartWidth;
    const y = height - paddingY - (val / maxValue) * chartHeight;
    return { x, y, val, month: months[idx] };
  });

  // SVG path generation
  const createPath = (points) => {
    if (points.length === 0) return "";
    return points.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[idx - 1];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }, "");
  };

  const createAreaPath = (points) => {
    const linePath = createPath(points);
    if (!linePath) return "";
    const last = points[points.length - 1];
    const first = points[0];
    const bottomY = height - paddingY;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  };

  const pathA = createPath(pointsA);
  const pathB = createPath(pointsB);
  const areaA = createAreaPath(pointsA);

  const yTicks = [1400, 1050, 700, 350, 0];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-card dark:bg-[#0D1C19] border border-border flex flex-col justify-between">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seriesA.color }} />
            <span className="text-muted font-medium">{seriesA.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seriesB.color }} />
            <span className="text-muted font-medium">{seriesB.name}</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56"
          preserveAspectRatio="none"
        >
          {/* Y Axis Gridlines */}
          {yTicks.map((tick) => {
            const y = height - paddingY - (tick / maxValue) * chartHeight;
            return (
              <g key={tick}>
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

          {/* Area fill for series A */}
          <path d={areaA} fill={seriesA.color} fillOpacity="0.12" />

          {/* Series A Line */}
          <path
            d={pathA}
            fill="none"
            stroke={seriesA.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Series B Line */}
          <path
            d={pathB}
            fill="none"
            stroke={seriesB.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {pointsA.map((pt, idx) => (
            <circle
              key={`a-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === idx ? "5" : "3.5"}
              fill="#FFFFFF"
              stroke={seriesA.color}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {pointsB.map((pt, idx) => (
            <circle
              key={`b-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === idx ? "5" : "3.5"}
              fill="#FFFFFF"
              stroke={seriesB.color}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* X Axis Month Labels */}
          {months.map((m, idx) => {
            const x = paddingX + (idx / (months.length - 1)) * chartWidth;
            return (
              <text
                key={m}
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
    </div>
  );
}
