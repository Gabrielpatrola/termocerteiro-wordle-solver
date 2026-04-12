import React from "react";
import type { PalpiteItem } from "@/types/solver";
import { cn } from "@/utils/cn";

interface ResultCardProps {
  item: PalpiteItem;
  rank: number;
}

function scoreToColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-400";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-400";
}

export function ResultCard({ item, rank }: ResultCardProps): React.JSX.Element {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <span className="w-6 text-right text-sm font-medium text-zinc-400 shrink-0">
        {rank}
      </span>

      <span className="flex-1 text-xl font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
        {item.palavra}
      </span>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold text-white",
            scoreToColor(item.score)
          )}
        >
          {item.score.toFixed(1)}
        </span>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-600">
          <div
            className={cn("h-full rounded-full transition-all", scoreToColor(item.score))}
            style={{ width: `${Math.min(item.score, 100)}%` }}
          />
        </div>
      </div>
    </li>
  );
}
