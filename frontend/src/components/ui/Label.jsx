import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../utils/cn";

const Label = React.forwardRef(({ className, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-none text-text-primary mb-1.5 block",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  >
    {props.children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
