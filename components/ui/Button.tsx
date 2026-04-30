import clsx from "clsx";

type Variant = "stage" | "green" | "amber" | "red" | "pink" | "blue" | "ghost" | "prop-on" | "prop-off";
type Size    = "md" | "sm";

const VARIANTS: Record<Variant, string> = {
  stage:    "bg-yellow-400/10 border-yellow-400/30 text-yellow-300",
  green:    "bg-emerald-400/10 border-emerald-400/25 text-emerald-400",
  amber:    "bg-amber-400/10  border-amber-400/25  text-amber-400",
  red:      "bg-red-400/10   border-red-400/25   text-red-400",
  pink:     "bg-pink-400/10  border-pink-400/30  text-pink-400",
  blue:     "bg-blue-400/10  border-blue-400/25  text-blue-400",
  ghost:    "bg-transparent  border-[var(--border2)] text-gray-500 hover:text-gray-300",
  "prop-on":  "bg-orange-400/10 border-orange-400/35 text-orange-400",
  "prop-off": "bg-transparent  border-[var(--border2)] text-gray-600",
};
const SIZES: Record<Size, string> = {
  md: "min-h-[52px] px-5 text-[14px]",
  sm: "min-h-[42px] px-4 text-[13px]",
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export default function Button({ variant = "ghost", size = "md", fullWidth = false, className, children, ...props }: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-[8px] border font-semibold",
        "transition-all active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed",
        "whitespace-nowrap -webkit-tap-highlight-color-transparent",
        VARIANTS[variant], SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
