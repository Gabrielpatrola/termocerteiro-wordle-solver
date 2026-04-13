from __future__ import annotations

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
