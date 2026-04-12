import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPrimeiraPalavra } from "@/services/solver";
import { getCopy } from "@/utils/copy";
import { cn } from "@/utils/cn";
import type { Language } from "@/types/i18n";
import type { GameType } from "@/types/solver";

interface BestFirstWordProps {
  game: GameType;
  language: Language;
}

export function BestFirstWord({ game, language }: BestFirstWordProps): React.JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["primeira-palavra", game],
    queryFn: () => fetchPrimeiraPalavra(game),
    staleTime: Infinity,
    retry: 3,
    retryDelay: 2000,
  });
  const copy = getCopy(language);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
        {copy.bestFirstWord.label}
      </p>

      {isLoading && <LoadingSkeleton label={copy.bestFirstWord.loading} />}

      {isError && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{copy.bestFirstWord.error}</p>
      )}

      {data && (
        <>
          <div className="flex gap-2">
            {data.palavra.split("").map((letter, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg",
                  "text-xl font-extrabold uppercase text-white",
                  "bg-emerald-500 shadow-sm dark:bg-emerald-600"
                )}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
            {copy.bestFirstWord.entropyLabel}{" "}
            <span className="font-semibold">{data.entropia.toFixed(2)} bits</span>{" "}
            {copy.bestFirstWord.entropySuffix}
          </p>
        </>
      )}
    </div>
  );
}

interface LoadingSkeletonProps {
  label: string;
}

function LoadingSkeleton({ label }: LoadingSkeletonProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-12 animate-pulse rounded-lg bg-emerald-200 dark:bg-emerald-800"
          />
        ))}
      </div>
      <span className="text-xs text-emerald-600 dark:text-emerald-500">
        {label}
      </span>
    </div>
  );
}
