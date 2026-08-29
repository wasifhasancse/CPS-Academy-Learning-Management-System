const variantStyles = {
  primary: "bg-[#4A628A] text-[#DFF2EB] dark:bg-[#7AB2D3] dark:text-[#1E2A3A] font-semibold",
  secondary: "bg-[#7AB2D3] text-white",
  highlight: "bg-[#B9E5E8]/40 text-[#4A628A] dark:bg-[#B9E5E8]/20 dark:text-[#B9E5E8] border border-[#B9E5E8]/60 font-bold",
  surface: "bg-surface text-foreground border border-border",
  outline: "border border-border text-muted",
  danger: "bg-red-500/10 text-red-500 border border-red-500/20 font-semibold",
  success: "bg-[#B9E5E8]/30 text-[#4A628A] dark:bg-[#B9E5E8]/20 dark:text-[#B9E5E8] border border-[#B9E5E8]/50 font-semibold",
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
