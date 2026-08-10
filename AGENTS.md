# AGENTS.md

## Repo overview

Polyglot personal practice repo. LeetCode solutions (Python + TypeScript), a FastAPI demo, Node.js learning app, Docker notes, and shell scripts.

| Path | Contents |
|---|---|
| `python/leetcode/` | Python LeetCode solutions (`question*.py`) |
| `typescript/leetcode/` | TypeScript LeetCode solutions (`question*.ts`) |
| `python/fastAPi/` | FastAPI demo app |
| `nodejs/` | Node.js learning notes + Express demo app |
| `docker/` | Docker learning notes |
| `shell/` | Bash scripts |
| `windowsShell/` | PowerShell scripts |

## LeetCode conventions

- Named `question<number>.py` / `question<number>.ts`
- No test framework — standalone scripts, no shared imports

## FastAPI demo (`python/fastAPi/`)

- **Entry**: `main.py`
- **Run**: `uvicorn main:app --reload` (activate `venv\Scripts\activate` first)
- **Deps**: `requirements.txt`; virtual env in `venv/` (gitignored)

## Node.js demo (`nodejs/simpleApplication/`)

- Express 5 app with `npm start`
- Deps installed locally; uses Taobao mirror via `.npmrc`

## `.gitignore`

Ignores `__pycache__/`, `*.pyc`, `venv/`, `.env`, `node_modules/`, `npm-debug.log*`, `.yarn/`, `claudecode/`, `ollama/`, `.DS_Store`, `Thumbs.db`, `/secret/*`

## What NOT to expect

- No test/lint/format commands, no CI, no deployment pipeline
- No `tsconfig.json`, `Makefile`, `Dockerfile` (docker/ has notes only)
- No generated or vendored code
