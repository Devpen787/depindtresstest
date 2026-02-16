---
name: depin-systematic-debugging
description: Root-cause-first debugging for simulation, optimizer, and sensitivity issues in this repository.
source: https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/systematic-debugging
risk: safe
---

# DePIN Systematic Debugging

## When to Use This Skill

Use this skill when:

- A simulation or optimizer test fails.
- `src/hooks/useSimulationRunner.ts` output is unexpected.
- `src/model/optimizer.ts` recommendations look unstable or contradictory.
- Parity or stress-pack outputs regress.

Do not use this skill when:

- You are only making formatting or copy edits.
- No failure, bug, or regression is present.

## Core Rule

Do not propose fixes before identifying a root cause with evidence.

## Workflow

1. Reproduce reliably.
2. Capture evidence at the failing boundary.
3. Trace backwards to the first wrong value.
4. Form one hypothesis.
5. Make one minimal change.
6. Re-run targeted verification.
7. If still failing after 3 serious attempts, stop and re-evaluate assumptions with the user.

## Repo-Specific Debug Commands

```bash
# Focused test runs
npm test -- src/model/simulation.test.ts
npm test -- src/model/sensitivity.test.ts
npm run test:parity

# Optimizer diagnostics
npm run skill:optimizer:quick -- --profile ono_v3_calibrated
npm run ci:optimizer:gate -- --profile ono_v3_calibrated --mode quick

# Script-level diagnostics
node --experimental-strip-types scripts/debug_sensitivity.ts
node --experimental-strip-types scripts/debug_onocoy_simulation.ts
```

## Evidence Template

For each issue, report:

- Reproduction command
- Observed vs expected behavior
- Root cause location (`file:line`)
- Minimal fix
- Post-fix verification command output summary

## Limitations

- This skill improves debugging discipline; it does not replace domain validation.
- For formula changes, pair with `depin-model-change-tdd`.
