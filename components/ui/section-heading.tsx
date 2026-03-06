import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-4">
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <div className="space-y-3">
        <h2 className="max-w-3xl font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-8 text-black/70 sm:text-lg">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
