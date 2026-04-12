export interface PalpitesRequest {
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
