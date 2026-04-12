from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from solver import carregar_palavras, obter_palpites


# ---------------------------------------------------------------------------
# Lifespan: pre-load word list at startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await carregar_palavras()
    yield


app = FastAPI(title="Termocerteiro API", lifespan=lifespan)

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


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health() -> dict[str, str]:
    from solver import _PALAVRAS_CACHE
    if _PALAVRAS_CACHE is None:
        raise HTTPException(status_code=503, detail="Word list not loaded yet")
    return {"status": "ok", "palavras_carregadas": str(len(_PALAVRAS_CACHE))}


@app.post("/api/palpites", response_model=PalpitesResponse)
async def get_palpites(body: PalpitesRequest) -> PalpitesResponse:
    palavras = await carregar_palavras()

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
