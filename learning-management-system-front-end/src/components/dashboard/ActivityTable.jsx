"use client";

import React from "react";

export function ActivityTable({
  title = "Recent Activity",
  subtitle = "Latest updates needing attention",
  icon,
  columns = ["ITEM", "USER", "CATEGORY", "STATUS", "ACTION"],
  data = [],
  onViewAll,
  viewAllLabel = "View All",
  emptyMessage = "No recent records found.",
}) {
  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
      case "ACTION NEEDED":
        return "bg-red-500/15 text-red-400 border border-red-500/30";
      case "RESOLVED":
      case "COMPLETED":
      case "ACTIVE":
      case "PUBLISHED":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
      case "IN PROGRESS":
      case "REVIEWING":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
      case "DRAFT":
      default:
        return "bg-muted/20 text-muted border border-border";
    }
  };

  const getCategoryBadge = (cat) => {
    const c = (cat || "").toUpperCase();
    if (c.includes("SPAM") || c.includes("ALERT")) {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
    if (c.includes("COPYRIGHT") || c.includes("QUIZ")) {
      return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
    if (c.includes("OFFENSIVE") || c.includes("ISSUE")) {
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    }
    return "bg-surface dark:bg-[#122421] text-secondary border border-border";
  };

  return (
    <div className="rounded-2xl bg-card dark:bg-[#0D1C19] border border-border overflow-hidden">
      {/* Table Header */}
      <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-surface dark:bg-[#122421] border border-border flex items-center justify-center text-secondary shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-extrabold text-foreground dark:text-white tracking-tight">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="px-3.5 py-1.5 rounded-lg bg-surface dark:bg-[#122421] hover:bg-border text-foreground dark:text-white text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            {viewAllLabel}
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface/50 dark:bg-[#091413]/50">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 font-bold text-[11px] uppercase tracking-wider text-muted ${
                    idx === columns.length - 1 ? "text-right" : ""
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="hover:bg-surface/40 dark:hover:bg-[#122421]/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-foreground dark:text-white max-w-[240px] truncate">
                    {row.item}
                  </td>
                  <td className="py-3.5 px-4 text-muted font-mono text-[11px]">{row.user}</td>
                  <td className="py-3.5 px-4">
                    {row.category && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getCategoryBadge(
                          row.category
                        )}`}
                      >
                        {row.category}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${getStatusBadge(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {row.actionButton ? (
                      row.actionButton
                    ) : (
                      <button
                        type="button"
                        onClick={row.onAction}
                        className="px-3 py-1 rounded-md bg-surface dark:bg-[#122421] hover:bg-border text-foreground dark:text-white text-[11px] font-semibold border border-border transition-colors cursor-pointer"
                      >
                        {row.actionLabel || "Review"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
