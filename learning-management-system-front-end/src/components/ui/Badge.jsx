const variantStyles = {
  primary: "bg-primary text-white dark:bg-secondary dark:text-white",
  secondary: "bg-secondary text-white",
  highlight: "bg-highlight text-[#213C51] font-semibold",
  surface: "bg-surface text-foreground",
  outline: "border border-border text-muted",
};

const sizeStyles = {
  sm: "text-[11px] px-2 py-0.5 rounded",
  md: "text-xs px-2.5 py-1 rounded-md",
  lg: "text-sm px-3 py-1.5 rounded-md",
};

export function Badge({
  children,
  variant = "surface",
  size = "md",
  className = "",
  ...props
}) {
  const baseClasses = "inline-flex items-center font-medium select-none";
  const classes = `${baseClasses} ${variantStyles[variant] || variantStyles.surface} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
