---
name: depin-verification-before-completion
description: Require fresh verification evidence before claiming model, optimizer, or stress-pack work is complete.
source: https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/verification-before-completion
risk: safe
---

# DePIN Verification Before Completion

## When to Use This Skill

Use this skill when:

- About to say a bug is fixed.
- About to claim tests pass.
- About to commit, open a PR, or hand off results.

Do not use this skill when:

- You are still investigating and have not reached a completion claim.

## Iron Rule

No completion claims without fresh command evidence from the current state.

## Verification Matrix

Choose commands based on what changed.

```bash
# Math/parity changes
npm run test:parity
python3 scripts/verify_parity.py

# Simulation or optimizer logic changes
npm test -- src/model/simulation.test.ts src/model/sensitivity.test.ts
npm run skill:optimizer:quick -- --profile ono_v3_calibrated
npm run ci:optimizer:gate -- --profile ono_v3_calibrated --mode quick

# Stress report pipeline changes
npm run generate:paper-stress-report
npm run test:paper-rigor

# Broad TypeScript/UI changes
npm test
npm run build
```

## Required Output Style

Before any completion claim, report:

- Commands run
- Exit status
- Key pass/fail counts
- Any skipped verification and why

## Limitations

- Passing checks here does not prove economic assumptions are correct.
- For behavior design changes, still document rationale in repo docs.
