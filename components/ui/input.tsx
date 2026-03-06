import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "ring-focus h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink placeholder:text-black/45",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
