"use client";

import React from "react";

export function Table({ headers, children, className = "", ...props }) {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-border bg-card shadow-1 ${className}`}>
      <table className="w-full text-left text-xs sm:text-sm border-collapse" {...props}>
        {headers && (
          <thead className="bg-[#F8FAF9] dark:bg-[#181E27] text-[11px] font-extrabold text-muted uppercase tracking-wider border-b border-border">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3.5 sm:px-6 font-extrabold">
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
    <thead className={`bg-[#F8FAF9] dark:bg-[#181E27] text-[11px] font-extrabold text-muted uppercase tracking-wider border-b border-border ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return <tbody className={`divide-y divide-border text-foreground ${className}`} {...props}>{children}</tbody>;
}

export function TableHead({ children, className = "", ...props }) {
  return <th className={`px-4 py-3.5 sm:px-6 font-extrabold text-[11px] text-muted uppercase tracking-wider ${className}`} {...props}>{children}</th>;
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr className={`hover:bg-[#E7F8EE]/20 dark:hover:bg-[#181E27]/60 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return <td className={`px-4 py-3.5 sm:px-6 align-middle ${className}`} {...props}>{children}</td>;
}

