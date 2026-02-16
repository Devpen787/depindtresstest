# Master Plan Checklist and Control Gates

Date: 2026-02-16
Purpose: single control checklist for executing and validating the dashboard hardening program.

## 1) Control Documents

1. Plan and phase status:
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/output/working_memory/task_plan.md`

2. Findings and risks:
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/output/working_memory/findings.md`

3. Execution log:
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/output/working_memory/progress.md`

4. UX target state:
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/FINAL_DASHBOARD_UI_SPEC_2026-02-16.md`
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/TAB_TRANSFORMATION_BLUEPRINT_2026-02-16.md`

5. Human-centered acceptance gate:
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/HCI_ACCEPTANCE_RUBRIC_2026-02-16.md`

## 2) Phase Checklist

### Phase 0 - Baseline Freeze (Pre-change)

1. Snapshot current tab/chart inventory and destination map.
2. Confirm non-loss rule: every moved panel has a destination.
3. Capture baseline behavior for protocol/scenario switching.

Exit criteria:
1. Baseline evidence saved.
2. No untracked "orphan" panel.

### Phase 1 - Architecture Hardening

1. Single global protocol state.
2. Single global scenario state.
3. Shared metric contract wired across key tabs.
4. Shared guardrail vocabulary wired (`Healthy`, `Watchlist`, `Intervention`).
5. Shared recommendation payload schema.

Exit criteria:
1. No conflicting protocol/scenario state.
2. Same metric values across tabs for same run context.
3. Recommendation payload serializes consistently.

### Phase 2 - Flow Alignment

1. Canonical nav flow enforced.
2. Default tab surfaces reduced to decision-critical content.
3. Advanced content parked and reachable.
4. Duplicate local controls removed.
5. Cross-tab next-step CTAs present.

Exit criteria:
1. First-time journey completable in <= 7 minutes.
2. No dead-end navigation in canonical path.
3. Advanced content reachable in <= 2 clicks.

### Phase 3 - Recommendation and Trust Layer

1. Decision brief integrated.
2. Evidence/confidence metadata visible on high-impact KPIs.
3. Freshness and reproducibility visible.
4. Exported brief includes run context.

Exit criteria:
1. Every recommendation has owner/trigger/action/effect.
2. Every high-impact KPI has source-grade context.
3. Decision brief export is reproducible.

## 3) HCI Hard Gates (Must Pass)

1. Accessibility:
- No critical blocker in default journey.
- Keyboard-only completion path available.

2. State integrity:
- No protocol/scenario drift across tabs.

3. Decision closure:
- Each default tab ends with explicit next action.

4. Trust:
- Recommendations show confidence + evidence metadata.

## 4) Verification Commands

1. Unit/invariant checks:
- `npm run test`
- `npm run test:math-invariants`
- `npm run test:parity`

2. E2E checks:
- `npm run test:e2e`
- `npm run test:e2e:live`

3. Domain gates:
- `npm run ci:optimizer`
- `npm run ci:dashboard:acceptance`

4. Reporting:
- `npm run ci:report:actions`

## 5) Monitoring Rhythm

Per implementation batch:
1. Update `progress.md` with actions and evidence.
2. Update phase status in `task_plan.md`.
3. Run relevant verification commands.
4. Score current state against HCI rubric categories.

Escalation trigger:
1. Three consecutive failed attempts on same issue.
2. Any hard gate failure after merge.
3. Any loss of unique analytical signal without documented destination.

## 6) Completion Definition

1. Weighted HCI rubric score >= 80 and all hard gates pass.
2. Canonical journey passes first-user protocol.
3. Decision brief export is reproducible and review-ready.
4. No critical regressions in tests and domain gates.
