# TermoCerteiro Wordle Solver - Bilingual word-guess assistant for Termoo and Wordle

## Tech Stack

- Frontend: React 19 with TypeScript
- Build tool: Vite 8
- Server state: TanStack Query v5
- Forms and validation: react-hook-form + Zod
- Styling: Tailwind CSS 4 with a local `cn()` utility
- Backend: Python + FastAPI + Pydantic v2
- HTTP client for upstream word lists: `httpx`
- Data processing helpers: `pandas`

## Project Structure

```text
backend/
├── main.py                # FastAPI app, lifespan, models, and routes
├── requirements.txt       # Python dependencies
├── solver.py              # Word loading, caching, filtering, scoring, entropy
├── tests/                 # pytest suites and shared backend test helpers
├── requirements-dev.txt   # Python test dependencies
└── Dockerfile             # Dockerfile for the backend

frontend/
├── public/                # Static assets and public files
├── src/
│   ├── assets/            # Static assets and images
│   ├── components/
│   │   ├── features/      # Solver-specific UI components
│   │   └── ui/            # Reusable UI primitives
│   ├── pages/             # React page components
│   ├── services/          # Frontend API calls to the backend
│   ├── types/             # Frontend request/response contracts and type definitions
│   ├── utils/             # Small pure helpers and utilities
│   ├── App.tsx            # React app root component
│   └── main.tsx           # React app entry point
├── tests/                 # Vitest suites and shared frontend test helpers
├── package.json           # Node.js dependencies
├── tsconfig.app.json      # TypeScript configuration for the frontend
├── tsconfig.node.json     # TypeScript configuration for Vite
├── vite.config.ts         # Vite configuration for the frontend
└── vitest.config.ts       # Vitest configuration for the frontend
```

## Architecture Rules

- **Keep API wiring in `backend/main.py` and solver logic in `backend/solver.py`.** Route handlers should validate inputs, call solver functions, and shape responses. They should not contain ranking or filtering logic inline.
- **This project has no database.** Do not introduce SQLAlchemy, Alembic, Prisma, Redis, or persistence-oriented abstractions unless explicitly requested. Runtime state is in-memory only.
- **The backend owns upstream data fetching.** Word lists are downloaded by the API and cached in `_PALAVRAS_CACHE`. The frontend should never fetch the raw dictionary sources directly.
- **The backend is the single source of truth for solver rules.** If filtering or scoring changes, update `backend/solver.py` first. The frontend should only collect inputs and display results.
- **Use TanStack Query for network-backed data and mutations.** `BestFirstWord` and solver submissions should continue to flow through query/mutation hooks instead of ad hoc request state.
- **Keep raw `fetch` calls in `frontend/src/services/`.** Components should call typed service functions, not build HTTP requests directly.
- **Use the `@/` alias for frontend imports.** It is already configured in `vite.config.ts` and `tsconfig.app.json`.
- **Preserve the current small-project shape unless growth justifies refactoring.** This repo does not need generic repository layers, service containers, or domain-heavy folder abstractions yet.

## Coding Conventions

### Frontend

- All React components use the `function` keyword and return `React.JSX.Element`.
- Exported functions should have explicit return types where practical, especially in `services/` and shared utilities.
- Form state belongs in `react-hook-form`; simple view state belongs in `useState`; server state belongs in TanStack Query.
- Normalize letter input to lowercase at the UI boundary and keep the current 5-letter assumptions explicit in types and validation.
- Import order should stay consistent: React, external packages, `@/` imports, then relative imports, then type-only imports when needed.

### Backend

- FastAPI route handlers should be `async def`.
- Pure solver helpers should remain synchronous unless they are performing actual I/O.
- Validate and normalize request data at the API boundary with Pydantic models and validators.
- Keep caches module-local and explicit. If a cache is added, document when it is populated and when it is safe to read.
- Prefer small, composable functions in `solver.py` instead of one large ranking pipeline.

## Library Preferences

- **Frontend data fetching:** TanStack Query. not Redux async slices or custom request state machines.
- **Frontend forms:** react-hook-form + Zod. not manual uncontrolled parsing for complex inputs.
- **Frontend styling:** Tailwind CSS utilities plus `cn()`. not CSS-in-JS.
- **Backend API layer:** FastAPI + Pydantic v2. not Flask.
- **Backend HTTP client:** `httpx`. not `requests` inside async flows.
- **No persistence layer by default:** in-memory caches are the intended design right now.

## File Naming

- React components: `PascalCase.tsx`
- Frontend services, utils, and types: `camelCase.ts`
- Python modules: `snake_case.py`
- Keep one primary component per file in `frontend/src/components/`

## NEVER DO THIS

1. **Never add database-specific code because a template suggested it.** This repo does not have a database connection, migration system, or ORM.
2. **Never duplicate solver business rules in the frontend.** Input collection belongs to the UI; candidate filtering and scoring belong to the backend.
3. **Never call `fetch` directly inside React components.** Put request logic in `frontend/src/services/solver.ts`.
4. **Never bypass lowercase normalization and letter validation.** Both the frontend and backend assume sanitized alphabetic input.
5. **Never assume caches are persistent.** Restarting the backend clears `_PALAVRAS_CACHE` and `_PRIMEIRA_PALAVRA_CACHE`.
6. **Never hardcode a new frontend origin without updating CORS.** If local dev ports change, update the backend CORS allowlist intentionally.
7. **Never introduce heavyweight architecture for its own sake.** Keep the codebase direct and readable unless the project scope genuinely expands.

## Testing

- Backend automated tests live under `backend/tests/`.
- Frontend automated tests live under `frontend/tests/`.
- For backend additions, prefer `pytest` and start with unit tests around `filtrar_palavras`, `calcular_padrao`, and `obter_palpites`.
- Run backend tests from `backend/` with `python3 -m pytest tests`.
- For frontend additions, prefer Vitest + React Testing Library and keep test files under `frontend/tests/`, grouped by app area such as `components/`, `pages/`, and `services/`.
- Shared frontend test helpers and setup should also live under `frontend/tests/`, not mixed into `frontend/src/`.
- Run frontend tests from `frontend/` with `yarn test` or `npm test`.
- At minimum, run a frontend production build and smoke-test the backend endpoints after meaningful changes.
