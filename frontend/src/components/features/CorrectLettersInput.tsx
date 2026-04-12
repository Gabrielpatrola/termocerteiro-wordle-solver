import React, { useRef } from "react";
import { cn } from "@/utils/cn";

type FiveLetters = [string, string, string, string, string];

interface CorrectLettersInputProps {
  value: FiveLetters;
  onChange: (value: FiveLetters) => void;
  error?: string;
}

export function CorrectLettersInput({
  value,
  onChange,
  error,
}: CorrectLettersInputProps): React.JSX.Element {
  const refs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null]);

  function handleChange(index: number, raw: string): void {
    const letter = raw.replace(/[^a-zA-Z]/g, "").slice(-1).toLowerCase();
    const next = [...value] as FiveLetters;
    next[index] = letter;
    onChange(next);

    if (letter && index < 4) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Letras corretas (posição certa)
      </span>
      <div className="flex gap-2">
        {value.map((letter, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-400">{i + 1}</span>
            <input
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              value={letter}
              maxLength={1}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                "h-12 w-12 rounded-lg border-2 text-center text-lg font-bold uppercase",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                "transition-colors duration-150",
                letter
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
                error && "border-red-400"
              )}
              aria-label={`Letra correta na posição ${i + 1}`}
            />
          </div>
        ))}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
