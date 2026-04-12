import type { Language } from "@/types/i18n";

interface Copy {
  languageSelector: {
    label: string;
    options: Record<Language, string>;
  };
  home: {
    subtitle: string;
  };
  gameSelector: {
    games: {
      termoo: string;
      wordle: string;
    };
    subtitles: {
      termoo: string;
      wordle: string;
    };
  };
  bestFirstWord: {
    label: string;
    error: string;
    entropyLabel: string;
    entropySuffix: string;
    loading: string;
  };
  solverForm: {
    correctLettersLabel: string;
    correctLetterAria: (position: number) => string;
    wrongPositionLabel: string;
    wrongPositionAria: (attempt: number, position: number) => string;
    wrongLettersLabel: string;
    tagPlaceholder: string;
    tagHelper: string;
    removeLetterAria: (letter: string) => string;
    submitIdle: string;
    submitLoading: string;
  };
  results: {
    emptyTitle: string;
    emptyHint: string;
    title: string;
    remainingWords: (total: number) => string;
  };
}

const copyByLanguage: Record<Language, Copy> = {
  "pt-BR": {
    languageSelector: {
      label: "Idioma",
      options: {
        "pt-BR": "PT-BR",
        en: "EN",
      },
    },
    home: {
      subtitle: "Descubra os melhores palpites para o Termoo / Wordle",
    },
    gameSelector: {
      games: {
        termoo: "Termoo",
        wordle: "Wordle",
      },
      subtitles: {
        termoo: "Português",
        wordle: "Inglês",
      },
    },
    bestFirstWord: {
      label: "Melhor primeira palavra",
      error: "Não foi possível carregar. O backend ainda pode estar calculando.",
      entropyLabel: "Entropia:",
      entropySuffix: "maximiza a informação obtida na primeira tentativa",
      loading: "Calculando…",
    },
    solverForm: {
      correctLettersLabel: "Letras corretas (posição certa)",
      correctLetterAria: (position) => `Letra correta na posição ${position}`,
      wrongPositionLabel: "Letras em posições erradas (amarelas)",
      wrongPositionAria: (attempt, position) => `Tentativa ${attempt}, posição ${position}`,
      wrongLettersLabel: "Letras erradas (não existem)",
      tagPlaceholder: "a b c…",
      tagHelper: "Digite letras — Backspace para remover a última",
      removeLetterAria: (letter) => `Remover letra ${letter}`,
      submitIdle: "Buscar Palpites",
      submitLoading: "Buscando palpites…",
    },
    results: {
      emptyTitle: "Nenhuma palavra encontrada com esses filtros.",
      emptyHint: "Tente remover algumas restrições.",
      title: "Melhores palpites",
      remainingWords: (total) =>
        `${total} palavra${total !== 1 ? "s" : ""} restante${total !== 1 ? "s" : ""}`,
    },
  },
  en: {
    languageSelector: {
      label: "Language",
      options: {
        "pt-BR": "PT-BR",
        en: "EN",
      },
    },
    home: {
      subtitle: "Discover the best guesses for Termoo / Wordle",
    },
    gameSelector: {
      games: {
        termoo: "Termoo",
        wordle: "Wordle",
      },
      subtitles: {
        termoo: "Portuguese",
        wordle: "English",
      },
    },
    bestFirstWord: {
      label: "Best first word",
      error: "Could not load. The backend may still be computing.",
      entropyLabel: "Entropy:",
      entropySuffix: "maximizes the information gained on the first guess",
      loading: "Calculating…",
    },
    solverForm: {
      correctLettersLabel: "Correct letters (right position)",
      correctLetterAria: (position) => `Correct letter at position ${position}`,
      wrongPositionLabel: "Misplaced letters (yellow)",
      wrongPositionAria: (attempt, position) => `Attempt ${attempt}, position ${position}`,
      wrongLettersLabel: "Wrong letters (not in the word)",
      tagPlaceholder: "a b c…",
      tagHelper: "Type letters — Backspace removes the last one",
      removeLetterAria: (letter) => `Remove letter ${letter}`,
      submitIdle: "Find Guesses",
      submitLoading: "Finding guesses…",
    },
    results: {
      emptyTitle: "No words matched these filters.",
      emptyHint: "Try removing a few constraints.",
      title: "Best guesses",
      remainingWords: (total) => `${total} word${total !== 1 ? "s" : ""} remaining`,
    },
  },
};

export function getCopy(language: Language): Copy {
  return copyByLanguage[language];
}
