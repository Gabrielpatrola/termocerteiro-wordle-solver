import React, { type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900",
          "placeholder:text-zinc-400",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
          "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
