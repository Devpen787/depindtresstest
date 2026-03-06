# DTSE Tab — Exhaustive Noise vs Signal Audit

**Scope:** Every element, label, section, and conditional in the DTSE tab. Nothing untouched, unread, unopened, unchallenged.

## Audit Overview

| Section | Content |
|---------|---------|
| [Shell & Wrapper](#shell--wrapper-indextsx) | Skip link, ErrorBoundary, layout |
| [DTSEDashboard](#dtsedashboard--run-context-strip) | Run strip, stage bar, Overview, footer |
| [Stage 1–5](#stage-1--protocol-context-dtsecontextstage) | Protocol Context, Applicability, Outcomes, Failure Autopsy, Response Paths |
| [Cross-cutting](#cross-cutting-issues) | Uppercase, decoration, redundancy |
| [Live Pass Findings](#live-pass-findings-2025-02-26) | Advanced toggle, Export, protocol/stress switching, bugs |
| [Extended Audit](#extended-audit-2025-02-26) | Empty states, sequence view, a11y, E2E, Stress Lab, protocol packs, evidence badge |
| [Summary](#summary-high-impact-changes) | Remove, Fix, Simplify, Clarify, Demote checklists |

**Test for each item:**
1. Would a user miss it if it were gone?
2. Does it duplicate information already shown elsewhere?
3. Does it require explanation to be useful? (If yes and we don't explain it → noise)
4. Does it help the user take the next step? (learn, compare, decide, export)

---

## Shell & Wrapper (index.tsx)

| Element | Location | Verdict | Challenge |
|---------|----------|---------|-----------|
| Skip link | `#dtse-stage-content` | **Signal** | A11y; keep. |
| ErrorBoundary | Wraps DTSEDashboard | **Signal** | Graceful failure; keep. |
| Panel id `panel-dtse` | Tab panel | **Signal** | ARIA; keep. |
| `relative flex-1 overflow-hidden` | Layout | **Neutral** | Structural. |

---

## DTSEDashboard — Run Context Strip

| Element | Location | Verdict | Challenge |
|---------|----------|---------|-----------|
| Decorative blurs (indigo, emerald) | Top/bottom | **Noise** | Pure decoration. Do they add atmosphere or just visual weight? Consider removing or reducing opacity. |
| "Protocol" label | Run strip | **Signal** | Needed. |
| Protocol select | Run strip | **Signal** | Core control. |
| "Stress Channel" label | Run strip | **Signal** | Needed. |
| Stress channel select | Run strip | **Signal** | Core control. |
| Evidence badge (complete/partial/missing) | Advanced only | **Edge** | Useful for power users. Keep in Advanced. |
| Guided / Overview toggle | Run strip | **Signal** | View mode; keep. |
| Advanced On/Off button | Run strip | **Edge** | Gate for power content. Label "Advanced" is jargon — "More" or "Details" might be clearer. |

---

## DTSEDashboard — Stage Indicator Bar

| Element | Location | Verdict | Challenge |
|---------|----------|---------|-----------|
| Connector lines between stages | `h-px flex-1 max-w-[40px]` | **Edge** | Visual flourish. Could simplify. |
| Stage pills (1–5) | Number + label | **Signal** | Core nav. |
| Stage labels: "Protocol Context", "Applicability", "Outcomes", "Failure Autopsy", "Response Paths" | Pills | **Signal** | "Applicability" is jargon — "Data Readiness" (Stage 2 subtitle) is clearer. Consider aligning. |
| Shadow/glow on active stage | `shadow-[0_0_15px_rgba(...)]` | **Edge** | Could be subtler. |

---

## DTSEDashboard — Overview Mode

| Element | Location | Verdict | Challenge |
|---------|----------|---------|-----------|
| Section wrapper per stage | `rounded-xl border...` | **Signal** | Structure. |
| Stage number in circle | `inline-flex w-5 h-5` | **Signal** | Orientation. |
| Section heading | `text-sm font-black uppercase` | **Edge** | Uppercase again — consider sentence case. |
| Footer: "Overview mode: all stages visible" | Footer strip | **Noise** | Redundant — user chose Overview. Could remove or shorten to "All stages" |
| "Back to Guided" button | Footer | **Signal** | Needed. |

---

## DTSEDashboard — Guided Footer

| Element | Location | Verdict | Challenge |
|---------|----------|---------|-----------|
| Previous button | Disabled on stage 1 | **Signal** | Keep. |
| Next button | Disabled on stage 5 | **Signal** | Keep. |
| Chevron icons | L/R | **Signal** | Clear. |

---

## Stage 1 — Protocol Context (DTSEContextStage)

### Header
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Stage 1 — Protocol Context" | **Signal** | Keep. |
| "Context to understand what DTSE is testing..." | **Signal** | Good. |

### Interpretation Boundary
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Interpretation Boundary" label | **Edge** | Jargon. "How to read this" or "Important" might be clearer. |
| Boundary text (baseline-relative, no price prediction) | **Signal** | Core; keep. |

### Scenario in this run
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Scenario in this run" section label | **Signal** | Keep. |
| "Stress Channel" sub-label | **Signal** | Keep. |
| Stress channel name (e.g. "Liquidity Shock") | **Signal** | Keep. |
| Stress channel summary | **Signal** | Keep. |
| "Run details" (Advanced) — Model, Run Envelope, Generated | **Edge** | Power-user. "Run Envelope" is jargon — "52 weeks · 1000 sims" is the signal. |

### Assessment
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Assessment" section label | **Signal** | Keep. |
| "Overall assessment" sub-label | **Noise** | Redundant with verdict title. Remove. |
| Verdict title ("Structure looks durable" / "Resilience is present..." / "The current token design breaks...") | **Signal** | Core. |
| Verdict summary (e.g. "3 of 5 core indicators need attention...") | **Signal** | Core. |
| Band count boxes (Healthy 2, Watchlist 1, Intervention 2) | **Signal** | Quantifies. But **duplicated** in Stage 3 band snapshot. Consider: is it needed in both? Stage 1 gives early read; Stage 3 gives full context. Keep both for now. |
| "Primary drivers" + Sparkles icon | **Signal** | Tells you what to focus on. |
| Driver labels (e.g. "Solvency Ratio", "Payback Period") | **Signal** | Keep. |
| "No stressed drivers detected" fallback | **Signal** | When healthy. |

### Protocol Card (right column)
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Protocol" label + chain badge | **Signal** | Keep. |
| Protocol name (large gradient text) | **Signal** | Keep. |
| protocol_id (Advanced, mono) | **Edge** | For debugging. Keep in Advanced. |
| "Surface" box | **Signal** | But label "Surface" is jargon. "What it does" or "Network type" clearer? |
| depin_surface text | **Signal** | Keep. |
| "Mechanism" box | **Signal** | "Mechanism" is jargon. "Token model" clearer? |
| mechanism text | **Signal** | Keep. |
| "Notes" box | **Signal** | Keep. |
| notes text | **Signal** | Keep. |
| "Evidence posture" (Advanced) | **Edge** | Explains Stage 2/3 flow. Redundant for repeat users. Keep in Advanced. |
| "Matched conditions" (Advanced) | **Edge** | Explains baseline comparison. Keep in Advanced. |

### Supplementary data (Advanced)
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Supplementary data (market snapshot + simulation assumptions)" | **Edge** | Long. "Market & model data" shorter. |
| Intro copy | **Edge** | "Market cards are live; model cards are simulation assumptions" — useful. |
| Market Snapshot (4 cards: Price, Market Cap, Circulating Supply, Supply Cap) | **Edge** | Not core to DTSE. Keep collapsed. |
| "Live Market" badge | **Edge** | Distinguishes from model. Keep. |
| Model Inputs (4 cards: Token Stock, Weekly Emission, Provider Count, Model Structure) | **Edge** | Simulation assumptions. Keep collapsed. |
| "Simulation" badge | **Edge** | Keep. |
| CardHeader (icon + label) pattern | **Edge** | Consistent. Cyan icons — do we need icons on every card? Could simplify. |

### Additional protocol context (always visible, collapsed)
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Additional protocol context (optional)" | **Edge** | "optional" is good. |
| "Open this only when you need deeper peer and mechanism context" | **Signal** | Sets expectation. |
| Comparable peers + confidence badge | **Signal** | When peers exist. |
| "Why these peers" | **Signal** | Rationale. |
| Demand Side / Supply Side / Token Role cards | **Edge** | Deep context. Keep collapsed. |
| Hover effects (`hover:-translate-y-0.5`) | **Edge** | Subtle. Could remove to reduce motion. |

---

## Stage 2 — Data Readiness (DTSEApplicabilityStage)

| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Stage 2 — Data Readiness" | **Signal** | Keep. |
| "Which metrics we can fairly score in this run" | **Signal** | Good. |
| Decorative blur (top-right indigo) | **Noise** | Same as dashboard blurs. Remove? |
| "Applicability Decisions" | **Edge** | Jargon. "Data Readiness" is stage name — "Decisions" adds little. Could be "Which metrics to score". |
| "5 / 6 Runnable" badge | **Signal** | Quick read. "/ 6 Runnable" — "Runnable" is jargon. "5 of 6 included" clearer? |
| Per-metric cards (Included/Excluded) | **Signal** | Core. |
| CheckCircle2 / XCircle icons | **Signal** | Clear. |
| Metric name | **Signal** | Keep. |
| details (entry.details or fallback) | **Signal** | Explains. |
| "Metric intent" details (expandable) | **Noise candidate** | 6 rows × 1 details each = 6 clicks to read all. Consolidate into one "Metric definitions" link? |
| buildMetricIntent output | **Edge** | Definition + relevance. Useful but buried. |
| "Included" / "Excluded" badge | **Signal** | Keep. |
| reasonLabels (e.g. "Proxy accepted") | **Signal** | "Proxy accepted" is jargon. "Data available" or "Using proxy data" clearer? |
| reasonCode (Advanced, mono) | **Edge** | For debugging. Keep. |
| "Data quality reasons" (Advanced) — full reason code glossary | **Edge** | Reference. Keep. |

---

## Stage 3 — Stress Results (DTSEOutcomesStage)

### Header & Loading
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Stage 3 — Stress Results" | **Signal** | Keep. |
| "Deterioration order under stress..." | **Signal** | Good. |
| Loading state (Loader2 + text + skeleton) | **Signal** | Keep. |

### Baseline Drift (when sequenceView)
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Baseline Drift" section label | **Signal** | Keep. |
| Gradient line (top of chart card) | **Noise** | Decorative. Remove? |
| "Stress deviation vs baseline" | **Signal** | Keep. |
| "Zero marks the matched baseline..." | **Signal** | Explains chart. |
| LineChart (5 lines: Solvency, Utilization, Providers, Price, Retention) | **Signal** | Core. |
| "No measurable baseline drift detected" warning | **Signal** | When flat. |
| "If this is unexpected, rerun..." | **Edge** | Helpful but long. Could shorten. |
| "Earliest trigger" card | **Signal** | "Week 1" or "Contained". |
| earliestTriggerLabel | **Signal** | Keep. |
| "Triggered families" card | **Signal** | Count + first 3 labels. |
| "+N more" when >3 | **Signal** | Keep. |
| "No subsystem divergence detected" | **Signal** | Empty state. |
| "The DePIN Illusion" box | **Signal** | Thesis-aligned. Keep. |
| illusionWarning text | **Signal** | Keep. |

### Transmission Pathway
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Transmission Pathway" section label | **Signal** | "Pathway" is slightly jargony. "What breaks first" (sub-head) is clearer. |
| "What breaks first" | **Signal** | Good. |
| "Each row shows when a subsystem first leaves..." | **Signal** | Explains. |
| Legend (Watch / Alert / Critical) | **Signal** | Keep. |
| Pathway rows: label + "Week N" badge | **Signal** | Keep. |
| triggerLabel | **Signal** | Keep. |
| detail | **Signal** | Keep. |
| "Peak" chip | **Signal** | Peak severity. |
| "Active Weeks" chip | **Noise candidate** | Redundant with Peak? "52 active weeks" when Peak is Alert — does it add? Consider removing. |
| "Milestones: watch W1 · alert W2 · critical none" (Advanced) | **Edge** | Diagnostic. Redundant with trigger week. Consider removing. |
| ~~Weekly timeline~~ | **Removed** | Was noise. |

### Sequence view unavailable
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Sequence view unavailable" | **Signal** | Keep. |
| sequenceUnavailableReason (3 variants) | **Signal** | Contextual. Keep. |

### Band Snapshot
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Band snapshot" section label | **Signal** | Keep. |
| "Where guardrails are holding or slipping" | **Signal** | Keep. |
| "5 scored metrics · 1 excluded" | **Signal** | Keep. |
| "Current run" / "Saved run" badge | **Signal** | Keep. |
| 3 band boxes (healthy, watchlist, intervention) | **Signal** | Keep. |
| Duplicate of Stage 1 band counts? | **Edge** | Stage 1 shows early; Stage 3 is full context. Both useful. |

### Threshold Chart
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Threshold chart" | **Signal** | Keep. |
| "100% marks the healthy threshold" | **Signal** | Keep. |
| BarChart | **Signal** | Core. |
| "Lower bars = further from healthy" | **Signal** | Keep. |

### Solvency Trajectory (Advanced)
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Supplementary solvency trajectory" | **Edge** | Keep in Advanced. |
| "Use this only after baseline drift and transmission order" | **Signal** | Sets priority. |
| AreaChart | **Signal** | When available. |
| "Healthy floor 1.3x" / "Intervention floor 0.8x" ref lines | **Signal** | Keep. |
| "Trajectory unavailable" empty state | **Signal** | Keep. |

### Metrics Section
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Metrics" section label | **Signal** | Keep. |
| Per-metric cards | **Signal** | Core. |
| Decorative glow (`blur-2xl opacity-10`) | **Noise** | Per-card. Remove? |
| Metric label (uppercase) | **Signal** | Keep. |
| BandIcon (TrendingUp/Down/Minus) | **Signal** | Visual. |
| Value + unit | **Signal** | Keep. |
| Band badge | **Signal** | Keep. |
| "Derived" badge | **Edge** | When not in applicability. Useful. |
| "Healthy threshold: ≥ 1.30x" | **Signal** | Keep. |
| interpretation (from metricInsights) | **Signal** | Core. |
| "Interpret using guardrail context" fallback | **Edge** | Generic. Could improve. |
| hover:-translate-y-1 | **Edge** | Motion. Optional. |

### Excluded Metrics
| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Excluded metrics" details | **Signal** | When exclusions exist. |
| "These metrics are excluded to avoid unfair scoring" | **Signal** | Keep. |
| "Excluded from scoring" sub-head | **Edge** | Redundant with summary? |
| Per-excluded cards | **Signal** | Keep. |

---

## Stage 4 — Failure Autopsy (DTSESignatureStage)

| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Stage 4 — Failure Autopsy" | **Signal** | Keep. |
| "What went wrong and how it fits the thesis failure patterns" | **Signal** | Good. |
| Empty state: "No Failure Signature Triggered" | **Signal** | Keep. |
| Empty state copy | **Signal** | Keep. |
| "Autopsy summary" | **Signal** | Lead takeaway. |
| leadSignature.label | **Signal** | Keep. |
| leadSignature.pattern | **Signal** | Keep. |
| "N active signatures detected" | **Signal** | Keep. |
| Per-signature cards | **Signal** | Core. |
| Severity icon (AlertOctagon, ShieldAlert, etc.) | **Signal** | Visual. |
| Severity badge | **Signal** | Keep. |
| "Why this matters" | **Signal** | Keep. |
| "Triggered by" (Advanced, trigger_logic) | **Edge** | Power-user. Keep. |
| "Linked metrics" | **Signal** | Connects to Stage 3. |
| animationDelay | **Edge** | Stagger. Optional. |

---

## Stage 5 — Response Paths (DTSERecommendationsStage)

| Element | Verdict | Challenge |
|---------|---------|-----------|
| "Stage 5 — Response Paths" | **Signal** | Keep. |
| "Areas to discuss and tradeoffs to consider, not prescriptions" | **Signal** | Good. |
| Empty state: "No Immediate Response Path" | **Signal** | Keep. |
| "Response Posture" section label | **Edge** | "Posture" is jargony. "Summary" clearer? |
| "Lead response path" | **Signal** | Keep. |
| leadRecommendation.action | **Signal** | Often very long. "Possible response path: test tighter issuance..." — **truncate or shorten** for headline? |
| "Main areas to examine: Tokenomics Review, Treasury..." | **Signal** | uniqueOwners. Keep. |
| Export card | **Signal** | Keep. |
| "Capture this run for discussion or review" | **Signal** | Keep. |
| "N high-priority and M medium/low-priority discussion items" | **Edge** | Useful summary. Could be lighter. |
| "Interpretive Paths" section label | **Edge** | "Interpretive" is academic. "Recommendations" or "Discussion points" clearer? |
| Numbered circles (1, 2, 3) | **Signal** | Order. |
| rec.action | **Signal** | Keep. |
| rec.priority badge | **Signal** | Keep. |
| rec.rationale | **Signal** | Keep. |
| "Expected effect" box | **Signal** | When present. |
| "Context and tradeoffs" details | **Edge** | Dense. Sub-fields: Who, Window, What to compare, Constraint, Risk if delayed, Peer example. Which are critical? Consider surfacing Who + Risk inline; rest in details. |
| "Who should review" | **Signal** | Keep. |
| "Window" | **Edge** | timeframe. When present. |
| "What to compare" | **Signal** | success_metric. |
| "Constraint" | **Signal** | dependency. |
| "Risk if delayed" | **Signal** | Important. |
| "Peer example" | **Signal** | peer_analog. |
| "Protocol insights (optional)" | **Edge** | Keep collapsed. |
| Per-insight: title, observation | **Signal** | Keep. |
| Confidence badge (Advanced) | **Edge** | Model/Derived/Mixed/Curated. Keep. |
| "Why it matters" + "Primary basis" | **Signal** | implication, trigger. |
| "Source trace" (Advanced) | **Edge** | provenance. Keep. |

---

## Export (DTSEDashboard)

| Element | Verdict | Challenge |
|---------|---------|-----------|
| JSON download | **Signal** | Keep. |
| Markdown stakeholder brief | **Signal** | Keep. |
| buildDTSEStakeholderBriefMarkdown content | **Signal** | Full export. |

---

## Cross-Cutting Issues

### Labels & Jargon
| Term | Used | Clearer alternative |
|------|------|---------------------|
| Applicability | Stage 2 | Data Readiness (already subtitle) |
| Interpretation Boundary | Stage 1 | How to read this |
| Run Envelope | Stage 1 Advanced | 52 weeks · 1000 sims |
| Runnable | Stage 2 | Included |
| Proxy accepted | Stage 2 | Data available / Using proxy |
| Transmission Pathway | Stage 3 | What breaks first |
| Response Posture | Stage 5 | Summary |
| Interpretive Paths | Stage 5 | Recommendations / Discussion points |
| Evidence posture | Stage 1 Advanced | (remove or shorten) |
| Matched conditions | Stage 1 Advanced | Baseline comparison |

### Uppercase
Many labels use `font-black uppercase tracking-[0.2em]`. Creates institutional feel. Consider sentence case for secondary labels.

### Decorative Elements
- Background blurs (dashboard)
- Gradient lines (chart cards)
- Per-card glow (metric cards)
- Hover translate effects

**Recommendation:** Audit each. Remove or reduce opacity if they add weight without clarity.

### Redundancy
- Band counts: Stage 1 + Stage 3. Both useful (early + full). Keep.
- "Overall assessment" label: Redundant with verdict title. Remove.
- "Excluded from scoring" sub-head: Redundant with summary. Consider removing.

---

## Live Pass Findings (2025-02-26)

**What was verified in the browser:**

### Advanced toggle
- **Confirmed:** Toggling Advanced On reveals: Run details (Model, Run Envelope, Generated), protocol_id, Evidence posture + Matched conditions boxes, Supplementary data (market + model inputs), Data quality reasons (Stage 2), Milestones (Stage 3), Trigger logic (Stage 4), Solvency trajectory, Protocol insight confidence badges, Source trace.
- **Note:** Model Inputs show "Baseline price input $0" for ONOCOY — possible placeholder or bug. Helium shows "$1.2" correctly.

### Overview mode
- **Confirmed:** All 5 stages render in one scrollable view. Footer shows "Back to Guided". Stage pills remain clickable for scroll-to.
- **Note:** Large DOM (800+ lines in snapshot). No obvious performance issue in quick test.

### Export
- **Confirmed:** Export button triggers download (JSON + MD). **No UI feedback** — no toast, no "Downloaded!" message. User has no confirmation beyond browser download bar.

### Protocol switching
- **Confirmed:** Switching ONOCOY → Helium updates content: protocol name, Surface, Mechanism, Notes, Model Inputs (223M tokens, 625K/week, 370K hotspots, Elastic, $1.2). Assessment band counts can change (e.g. 3/5 → 5/5 when stress channel also changes).

### Stress channel switching
- **Confirmed:** Switching Liquidity Shock → Baseline Neutral updates Stress Channel label and summary. Assessment updates (e.g. "5 of 5 core indicators need attention" with 0/2/3 band split).

### Bugs found (live)
1. **"4 active signature s"** — Snapshot shows space before "s". May be pluralisation or accessibility tree quirk. Verify in DOM.
2. **"price compression is -3827311596.3%"** and **"-82644528.1%"** — Nonsensical percentages in trigger logic (Stage 4/5 Protocol insights). Likely unclamped or wrong unit. **Fix required.**
3. **"Baseline price input $0"** — ONOCOY shows $0; Helium shows $1.2. Check protocol brief data.

---

## Extended Audit (2025-02-26)

**Scope:** All items previously marked "Not verified" plus other tabs, Stress Lab, E2E coverage, protocol packs, evidence badges, skip link, responsive layout, and performance.

### Empty states (Stage 4 & 5)

| Item | Method | Result |
|------|--------|--------|
| Stage 4 no signatures | Code review | `DTSESignatureStage` has empty-state UI: "No Failure Signature Triggered" with Info icon. Triggered when `signatures.length === 0`. Pack data always provides ≥1 signature via `filterFallbackFailureSignaturesByOutcomes` (falls back to `signatures.slice(0, 1)`). **To test:** Would need live run with no stressed metrics or custom pack with empty `failure_signatures`. |
| Stage 5 no recommendations | Code review | `DTSERecommendationsStage` has empty-state UI: "No Immediate Response Path" with Zap icon. `buildLiveDTSERecommendations` returns ≥1 item (low-priority monitoring rec when no signatures fire). **To test:** Would need scenario where both signatures and recommendations are empty. |

### Sequence view & excluded metrics

| Item | Method | Result |
|------|--------|--------|
| Sequence view unavailable | Code review | `buildDTSESequenceView` returns `null` when `liveAggregated` or `liveBaselineAggregated` is empty. Pack-only mode (no simulation) has both empty → `sequenceView` is null. `DTSEOutcomesStage` shows "Sequence view unavailable" with `sequenceUnavailableReason`. **Confirmed in E2E:** `dtse-flow.cy.ts` expects `hasChart \|\| hasLoading \|\| hasUnavailable`. |
| Excluded metrics section | Code review | `excludedOutcomes = outcomes.filter(o => applicability entry verdict !== 'R')`. `buildLiveDTSEApplicability` can exclude e.g. `vampire_churn` when `competitorYield === 0`. Pack applicability uses `standardApplicability()` — all 'R' unless overridden. **To test:** Run with `competitive_yield_pressure` stress and check Stage 2/3 for excluded metrics. |

### Loading state

| Item | Method | Result |
|------|--------|--------|
| Loading state | Code review | `DTSEOutcomesStage` has `isLoading` prop; shows "Loading stress charts" when true. `DTSEDashboard` passes `isLoading` from simulation runner state. **To test:** Run simulation and observe Stage 3 during run. |

### Error boundary

| Item | Method | Result |
|------|--------|--------|
| Error boundary fallback | Code review | `ErrorBoundary` wraps `DTSEDashboard` in `index.tsx`. **To test:** Inject a render error (e.g. throw in component) and verify fallback UI. |

### Keyboard / screen reader

| Item | Method | Result |
|------|--------|--------|
| Keyboard navigation | E2E | `dtse-a11y.cy.ts` passes: stage nav keyboard accessible (Enter on Next/Prev), focus management on transitions, tab participates in tab nav. `keyboard-access.cy.ts` passes: canonical journey, ARIA semantics. |
| Skip link | Browser | "Skip to stage content" link exists in a11y tree (ref e9). **Not clickable** in snapshot — `opacity: 0` (visually hidden until focus). Standard skip-link pattern for screen readers. |

### Responsive layout

| Item | Method | Result |
|------|--------|--------|
| Mobile viewport (375×667) | Browser | Resized to 375×667. All tabs, Stress Lab controls, and content render. No formal breakpoint audit. Layout is dense; horizontal scroll or overflow may occur on narrow screens. |

### Other tabs (Benchmark, Root Causes, Strategy, Decide, Evidence)

| Tab | Label | Method | Result |
|-----|-------|--------|--------|
| Benchmark | Benchmark | Browser | Tab exists; not fully exercised in this pass. E2E `app-shell.cy.ts` switches to it. |
| Root Causes | Root Causes | Browser | Tab exists (diagnostic). |
| Strategy | Strategy | Browser | Tab exists (thesis). |
| Decide | Decide | Browser | Tab exists (decision_tree). |
| Evidence | Evidence | Browser | Tab exists (case_study). Case study content (Onocoy narrative, charts) renders. |

### Stress Lab / Simulator

| Item | Method | Result |
|------|--------|--------|
| Open Stress Lab | Browser | Actions menu (Evidence tab) → "Open Stress Lab" → opens Advanced workspace with Stress Lab tab selected. Browse, Compare, Stress Lab sub-tabs visible. Analyst Suite, stress controls, presets, tokenomics, protocol selector all render. |
| Back to Evidence | Browser | Actions → "Back to Evidence" returns to case-study narrative. |

### E2E coverage

| Spec | Tests | Pass | Fail |
|------|-------|------|------|
| app-shell.cy.ts | 4 | 4 | 0 |
| dtse-a11y.cy.ts | 5 | 5 | 0 |
| dtse-flow.cy.ts | 9 | 9 | 0 |
| global-state-sync.cy.ts | 1 | 1 | 0 |
| keyboard-access.cy.ts | 2 | 2 | 0 |
| review-rehearsal.cy.ts | 1 | 0 | 1 |
| **Total** | **22** | **21** | **1** |

**review-rehearsal failure:** `[data-cy="decision-tree-root"]` not found when navigating: case_study → Open Stress Lab → Return to Evidence → Decide tab. Decision tree may not render in that flow (timing, state, or conditional render).

### Protocol packs

| Source | Count | Method |
|--------|-------|--------|
| DTSE_PROTOCOL_PACKS | 14 | `Object.keys(DTSE_PROTOCOL_PACKS)` in dtseContent.ts |
| Protocol select options | ONOCOY, Helium, Render, Filecoin, Akash, Hivemapper, DIMO, Grass, io.net, Nosana, Geodnet, Aleph, XNET | Browser snapshot (Evidence tab, DTSE protocol select) |

All 14 packs have `buildDTSEProtocolPack` coverage per `dtseContent.test.ts`.

### Evidence badge states

| State | Source | When |
|-------|--------|------|
| complete | `buildRunContext` (pack), `buildLiveDTSERunContext` (when liveOutputs complete) | Default for pack; live when all metrics available |
| partial | `buildLiveDTSERunContext` in dtseLiveOutputs.ts | When live run has gaps (e.g. missing baseline) |
| missing | Decision brief / evidence policy | When evidence refs are missing or non-runnable |

Evidence badge (complete/partial/missing) is shown in DTSE run strip **only when Advanced is On**. Pack-only runs use `evidence_status: 'complete'` from `buildRunContext`.

### API features (GEMINI_API_KEY, DUNE_API_KEY)

| Feature | Location | Status |
|---------|----------|--------|
| AI insights | Benchmark / AIInsights | Optional; requires GEMINI_API_KEY |
| Live on-chain data | useProtocolMetrics, Dune | Optional; requires DUNE_API_KEY |

Not exercised in this audit (no keys in env). Dashboard works fully without them per AGENTS.md.

### Performance

| Item | Method | Result |
|------|--------|--------|
| Tab switch | index.tsx | `recordPerf('tab-switch', ...)` in useEffect. No profiling run. |
| DTSE render | — | No CPU profiling. Large DOM in Overview mode (800+ lines) — no obvious lag in quick test. |

### Audit coverage summary

| Category | Checked | Method |
|----------|---------|--------|
| Empty states | Code | DTSESignatureStage, DTSERecommendationsStage have UI; pack data prevents empty in normal flow |
| Sequence view | Code + E2E | Null when no live data; "Sequence view unavailable" shown |
| Excluded metrics | Code | buildLiveDTSEApplicability can exclude; pack uses standard |
| Loading state | Code | isLoading prop, "Loading stress charts" |
| Error boundary | Code | ErrorBoundary wraps DTSEDashboard |
| Keyboard / a11y | E2E + Browser | dtse-a11y, keyboard-access pass; skip link exists (opacity 0) |
| Responsive | Browser | 375×667 renders; no breakpoint audit |
| Other tabs | Browser | All 6 tabs exist and switch |
| Stress Lab | Browser | Actions → Open Stress Lab works |
| E2E | Terminal | 21/22 pass; review-rehearsal fails |
| Protocol packs | Code + Browser | 14 packs; select shows 13 options |
| Evidence badge | Code | complete/partial/missing; Advanced only |
| API features | — | Not tested (no keys) |
| Performance | — | No profiling |

---

## Summary: High-Impact Changes

### Remove
- [ ] "Overall assessment" sub-label (Stage 1)
- [ ] "Active Weeks" chip (Stage 3 pathway rows) — if Peak suffices
- [ ] "Overview mode: all stages visible" footer text — or shorten to "All stages"
- [ ] Decorative blurs (or reduce opacity)

### Fix (bugs from live pass)
- [ ] "signature s" pluralisation (Stage 4) — DTSESignatureStage line 90: `{activeCount} active signature{activeCount === 1 ? '' : 's'}` is correct; "signature s" may be a11y tree quirk
- [ ] "price compression" nonsensical percentages — `dtseLiveSignatures.ts` line 56: `priceCompressionPct = ((firstPrice - lastPrice) / firstPrice) * 100`; when `firstPrice` is tiny or values extreme, result is unbounded. Clamp to e.g. ±999%.
- [ ] "Baseline price input $0" for ONOCOY (protocol brief data)
- [ ] Export: add feedback (toast or "Downloaded" message)
- [ ] review-rehearsal E2E: decision-tree-root not found after Evidence → Stress Lab → Return → Decide flow

### Simplify
- [ ] Lead recommendation headline (Stage 5) — truncate or shorten
- [ ] "Metric intent" — single glossary vs 6 per-row details (Stage 2)
- [ ] "Context and tradeoffs" — surface Who + Risk; rest in details (Stage 5)

### Clarify
- [ ] "Runnable" → "Included" (Stage 2)
- [ ] "Proxy accepted" → "Data available" or "Using proxy" (Stage 2)
- [ ] "Interpretation Boundary" → "How to read this" (Stage 1)
- [ ] "Response Posture" → "Summary" (Stage 5)
- [ ] "Interpretive Paths" → "Recommendations" (Stage 5)

### Demote / Collapse
- [ ] Evidence posture + Matched conditions (Stage 1) — already in Advanced
- [ ] Milestones line (Stage 3) — already in Advanced; consider removing (redundant with trigger week)

---

## Completed

- Weekly timeline removed (Stage 3)
- Band snapshot, threshold chart, pathway legend promoted to default (Stage 3)
- Live pass (2025-02-26): Advanced toggle, Overview mode, Export, protocol/stress switching verified; bugs and gaps documented above
- Extended audit (2025-02-26): Empty states, sequence view, excluded metrics, loading, error boundary, keyboard/a11y, responsive, other tabs, Stress Lab, E2E (21/22 pass), protocol packs, evidence badge, API features, performance — all documented in [Extended Audit](#extended-audit-2025-02-26)
