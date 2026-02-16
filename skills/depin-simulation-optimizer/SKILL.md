---
name: depin-simulation-optimizer
description: Run deterministic simulation and optimizer diagnostics for this repository, then write machine-readable and markdown summaries. Use when asked to validate or tune tokenomics via break-even price, max scalable providers, retention defense emissions, sensitivity sweeps, or to investigate behavior tied to src/hooks/useSimulationRunner.ts and src/model/optimizer.ts.
source: self
risk: safe
---

# Depin Simulation Optimizer

Run a reproducible diagnostics pass over the simulation model and optimizer helpers, then write a concise report to `output/skill_reports/`.

## When to Use This Skill

Use this skill when:

- You need a fast health check for optimizer behavior.
- A change in `src/model/optimizer.ts` needs objective regression evidence.
- A change in `src/hooks/useSimulationRunner.ts` may have altered optimization wiring.
- You need to compare break-even, scale, and defense outputs across profiles.

Do not use this skill when:

- The task is pure UI styling with no model/optimizer touch.
- You need live on-chain analytics instead of model diagnostics.

## Workflow

1. Pick the protocol and speed profile:
- Default profile is the first protocol in `PROTOCOL_PROFILES`.
- Pass `--profile <protocol_id>` to target a specific protocol.
- Use `--mode quick` for fast iteration and `--mode full` for deeper checks.

2. Run the diagnostics script:

```bash
node --experimental-strip-types skills/depin-simulation-optimizer/scripts/run_optimizer_diagnostics.ts --mode quick
```

Example with explicit protocol:

```bash
node --experimental-strip-types skills/depin-simulation-optimizer/scripts/run_optimizer_diagnostics.ts --mode full --profile ono_v3_calibrated
```

3. Read artifacts:
- Markdown summary: `output/skill_reports/<profile>_<mode>_report.md`
- JSON details: `output/skill_reports/<profile>_<mode>_report.json`

4. Use findings to drive action:
- If break-even validation fails, inspect `findBreakEvenPrice` usage in `src/model/optimizer.ts`.
- If scale or defense checks regress, inspect `runOptimization` wiring in `src/hooks/useSimulationRunner.ts`.
- If sensitivity output looks unstable, rerun with `--mode full`.

## Decision Rules

- Treat `breakEven.isThresholdMetAtSuggestedPrice = false` as a blocking issue before shipping optimizer-related changes.
- Treat `defense.improvedVsBaseline = false` as a warning that `findRetentionAPY` may not be helping under current assumptions.
- Use the top sensitivity factor as the first candidate for parameter audits and scenario sweeps.

## Notes

- This skill is model-focused and intentionally avoids mutating repository source code.
- `scripts/run_optimizer_diagnostics.ts` mirrors optimizer algorithms from `src/model/optimizer.ts` so it can execute in the current Node strip-types runtime; keep both in sync when optimizer logic changes.
- Run repo tests separately when requested:
```bash
npm test
```
