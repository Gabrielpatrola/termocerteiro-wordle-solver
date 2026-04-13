from __future__ import annotations

import sys
from pathlib import Path

import pytest


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import solver  # noqa: E402


@pytest.fixture(autouse=True)
def clear_solver_caches() -> None:
    solver._PALAVRAS_CACHE.clear()
    solver._PRIMEIRA_PALAVRA_CACHE.clear()
    yield
    solver._PALAVRAS_CACHE.clear()
    solver._PRIMEIRA_PALAVRA_CACHE.clear()
