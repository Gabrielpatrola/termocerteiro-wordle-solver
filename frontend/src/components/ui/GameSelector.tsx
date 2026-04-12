import React from "react";
import { cn } from "@/utils/cn";
import { getCopy } from "@/utils/copy";
import type { Language } from "@/types/i18n";
import type { GameType } from "@/types/solver";

interface GameSelectorProps {
  value: GameType;
  onChange: (game: GameType) => void;
  language: Language;
}

const GAMES: GameType[] = ["termoo", "wordle"];

export function GameSelector({
  value,
  onChange,
  language,
}: GameSelectorProps): React.JSX.Element {
  const copy = getCopy(language);

  return (
    <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800">
      {GAMES.map((game) => {
        const isActive = value === game;
        return (
          <button
            key={game}
            type="button"
            onClick={() => onChange(game)}
            className={cn(
              "flex flex-1 flex-col items-center rounded-lg px-4 py-2 text-sm transition-all duration-150",
              isActive
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            <span className="font-semibold">{copy.gameSelector.games[game]}</span>
            <span className="text-xs opacity-70">{copy.gameSelector.subtitles[game]}</span>
          </button>
        );
      })}
    </div>
  );
}
