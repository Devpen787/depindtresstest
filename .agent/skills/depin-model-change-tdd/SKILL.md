---
name: depin-model-change-tdd
description: Test-first workflow for simulation math, optimizer logic, and risk metric behavior changes.
source: https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/test-driven-development
risk: safe
---

# DePIN Model Change TDD

## When to Use This Skill

Use this skill when:

- Editing `src/model/*` logic.
- Changing `src/model/optimizer.ts`.
- Updating risk thresholds, guardrails, or parity-sensitive math.

Do not use this skill when:

- Making pure documentation or UI copy updates with no behavior change.

## Red-Green-Refactor Contract

1. RED: write/adjust a failing test for the target behavior.
2. GREEN: implement the smallest code change that passes.
3. REFACTOR: clean up while keeping all tests green.

Do not write production math logic before confirming a failing test.

## Suggested Test Targets

- `src/model/simulation.test.ts`
- `src/model/sensitivity.test.ts`
- `src/audit/math_parity_golden.test.ts`
- `src/protocols/registry.test.ts`

## Fast Command Loop

```bash
# 1) Run focused failing test first
npm test -- src/model/simulation.test.ts

# 2) After minimal fix, re-run focused tests
npm test -- src/model/simulation.test.ts src/model/sensitivity.test.ts

# 3) Validate parity-sensitive changes
npm run test:parity
python3 scripts/verify_parity.py
```

## Done Criteria

- New/updated test fails before fix and passes after fix.
- No regression in targeted model tests.
- Parity checks pass if math changed.

## Limitations

- TDD alone does not validate realism of scenario assumptions.
- Use research docs and evidence files for economic justification.
