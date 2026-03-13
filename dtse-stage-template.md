# DTSE Stage Template

Purpose: define one repeatable grammar for all DTSE stages so each stage answers a distinct analytical question without UI drift.

Reference system docs:

- `dtse-design-system.md`
- `dtse-component-inventory.md`

## A. Shared Page Grammar

Every DTSE stage screen should use this base structure:

1. `AppShell`
2. `StageHeader` (+ `ModeToggle`)
3. `StageTabs`
4. Stage framing strip (stage summary + metadata chips + summary stats)
5. Main evidence area (`main column`)
6. Right rail support stack (`right rail`)
7. Support or boundary note section (main column lower)
8. `FooterNote`

### Fixed vs variable elements

Must stay fixed:

- App shell geometry
- Sidebar behavior
- Header and tabs location
- Main/rail split philosophy
- Token system and type scale
- Chart language

May vary per stage:

- Primary evidence type
- Summary labels and microcopy
- Specific rail modules
- Support-note wording

## B. Stage-by-Stage Intent

## Stage 1 — Context

- Analytical question: What run context am I reading, and what is trusted before scoring?
- User mental state: orienting and trust-setting.
- Primary evidence type: framing narrative + baseline drift context.
- Expected summary: protocol/stress/confidence and coverage snapshot.
- Likely right-rail content:
  - risk summary
  - confidence composition
  - signal strength
  - next inspection starter
- Support section likely needed: interpretation boundaries.
- Reuse components first:
  - `RunBriefingCard`
  - `SummaryStatCard`
  - `ChartCard`
  - `EvidenceScoringCard`
  - `InterpretationBoundariesPanel`
- Potential justified new component: none unless context source traceability needs a compact provenance row.

## Stage 2 — What Can Be Scored

- Analytical question: Which metrics are fairly scoreable in this run and which are held out?
- User mental state: evaluating fairness and evidence sufficiency.
- Primary evidence type: scored-vs-held-out matrix with rationale.
- Expected summary: coverage count, scored count, held-out count, confidence basis.
- Likely right-rail content:
  - quality caveat summary
  - evidence composition
  - metric reliability ordering
  - what to validate before comparing protocols
- Support section likely needed: scoring boundary notes.
- Reuse components first:
  - `SummaryStatCard`
  - `EvidenceScoringCard`
  - `ConfidenceCompositionCard`
  - `MetricSignalStrengthCard`
  - `InterpretationBoundariesPanel`
- Potential justified new component: `MetricInclusionRuleTable` if tag-based blocks are insufficient.

## Stage 3 — What Broke First

- Analytical question: What fails first and how does pressure propagate through metrics?
- User mental state: tracing failure order and timing.
- Primary evidence type: failure sequence visualization + supporting metric cards.
- Expected summary: first-break family, trigger week, containment vs escalation.
- Likely right-rail content:
  - first-break summary
  - trigger confidence
  - key thresholds crossed
  - follow-up checks
- Support section likely needed: sequence interpretation caveats.
- Reuse components first:
  - `ChartCard` (or sequence chart equivalent)
  - `RiskSummaryCard`
  - `MetricSignalStrengthCard`
  - `NextInspectionCard`
- Potential justified new component: `FailureSequenceTable` with strict row hierarchy.

## Stage 4 — Failure Patterns

- Analytical question: Which pattern best explains the observed failure cluster?
- User mental state: moving from sequence to interpretation.
- Primary evidence type: primary pattern story + linked metrics.
- Expected summary: lead pattern and downstream pattern chain.
- Likely right-rail content:
  - run impact
  - visible damage metrics
  - confidence caveat
  - comparative context pointer
- Support section likely needed: pattern interpretation boundaries.
- Reuse components first:
  - `RunBriefingCard` (adapted as pattern story card)
  - `RiskSummaryCard`
  - `EvidenceScoringCard`
  - `InterpretationBoundariesPanel`
- Potential justified new component: `PatternChainCard` for ordered propagation logic.

## Stage 5 — Next Tests

- Analytical question: What reruns should happen next and why?
- User mental state: converting interpretation into disciplined testing.
- Primary evidence type: ranked rerun recommendations with success criteria.
- Expected summary: lead next test + rationale + owners.
- Likely right-rail content:
  - run focus counts
  - export/share
  - risk-if-ignored summary
  - scheduling/timing hints
- Support section likely needed: protocol-specific interpretation notes.
- Reuse components first:
  - `NextInspectionCard`
  - `RiskSummaryCard`
  - `ConfidenceCompositionCard` (optional)
  - `InterpretationBoundariesPanel` (as protocol meaning notes)
- Potential justified new component: `RerunRecommendationCard` if needed for owner/timing/criteria block.

## C. Variation Rules

### Must remain consistent across all stages

1. Shell geometry and sidebar behavior.
2. Spacing system and token usage.
3. Typography scale hierarchy.
4. Card role hierarchy (`primary/secondary/support/note`).
5. Stage tabs style and order.
6. Chart language and annotation discipline.
7. Right rail support philosophy.
8. Chip/tag style family.
9. Footer note tone.

### May vary by stage

1. Chart type (line, sequence, distribution, decomposition).
2. Evidence module format (matrix, timeline, pattern table).
3. Summary labels and metric names.
4. Support-note wording.
5. Risk framing language.
6. Right-rail module content details.

## D. Per-Stage Composition Rules

1. Avoid oversized empty regions in main evidence column.
2. Main evidence must dominate visually over rail support.
3. Use support/note modules to close composition gaps when needed.
4. Do not overload right rail with more than 3-4 substantial modules.
5. Support notes must remain visually quieter than core evidence.
6. Preserve narrative flow:
   - framing
   - evidence
   - interpretation
   - next action
7. If composition feels imbalanced at 67% zoom, adjust section density before adding new motifs.

## E. How to Build a New DTSE Stage Without Drift

1. Define the stage question in one sentence.
2. Map required content to existing inventory components.
3. Identify missing needs only after reuse mapping.
4. Validate layout against `dtse-design-system.md` hierarchy and tokens.
5. Implement with DTSE tokens only (no local palette invention).
6. Review at `100%`, `67%`, and `50%` zoom.
7. If a new component was introduced:
   - document in `dtse-component-inventory.md`
   - assign priority role
   - define placement and anti-patterns
8. Run visual QA:
   - main evidence prominence
   - right rail discipline
   - chart language compliance
   - no motif drift
