export function Card({
  children,
  className = "",
  hoverable = false,
  ...props
}) {
  const hoverClass = hoverable
    ? "transition-all duration-200 hover:border-secondary hover:shadow-sm"
    : "";
  return (
    <article
      className={`bg-card text-card-foreground rounded-xl border border-border overflow-hidden ${hoverClass} ${className}`}
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

export function CardTitle({ children, className = "", as: Component = "h3", ...props }) {
  return (
    <Component className={`text-lg font-bold text-foreground ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`text-sm text-muted mt-1 leading-relaxed ${className}`} {...props}>
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
    <footer className={`p-5 pt-3 border-t border-border flex items-center ${className}`} {...props}>
      {children}
    </footer>
  );
}
