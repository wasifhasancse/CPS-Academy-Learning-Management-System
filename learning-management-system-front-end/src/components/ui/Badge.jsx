const variantStyles = {
  primary: "bg-[#309255] text-white font-semibold",
  secondary: "bg-[#212832] text-white dark:bg-[#309255] dark:text-white font-semibold",
  highlight: "bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/15 dark:text-[#E7F8EE] border border-[#309255]/20 font-bold",
  surface: "bg-surface text-foreground border border-border",
  outline: "border border-border text-muted",
  danger: "bg-red-500/10 text-red-500 border border-red-500/20 font-semibold",
  success: "bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] border border-[#309255]/30 font-semibold",
};

const sizeStyles = {
  sm: "text-[11px] px-2.5 py-0.5 rounded-full",
  md: "text-xs px-3 py-1 rounded-full",
  lg: "text-sm px-3.5 py-1.5 rounded-full",
};

export function Badge({
  children,
  variant = "surface",
  size = "md",
  className = "",
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium select-none whitespace-nowrap shrink-0";
  const classes = `${baseClasses} ${variantStyles[variant] || variantStyles.surface} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
