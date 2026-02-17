# Navigation Naming Exercise

Date: 2026-02-17  
Goal: rename primary and secondary navigation so first-time users understand each screen's purpose without domain jargon.

## 1) Naming Rules
1. Use intent-first labels: what the user can do, not internal architecture terms.
2. Prefer plain language over thesis vocabulary.
3. Keep top-level labels short (1-2 words).
4. Avoid terms requiring prior tokenomics context (`lab`, `thesis`, `archetype`) at top level.
5. Ensure each label answers a distinct user question.

## 2) User Questions By Surface
1. "What is the current status?" -> Benchmark
2. "What is breaking and why?" -> Diagnostics
3. "What should we change next?" -> current Policy Lab
4. "What should I do first?" -> Decision Tree
5. "Where is supporting evidence?" -> Appendix
6. "Where can I run deep experiments?" -> Advanced workspace (Explorer/Comparison/Sandbox)

## 3) Primary Tab Intent Map
1. Current: `Decision Tree`
- Purpose: guide first-time reviewers to a decision path.
- Better plain-language intent: start and choose a path.
2. Current: `Benchmark`
- Purpose: compare protocol outcomes vs peers.
- Better plain-language intent: status snapshot + peer context.
3. Current: `Diagnostics`
- Purpose: isolate failure modes and root causes.
- Better plain-language intent: find causes and risk types.
4. Current: `Policy Lab`
- Purpose: test levers and choose a recommended next move.
- Better plain-language intent: tune strategy and select action.
5. Current: `Appendix`
- Purpose: supporting detail and advanced analysis evidence.
- Better plain-language intent: deep evidence and sensitivity context.
6. Current: `Design Lab` (internal)
- Purpose: UI design system playground.
- Better plain-language intent: internal-only tooling, not reviewer flow.

## 4) Candidate Label Matrix
Scoring: 1 (weak) to 5 (strong), based on first-time comprehension.

| Surface | Candidate | Clarity | Precision | Actionability | Notes |
|---|---|---:|---:|---:|---|
| Decision Tree | Start | 5 | 3 | 4 | Very clear for first-time flow, less specific. |
| Decision Tree | Decide | 4 | 4 | 5 | Strong action framing. |
| Decision Tree | Guided Path | 3 | 5 | 4 | Accurate but longer. |
| Diagnostics | Diagnostics | 3 | 5 | 3 | Accurate, still technical. |
| Diagnostics | Risk Diagnosis | 4 | 5 | 4 | Clear + precise. |
| Diagnostics | Root Causes | 5 | 4 | 4 | Very understandable. |
| Policy Lab | Policy Lab | 2 | 4 | 3 | Too abstract for first-time users. |
| Policy Lab | Strategy | 5 | 4 | 4 | Best plain-language replacement. |
| Policy Lab | Action Plan | 5 | 3 | 5 | Highly actionable, less model-specific. |
| Policy Lab | Tuning | 3 | 4 | 4 | Technical; weaker for non-technical users. |
| Appendix | Appendix | 3 | 4 | 2 | Familiar but vague. |
| Appendix | Evidence | 5 | 4 | 3 | Clear value proposition. |
| Appendix | Deep Dive | 4 | 4 | 4 | Strong for advanced content. |

## 5) Recommended Naming Set
Primary tabs:
1. `Decide` (from Decision Tree)
2. `Benchmark`
3. `Root Causes` (or keep `Diagnostics` if you need technical continuity)
4. `Strategy` (from Policy Lab)
5. `Evidence` (from Appendix)

Internal tab:
1. Move `Design Lab` out of top-level reviewer nav into an internal/dev entry point.

## 6) Secondary Navigation Recommendations
Benchmark local tabs:
1. `Dashboard` -> `Snapshot`
2. `Appendix` -> `Deep Dive`

Diagnostics failure-mode buttons:
1. `I. Subsidy Trap` -> `Payout Gap`
2. `II. Churn Shock` -> `Exit Risk`
3. `III. Density Trap` -> `Saturation Risk`
4. `IV. Adversarial` -> `Attack Risk`

Advanced workspace tabs:
1. `Explorer` -> `Browse`
2. `Comparison` -> `Compare`
3. `Sandbox` -> `Experiment`

## 7) Recommended Copy Guardrail
For each tab header, include one short sentence in this format:
1. "Use this tab to [action], so you can [decision outcome]."

Example for current Policy Lab replacement:
1. "Use this tab to test strategy levers, so you can choose one safe next move."

## 8) Rollout Plan (Low Risk)
1. Update labels only first (no behavior changes).
2. Run smoke tests for nav selectors and keyboard navigation.
3. Update presenter script language to match new labels.
4. After 1 internal session, decide if any label still causes hesitation.

## 9) Default Recommendation For Your Question
If choosing one replacement for `Policy Lab` now:
1. Use `Strategy`.
Reason: highest comprehension for non-technical reviewers while preserving decision intent.
