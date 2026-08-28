"use client";

import React from "react";

export function Table({ headers, children, className = "", ...props }) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-border bg-card ${className}`}>
      <table className="w-full text-left text-xs sm:text-sm" {...props}>
        {headers && (
          <thead className="bg-surface text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 sm:px-6">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "", ...props }) {
  return (
    <thead className={`bg-surface text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return <tbody className={`divide-y divide-border text-foreground ${className}`} {...props}>{children}</tbody>;
}

export function TableHead({ children, className = "", ...props }) {
  return <th className={`px-4 py-3 sm:px-6 font-bold text-xs text-muted uppercase ${className}`} {...props}>{children}</th>;
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr className={`hover:bg-surface/50 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return <td className={`px-4 py-3 sm:px-6 align-middle ${className}`} {...props}>{children}</td>;
}
