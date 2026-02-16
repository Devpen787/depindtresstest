# Dashboard Done Marker

This file defines when we should stop iterating and call the current dashboard/model workstream complete.

## Stop Rule

Mark the workstream as done only when every **required** criterion is `PASS`.

## Scopes

The done marker supports two scopes via `OPTIMIZER_DONE_SCOPE`:

1. `optimizer` (default): closes the model/optimizer hardening stream.
2. `dashboard`: closes full dashboard acceptance readiness.

## Criteria

Required in both scopes:

1. Optimizer hard gate passes (`npm run ci:optimizer`).
2. No actionable optimizer regression flags are present in the latest report.
3. At least 5 consecutive green runs of the `Optimizer Gate` workflow are recorded.
4. Open P0/P1 regressions are `0`.

Required only in `dashboard` scope:

5. Stakeholder acceptance checklist passes for every section (`>=80%` practical coverage per section).

## Automated Evidence

`scripts/check_optimizer_report.ts` now writes a machine-readable summary at:

- `output/skill_reports/<profile>_<mode>_done_marker.md`
- `output/skill_reports/<profile>_<mode>_<scope>_done_marker.md`

In GitHub Actions (`.github/workflows/optimizer-skill-gate.yml`), the workflow auto-populates:

- `OPTIMIZER_GATE_CONSECUTIVE_GREEN_RUNS` from recent completed runs of the same workflow on the current branch (estimated including current run).
- `OPTIMIZER_GATE_OPEN_P0P1` from open issues carrying labels listed in `OPTIMIZER_DONE_HIGH_SEVERITY_LABELS` (default: `P0,P1`).

The summary table includes a `Required` column so you can see which criteria are blocking for the active scope.

## Interim Dashboard Progress Gate (While Waiting for Primary Inputs)

Use:

- `npm run ci:dashboard:acceptance`

This regenerates acceptance artifacts from live evaluators and enforces:

- `N` answers are limited to the temporary waiver list (`M1,M2,M3` by default).
- all non-excluded sections pass `>=80%` practical coverage (default exclusion: `I Onocoy Inputs` while primary inputs are missing).

Operational mode details:

- Acceptance generation can promote reproducible high-confidence partial answers (`P`) to operational direct answers (`Y`).
- Default threshold: `0.79` confidence.
- Disable promotion for strict raw evaluator status by running generation with `--strict` (or `ACCEPTANCE_ENABLE_OPERATIONAL_PROMOTION=0`).

Workflow:

- `.github/workflows/dashboard-acceptance-gate.yml`

The summary includes `PASS/FAIL/PENDING` for each criterion and a final status:

- `DONE`: all criteria passed.
- `NOT_DONE`: one or more criteria failed.
- `PENDING`: no failures, but missing external evidence (for example consecutive-run or P0/P1 counters not supplied yet).

## Current Practical Use

Use this as the operational loop:

1. Run `npm run ci:optimizer`.
2. Open the latest `*_done_marker.md` summary.
3. Continue work until final status is `DONE` for your active scope.

If you want CI to fail when done-marker status is not `DONE`, set:

- `OPTIMIZER_GATE_ENFORCE_DONE_MARKER=1`
