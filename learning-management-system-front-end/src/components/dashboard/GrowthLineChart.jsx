"use client";

import React, { useState } from "react";

const DEFAULT_COLORS = [
  "#7AB2D3", // Sky Steel Blue
  "#4A628A", // Deep Slate Blue
  "#5B93B5", // Slate Cyan
  "#94C8CD", // Soft Pale Teal
];

export function GrowthLineChart({
  title = "Activity Trend",
  subtitle = "",
  series = [],
  dataPoints = [],
  metricLabel = "Events",
  className = "",
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeSeries, setActiveSeries] = useState({});

  // Normalize single dataPoints prop to series array
  const resolvedSeries = React.useMemo(() => {
    if (series && series.length > 0) {
      return series.map((s, idx) => ({
        name: s.name || `Series ${idx + 1}`,
        color: s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        dataPoints: s.dataPoints || s.data || [],
      }));
    }
    return [
      {
        name: metricLabel,
        color: DEFAULT_COLORS[0],
        dataPoints: dataPoints || [],
      },
    ];
  }, [series, dataPoints, metricLabel]);

  // Create 6 monthly buckets for all series
  const monthBuckets = React.useMemo(() => {
    const buckets = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short" });
      const fullLabel = d.toLocaleString("default", { month: "long", year: "numeric" });
      buckets[key] = { label, fullLabel, seriesCounts: {} };
    }
    return buckets;
  }, []);

  const months = Object.values(monthBuckets).map((b) => b.label);
  const monthKeys = Object.keys(monthBuckets);

  // Compute points and cumulative counts for each series
  const computedSeries = React.useMemo(() => {
    return resolvedSeries.map((s, sIdx) => {
      const monthlyCounts = monthKeys.map((key) => {
        let count = 0;
        (s.dataPoints || []).forEach((pt) => {
          const rawDate = pt.dateObj || pt.createdAt || pt.updatedAt || pt.submittedAt || pt.timestamp;
          if (!rawDate) return;
          const d = new Date(rawDate);
          if (isNaN(d.getTime())) return;
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (k === key) count += 1;
        });
        return count;
      });

      // Cumulative sum
      const cumulative = [];
      monthlyCounts.reduce((acc, val) => {
        const next = acc + val;
        cumulative.push(next);
        return next;
      }, 0);

      return {
        ...s,
        id: `series-${sIdx}`,
        monthlyCounts,
        cumulative,
      };
    });
  }, [resolvedSeries, monthKeys]);

  // Determine global max across visible series for uniform scale
  const visibleSeries = computedSeries.filter((s) => activeSeries[s.id] !== false);
  const globalMax = Math.max(
    ...visibleSeries.flatMap((s) => s.cumulative),
    1
  );

  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

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

  // Build points for each visible series
  const renderedSeries = visibleSeries.map((s) => {
    const pts = s.cumulative.map((val, idx) => {
      const x = paddingX + (months.length > 1 ? (idx / (months.length - 1)) * chartWidth : chartWidth / 2);
      const y = height - paddingY - (val / globalMax) * chartHeight;
      return { x, y, val, month: months[idx] };
    });
    return {
      ...s,
      points: pts,
      linePath: createPath(pts),
      areaPath: createAreaPath(pts),
    };
  });

  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
    Math.round((globalMax / yTickCount) * (yTickCount - i))
  );

  const hasData = visibleSeries.some((s) => s.cumulative.some((v) => v > 0));

  const toggleSeries = (id) => {
    setActiveSeries((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const selectedIdx = hoveredIdx !== null ? hoveredIdx : months.length - 1;

  return (
    <div className={`p-5 sm:p-6 rounded-2xl bg-card border border-border flex flex-col justify-between shadow-xs ${className}`}>
      {/* Header with Title and Single-line Horizontally Scrollable Legend Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="shrink-0">
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>

        {/* Single-line Horizontally Scrollable Series Legend */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-1 max-w-full">
          {computedSeries.map((s) => {
            const isHidden = activeSeries[s.id] === false;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSeries(s.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isHidden
                    ? "bg-surface/50 border-border text-muted/60 opacity-60"
                    : "bg-surface border-border text-foreground hover:border-primary/40"
                }`}
                title={`Click to ${isHidden ? "show" : "hide"} ${s.name}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: isHidden ? "#94A3B8" : s.color }}
                />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-center my-auto">
          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-muted mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-foreground">No activity data recorded</p>
          <p className="text-[11px] text-muted mt-1">Timeline will populate dynamically as platform activity occurs</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto flex-1 flex flex-col justify-between">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 sm:h-52"
            preserveAspectRatio="none"
          >
            {/* Y Axis Gridlines */}
            {yTicks.map((tick, idx) => {
              const y = height - paddingY - (tick / globalMax) * chartHeight;
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

            {/* Area Fills for each series */}
            {renderedSeries.map((s) => (
              <path
                key={`area-${s.id}`}
                d={s.areaPath}
                fill={s.color}
                fillOpacity="0.10"
              />
            ))}

            {/* Bezier Lines for each series */}
            {renderedSeries.map((s) => (
              <path
                key={`line-${s.id}`}
                d={s.linePath}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Data Point Circles */}
            {renderedSeries.map((s) =>
              s.points.map((pt, idx) => (
                <circle
                  key={`pt-${s.id}-${idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={selectedIdx === idx ? "5" : "3.5"}
                  fill="#FFFFFF"
                  stroke={s.color}
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => setHoveredIdx(idx)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                />
              ))
            )}

            {/* X Axis Month Labels */}
            {months.map((m, idx) => {
              const x = paddingX + (months.length > 1 ? (idx / (months.length - 1)) * chartWidth : chartWidth / 2);
              return (
                <g key={m + idx}>
                  <rect
                    x={x - chartWidth / (months.length * 2)}
                    y={paddingY}
                    width={chartWidth / months.length}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setHoveredIdx(idx)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                  />
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fill="currentColor"
                    className={`transition-colors font-medium cursor-pointer ${
                      selectedIdx === idx
                        ? "text-primary dark:text-highlight font-extrabold"
                        : "text-muted opacity-80"
                    }`}
                  >
                    {m}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Always Visible Multi-Series Metric Summary Tray */}
          <div className="mt-2.5 p-3 rounded-xl bg-surface border border-border flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Metrics:</span>
              <span className="font-bold text-foreground font-mono">
                {Object.values(monthBuckets)[selectedIdx]?.fullLabel || months[selectedIdx]}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {renderedSeries.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-muted text-[11px]">{s.name}:</span>
                  <span className="font-bold text-foreground font-mono">
                    {s.cumulative[selectedIdx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
