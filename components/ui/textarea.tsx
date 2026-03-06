import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "ring-focus min-h-[140px] w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-black/45",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
