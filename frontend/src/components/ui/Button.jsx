import * as React from "react";
import { cn } from "../utils/cn";

const buttonVariants = {
  default: "bg-black text-white hover:bg-gray-900",
  outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
  ghost: "hover:bg-gray-100 text-gray-900",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variantStyles = buttonVariants[variant] || buttonVariants.default;
    const sizeStyles = buttonSizes[size] || buttonSizes.default;
    
    return (
      <button
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
