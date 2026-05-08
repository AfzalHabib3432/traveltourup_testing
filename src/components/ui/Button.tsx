import React from "react";
import { Link } from "@/i18n/navigation";

export type ButtonVariant =
  | "primary"
  | "primary-cta"
  | "secondary"
  | "icon"
  | "outline"
  | "ghost"
  | "link"
  | "destructive";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
  className?: string;
  /** When provided, renders as Next.js Link instead of button */
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primary-600 text-primary-foreground shadow-sm hover:shadow transition-all duration-200",
  "primary-cta":
    "bg-primary hover:bg-primary-600 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200",
  secondary:
    "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors duration-200",
  icon: "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors duration-200",
  outline: "border border-input bg-transparent hover:bg-muted text-foreground transition-colors duration-200",
  ghost: "hover:bg-muted text-foreground transition-colors duration-200",
  link: "text-primary hover:text-primary-600 font-medium bg-transparent hover:bg-transparent shadow-none",
  destructive:
    "bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors duration-200",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3.5 text-sm font-semibold",
  icon: "w-10 h-10 p-0",
};

const baseStyles =
  "rounded-xl font-medium inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  href,
  ...props
}: ButtonProps) {
  const sizeClass = size === "icon" ? sizeStyles.icon : sizeStyles[size];
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeClass} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
