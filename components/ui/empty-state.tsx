import { ButtonLink } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="glass-panel flex flex-col items-start gap-4 p-8">
      <div className="space-y-2">
        <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-ink">
          {title}
        </h3>
        <p className="max-w-xl text-sm leading-7 text-black/70">{description}</p>
      </div>
      {actionLabel && actionHref ? <ButtonLink href={actionHref}>{actionLabel}</ButtonLink> : null}
    </div>
  );
}
