# DTSE Tab — Improvement Plan

**Full plan:** [docs/DTSE_IMPROVEMENT_PLAN.md](../../docs/DTSE_IMPROVEMENT_PLAN.md)

**Purpose:** Make the DTSE tab readable, learnable, trustworthy, and action-oriented.

## Phases

| Phase | Focus |
|-------|-------|
| 1 | Fix bugs (price clamp, export feedback, ONOCOY $0, review-rehearsal E2E) |
| 2 | Remove redundancy |
| 3 | Clarify labels |
| 4 | Simplify content |
| 5 | Polish (UI review fixes) |
| 6 | UI refinement (optional) |
| 7 | Design system (optional) |
| 8 | Feedback loop (ongoing) |

## Phase 1 checklist (priority)

- [ ] Price compression clamp — `src/utils/dtseLiveSignatures.ts` line 56: clamp `priceCompressionPct` to ±999
- [ ] Export feedback — Add toast or inline "Downloaded" after DTSE export
- [ ] ONOCOY $0 — Fix `PROTOCOL_BRIEF_OVERRIDES` or `deriveDefaultProtocolBrief` in `src/data/dtseContent.ts`
- [ ] review-rehearsal E2E — Fix decision-tree-root not found in Evidence → Stress Lab → Return → Decide flow

## Proof commands

| Step | Command | Expected |
|------|---------|----------|
| Unit tests | `npm run test` | All pass |
| Build | `npm run build` | No errors |
| E2E | `npm run test:e2e` | All 22 pass |

## Before claiming done

1. Run proof commands above.
2. Use **verification-before-completion** or **depin-verification-before-completion** skill.
3. Use Source Control → Agent Review before PR.
