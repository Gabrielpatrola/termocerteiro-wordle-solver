from __future__ import annotations

import solver


def test_filtrar_palavras_keeps_confirmed_letters_and_blocked_positions_in_sync() -> None:
    palavras = ["carro", "corro", "curto", "canto"]

    resultado = solver.filtrar_palavras(
        palavras=palavras,
        letras_corretas=["c", "", "", "", ""],
        letras_existentes=["r"],
        letras_nao_existentes=["r", "u"],
        letras_nao_existentes_na_posicao={1: "a"},
    )

    assert resultado == ["corro"]


def test_calcular_padrao_handles_duplicate_letters_like_wordle() -> None:
    assert solver.calcular_padrao("allee", "apple") == (2, 1, 0, 0, 2)


def test_obter_palpites_returns_ranked_results_with_total_count() -> None:
    ranking, total = solver.obter_palpites(
        palavras=["crane", "stare", "cigar"],
        letras_corretas=["", "", "", "", ""],
        letras_existentes=[],
        letras_nao_existentes=[],
        letras_nao_existentes_na_posicao={},
        top_n=2,
    )

    assert total == 3
    assert len(ranking) == 2
    assert ranking[0][1] >= ranking[1][1]
    assert {palavra for palavra, _ in ranking}.issubset({"crane", "stare", "cigar"})
