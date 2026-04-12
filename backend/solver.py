import httpx
import pandas as pd
from collections import Counter
from typing import Literal

GameType = Literal["termoo", "wordle"]

GAME_CONFIG: dict[str, str] = {
    "termoo": "https://www.ime.usp.br/~pf/dicios/br-sem-acentos.txt",
    "wordle": "https://www-cs-faculty.stanford.edu/~knuth/sgb-words.txt",
}

_PALAVRAS_CACHE: dict[str, list[str]] = {}
_PRIMEIRA_PALAVRA_CACHE: dict[str, tuple[str, float]] = {}


async def carregar_palavras(game: GameType = "termoo") -> list[str]:
    if game in _PALAVRAS_CACHE:
        return _PALAVRAS_CACHE[game]

    url = GAME_CONFIG[game]
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url)
        response.raise_for_status()

    lines = response.text.splitlines()

    if game == "termoo":
        # USP list contains words of all lengths — keep only 5-letter words
        palavras = [
            line.strip().lower()
            for line in lines
            if line.strip() and len(line.strip()) == 5 and line.strip().isalpha()
        ]
    else:
        # Knuth list is already exactly 5-letter lowercase words
        palavras = [
            line.strip().lower()
            for line in lines
            if line.strip() and line.strip().isalpha()
        ]

    _PALAVRAS_CACHE[game] = palavras
    return palavras


def filtrar_palavras(
    palavras: list[str],
    letras_corretas: list[str],
    letras_existentes: list[str],
    letras_nao_existentes: list[str],
    letras_nao_existentes_na_posicao: dict[int, str] | None = None,
) -> list[str]:
    """
    letras_corretas: lista de 5 posições, ex: ["", "o", "", "", "s"]
    letras_existentes: letras que existem, mas sem posição exata garantida, ex: ["r", "a"]
    letras_nao_existentes: letras que não existem na palavra, ex: ["z", "u"]
    letras_nao_existentes_na_posicao:
        dict ou lista de restrições por posição.
        Exemplo em dict:
            {0: ["r"], 2: ["a"]}
        significa:
            - r não pode estar na posição 0
            - a não pode estar na posição 2
    """
    if letras_nao_existentes_na_posicao is None:
        letras_nao_existentes_na_posicao = {}

    resultado = []

    for palavra in palavras:
        valido = True

        # 1. Letras corretas na posição certa
        for i, letra in enumerate(letras_corretas):
            if letra and palavra[i] != letra:
                valido = False
                break

        if not valido:
            continue

        # 2. Letras que existem devem aparecer na palavra
        for letra in letras_existentes:
            if letra not in palavra:
                valido = False
                break

        if not valido:
            continue

        # 3. Letras que não existem não podem aparecer
        # cuidado: se uma letra está em letras_corretas/letras_existentes,
        # ela não deve ser banida aqui
        letras_confirmadas = set([l for l in letras_corretas if l] + letras_existentes)
        for letra in letras_nao_existentes:
            if letra in palavra and letra not in letras_confirmadas:
                valido = False
                break

        if not valido:
            continue

        # 4. Letras que não podem estar em posições específicas
        for pos, letras_bloqueadas in letras_nao_existentes_na_posicao.items():
            if palavra[pos] in letras_bloqueadas:
                valido = False
                break

        if valido:
            resultado.append(palavra)

    return resultado


def calcular_frequencia_letras(lista_palavras: list[str]) -> Counter:
    """
    Frequência por letra considerando presença na palavra, não repetição.
    Ex.: "arara" conta a, r uma vez só.
    """
    contador: Counter = Counter()

    for palavra in lista_palavras:
        letras_unicas = set(palavra)
        contador.update(letras_unicas)

    return contador


def calcular_frequencia_posicional(lista_palavras: list[str]) -> list[Counter]:
    """
    Frequência por posição.
    Ex.: quantas vezes 'a' aparece na posição 0, 1, 2...
    """
    frequencias: list[Counter] = [Counter() for _ in range(5)]

    for palavra in lista_palavras:
        for i, letra in enumerate(palavra):
            frequencias[i][letra] += 1

    return frequencias


def pontuar_palavra_classe(palavra: str, mapa_classes: dict[str, str] | None = None) -> float:
    """
    Opcional.
    Você só consegue usar isso se tiver um dicionário com classe gramatical.
    """
    if mapa_classes is None:
        return 50.0

    classe = mapa_classes.get(palavra, "desconhecida")

    pesos: dict[str, float] = {
        "substantivo": 90,
        "verbo": 80,
        "adjetivo": 70,
        "adverbio": 60,
        "outros": 50,
        "desconhecida": 50,
    }

    return pesos.get(classe, 50.0)


def pontuar_palavra_caracteres(
    palavra: str,
    freq_letras: Counter | None = None,
    freq_posicional: list[Counter] | None = None,
    max_score: float = 100,
) -> float:
    """
    Pontua pela utilidade das letras.
    Mistura:
    - frequência global das letras
    - frequência da letra naquela posição
    """
    if freq_letras is None or freq_posicional is None:
        return 0.0

    score_bruto = 0.0

    for i, letra in enumerate(palavra):
        score_bruto += freq_letras.get(letra, 0)
        score_bruto += freq_posicional[i].get(letra, 0)

    # normalização simples
    max_bruto = 0.0
    for i in range(5):
        if freq_posicional[i]:
            max_bruto += max(freq_posicional[i].values())
    letras_top = sorted(freq_letras.values(), reverse=True)
    max_bruto += sum(letras_top[:5]) if letras_top else 1

    if max_bruto == 0:
        return 0.0

    return min((score_bruto / max_bruto) * max_score, 100.0)


def pontuar_palavra_diferentes(palavra: str) -> float:
    """
    Quanto mais letras diferentes, melhor para explorar informação.
    5 letras diferentes = 100
    4 = 80
    3 = 60
    2 = 40
    1 = 20
    """
    qtd = len(set(palavra))
    return (qtd / 5) * 100


def pontuar_palavra(
    palavra: str,
    freq_letras: Counter,
    freq_posicional: list[Counter],
    mapa_classes: dict[str, str] | None = None,
) -> float:
    """
    Combinação final.
    Sugestão de pesos:
    - caracteres: 50%
    - letras diferentes: 35%
    - classe gramatical: 15%
    """
    score_classe = pontuar_palavra_classe(palavra, mapa_classes)
    score_caracteres = pontuar_palavra_caracteres(palavra, freq_letras, freq_posicional)
    score_diferentes = pontuar_palavra_diferentes(palavra)

    score_final = (
        score_caracteres * 0.50
        + score_diferentes * 0.35
        + score_classe * 0.15
    )

    return round(score_final, 2)


def calcular_padrao(guess: str, answer: str) -> tuple[int, ...]:
    """
    Computes the Wordle color pattern for a guess against an answer.
    Returns a tuple of 5 ints: 2=green, 1=yellow, 0=gray.
    Handles duplicate letters correctly (Wordle rules).
    """
    pattern = [0] * 5
    answer_remaining = list(answer)

    # Pass 1: greens
    for i in range(5):
        if guess[i] == answer[i]:
            pattern[i] = 2
            answer_remaining[i] = None  # type: ignore[call-overload]

    # Pass 2: yellows
    for i in range(5):
        if pattern[i] == 2:
            continue
        if guess[i] in answer_remaining:
            pattern[i] = 1
            answer_remaining[answer_remaining.index(guess[i])] = None  # type: ignore[call-overload]

    return tuple(pattern)


def calcular_entropia(guess: str, palavras: list[str]) -> float:
    """
    Computes the Shannon entropy (bits) of a guess over the current word list.

    H = Σ p_i × log₂(1/p_i)   where p_i = group_size / total

    Higher entropy = more information gained on average = better guess.
    """
    import math

    grupos: dict[tuple[int, ...], int] = {}
    for answer in palavras:
        padrao = calcular_padrao(guess, answer)
        grupos[padrao] = grupos.get(padrao, 0) + 1

    total = len(palavras)
    return sum(
        (c / total) * math.log2(total / c) for c in grupos.values()
    )


def calcular_melhor_primeira_palavra(palavras: list[str]) -> tuple[str, float]:
    """
    Finds the best opening word by maximizing Shannon entropy over the full
    word list. No pre-filter — guarantees the true optimum.

    Returns (best_word, its_entropia_in_bits).
    """
    import time

    total = len(palavras)
    print(f"[solver] Calculando melhor primeira palavra em {total} palavras...", flush=True)
    t0 = time.perf_counter()

    melhor_palavra = palavras[0]
    melhor_entropia = -1.0

    for guess in palavras:
        entropia = calcular_entropia(guess, palavras)
        if entropia > melhor_entropia:
            melhor_entropia = entropia
            melhor_palavra = guess

    elapsed = time.perf_counter() - t0
    print(
        f"[solver] Melhor primeira palavra: '{melhor_palavra}'"
        f" (entropia: {melhor_entropia:.3f} bits)"
        f" — calculado em {elapsed:.1f}s",
        flush=True,
    )

    return melhor_palavra, round(melhor_entropia, 3)


def obter_palpites(
    palavras: list[str],
    letras_corretas: list[str],
    letras_existentes: list[str],
    letras_nao_existentes: list[str],
    letras_nao_existentes_na_posicao: dict[int, str] | None = None,
    mapa_classes: dict[str, str] | None = None,
    top_n: int = 10,
) -> list[tuple[str, float]]:
    palavras_filtradas = filtrar_palavras(
        palavras=palavras,
        letras_corretas=letras_corretas,
        letras_existentes=letras_existentes,
        letras_nao_existentes=letras_nao_existentes,
        letras_nao_existentes_na_posicao=letras_nao_existentes_na_posicao,
    )

    if not palavras_filtradas:
        return []

    freq_letras = calcular_frequencia_letras(palavras_filtradas)
    freq_posicional = calcular_frequencia_posicional(palavras_filtradas)

    ranking: list[tuple[str, float]] = []
    for palavra in palavras_filtradas:
        score = pontuar_palavra(
            palavra=palavra,
            freq_letras=freq_letras,
            freq_posicional=freq_posicional,
            mapa_classes=mapa_classes,
        )
        ranking.append((palavra, score))

    ranking.sort(key=lambda x: x[1], reverse=True)
    return ranking[:top_n], len(palavras_filtradas)
