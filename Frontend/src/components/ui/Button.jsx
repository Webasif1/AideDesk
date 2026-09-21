// The design system's button. Variants map to the palette: primary is the
// brand fill (forest in light mode, sage in dark), secondary is outlined,
// ghost is text-only, danger is destructive. `loading` disables the button,
// shows a spinner and sets aria-busy so the state is announced.
const VARIANTS = {
  primary:
    "bg-brand text-white dark:text-black hover:bg-brand-hover shadow-[0_8px_20px_-8px_rgba(35,83,71,0.6)]",
  secondary:
    "bg-white dark:bg-transparent border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900",
  ghost: "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
  danger: "bg-err text-white dark:text-black hover:opacity-90",
};

const SIZES = {
  sm: "h-[34px] px-[12px] text-[13px] gap-[6px]",
  md: "h-[40px] px-[16px] text-[14px] gap-[8px]",
  lg: "h-[48px] px-[22px] text-[15px] gap-[10px]",
};

const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  type = "button",
  className = "",
  disabled,
  children,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`inline-flex items-center justify-center rounded-full font-semibold transition-[background-color,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${
      VARIANTS[variant] || VARIANTS.primary
    } ${SIZES[size] || SIZES.md} ${className}`}
    {...rest}
  >
    {loading ? (
      <span aria-hidden="true" className="w-[16px] h-[16px] rounded-full border-2 border-current border-r-transparent animate-spin" />
    ) : (
      icon && (
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
          {icon}
        </span>
      )
    )}
    {children}
  </button>
);

export default Button;
