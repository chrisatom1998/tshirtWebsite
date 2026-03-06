import * as React from "react";
import Link, { type LinkProps } from "next/link";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white hover:-translate-y-0.5 hover:bg-black disabled:bg-ink/50",
  secondary:
    "bg-clay text-white hover:-translate-y-0.5 hover:bg-clay/90 disabled:bg-clay/60",
  ghost:
    "border border-black/10 bg-white/70 text-ink hover:border-black/20 hover:bg-white",
  danger:
    "bg-red-600 text-white hover:-translate-y-0.5 hover:bg-red-700 disabled:bg-red-400",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "ring-focus inline-flex items-center justify-center rounded-full font-semibold shadow-sm disabled:cursor-not-allowed disabled:translate-y-0",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link href={href} className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
