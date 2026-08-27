export function Input({
  label,
  error,
  id,
  className = "",
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  icon: Icon,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-foreground uppercase tracking-wide"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none disabled:bg-surface disabled:cursor-not-allowed ${
            Icon ? "pl-10" : ""
          } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-border"} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
