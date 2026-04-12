import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from solver import carregar_palavras, calcular_melhor_primeira_palavra, obter_palpites
import solver


# ---------------------------------------------------------------------------
# Lifespan: load both word lists and compute best first words concurrently
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Fetch both word lists in parallel
    palavras_pt, palavras_en = await asyncio.gather(
        carregar_palavras("termoo"),
        carregar_palavras("wordle"),
    )

    # Compute best first word for each game in parallel thread executors
    loop = asyncio.get_event_loop()
    pt_result, en_result = await asyncio.gather(
        loop.run_in_executor(None, calcular_melhor_primeira_palavra, palavras_pt),
        loop.run_in_executor(None, calcular_melhor_primeira_palavra, palavras_en),
    )

    solver._PRIMEIRA_PALAVRA_CACHE["termoo"] = pt_result
    solver._PRIMEIRA_PALAVRA_CACHE["wordle"] = en_result
    yield


app = FastAPI(title="Termocerteiro / Wordle Solver API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class PalpitesRequest(BaseModel):
    game: Literal["termoo", "wordle"] = Field(default="termoo")
    letras_corretas: list[str] = Field(default=["", "", "", "", ""])
    letras_existentes: list[str] = Field(default=[])
    letras_nao_existentes: list[str] = Field(default=[])
    letras_nao_existentes_na_posicao: dict[str, str] = Field(default={})
    n_palpites: int = Field(default=10, ge=1, le=50)

    @field_validator("letras_corretas")
    @classmethod
    def validate_letras_corretas(cls, v: list[str]) -> list[str]:
        if len(v) != 5:
            raise ValueError("letras_corretas must have exactly 5 elements")
        for letra in v:
            if letra and (len(letra) != 1 or not letra.isalpha()):
                raise ValueError(f"Invalid letter: '{letra}'. Must be a single alphabetic character or empty string.")
        return [letra.lower() for letra in v]

    @field_validator("letras_existentes", "letras_nao_existentes")
    @classmethod
    def validate_letras(cls, v: list[str]) -> list[str]:
        for letra in v:
            if len(letra) != 1 or not letra.isalpha():
                raise ValueError(f"Invalid letter: '{letra}'. Must be a single alphabetic character.")
        return [letra.lower() for letra in v]

    @field_validator("letras_nao_existentes_na_posicao")
    @classmethod
    def validate_posicoes(cls, v: dict[str, str]) -> dict[str, str]:
        for key, letra in v.items():
            try:
                pos = int(key)
            except ValueError:
                raise ValueError(f"Position key '{key}' must be an integer string.")
            if pos < 0 or pos > 4:
                raise ValueError(f"Position {pos} is out of range. Must be between 0 and 4.")
            if len(letra) != 1 or not letra.isalpha():
                raise ValueError(f"Invalid letter: '{letra}'. Must be a single alphabetic character.")
        return {k: v_letra.lower() for k, v_letra in v.items()}


class PalpiteItem(BaseModel):
    palavra: str
    score: float


class PalpitesResponse(BaseModel):
    palpites: list[PalpiteItem]
    total_palavras_restantes: int


class PrimeiraPalavraResponse(BaseModel):
    palavra: str
    entropia: float  # Shannon entropy in bits — higher = more informative


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health() -> dict[str, str]:
    counts = {
        game: str(len(words))
        for game, words in solver._PALAVRAS_CACHE.items()
    }
    if not counts:
        raise HTTPException(status_code=503, detail="Word lists not loaded yet")
    return {"status": "ok", **counts}


@app.get("/api/primeira-palavra", response_model=PrimeiraPalavraResponse)
async def get_primeira_palavra(
    game: Literal["termoo", "wordle"] = "termoo",
) -> PrimeiraPalavraResponse:
    if game not in solver._PRIMEIRA_PALAVRA_CACHE:
        raise HTTPException(status_code=503, detail=f"Still computing best first word for '{game}'")
    palavra, entropia = solver._PRIMEIRA_PALAVRA_CACHE[game]
    return PrimeiraPalavraResponse(palavra=palavra, entropia=entropia)


@app.post("/api/palpites", response_model=PalpitesResponse)
async def get_palpites(body: PalpitesRequest) -> PalpitesResponse:
    palavras = await carregar_palavras(body.game)

    posicoes: dict[int, str] = {
        int(k): v for k, v in body.letras_nao_existentes_na_posicao.items()
    }

    resultado = obter_palpites(
        palavras=palavras,
        letras_corretas=body.letras_corretas,
        letras_existentes=body.letras_existentes,
        letras_nao_existentes=body.letras_nao_existentes,
        letras_nao_existentes_na_posicao=posicoes,
        top_n=body.n_palpites,
    )

    ranking, total = resultado

    return PalpitesResponse(
        palpites=[PalpiteItem(palavra=p, score=s) for p, s in ranking],
        total_palavras_restantes=total,
    )
