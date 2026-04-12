import React from "react";
import type { PalpiteItem } from "@/types/solver";
import { ResultCard } from "@/components/features/ResultCard";

interface ResultsListProps {
  palpites: PalpiteItem[];
  total: number;
}

export function ResultsList({ palpites, total }: ResultsListProps): React.JSX.Element {
  if (palpites.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-zinc-500 dark:text-zinc-400">
          Nenhuma palavra encontrada com esses filtros.
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Tente remover algumas restrições.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Melhores palpites
        </h2>
        <span className="text-sm text-zinc-400">
          {total} palavra{total !== 1 ? "s" : ""} restante{total !== 1 ? "s" : ""}
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
