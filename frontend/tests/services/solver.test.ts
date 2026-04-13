import { describe, expect, it, vi } from "vitest";

import { fetchPalpites, fetchPrimeiraPalavra } from "@/services/solver";

describe("solver services", () => {
  it("posts palpites requests and returns parsed JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          palpites: [{ palavra: "crane", score: 91.2 }],
          total_palavras_restantes: 4,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPalpites({
      game: "wordle",
      letras_corretas: ["", "", "", "", ""],
      letras_existentes: ["r"],
      letras_nao_existentes: ["t"],
      letras_nao_existentes_na_posicao: { "0": "r" },
      n_palpites: 5,
    });

    expect(result).toEqual({
      palpites: [{ palavra: "crane", score: 91.2 }],
      total_palavras_restantes: 4,
    });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/api/palpites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game: "wordle",
        letras_corretas: ["", "", "", "", ""],
        letras_existentes: ["r"],
        letras_nao_existentes: ["t"],
        letras_nao_existentes_na_posicao: { "0": "r" },
        n_palpites: 5,
      }),
    });
  });

  it("throws a detailed error for failed palpites responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("backend exploded", { status: 500 }))
    );

    await expect(
      fetchPalpites({
        game: "termoo",
        letras_corretas: ["", "", "", "", ""],
        letras_existentes: [],
        letras_nao_existentes: [],
        letras_nao_existentes_na_posicao: {},
        n_palpites: 10,
      })
    ).rejects.toThrow("Erro da API (500): backend exploded");
  });

  it("fetches the best first word for the selected game", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          palavra: "stare",
          entropia: 5.4321,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPrimeiraPalavra("wordle");

    expect(result).toEqual({
      palavra: "stare",
      entropia: 5.4321,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/primeira-palavra?game=wordle"
    );
  });
});
