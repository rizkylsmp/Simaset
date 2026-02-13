import * as React from "react";
import { cn } from "../utils/cn";

const badgeVariants = {
  default: "bg-surface-tertiary text-text-secondary border-border",
  primary:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  success:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  warning:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  danger:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  info: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  purple:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  outline:
    "bg-transparent border-border text-text-secondary hover:bg-surface-secondary",
};

const badgeSizes = {
  sm: "px-1.5 py-0.5 text-[10px]",
  default: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

const Badge = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      icon,
      dot,
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles = badgeVariants[variant] || badgeVariants.default;
    const sizeStyles = badgeSizes[size] || badgeSizes.default;

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium border rounded-full transition-colors",
          variantStyles,
          sizeStyles,
          className,
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              variant === "success" && "bg-emerald-500",
              variant === "warning" && "bg-amber-500",
              variant === "danger" && "bg-red-500",
              variant === "primary" && "bg-blue-500",
              variant === "info" && "bg-cyan-500",
              variant === "purple" && "bg-purple-500",
              variant === "default" && "bg-gray-500",
            )}
          />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
