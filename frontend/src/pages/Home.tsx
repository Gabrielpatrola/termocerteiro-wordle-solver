import React, { useState } from "react";
import { SolverForm } from "@/components/features/SolverForm";
import { ResultsList } from "@/components/features/ResultsList";
import { BestFirstWord } from "@/components/features/BestFirstWord";
import { GameSelector } from "@/components/ui/GameSelector";
import type { GameType, PalpitesResponse } from "@/types/solver";

export function Home(): React.JSX.Element {
  const [game, setGame] = useState<GameType>("termoo");
  const [results, setResults] = useState<PalpitesResponse | null>(null);

  function handleGameChange(newGame: GameType): void {
    setGame(newGame);
    setResults(null);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-xl px-4 py-10">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Termo<span className="text-emerald-500">Certeiro</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Descubra os melhores palpites para o Termoo / Wordle
          </p>
        </header>

        {/* Game selector */}
        <GameSelector value={game} onChange={handleGameChange} />

        {/* Best first word — keyed by game so it remounts on switch */}
        <div className="mt-4">
          <BestFirstWord game={game} />
        </div>

        {/* Form card — key={game} unmounts/remounts to reset all fields */}
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <SolverForm key={game} game={game} onResults={setResults} />
        </div>

        {/* Results */}
        {results !== null && (
          <div className="mt-6">
            <ResultsList
              palpites={results.palpites}
              total={results.total_palavras_restantes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
