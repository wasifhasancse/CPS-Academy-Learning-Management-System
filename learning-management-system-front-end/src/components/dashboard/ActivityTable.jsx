"use client";

import React from "react";
import Link from "next/link";

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
      case "FAILED":
        return "bg-red-500/15 text-red-500 border border-red-500/30";
      case "RESOLVED":
      case "COMPLETED":
      case "ACTIVE":
      case "PUBLISHED":
      case "PASSED":
        return "bg-primary/15 text-primary dark:text-highlight border border-primary/30";
      case "IN PROGRESS":
      case "REVIEWING":
        return "bg-[#7AB2D3]/20 text-[#4A628A] dark:text-[#B9E5E8] border border-[#7AB2D3]/30";
      case "DRAFT":
      default:
        return "bg-surface text-muted border border-border";
    }
  };

  const getCategoryBadge = (cat) => {
    const c = (cat || "").toUpperCase();
    if (c.includes("ADMIN")) {
      return "bg-primary/15 text-primary dark:text-highlight border border-primary/30";
    }
    if (c.includes("INSTRUCTOR") || c.includes("MANAGER")) {
      return "bg-[#7AB2D3]/20 text-[#4A628A] dark:text-[#B9E5E8] border border-[#7AB2D3]/30";
    }
    if (c.includes("STUDENT") || c.includes("ENROLLMENT") || c.includes("COURSE")) {
      return "bg-surface text-foreground border border-border";
    }
    return "bg-surface text-muted border border-border";
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xs">
      {/* Table Header */}
      <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-primary dark:text-highlight shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-extrabold text-foreground tracking-tight">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-border text-foreground text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            {viewAllLabel}
          </button>
        )}
      </div>

      {/* Table Content with Sticky Header and 8-row Scroll Container */}
      <div className="overflow-x-auto">
        <div className="max-h-[384px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-surface shadow-xs">
              <tr className="border-b border-border">
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
                  <td colSpan={columns.length} className="py-12 text-center text-muted">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-surface/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-foreground max-w-[260px] truncate">
                      {row.item}
                    </td>
                    <td className="py-3 px-4 text-muted font-mono text-[11px] whitespace-nowrap">{row.user}</td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${getStatusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {row.actionButton ? (
                        row.actionButton
                      ) : row.href ? (
                        <Link
                          href={row.href}
                          className="px-3 py-1 rounded-md bg-surface hover:bg-border text-foreground text-[11px] font-semibold border border-border transition-colors inline-block cursor-pointer"
                        >
                          {row.actionLabel || "View"}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={row.onAction}
                          className="px-3 py-1 rounded-md bg-surface hover:bg-border text-foreground text-[11px] font-semibold border border-border transition-colors cursor-pointer"
                        >
                          {row.actionLabel || "View"}
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
    </div>
  );
}
