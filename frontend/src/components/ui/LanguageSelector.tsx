import React from "react";
import { cn } from "@/utils/cn";
import type { Language } from "@/types/i18n";

interface LanguageSelectorProps {
  label: string;
  value: Language;
  onChange: (language: Language) => void;
  options: Record<Language, string>;
}

const LANGUAGES: Language[] = ["pt-BR", "en"];

export function LanguageSelector({
  label,
  value,
  onChange,
  options,
}: LanguageSelectorProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-end">
      <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as Language)}
          className={cn(
            "rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-zinc-700",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500",
            "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          )}
          aria-label={label}
        >
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {options[language]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
