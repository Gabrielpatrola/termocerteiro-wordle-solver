from __future__ import annotations

import asyncio

from fastapi.testclient import TestClient

import main
import solver


def test_health_returns_503_when_word_lists_are_not_loaded() -> None:
    client = TestClient(main.app)

    response = client.get("/health")

    assert response.status_code == 503
    assert response.json() == {"detail": "Word lists not loaded yet"}


def test_health_returns_cache_counts_when_word_lists_are_loaded() -> None:
    solver._PALAVRAS_CACHE.update(
        {
            "termoo": ["sagaz", "sonar"],
            "wordle": ["crane"],
        }
    )
    client = TestClient(main.app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "termoo": "2",
        "wordle": "1",
    }


def test_lifespan_populates_primeira_palavra_cache(monkeypatch) -> None:
    async def fake_carregar_palavras(game: str) -> list[str]:
        if game == "termoo":
            return ["sagaz", "sonar"]
        return ["crane", "slate"]

    def fake_calcular_melhor_primeira_palavra(palavras: list[str]) -> tuple[str, float]:
        return palavras[0], float(len(palavras))

    monkeypatch.setattr(main, "carregar_palavras", fake_carregar_palavras)
    monkeypatch.setattr(
        main,
        "calcular_melhor_primeira_palavra",
        fake_calcular_melhor_primeira_palavra,
    )

    async def run_lifespan() -> None:
        async with main.lifespan(main.app):
            assert solver._PRIMEIRA_PALAVRA_CACHE == {
                "termoo": ("sagaz", 2.0),
                "wordle": ("crane", 2.0),
            }

    asyncio.run(run_lifespan())


def test_get_primeira_palavra_returns_cached_value() -> None:
    solver._PRIMEIRA_PALAVRA_CACHE["wordle"] = ("stare", 5.43)
    client = TestClient(main.app)

    response = client.get("/api/primeira-palavra?game=wordle")

    assert response.status_code == 200
    assert response.json() == {
        "palavra": "stare",
        "entropia": 5.43,
    }


def test_get_primeira_palavra_returns_503_when_cache_is_missing() -> None:
    client = TestClient(main.app)

    response = client.get("/api/primeira-palavra?game=termoo")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Still computing best first word for 'termoo'"
    }


def test_get_palpites_normalizes_letters_and_maps_position_keys(monkeypatch) -> None:
    captured: dict[str, object] = {}

    async def fake_carregar_palavras(game: str) -> list[str]:
        captured["game"] = game
        return ["crane", "cigar"]

    def fake_obter_palpites(**kwargs):
        captured["solver_kwargs"] = kwargs
        return [("crane", 88.5)], 1

    monkeypatch.setattr(main, "carregar_palavras", fake_carregar_palavras)
    monkeypatch.setattr(main, "obter_palpites", fake_obter_palpites)
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "wordle",
            "letras_corretas": ["C", "", "", "", ""],
            "letras_existentes": ["R"],
            "letras_nao_existentes": ["T"],
            "letras_nao_existentes_na_posicao": {"0": "A", "2": "Rs"},
            "n_palpites": 5,
        },
    )

    assert response.status_code == 200
    assert captured["game"] == "wordle"
    assert captured["solver_kwargs"] == {
        "palavras": ["crane", "cigar"],
        "letras_corretas": ["c", "", "", "", ""],
        "letras_existentes": ["r"],
        "letras_nao_existentes": ["t"],
        "letras_nao_existentes_na_posicao": {0: "a", 2: "rs"},
        "top_n": 5,
    }
    assert response.json() == {
        "palpites": [{"palavra": "crane", "score": 88.5}],
        "total_palavras_restantes": 1,
    }


def test_get_palpites_rejects_invalid_correct_letter_length() -> None:
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "termoo",
            "letras_corretas": ["a", "b"],
            "letras_existentes": [],
            "letras_nao_existentes": [],
            "letras_nao_existentes_na_posicao": {},
            "n_palpites": 10,
        },
    )

    assert response.status_code == 422
    assert "letras_corretas" in response.text


def test_get_palpites_rejects_invalid_correct_letter_character() -> None:
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "termoo",
            "letras_corretas": ["1", "", "", "", ""],
            "letras_existentes": [],
            "letras_nao_existentes": [],
            "letras_nao_existentes_na_posicao": {},
            "n_palpites": 10,
        },
    )

    assert response.status_code == 422
    assert "Invalid letter" in response.text


def test_get_palpites_rejects_invalid_existing_letter_character() -> None:
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "wordle",
            "letras_corretas": ["", "", "", "", ""],
            "letras_existentes": ["3"],
            "letras_nao_existentes": [],
            "letras_nao_existentes_na_posicao": {},
            "n_palpites": 10,
        },
    )

    assert response.status_code == 422
    assert "Invalid letter" in response.text


def test_get_palpites_rejects_non_integer_position_keys() -> None:
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "wordle",
            "letras_corretas": ["", "", "", "", ""],
            "letras_existentes": [],
            "letras_nao_existentes": [],
            "letras_nao_existentes_na_posicao": {"x": "a"},
            "n_palpites": 10,
        },
    )

    assert response.status_code == 422
    assert "must be an integer string" in response.text


def test_get_palpites_rejects_out_of_range_position_keys() -> None:
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "wordle",
            "letras_corretas": ["", "", "", "", ""],
            "letras_existentes": [],
            "letras_nao_existentes": [],
            "letras_nao_existentes_na_posicao": {"5": "a"},
            "n_palpites": 10,
        },
    )

    assert response.status_code == 422
    assert "out of range" in response.text


def test_get_palpites_rejects_invalid_blocked_position_value() -> None:
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "wordle",
            "letras_corretas": ["", "", "", "", ""],
            "letras_existentes": [],
            "letras_nao_existentes": [],
            "letras_nao_existentes_na_posicao": {"2": "9"},
            "n_palpites": 10,
        },
    )

    assert response.status_code == 422
    assert "Invalid value" in response.text


def test_get_palpites_rejects_out_of_range_n_palpites() -> None:
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "wordle",
            "letras_corretas": ["", "", "", "", ""],
            "letras_existentes": [],
            "letras_nao_existentes": [],
            "letras_nao_existentes_na_posicao": {},
            "n_palpites": 0,
        },
    )

    assert response.status_code == 422
    assert "greater than or equal to 1" in response.text


def test_get_palpites_returns_empty_results_when_solver_finds_no_candidates(
    monkeypatch,
) -> None:
    async def fake_carregar_palavras(_: str) -> list[str]:
        return ["crane", "cigar"]

    def fake_obter_palpites(**_: object):
        return [], 0

    monkeypatch.setattr(main, "carregar_palavras", fake_carregar_palavras)
    monkeypatch.setattr(main, "obter_palpites", fake_obter_palpites)
    client = TestClient(main.app)

    response = client.post(
        "/api/palpites",
        json={
            "game": "wordle",
            "letras_corretas": ["", "", "", "", ""],
            "letras_existentes": ["x"],
            "letras_nao_existentes": [],
            "letras_nao_existentes_na_posicao": {},
            "n_palpites": 10,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "palpites": [],
        "total_palavras_restantes": 0,
    }
