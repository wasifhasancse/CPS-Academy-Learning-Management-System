export function Card({
  children,
  className = "",
  hoverable = false,
  ...props
}) {
  const hoverClass = hoverable
    ? "transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-1 hover:border-[#309255] dark:hover:bg-surface-hover"
    : "transition-colors duration-200";
  return (
    <article
      className={`bg-card text-card-foreground rounded-2xl border border-border shadow-1 overflow-hidden ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </article>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <header className={`p-5 pb-3 ${className}`} {...props}>
      {children}
    </header>
  );
}

export function CardTitle({
  children,
  className = "",
  as: Component = "h3",
  ...props
}) {
  return (
    <Component
      className={`text-lg font-bold text-foreground ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p
      className={`text-sm text-muted mt-1 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <section className={`p-5 pt-0 ${className}`} {...props}>
      {children}
    </section>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <footer
      className={`p-5 pt-3 border-t border-border flex items-center ${className}`}
      {...props}
    >
      {children}
    </footer>
  );
}
