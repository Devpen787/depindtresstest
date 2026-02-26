# AGENTS.md

## Cursor Cloud specific instructions

This is a client-side React SPA (no backend, no database). The only required service is the Vite dev server.

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000, `0.0.0.0`) |
| Unit tests | `npm run test` (Vitest) |
| Build | `npm run build` |
| E2E tests | `npm run test:e2e` (Cypress, starts its own server on port 4173) |

All standard commands are documented in `README.md` and `package.json` scripts.

### Non-obvious notes

- The app has no ESLint or Prettier config — there is no `lint` script. TypeScript checking happens implicitly via `npm run build` (Vite + `tsc`-style checks through `@vitejs/plugin-react`).
- The Vite dev server binds to `0.0.0.0:3000` by default (configured in `vite.config.ts`).
- E2E tests (`npm run test:e2e`) use `start-server-and-test` to spin up a separate Vite instance on `127.0.0.1:4173` — do not start the dev server manually before running E2E.
- Optional API keys (`GEMINI_API_KEY`, `DUNE_API_KEY`) can be set in a `.env` file at the repo root. The dashboard works fully without them — they enable AI insights and live on-chain data respectively.
- The default landing tab is **DTSE** (DePIN Token Stress Evaluation), a 5-stage guided workflow. Other navigation tabs are **Benchmark, Root Causes, Strategy, Decide, Evidence**. The Stress Lab / Simulator is accessed via **Actions > Open Stress Lab** from any tab.
- Sub-packages under `packages/` (`simulator-mcp`, `memory-server`, `pdf-tool`) are independent and optional; they have their own `package.json` / `package-lock.json` and are not needed for dashboard development.
