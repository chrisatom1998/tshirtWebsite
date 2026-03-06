import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "ring-focus h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink",
          className,
        )}
        {...props}
      />
    );
  },
);

Select.displayName = "Select";
