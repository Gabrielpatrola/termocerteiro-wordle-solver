import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SolverForm } from "@/components/features/SolverForm";
import { fetchPalpites } from "@/services/solver";
import { renderWithQueryClient } from "../../testUtils";
import type { PalpitesResponse } from "@/types/solver";

vi.mock("@/services/solver", () => ({
  fetchPalpites: vi.fn(),
  fetchPrimeiraPalavra: vi.fn(),
}));

function deferredPromise<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("SolverForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the default empty payload when the user sends the untouched form", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchPalpites).mockResolvedValue({
      palpites: [],
      total_palavras_restantes: 0,
    });

    renderWithQueryClient(
      <SolverForm game="termoo" language="en" onResults={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: "Find Guesses" }));

    await waitFor(() => expect(fetchPalpites).toHaveBeenCalled());
    expect(vi.mocked(fetchPalpites).mock.lastCall?.[0]).toEqual({
      game: "termoo",
      letras_corretas: ["", "", "", "", ""],
      letras_existentes: [],
      letras_nao_existentes: [],
      letras_nao_existentes_na_posicao: {},
      n_palpites: 10,
    });
  });

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

    await waitFor(() => expect(fetchPalpites).toHaveBeenCalled());
    expect(vi.mocked(fetchPalpites).mock.lastCall?.[0]).toEqual({
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

  it("shows the loading copy while the mutation is pending", async () => {
    const user = userEvent.setup();
    const pending = deferredPromise<PalpitesResponse>();
    vi.mocked(fetchPalpites).mockReturnValue(pending.promise);

    renderWithQueryClient(
      <SolverForm game="termoo" language="en" onResults={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: "Find Guesses" }));

    expect(screen.getByRole("button", { name: "Finding guesses…" })).toBeDisabled();

    pending.resolve({
      palpites: [],
      total_palavras_restantes: 0,
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Find Guesses" })).toBeEnabled()
    );
  });
});
