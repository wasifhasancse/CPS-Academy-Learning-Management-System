const variantStyles = {
  primary: "bg-primary text-white dark:bg-secondary dark:text-[#091413] font-semibold",
  secondary: "bg-secondary text-white",
  highlight: "bg-highlight text-[#091413] font-bold",
  surface: "bg-surface text-foreground border border-border",
  outline: "border border-border text-muted",
  danger: "bg-red-500/10 text-red-500 border border-red-500/20 font-semibold",
  success: "bg-[#285A48]/10 text-[#285A48] dark:bg-[#B0E4CC]/10 dark:text-[#B0E4CC] border border-[#285A48]/20 font-semibold",
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
