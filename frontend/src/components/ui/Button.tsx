import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive";
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  secondary:
    "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 focus-visible:ring-zinc-400 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

export function Button({
  variant = "primary",
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
