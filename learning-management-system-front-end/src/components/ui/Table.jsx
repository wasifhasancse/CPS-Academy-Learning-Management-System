"use client";

import React from "react";

export function Table({ headers, children, className = "" }) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-border bg-card ${className}`}>
      <table className="w-full text-left text-xs sm:text-sm">
        <tbody className="divide-y divide-border text-foreground">{children}</tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = "" }) {
  return (
    <tr className={`hover:bg-surface/50 transition-colors ${className}`}>
      {children}
    </tr>
  );
}
