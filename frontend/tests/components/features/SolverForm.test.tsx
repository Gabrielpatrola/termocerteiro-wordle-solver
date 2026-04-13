import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SolverForm } from "@/components/features/SolverForm";
import { fetchPalpites } from "@/services/solver";
import { renderWithQueryClient } from "../../testUtils";
import type { PalpitesResponse } from "@/types/solver";

vi.mock("@/services/solver", () => ({
  fetchPalpites: vi.fn(),
  fetchPrimeiraPalavra: vi.fn(),
}));

describe("SolverForm", () => {
  it("builds the solver payload from user input and forwards successful results", async () => {
    const user = userEvent.setup();
    const response: PalpitesResponse = {
      palpites: [{ palavra: "crane", score: 88.5 }],
      total_palavras_restantes: 1,
    };
    const onResults = vi.fn();
    vi.mocked(fetchPalpites).mockResolvedValue(response);

    renderWithQueryClient(
      <SolverForm game="wordle" language="en" onResults={onResults} />
    );

    await user.type(screen.getByLabelText("Correct letter at position 1"), "C");
    await user.type(screen.getByLabelText("Attempt 1, position 1"), "R");
    await user.type(screen.getByLabelText("Attempt 2, position 1"), "r");
    await user.type(screen.getByLabelText("Attempt 1, position 2"), "A");
    await user.type(screen.getByLabelText("Wrong letters (not in the word)"), "T");
    await user.click(screen.getByRole("button", { name: "Find Guesses" }));

    await waitFor(() => expect(fetchPalpites).toHaveBeenCalledTimes(1));
    expect(vi.mocked(fetchPalpites).mock.calls[0]?.[0]).toEqual({
      game: "wordle",
      letras_corretas: ["c", "", "", "", ""],
      letras_existentes: ["r", "a"],
      letras_nao_existentes: ["t"],
      letras_nao_existentes_na_posicao: {
        "0": "r",
        "1": "a",
      },
      n_palpites: 10,
    });
    await waitFor(() => expect(onResults).toHaveBeenCalledWith(response));
  });

  it("renders API errors when the mutation fails", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchPalpites).mockRejectedValue(new Error("Erro da API (500): boom"));

    renderWithQueryClient(
      <SolverForm game="termoo" language="en" onResults={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: "Find Guesses" }));

    expect(await screen.findByText("Erro da API (500): boom")).toBeInTheDocument();
  });
});
