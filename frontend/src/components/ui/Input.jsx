import * as React from "react";
import { cn } from "../utils/cn";

const Input = React.forwardRef(
  ({ className, type, leftIcon, rightIcon, error, ...props }, ref) => (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-surface px-4 py-2 text-sm text-text-primary placeholder-text-muted transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-secondary",
          error
            ? "border-red-500 focus-visible:ring-red-500/30 focus-visible:border-red-500"
            : "border-border hover:border-text-muted focus-visible:ring-accent/30 focus-visible:border-accent",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className,
        )}
        ref={ref}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
          {rightIcon}
        </div>
      )}
    </div>
  ),
);
Input.displayName = "Input";

export { Input };
