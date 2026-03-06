import { cn } from "@/lib/utils";

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("text-sm font-semibold uppercase tracking-[0.2em] text-black/50", className)}>
      {children}
    </label>
  );
}
