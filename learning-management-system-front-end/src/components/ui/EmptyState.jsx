export function EmptyState({
  icon,
  title = "No Data Found",
  description = "There are no records to display at this moment.",
  action,
  className = "",
  size = "md",
}) {
  const sizeStyles = {
    sm: "py-6 px-4",
    md: "py-10 px-6 sm:py-14 sm:px-8",
    lg: "py-16 px-8 sm:py-20 sm:px-12",
  };

  const iconSizes = {
    sm: "w-10 h-10 text-base",
    md: "w-14 h-14 text-xl",
    lg: "w-16 h-16 text-2xl",
  };

  const defaultIcon = (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center bg-surface/60 border border-dashed border-border rounded-2xl ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      <div
        className={`${iconSizes[size] || iconSizes.md} rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-highlight flex items-center justify-center mb-4 shrink-0 shadow-sm`}
      >
        {icon || defaultIcon}
      </div>

      <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-muted max-w-sm sm:max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3">{action}</div>}
    </div>
  );
}
