import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BestFirstWord } from "@/components/features/BestFirstWord";
import { fetchPrimeiraPalavra } from "@/services/solver";
import { renderWithQueryClient } from "../../testUtils";

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

describe("BestFirstWord", () => {
  it("shows a loading state first and then renders the returned word and entropy", async () => {
    const pending = deferredPromise<{ palavra: string; entropia: number }>();
    vi.mocked(fetchPrimeiraPalavra).mockReturnValue(pending.promise);

    renderWithQueryClient(<BestFirstWord game="wordle" language="en" />);

    expect(screen.getByText("Calculating…")).toBeInTheDocument();

    pending.resolve({ palavra: "stare", entropia: 5.4321 });

    expect(await screen.findByText("5.43 bits")).toBeInTheDocument();
    expect(fetchPrimeiraPalavra).toHaveBeenCalledWith("wordle");
  });
});
