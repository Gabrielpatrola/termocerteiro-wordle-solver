import React, { useEffect, useRef, useState } from "react";
import { SolverForm } from "@/components/features/SolverForm";
import { ResultsList } from "@/components/features/ResultsList";
import { BestFirstWord } from "@/components/features/BestFirstWord";
import { GameSelector } from "@/components/ui/GameSelector";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { getCopy } from "@/utils/copy";
import type { Language } from "@/types/i18n";
import type { GameType, PalpitesResponse } from "@/types/solver";

export function Home(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>("pt-BR");
  const [game, setGame] = useState<GameType>("termoo");
  const [results, setResults] = useState<PalpitesResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const copy = getCopy(language);

  useEffect(() => {
    if (results !== null) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  function handleGameChange(newGame: GameType): void {
    setGame(newGame);
    setResults(null);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-xl px-4 py-10">
        <LanguageSelector
          label={copy.languageSelector.label}
          value={language}
          onChange={setLanguage}
          options={copy.languageSelector.options}
        />

        {/* Header */}
        <header className="mb-6 mt-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Termo<span className="text-emerald-500">Certeiro</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {copy.home.subtitle}
          </p>
        </header>

        {/* Game selector */}
        <GameSelector value={game} onChange={handleGameChange} language={language} />

        {/* Best first word — keyed by game so it remounts on switch */}
        <div className="mt-4">
          <BestFirstWord game={game} language={language} />
        </div>

        {/* Form card — key={game} unmounts/remounts to reset all fields */}
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <SolverForm key={game} game={game} language={language} onResults={setResults} />
        </div>

        {/* Results */}
        {results !== null && (
          <div ref={resultsRef} className="mt-6">
            <ResultsList
              language={language}
              palpites={results.palpites}
              total={results.total_palavras_restantes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
