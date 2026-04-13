from __future__ import annotations

import asyncio
from collections import Counter

import solver


def test_carregar_palavras_fetches_filters_and_caches_both_games(monkeypatch) -> None:
    class FakeResponse:
        def __init__(self, text: str) -> None:
            self.text = text

        def raise_for_status(self) -> None:
            return None

    class FakeAsyncClient:
        calls = 0

        def __init__(self, timeout: float) -> None:
            assert timeout == 30.0

        async def __aenter__(self) -> "FakeAsyncClient":
            return self

        async def __aexit__(self, exc_type, exc, tb) -> None:
            return None

        async def get(self, url: str) -> FakeResponse:
            FakeAsyncClient.calls += 1
            if "br-sem-acentos" in url:
                return FakeResponse("sagaz\nabc\n12345\ncafé\nSONAR\n")
            return FakeResponse("crane\nslate\nabc1d\n")

    monkeypatch.setattr(solver.httpx, "AsyncClient", FakeAsyncClient)

    palavras_pt = asyncio.run(solver.carregar_palavras("termoo"))
    palavras_en = asyncio.run(solver.carregar_palavras("wordle"))
    palavras_pt_cached = asyncio.run(solver.carregar_palavras("termoo"))

    assert palavras_pt == ["sagaz", "sonar"]
    assert palavras_en == ["crane", "slate"]
    assert palavras_pt_cached == ["sagaz", "sonar"]
    assert FakeAsyncClient.calls == 2


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


def test_filtrar_palavras_handles_missing_existing_letters_and_no_blocked_positions() -> None:
    palavras = ["crane", "cigar", "trace"]

    resultado = solver.filtrar_palavras(
        palavras=palavras,
        letras_corretas=["c", "", "", "", ""],
        letras_existentes=["r", "n"],
        letras_nao_existentes=["g"],
    )

    assert resultado == ["crane"]


def test_calcular_padrao_handles_duplicate_letters_like_wordle() -> None:
    assert solver.calcular_padrao("allee", "apple") == (2, 1, 0, 0, 2)


def test_pontuar_palavra_helpers_cover_class_and_missing_frequency_guards() -> None:
    assert solver.pontuar_palavra_classe("sagaz", {"sagaz": "substantivo"}) == 90
    assert solver.pontuar_palavra_classe("sagaz", {"sagaz": "misteriosa"}) == 50.0
    assert solver.pontuar_palavra_caracteres("sagaz") == 0.0
    assert solver.pontuar_palavra_diferentes("arara") == 40.0
    assert solver.calcular_frequencia_letras(["arara", "canto"]) == Counter(
        {"a": 2, "r": 1, "c": 1, "n": 1, "o": 1, "t": 1}
    )


def test_calcular_entropia_returns_positive_value_for_distinguishing_guess() -> None:
    entropia = solver.calcular_entropia("crane", ["crane", "slate", "cigar"])

    assert entropia > 0


def test_calcular_melhor_primeira_palavra_uses_highest_entropy(monkeypatch) -> None:
    entropias = {
        "crane": 2.1,
        "slate": 4.2,
        "cigar": 3.4,
    }

    monkeypatch.setattr(solver, "calcular_entropia", lambda guess, _: entropias[guess])

    melhor_palavra, entropia = solver.calcular_melhor_primeira_palavra(
        ["crane", "slate", "cigar"]
    )

    assert melhor_palavra == "slate"
    assert entropia == 4.2


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


def test_obter_palpites_returns_empty_when_no_words_survive_filtering() -> None:
    ranking, total = solver.obter_palpites(
        palavras=["crane", "stare", "cigar"],
        letras_corretas=["z", "", "", "", ""],
        letras_existentes=[],
        letras_nao_existentes=[],
        letras_nao_existentes_na_posicao={},
        top_n=5,
    )

    assert ranking == []
    assert total == 0
