import * as React from "react";
import { cn } from "../utils/cn";

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-none border-2 border-gray-800 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
