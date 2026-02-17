# Pre-Onocoy Execution Runbook

Date: 2026-02-16  
Status: active while external Onocoy reviewer is unavailable

## 1) Objective
Keep momentum without lowering standards by running a controlled internal first-user review cycle against the same acceptance gates planned for Onocoy.

## 2) Scope
1. Use the existing canonical path:
- `Decision Tree -> Benchmark -> Diagnostics -> Strategy -> Appendix`
2. Preserve known temporary waivers:
- `M1`, `M2`, `M3`
3. Do not expand scope to new features during this cycle.

## 3) Freeze Baseline
Baseline evidence bundle for this run:
1. `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/ONOCOY_REVIEW_HANDOFF_PACKET_2026-02-16.md`
2. `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/ONOCOY_REVIEW_ONE_PAGER_2026-02-16.md`
3. `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/ONOCOY_REVIEW_PRESENTER_SCRIPT_2026-02-16.md`
4. `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/ONOCOY_REVIEW_DRY_RUN_FRICTION_LOG_2026-02-16.md`
5. Exported decision briefs in `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/cypress/downloads/`

## 4) Internal Reviewer Cycle
Run with 1-2 reviewers who were not primary builders.

Reviewer instructions:
1. Complete the journey in <= 7 minutes.
2. Explain the decision in plain language.
3. Export one decision brief.
4. Call out any chart they cannot interpret in under 15 seconds.

Logging:
1. Record all findings in `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/PRE_ONOCOY_INTERNAL_REVIEW_LOG_2026-02-16.md`
2. Severity only:
- `P1`: blocks interpretation or decision closure
- `P2`: friction but path still completable
- `P3`: polish

## 5) Gating Commands (must pass before send)
1. `npm run test:e2e`
2. `npm run build`
3. `npm run acceptance:generate -- --profile ono_v3_calibrated --mode quick`
4. `npm run ci:dashboard:acceptance:gate -- --require-section-pass --exclude-sections 'I Onocoy Inputs'`

## 6) Promotion Rule
Promote to "External Review Candidate" when all conditions hold:
1. No unresolved `P1`.
2. At most 2 unresolved `P2`.
3. All four gating commands pass.
4. `M1/M2/M3` are explicitly disclosed in the review pack.

## 7) Exit Condition
When Onocoy feedback becomes available:
1. Replay same script and feedback questions.
2. Merge internal + external findings into one triage list.
3. Execute one focused remediation pass.
4. Re-run the same four gates and publish updated packet.
