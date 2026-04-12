import React, { useRef } from "react";
import { cn } from "@/utils/cn";

type FiveLetters = [string, string, string, string, string];
export type FourAttempts = [FiveLetters, FiveLetters, FiveLetters, FiveLetters];

interface WrongPositionInputProps {
  value: FourAttempts;
  onChange: (value: FourAttempts) => void;
  error?: string;
}

export function WrongPositionInput({
  value,
  onChange,
  error,
}: WrongPositionInputProps): React.JSX.Element {
  const refs = useRef<Array<HTMLInputElement | null>>(Array(20).fill(null));

  function getRef(row: number, col: number): HTMLInputElement | null {
    return refs.current[row * 5 + col];
  }

  function handleChange(row: number, col: number, raw: string): void {
    const letter = raw.replace(/[^a-zA-Z]/g, "").slice(-1).toLowerCase();
    const next = value.map((r, ri) =>
      ri === row ? (r.map((c, ci) => (ci === col ? letter : c)) as FiveLetters) : r
    ) as FourAttempts;
    onChange(next);
    if (letter && col < 4) {
      getRef(row, col + 1)?.focus();
    }
  }

  function handleKeyDown(row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Backspace" && !value[row][col]) {
      if (col > 0) {
        e.preventDefault();
        const next = value.map((r, ri) =>
          ri === row ? (r.map((c, ci) => (ci === col - 1 ? "" : c)) as FiveLetters) : r
        ) as FourAttempts;
        onChange(next);
        getRef(row, col - 1)?.focus();
      } else if (row > 0) {
        getRef(row - 1, 4)?.focus();
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Letras em posições erradas (amarelas)
      </span>

      <div className="flex flex-col gap-1.5">
        {/* Position labels */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex w-12 items-center justify-center">
              <span className="text-xs text-zinc-400">{n}</span>
            </div>
          ))}
        </div>

        {/* 4 attempt rows × 5 position columns */}
        {value.map((row, ri) => (
          <div key={ri} className="flex gap-2">
            {row.map((letter, ci) => (
              <input
                key={ci}
                ref={(el) => { refs.current[ri * 5 + ci] = el; }}
                type="text"
                value={letter}
                maxLength={1}
                onChange={(e) => handleChange(ri, ci, e.target.value)}
                onKeyDown={(e) => handleKeyDown(ri, ci, e)}
                className={cn(
                  "h-12 w-12 rounded-lg border-2 text-center text-lg font-bold uppercase",
                  "focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent",
                  "transition-colors duration-150",
                  letter
                    ? "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
                  error && "border-red-400"
                )}
                aria-label={`Tentativa ${ri + 1}, posição ${ci + 1}`}
              />
            ))}
          </div>
        ))}
      </div>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
