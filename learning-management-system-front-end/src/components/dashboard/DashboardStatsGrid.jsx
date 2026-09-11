"use client";


export function DashboardStatsGrid({ stats = [] }) {
  if (!stats || stats.length === 0) return null;

  const colsClass =
    stats.length === 5
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
      : stats.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${colsClass} gap-4`}>
      {stats.map((stat, idx) => {
        const isAlert = stat.isAlert;

        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between shadow-1 transform hover:-translate-y-0.5 hover:shadow-1 ${
              isAlert
                ? "bg-red-500/10 border-red-500/30 text-foreground"
                : "bg-card border-border text-foreground hover:border-[#309255] dark:hover:bg-surface-hover"
            }`}
          >
            {/* Top Bar: Label + Top-right Icon Badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="space-y-1">
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    isAlert ? "text-red-500" : "text-muted"
                  }`}
                >
                  {stat.title}
                </span>
                {stat.badge && (
                  <span
                    className={`inline-block text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isAlert
                        ? "bg-red-500/20 text-red-500 border border-red-500/30"
                        : "bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/15 dark:text-[#E7F8EE] border border-[#309255]/20 font-bold"
                    }`}
                  >
                    {stat.badge}
                  </span>
                )}
              </div>

              {stat.icon && (
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isAlert
                      ? "bg-red-500/15 text-red-500 border border-red-500/20"
                      : "bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/10 dark:text-[#E7F8EE] border border-[#309255]/20"
                  }`}
                >
                  {stat.icon}
                </div>
              )}
            </div>

            {/* Main Metric Value */}
            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-foreground">
                {stat.value}
              </div>

              {/* Subtitle description */}
              {stat.subtitle && (
                <div className="text-xs font-medium text-muted leading-tight">
                  {stat.subtitle}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
