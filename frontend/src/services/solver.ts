import type { GameType, PalpitesRequest, PalpitesResponse, PrimeiraPalavraResponse } from "@/types/solver";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function fetchPalpites(
  request: PalpitesRequest
): Promise<PalpitesResponse> {
  const response = await fetch(`${API_BASE}/palpites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Erro da API (${response.status}): ${detail}`);
  }

  return response.json() as Promise<PalpitesResponse>;
}

export async function fetchPrimeiraPalavra(game: GameType): Promise<PrimeiraPalavraResponse> {
  const response = await fetch(`${API_BASE}/primeira-palavra?game=${game}`);

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Erro da API (${response.status}): ${detail}`);
  }

  return response.json() as Promise<PrimeiraPalavraResponse>;
}
