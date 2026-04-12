import type { PalpitesRequest, PalpitesResponse } from "@/types/solver";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function fetchPalpites(
  request: PalpitesRequest
): Promise<PalpitesResponse> {
  const response = await fetch(`${API_BASE}/api/palpites`, {
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
