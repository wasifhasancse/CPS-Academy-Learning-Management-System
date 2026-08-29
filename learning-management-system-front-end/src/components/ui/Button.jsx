import Link from "next/link";

const variantStyles = {
  primary:
    "bg-[#7AB2D3] text-white hover:bg-[#4A628A] dark:bg-[#7AB2D3] dark:text-[#1E2A3A] dark:hover:bg-[#B9E5E8] focus-visible:ring-[#7AB2D3]/40 font-bold",
  secondary:
    "bg-[#4A628A] text-[#DFF2EB] hover:bg-[#5A7BA0] dark:bg-[#5A7BA0] dark:text-[#DFF2EB] dark:hover:bg-[#7AB2D3] focus-visible:ring-[#4A628A]/40 font-semibold",
  highlight:
    "bg-[#B9E5E8] text-[#4A628A] hover:bg-[#DFF2EB] dark:bg-[#B9E5E8] dark:text-[#1E2A3A] dark:hover:bg-[#DFF2EB] focus-visible:ring-[#B9E5E8]/50 font-bold",
  outline:
    "border border-[#7AB2D3] text-[#7AB2D3] hover:bg-[#7AB2D3]/10 dark:border-[#B9E5E8] dark:text-[#B9E5E8] dark:hover:bg-[#B9E5E8]/15 focus-visible:ring-[#7AB2D3]/30 font-semibold",
  outlineSecondary:
    "border border-[#B9E5E8] text-[#4A628A] dark:border-[#B9E5E8]/40 dark:text-[#B9E5E8] hover:bg-[#B9E5E8]/10 focus-visible:ring-[#B9E5E8]/30",
  ghost:
    "text-foreground hover:bg-surface dark:text-foreground dark:hover:bg-surface focus-visible:ring-[#7AB2D3]/20",
  surface:
    "bg-surface text-foreground hover:bg-border/60 dark:bg-surface dark:text-foreground dark:hover:bg-border/60 focus-visible:ring-[#7AB2D3]/20",
  danger:
    "bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20 focus-visible:ring-red-500/30",
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
  isLoading = false,
  type = "button",
  onClick,
  ...props
}) {
  const isDisabled = disabled || isLoading;
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2";
  const classes = `${baseClasses} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`;

  const content = (
    <>
      {isLoading && (
        <svg
          className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
}
