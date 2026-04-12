import React from "react";
import type { PalpiteItem } from "@/types/solver";
import { ResultCard } from "@/components/features/ResultCard";
import { getCopy } from "@/utils/copy";
import type { Language } from "@/types/i18n";

interface ResultsListProps {
  language: Language;
  palpites: PalpiteItem[];
  total: number;
}

export function ResultsList({
  language,
  palpites,
  total,
}: ResultsListProps): React.JSX.Element {
  const copy = getCopy(language);

  if (palpites.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-zinc-500 dark:text-zinc-400">
          {copy.results.emptyTitle}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          {copy.results.emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {copy.results.title}
        </h2>
        <span className="text-sm text-zinc-400">
          {copy.results.remainingWords(total)}
        </span>
      </div>

      <ul className="flex max-h-[480px] flex-col gap-2 overflow-y-auto pr-1">
        {palpites.map((item, i) => (
          <ResultCard key={item.palavra} item={item} rank={i + 1} />
        ))}
      </ul>
    </div>
  );
}
