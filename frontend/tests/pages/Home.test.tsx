import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Home } from "@/pages/Home";
import { renderWithQueryClient } from "../testUtils";

vi.mock("@/components/features/BestFirstWord", () => ({
  BestFirstWord: ({
    game,
    language,
  }: {
    game: "termoo" | "wordle";
    language: "pt-BR" | "en";
  }) => <div data-testid="best-first-word">{game}:{language}</div>,
}));

vi.mock("@/components/features/SolverForm", () => ({
  SolverForm: ({
    game,
    language,
    onResults,
  }: {
    game: "termoo" | "wordle";
    language: "pt-BR" | "en";
    onResults: (data: {
      palpites: Array<{ palavra: string; score: number }>;
      total_palavras_restantes: number;
    }) => void;
  }) => (
    <div>
      <div data-testid="solver-form">{game}:{language}</div>
      <button
        type="button"
        onClick={() =>
          onResults({
            palpites: [{ palavra: "sagaz", score: 92.3 }],
            total_palavras_restantes: 1,
          })
        }
      >
        Emit Results
      </button>
    </div>
  ),
}));

describe("Home", () => {
  it("renders the default state, updates copy on language change, and clears results on game change", async () => {
    const user = userEvent.setup();
    const scrollIntoViewMock = vi.spyOn(Element.prototype, "scrollIntoView");

    renderWithQueryClient(<Home />);

    expect(
      screen.getByText("Descubra os melhores palpites para o Termoo / Wordle")
    ).toBeInTheDocument();
    expect(screen.getByTestId("solver-form")).toHaveTextContent("termoo:pt-BR");
    expect(screen.queryByText("Melhores palpites")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Emit Results" }));

    expect(await screen.findByText("Melhores palpites")).toBeInTheDocument();
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("sagaz")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Idioma"), "en");

    expect(
      screen.getByText("Discover the best guesses for Termoo / Wordle")
    ).toBeInTheDocument();
    expect(screen.getByTestId("solver-form")).toHaveTextContent("termoo:en");
    expect(screen.getByTestId("best-first-word")).toHaveTextContent("termoo:en");

    await user.click(screen.getByRole("button", { name: /Wordle/ }));

    await waitFor(() => {
      expect(screen.queryByText("Best guesses")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("solver-form")).toHaveTextContent("wordle:en");
    expect(screen.getByTestId("best-first-word")).toHaveTextContent("wordle:en");
  });
});
