import Link from "next/link";

const variantStyles = {
  primary:
    "bg-[#309255] text-white hover:bg-[#212832] dark:bg-[#309255] dark:hover:bg-[#212832] shadow-1 hover:shadow-1 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#309255]/40 font-bold",
  secondary:
    "bg-[#212832] text-white hover:bg-[#309255] dark:bg-[#309255] dark:text-white dark:hover:bg-[#267544] shadow-1 hover:shadow-1 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#212832]/40 font-semibold",
  highlight:
    "bg-[#E7F8EE] text-[#309255] hover:bg-[#309255] hover:text-white dark:bg-[#E7F8EE]/10 dark:text-[#E7F8EE] dark:hover:bg-[#309255] dark:hover:text-white border border-[#309255]/20 shadow-1 hover:shadow-1 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#309255]/30 font-bold",
  outline:
    "border-2 border-[#309255] text-[#309255] hover:bg-[#309255] hover:text-white dark:border-[#309255] dark:text-[#309255] dark:hover:bg-[#309255] dark:hover:text-white hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#309255]/30 font-bold",
  outlineSecondary:
    "border border-[#212832]/20 text-[#212832] dark:border-[#E7F8EE]/20 dark:text-[#E7F8EE] hover:bg-[#E7F8EE]/40 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#212832]/30 font-semibold",
  ghost:
    "text-foreground hover:bg-[#E7F8EE] hover:text-[#309255] dark:text-foreground dark:hover:bg-[#212832] dark:hover:text-[#E7F8EE] focus-visible:ring-[#309255]/20",
  surface:
    "bg-surface text-foreground hover:bg-[#E7F8EE] hover:text-[#309255] border border-border dark:bg-surface dark:text-foreground dark:hover:bg-border/60 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#309255]/20",
  danger:
    "bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-500/20 focus-visible:ring-red-500/30",
};

const sizeStyles = {
  sm: "text-xs px-3.5 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4.5 py-2 rounded-xl gap-2",
  lg: "text-base px-6 py-3 rounded-xl gap-2.5 font-medium",
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
    "inline-flex items-center justify-center font-medium transition-all duration-300 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus-visible:outline-none focus-visible:ring-2";
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
