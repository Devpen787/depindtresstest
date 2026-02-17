# REVAMP Integration Bridge

## Red-Team Addendum (2026-02-17)

## Phase 2A Status Update (2026-02-17)

Implemented this pass:
1. Canonical scenario state hardened in app shell:
   - Default scenario id now initializes to `baseline`.
   - Parameter-only scenario loads now stamp `custom` instead of leaving scenario state ambiguous.
2. Removed benchmark scenario inference drift:
   - Benchmark now consumes canonical app-shell scenario id directly rather than inferring from params.
3. Added explicit sync observability hooks:
   - App shell now exposes canonical protocol/scenario ids via `data-cy="global-context-state"` for integration assertions.
4. Added sync kill test:
   - New Cypress smoke spec validates scenario + protocol consistency across Benchmark -> Root Causes -> Strategy and back.

Verification:
1. `npm run test:e2e` -> PASS (`8/8`, includes `global-state-sync.cy.ts`)
2. `npm run test -- src/utils/decisionBrief.test.ts src/audit/kpiOwnerMath.test.ts src/audit/kpiOwnerRegistry.test.ts` -> PASS
3. `npm run build` -> PASS
4. `npm run test:e2e:perf-tabs` -> PASS (no performance gate regression)

### A) Top Risks
1. Failure mode: scenario/protocol state diverges across surfaces, so users compare one scenario and judge another.
Likelihood: 5
Impact: 5
Why this matters now: this invalidates first external review outcomes because the same label can point to different underlying params.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:54`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Benchmark/BenchmarkView.tsx:335`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/ScenarioManager.tsx:131`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ThesisDashboard.tsx:94`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/SimulatorSidebar.tsx:272`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/TAB_TRANSFORMATION_BLUEPRINT_2026-02-16.md:9`.

2. Failure mode: KPI ownership is nominal only; payback and related decision KPIs are recomputed with different formulas in multiple owners.
Likelihood: 5
Impact: 4
Why this matters now: owner/mirror architecture fails if the same KPI yields different values by tab.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:307`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/benchmarkViewMath.ts:118`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/SandboxView.tsx:82`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ThesisDashboard.tsx:185`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/OWNER_MIRROR_DECISION_MATRIX_2026-02-17.md:29`.

3. Failure mode: Decision Brief can be reproducible in format but non-reproducible in meaning because it is generated from global sim state, while thesis/strategy uses local model state.
Likelihood: 4
Impact: 5
Why this matters now: exported recommendation can disagree with what was visually analyzed.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:381`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:364`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ThesisDashboard.tsx:122`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ThesisDashboard.tsx:657`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/types/decisionBrief.ts:53`.

4. Failure mode: live vs projected and confidence signaling is inconsistent in default surfaces, leading to over-trust in modeled values.
Likelihood: 4
Impact: 4
Why this matters now: first-time reviewers will not reliably distinguish measured data from proxy outputs.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Benchmark/BenchmarkView.tsx:22`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Benchmark/BenchmarkView.tsx:364`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/MetricEvidenceBadge.tsx:31`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/data/metricEvidence.ts:15`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/utils/decisionBrief.ts:63`.

5. Failure mode: narrative flow is not enforced and starts midstream, so “verification first” is only a document claim.
Likelihood: 4
Impact: 4
Why this matters now: review sessions drift into ad-hoc tab hopping and produce non-comparable conclusions.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:42`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:66`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/OWNER_MIRROR_DECISION_MATRIX_2026-02-17.md:50`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/TAB_TRANSFORMATION_BLUEPRINT_2026-02-16.md:16`.

6. Failure mode: architecture feasibility risk from compute contention; benchmark enter and auto-run can trigger expensive simulation cycles, degrading tab responsiveness.
Likelihood: 4
Impact: 4
Why this matters now: slow switching degrades usability and confounds UX decisions in the revamp itself.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:177`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:197`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/hooks/useSimulationRunner.ts:203`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/hooks/useSimulationRunner.ts:357`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/hooks/useSimulationRunner.ts:369`.

### B) Rejections
1. Claim being rejected: “Protocol and scenario are global and synchronized.”
Why it fails: implementation has three scenario control paths with different state sources; benchmark and thesis do not share a single scenario owner.
Counterproposal: define one canonical `scenarioContext` and `protocolContext` in app shell, remove local scenario states, and require consumers to be read-only unless explicitly owner-authorized.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/TAB_TRANSFORMATION_BLUEPRINT_2026-02-16.md:9`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:54`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ui/ScenarioManager.tsx:131`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ThesisDashboard.tsx:94`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/SimulatorSidebar.tsx:272`.

2. Claim being rejected: “KPI owner/mirror policy is already materially enforced.”
Why it fails: payback and related KPIs are recomputed in app shell, benchmark math, sandbox, and thesis with different mechanics; mirrors are not consuming one canonical owner value.
Counterproposal: create a single KPI registry with owner calculators and mirror adapters; prohibit tab-local KPI math for owner-tagged families.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/OWNER_MIRROR_DECISION_MATRIX_2026-02-17.md:28`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:307`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/benchmarkViewMath.ts:118`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Simulator/SandboxView.tsx:82`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ThesisDashboard.tsx:185`.

3. Claim being rejected: “Decision Brief contract is ready for governance-grade reproducibility.”
Why it fails: current schema does not encode required evidence-status gating policy, and strategy brief can reflect global sim params instead of local thesis scenario controls.
Counterproposal: add required fields `evidence_status`, `run_id`, `kpi_owner_versions`, and enforce policy `partial|missing => verdict=hold`; bind strategy brief inputs to the exact rendered owner state.
Evidence refs: `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/PHASE1_IMPLEMENTATION_CHECKLIST_2026-02-17.md:34`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/types/decisionBrief.ts:53`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/utils/decisionBrief.ts:119`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/index.tsx:381`, `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/ThesisDashboard.tsx:122`.

### C) Kill Tests
1. Kill test for rejected global synchronization claim.
Metric and threshold: for one test session, set scenario once, then sample `scenario_id` and top KPI values from Benchmark, Diagnose, Strategy, and Decision Brief; required mismatch count is 0.
Invalidating result: any single mismatch in `scenario_id` or >1% KPI delta between owner and brief invalidates the claim.

2. Kill test for rejected owner/mirror enforcement claim.
Metric and threshold: run one fixed seed and parameters snapshot; compare `payback`, `solvency`, and `retention` across owner and mirror surfaces; required absolute delta is <=0.1 for ratio metrics and <=0.2 months for payback.
Invalidating result: any metric exceeds threshold, or mirror has independent threshold wording not matching owner.

3. Kill test for rejected Decision Brief reproducibility claim.
Metric and threshold: export 20 briefs with unchanged params hash and scenario id; require stable `drivers` values and verdict across all 20 exports; require `partial|missing evidence_status` to force verdict `hold`.
Invalidating result: any drift in driver values/verdict for identical params hash, or any non-hold verdict under partial/missing evidence.

### D) Decision Table
1. Proposal: Narrative flow (Verification -> Comparison -> Stress -> Judgment).
Decision: Accept with changes.
Confidence: 0.79.
Blockers: no enforced entry gate, default starts at Benchmark, and no global progress lock between stages.

2. Proposal: KPI ownership and duplication control.
Decision: Reject (current implementation).
Confidence: 0.86.
Blockers: multi-formula KPI computation across tabs; missing owner-bound computation API.

3. Proposal: Live vs projected labeling and confidence signaling.
Decision: Accept with changes.
Confidence: 0.74.
Blockers: default surfaces suppress or inconsistently expose evidence badges; confidence score is source-grade weighted but not uncertainty-calibrated.

4. Proposal: Decision Brief contract and reproducibility.
Decision: Reject (current implementation).
Confidence: 0.83.
Blockers: missing required evidence-status contract enforcement and state-source mismatch for strategy-generated calls.

5. Proposal: Feasibility within current architecture.
Decision: Accept with changes.
Confidence: 0.71.
Blockers: simulation rerun pressure on tab transitions and auto-run/peer-calibration contention.

### E) Integration Advice
1. P0 Do now (during revamp): centralize `protocol_id` and `scenario_id` into one app-level context; remove local scenario ownership from Benchmark/Thesis and keep only owner-authorized controls.
2. P0 Do now (during revamp): implement KPI owner registry and migrate payback/solvency/retention calculators to single-source functions consumed by mirrors.
3. P0 Do now (during revamp): harden Decision Brief policy contract with `evidence_status` and forced `hold` downgrade rules; include `run_id` and owner-version map.
4. P1 Do now (during revamp): enforce staged flow checkpoints in UI with explicit “complete current stage” status before next stage is considered valid for brief generation.
5. P1 Do now (during revamp): promote live/proxy/projection labeling into default cards and charts, not tooltip-only tags.
6. P1 Do now (during revamp): add integration tests for cross-tab scenario consistency and owner/mirror metric parity.
7. P2 Do after freeze: generate human-readable export format (PDF/Markdown) once contract and parity tests are stable.
8. P2 Do after freeze: optimize compute scheduling by precomputing shared benchmark cohorts and debouncing tab-triggered reruns with stale-result cancellation telemetry gates.

Most likely hidden failure if unaddressed: externally shared verdicts will look precise but be generated from inconsistent state and non-canonical KPI math.
