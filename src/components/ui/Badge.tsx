import React from "react";

export type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/20 text-success",
  warning: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  destructive: "bg-destructive/20 text-destructive",
  outline: "border border-input bg-transparent text-foreground",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
