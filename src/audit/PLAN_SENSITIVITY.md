# Plan: Global Sensitivity Audit

## Scope
- **Metric**: Price, Supply, Provider Count.
- **Files**: `src/audit/global_sensitivity.test.ts`, `src/model/simulation.ts`.
- **Modifiers**: Burn Rate, Mint Rate, Initial Liquidity, Investor Unlock, Hardware Cost.

## Constraints
- **Technical**: Must run via `vitest`.
- **Logic**: Tests must compare `BASELINE_PARAMS` (Peace Time) vs Modified Params.
- **Thresholds**: Sensitivity must be > 2% (statistically significant) to pass.

## Goals
- **Output**: Pass all 5 audit cases in `global_sensitivity.test.ts`.
- **Success Criteria**: 
    - Higher Burn -> Price Up.
    - Higher Mint -> Price Down.
    - Unlock -> Price Drop.
    - High HW Cost -> Lower Provider Count.
- **Deliverable**: Verified logical integrity of the simulation engine.

## Verification
- Run `npx vitest run src/audit/global_sensitivity.test.ts`.
- Review console logs for "Delta %" values.
