export type GameType = "termoo" | "wordle";

export interface PalpitesRequest {
  game: GameType;
  letras_corretas: [string, string, string, string, string];
  letras_existentes: string[];
  letras_nao_existentes: string[];
  letras_nao_existentes_na_posicao: Record<string, string>;
  n_palpites?: number;
}

export interface PalpiteItem {
  palavra: string;
  score: number;
}

export interface PalpitesResponse {
  palpites: PalpiteItem[];
  total_palavras_restantes: number;
}

export interface PrimeiraPalavraResponse {
  palavra: string;
  entropia: number; // Shannon entropy in bits
}
