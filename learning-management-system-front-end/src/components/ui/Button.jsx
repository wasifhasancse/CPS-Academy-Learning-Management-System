import Link from "next/link";

const variantStyles = {
  primary:
    "bg-primary text-white hover:bg-[#182C3C] dark:bg-[#6594B1] dark:text-[#101F2B] dark:hover:bg-[#7BA7C4] dark:font-semibold focus-visible:ring-primary/40",
  secondary:
    "bg-secondary text-white hover:bg-[#527D99] dark:bg-secondary dark:hover:bg-[#527D99] focus-visible:ring-secondary/40",
  highlight:
    "bg-highlight text-[#213C51] hover:bg-[#CE9EC4] dark:bg-highlight dark:text-[#101F2B] dark:hover:bg-[#CE9EC4] focus-visible:ring-highlight/50 font-semibold",
  outline:
    "border border-primary text-primary hover:bg-surface dark:border-[#9BB8CB] dark:text-foreground dark:hover:bg-surface focus-visible:ring-primary/30",
  outlineSecondary:
    "border border-secondary text-secondary hover:bg-surface dark:border-secondary dark:text-secondary dark:hover:bg-surface focus-visible:ring-secondary/30",
  ghost:
    "text-foreground hover:bg-surface dark:text-foreground dark:hover:bg-surface focus-visible:ring-primary/20",
  surface:
    "bg-surface text-foreground hover:bg-border/60 dark:bg-surface dark:text-foreground dark:hover:bg-border/60 focus-visible:ring-primary/20",
};

const sizeStyles = {
  sm: "text-xs px-3 py-1.5 rounded-md gap-1.5",
  md: "text-sm px-4 py-2 rounded-lg gap-2",
  lg: "text-base px-6 py-3 rounded-lg gap-2.5 font-medium",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2";
  const classes = `${baseClasses} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
