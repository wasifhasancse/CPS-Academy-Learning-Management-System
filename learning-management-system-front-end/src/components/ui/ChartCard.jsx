"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export function BarChartCard({ title, data = [], height = 180, className = "" }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle as="h3" className="text-base font-bold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div
          className="w-full flex items-end justify-around gap-2 pt-6 pb-2 border-b border-border"
          style={{ height: `${height}px` }}
        >
          {data.map((item, index) => {
            const heightPercent = Math.max(Math.round((item.value / maxValue) * 100), 6);
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[11px] font-bold text-muted group-hover:text-primary dark:group-hover:text-highlight transition-colors">
                  {item.value}
                </span>
                <div className="w-full max-w-[48px] bg-surface dark:bg-surface/50 rounded-t-md overflow-hidden flex items-end h-full">
                  <div
                    className="w-full rounded-t-md transition-all duration-300"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: item.color || "#285A48",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-around gap-2 pt-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center truncate">
              <span className="text-xs font-semibold text-muted truncate block" title={item.label}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PieChartCard({ title, data = [], className = "" }) {
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1;

  // Compute SVG arc angles
  let accumulatedAngle = 0;
  const segments = data.map((item) => {
    const fraction = item.value / total;
    const angle = fraction * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      ...item,
      fraction,
      startAngle,
      endAngle: accumulatedAngle,
    };
  });

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle as="h3" className="text-base font-bold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Ring Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((seg, idx) => {
              const strokeDasharray = `${seg.fraction * 283} 283`;
              const strokeDashoffset = -((seg.startAngle / 360) * 283);
              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={seg.color || "#285A48"}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-foreground">{total}</span>
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.color || "#285A48" }}
              />
              <span className="text-muted truncate font-medium">{item.label}</span>
              <span className="font-bold text-foreground ml-auto">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
