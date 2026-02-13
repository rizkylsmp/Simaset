import * as React from "react";
import { cn } from "../utils/cn";

const buttonVariants = {
  default:
    "bg-accent text-white dark:text-gray-900 hover:bg-accent-hover shadow-sm hover:shadow-md",
  primary:
    "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md shadow-blue-500/20",
  success:
    "bg-linear-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-sm hover:shadow-md shadow-emerald-500/20",
  danger:
    "bg-linear-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md shadow-red-500/20",
  warning:
    "bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-sm hover:shadow-md shadow-amber-500/20",
  outline:
    "border-2 border-border bg-transparent hover:bg-surface-tertiary text-text-primary hover:border-text-tertiary",
  ghost: "hover:bg-surface-tertiary text-text-primary",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
  link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
  soft: "bg-accent/10 text-accent hover:bg-accent/20",
};

const buttonSizes = {
  xs: "h-7 px-2 text-xs rounded-md",
  sm: "h-8 px-3 text-xs rounded-lg",
  default: "h-10 px-4 py-2 text-sm rounded-lg",
  lg: "h-11 px-6 text-sm rounded-lg",
  xl: "h-12 px-8 text-base rounded-xl",
  icon: "h-10 w-10 rounded-lg",
  "icon-sm": "h-8 w-8 rounded-lg",
};

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    const variantStyles = buttonVariants[variant] || buttonVariants.default;
    const sizeStyles = buttonSizes[size] || buttonSizes.default;

    return (
      <button
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!isLoading && rightIcon ? rightIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
