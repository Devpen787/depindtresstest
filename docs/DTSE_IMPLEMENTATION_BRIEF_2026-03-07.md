# DTSE Implementation Brief

Date: 2026-03-07

Scope: Rewrite the DTSE tab so a first-time user can understand what it does, why the run should or should not be trusted, what broke first, and what to test next, without needing prior tokenomics expertise.

This brief is based on:

- a browser walkthrough of the DTSE flow as a new user
- inspection of the current DTSE implementation
- inspection of the current `Learn`, `Data`, `Actions`, export, and documentation surfaces

## Product Goal

The first 30-60 seconds of DTSE should answer five questions:

1. What is DTSE?
2. What is this current run testing?
3. Which parts of this run are live data versus model assumptions?
4. What failed first?
5. What should I test or discuss next?

## Non-Negotiable Outcome

DTSE must feel like a trustworthy guided workflow, not like an internal model viewer with nicer cards.

## Main Problems to Fix

1. The tab asks for trust before it explains itself.
2. Internal implementation details leak into the UI.
3. Supporting documentation sounds more authoritative than the product can justify.
4. Stage 2 does not feel reliably scoped to the active stress channel.
5. Stage 5 recommendations are not specific enough to drive the next rerun or decision.
6. Header menus do not match the repo guidance or user expectation for the DTSE surface.

## Workstream 1: App Shell and Header Controls

Primary files:

- `index.tsx`
- `src/components/ui/HeaderDropdown.tsx`
- `src/components/MethodologyDrawer.tsx`
- `src/components/MethodologySheet.tsx`
- `src/data/research.ts`
- `src/data/wiki.ts`

Required changes:

- Replace the current `Learn` destinations with three distinct user-facing destinations:
  - `How DTSE Works`
  - `Metric Definitions`
  - `Product Docs`
- Do not route both `Methodology` and `Math Specification` into the same drawer.
- Remove thesis-style language from user-facing help.
- Remove `Doctoral Research Thesis (2025)` from the UI.
- Remove `Inferred Research Plan and Methodology` from the UI.
- Update `showSpecModal` in `index.tsx` to a real stateful destination, or remove it entirely if a unified learn drawer is used.
- Make `Actions` useful on DTSE.
- Because repo guidance says Stress Lab should be reachable from any tab, expose `Open Stress Lab` from DTSE as well.
- Add `Export DTSE Run` to `Actions` while on DTSE, or remove the header action entirely for DTSE. Do not leave it as a disabled dead-end.
- Ensure dropdowns close after an action is selected.

Exact menu labels:

- `Learn`
  - `How DTSE Works`
  - `Metric Definitions`
  - `Product Docs`
- `Data`
  - `Refresh market data`
  - `Auto-refresh every 5 minutes`
  - `Model engine: Agent-Based v2`
- `Actions`
  - `Export DTSE run`
  - `Open Stress Lab`

Do not use these current labels in the new UI:

- `Methodology`
- `Math Specification`
- `System Wiki`
- `Export Brief` when the user is clearly in DTSE mode

## Workstream 2: DTSE Frame and First-Run Orientation

Primary file:

- `src/components/DTSE/DTSEDashboard.tsx`

Required changes:

- Add a persistent top explainer card above the stage rail.
- This card must appear in both `Guided` and `Overview`.
- It must explain:
  - what DTSE is
  - what it is not
  - how to read the current run
- Always show trust-status chips in the frame, not only in `More`.
- Replace the single `partial evidence` badge with a clearer status summary.

Required trust-status chips:

- `Market context: Live` or `Market context: Reference`
- `Model source: Current run` or `Model source: Saved pack`
- `Scoring confidence: Full`, `Partial`, or `Limited`

Exact intro card copy:

- Title: `What DTSE does`
- Body: `DTSE compares a selected stress scenario against a matched baseline and shows what weakens first. Use it to understand failure order and next tests. Do not use it as a price forecast or a universal protocol ranking.`
- Helper line: `Read Stage 1 before trusting the scores. Read Stage 3 before reading Stage 5.`

Keep the 5-stage structure. Do not add or remove stages.

## Workstream 3: Stage 1 Rewrite

Primary file:

- `src/components/DTSE/DTSEContextStage.tsx`

Required changes:

- Keep the protocol/stress context layout, but change the job of the stage from passive context dump to trust calibration.
- Do not surface raw profile IDs in the default UI.
- If an internal ID must exist in advanced mode, label it `Profile ID`, not bare text.
- Replace the current helper copy.
- Split market facts and model assumptions more aggressively.
- Use adaptive currency formatting so very small live prices never render as `$0`.

Exact replacement copy:

- Stage description: `Confirm what this run is about before trusting any score.`
- Helper card title: `How to use this stage`
- Helper card body: `This stage tells you what is live market context, what is saved reference data, and what the model assumed when it built the run.`

Market section rules:

- If live market data exists, title the section `Live market context`.
- If live market data does not exist, title it `Reference market context`.
- If live market data does not exist, show this note: `Live market data is unavailable, so DTSE is using saved reference values for market context.`

Model section rules:

- Add a section intro line: `These values are simulation inputs. They are not claims about the live network today.`

Formatting rule for price:

- If price >= 1, show 2 decimals.
- If price >= 0.01 and < 1, show 4 decimals.
- If price < 0.01, show up to 6 significant decimals.
- Never show `$0` unless the actual value is exactly zero.

Peer analog rules:

- Keep peers visible, but replace `high confidence` / `medium confidence` / `low confidence` with `Peer fit: high` / `Peer fit: medium` / `Peer fit: low`.
- Always show one sentence explaining why the peers were selected.

## Workstream 4: Stage 2 Rewrite

Primary files:

- `src/components/DTSE/DTSEApplicabilityStage.tsx`
- `src/utils/dtseLiveApplicability.ts`
- `src/types/dtse.ts`
- `src/data/dtseContent.ts`

Required changes:

- Rename the stage in the UI from `Data Readiness` to `What Can Be Scored`.
- The user should understand which metrics are scored now, which are held out, and why.
- Do not surface scenario-irrelevant exceptions as the main story.
- Add a new applicability reason code for metrics that are not relevant in the active stress channel.

Add this reason code:

- `SCENARIO_INACTIVE`

Add this user-facing label:

- `Not used in this scenario`

Behavior rules:

- If `competitive_yield_pressure` is not active, `vampire_churn` should not show up as the primary run exception.
- It can remain in advanced mode or in a secondary “not scored in this run” grouping.
- Group the metric cards into:
  - `Scored now`
  - `Held out`
- Rename `Protocol-specific gates` to `Exceptions in this run`.

Exact replacement copy:

- Stage description: `This run only scores metrics that are fair under the selected protocol, stress channel, and evidence quality.`
- Exceptions title: `Exceptions in this run`
- Empty-state exception copy: `No run-specific scoring exceptions were detected.`

Advanced mode rule:

- Keep the reason-code legend in advanced mode only.
- Never render raw code and label without spacing.

## Workstream 5: Stage 3 Rewrite

Primary files:

- `src/components/DTSE/DTSEOutcomesStage.tsx`
- `src/utils/dtseLiveOutputs.ts`
- `src/utils/dtseSequenceView.ts`
- `src/utils/dtseLiveSignatures.ts`
- `src/audit/decisionTreeViewMath.ts`

Required changes:

- Rename the stage presentation from `Stress Results` to `What Broke First`.
- Lead with failure order, not charts.
- Keep the sequence view, but make it easier to understand without domain context.
- Remove or rewrite any impossible-looking trigger language.

Exact replacement copy:

- Stage title: `Stage 3 — What Broke First`
- Stage description: `Start with failure order. Then read the metric levels underneath it.`
- Stress channel helper sentence: `This run applies a controlled stress channel against a matched baseline to show failure order, not to predict a market path.`

Sequence rules:

- If drift is flat, say: `This run's strongest signal is threshold failure, not baseline divergence.`
- Do not show `If this is unexpected, rerun...` in the default view.
- Keep `The DePIN Illusion`, but relabel it `Interpretation note`.

Metric card rules:

- Replace `Measures:` with `What it measures:`
- Add `Why it is flagged now:` using the current band interpretation

Critical bug fixes:

- No exported or visible trigger string may contain values that obviously contradict each other.
- Specifically block combinations like:
  - `price compression is -999%`
  - `max drawdown is 0%` paired with severe liquidity wording
- Validate trigger numbers before rendering.
- If a trigger number is not reliable, omit the exact number and use plain-language fallback text.

Technical fix:

- Eliminate the Recharts `width(-1)` / `height(-1)` warnings when switching to advanced/overview flows.

## Workstream 6: Stage 4 Rewrite

Primary files:

- `src/components/DTSE/DTSESignatureStage.tsx`
- `src/utils/dtseLiveSignatures.ts`

Required changes:

- Keep this stage structurally similar. It is the strongest part of DTSE today.
- Rename the stage label from `Failure Autopsy` to `Failure Patterns`.
- Add one plain-language disclaimer at the top.

Exact replacement copy:

- Stage title: `Stage 4 — Failure Patterns`
- Stage description: `These are interpreted patterns inferred from the scored outputs above.`
- Disclaimer line: `Patterns are model interpretations, not direct observations of live network events.`

Rules:

- Keep `Why this matters` in default mode.
- Keep numeric trigger logic in advanced mode only.
- Humanize trigger logic strings. Do not show raw formula-style narratives unless the numbers are credible and readable.

## Workstream 7: Stage 5 Rewrite

Primary files:

- `src/components/DTSE/DTSERecommendationsStage.tsx`
- `src/utils/dtseLiveRecommendations.ts`
- `src/utils/dtseProtocolInsights.ts`
- `src/components/DTSE/DTSEDashboard.tsx`

Required changes:

- Keep the stage as the action layer, but make it concrete.
- Recommendation titles must become direct next tests, not generic committee phrases.
- Remove the repeated prefix `Possible response path:`.
- Recommendation cards should read like rerun instructions.

Exact recommendation title style:

- `Rerun with lower net emissions and stronger demand sinks`
- `Rerun with liquidity buffers and unlock controls`
- `Rerun with provider cost relief by cohort`

Exact replacement stage copy:

- Stage title: `Stage 5 — Next Tests`
- Stage description: `Use these as reruns or decision discussions. They are not direct prescriptions.`
- Summary title: `Lead next test`

Recommendation card structure:

- Title
- `Why now`
- `What to change in the rerun`
- `What success looks like`
- `Owner`
- `Timing`
- `Risk if ignored`

Protocol insights rules:

- Keep protocol insights, but reduce overclaiming.
- Use confidence labels that a user can parse:
  - `From this run`
  - `Derived from this run`
  - `Verified protocol context`
  - `Mixed`
- `Source trace` stays in advanced mode only.
- Remove any provenance item that reads like internal taxonomy jargon unless it is labeled for users.

## Workstream 8: Export Rewrite

Primary file:

- `src/components/DTSE/DTSEDashboard.tsx`

Required changes:

- Exported Markdown must use the human protocol name, not only the protocol ID.
- Add a `Data Source Summary` section to the Markdown export.
- Mirror the trust model shown in the UI.
- Do not include implausible trigger strings.

Required `Data Source Summary` section fields:

- market context status
- model source status
- scoring confidence status
- proxy metrics used
- fallback/reference values used

## Workstream 9: Documentation Rewrite

Primary files:

- `src/components/MethodologyDrawer.tsx`
- `src/components/MethodologySheet.tsx`
- `src/data/research.ts`
- `src/data/wiki.ts`

Required changes:

- Rewrite docs to match actual app behavior.
- The wiki currently says DTSE loads a frozen bundle, but the app uses live outputs when current simulation data is available.
- Documentation must describe actual behavior, not historical intent.
- Remove all thesis framing from product docs.
- Rewrite DTSE docs in plain product language.

Required doc sections:

- `What DTSE is`
- `What DTSE is not`
- `What each stage does`
- `Where data comes from`
- `How evidence quality affects scoring`
- `How to use DTSE with Stress Lab`

## Exact Copy Appendix

Use these strings unless a code constraint requires minor punctuation changes.

- `DTSE compares a selected stress scenario against a matched baseline and shows what weakens first.`
- `Use it to understand failure order and next tests.`
- `Do not use it as a price forecast or a universal protocol ranking.`
- `This run only scores metrics that are fair under the selected protocol, stress channel, and evidence quality.`
- `This run's strongest signal is threshold failure, not baseline divergence.`
- `Patterns are model interpretations, not direct observations of live network events.`
- `Use these as reruns or decision discussions. They are not direct prescriptions.`

## Acceptance Criteria

Product acceptance:

- A first-time user can explain DTSE in one sentence after reading the intro card.
- A first-time user can tell which values are live, reference, and modeled.
- Stage 2 does not foreground scenario-irrelevant metrics.
- Stage 3 prioritizes failure order over decorative charting.
- Stage 5 recommendations read like concrete next tests.

Trust acceptance:

- No raw protocol IDs appear in the default DTSE UI.
- No raw reason codes appear in the default DTSE UI.
- No user-facing help references a doctoral thesis.
- No visible or exported trigger string contains implausible values like `-999%`.
- A live price below `$0.01` never renders as `$0` unless it is truly zero.

Behavior acceptance:

- `Learn` opens three distinct destinations.
- `Actions` from DTSE includes `Open Stress Lab`.
- `Actions` from DTSE includes a working export path.
- Exported Markdown uses protocol name plus data-source summary.

Technical acceptance:

- No Recharts `width(-1)` / `height(-1)` warnings during DTSE mode toggles.
- No new console errors introduced by the rewrite.
- Existing DTSE keyboard navigation remains intact.

## Tests to Update or Add

Unit tests:

- `src/utils/dtseLiveApplicability.test.ts`
- `src/utils/dtseLiveOutputs.test.ts`
- `src/utils/dtseLiveSignatures.test.ts`
- `src/utils/dtseProtocolInsights.test.ts`
- Add a test for adaptive DTSE market-price formatting.
- Add a test for export markdown data-source summary.

Component tests:

- Add DTSE rendering assertions for:
  - intro card
  - trust-status chips
  - Stage 2 grouped scoring state
  - Stage 5 recommendation title format

E2E tests:

- Walk DTSE as a first-time user:
  - open default DTSE
  - read guided stages 1-5
  - switch to overview
  - toggle `More`
  - open `Learn`, `Data`, and `Actions`
  - fetch live data
  - export DTSE run
- Assert that DTSE `Actions` exposes `Open Stress Lab`.

## Recommended Implementation Order

1. Fix header controls and help surfaces.
2. Add DTSE intro card and trust-status chips.
3. Rewrite Stage 1 and Stage 2.
4. Fix Stage 3 trust issues and trigger bugs.
5. Rewrite Stage 5 recommendation language.
6. Update export.
7. Rewrite docs.
8. Add tests and rerun acceptance flow.

## Definition of Done

This rewrite is done only when the UI, export, and docs all tell the same story:

- DTSE is comparative, not predictive.
- The trust level of each run is legible.
- The failure order is understandable.
- The next action is concrete.
