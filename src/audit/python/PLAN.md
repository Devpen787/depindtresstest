# Plan: Verify Solvency Ratio Math

## Scope
- **Metric**: Solvency Ratio (Daily Value Burned / Daily Value Minted).
- **Files**: `src/audit/python/verify_solvency.py`.
- **References**: `src/model/simulation.ts` (lines 540-750).

## Constraints
- **Language**: Python 3.
- **Dependencies**: Standard library (`math`, `random`) only. No pip install required if possible.
- **Inputs**: Hardcoded constants approximating "ONOCOY" profile from `src/data/protocols.ts`.
- **Logic**: Must strictly follow the TS implementation order.

## Goals
- **Output**: Print `Solvency Score` for Week 52.
- **Success Criteria**: Python result matches TS result within 1% tolerance.
- **Deliverable**: `verify_solvency.py` script.

## Verification
- Run `python3 src/audit/python/verify_solvency.py`.
- Compare output manually with the dashboard values or `vitest` output.
