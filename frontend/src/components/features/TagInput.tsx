import React, { useRef, type KeyboardEvent } from "react";
import { cn } from "@/utils/cn";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  tagColor?: "yellow" | "red";
  error?: string;
}

const tagColorClasses: Record<NonNullable<TagInputProps["tagColor"]>, string> = {
  yellow:
    "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300",
  red: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300",
};

export function TagInput({
  label,
  value,
  onChange,
  tagColor = "yellow",
  error,
}: TagInputProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Backspace" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  function handleChange(raw: string): void {
    const letter = raw.trim().toLowerCase();
    if (letter.length === 1 && /^[a-z]$/.test(letter) && !value.includes(letter)) {
      onChange([...value, letter]);
    }
    // Always clear the input — the chip is the visual representation
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeTag(letter: string): void {
    onChange(value.filter((l) => l !== letter));
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <div
        className={cn(
          "flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 cursor-text",
          "focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent",
          "dark:border-zinc-600 dark:bg-zinc-800",
          error && "border-red-500"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((letter) => (
          <span
            key={letter}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-semibold uppercase",
              tagColorClasses[tagColor]
            )}
          >
            {letter}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(letter); }}
              className="ml-0.5 text-xs leading-none opacity-60 hover:opacity-100"
              aria-label={`Remover letra ${letter}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          maxLength={1}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-6 w-8 min-w-[2rem] flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          placeholder={value.length === 0 ? "a b c…" : ""}
          aria-label={label}
        />
      </div>
      <p className="text-xs text-zinc-400">
        Digite letras — Backspace para remover a última
      </p>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
