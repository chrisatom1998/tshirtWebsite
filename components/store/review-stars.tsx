import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function ReviewStars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn("h-4 w-4", index < rating ? "fill-amber-400 text-amber-400" : "text-black/15")}
        />
      ))}
    </div>
  );
}
