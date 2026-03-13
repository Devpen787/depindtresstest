# DTSE Component Inventory

Baseline source: `public/dtse-theme-mock-light.html` (third-pass polish).  
Purpose: define reusable components and prevent stage-by-stage UI drift.

## Inventory Rules

- Every DTSE screen must be assembled from this inventory first.
- Each component must have a declared priority role:
  - `shell`
  - `primary`
  - `secondary`
  - `support`
  - `note`
- If a screen needs a new component, follow `New component policy` at bottom.

---

## AppShell

- Purpose: global frame for all DTSE stages.
- Priority: `shell`
- Where used: every stage screen.
- Typical content: sidebar + main content container.
- Layout behavior: `220px` sidebar + fluid content; responsive collapse on tablet.
- Style rules: neutral shell background, thin outer border, restrained shadow.
- Reuse guidance: never replace per stage.
- Must stay consistent: shell geometry, sidebar position, outer spacing.
- May vary by stage: none.
- Column ownership: both.

## SidebarNav

- Purpose: stable stage-adjacent navigation context.
- Priority: `shell`
- Where used: left rail in all stages.
- Typical content: brand label + vertical nav links.
- Layout behavior: fixed rail in desktop; compact top section in smaller layouts.
- Style rules: calm navy gradient, subtle active item tint + accent bar.
- Reuse guidance: keep visual weight below content.
- Must stay consistent: width, tone family, active-state pattern.
- May vary by stage: active link only.
- Column ownership: shell rail.

## StageHeader

- Purpose: establish stage identity and framing.
- Priority: `primary`
- Where used: top of main content.
- Typical content: stage label, title, subtitle.
- Layout behavior: left-aligned content + right-aligned mode control.
- Style rules: strongest type after run briefing/chart.
- Reuse guidance: keep concise; one subtitle sentence.
- Must stay consistent: title hierarchy and spacing.
- May vary by stage: stage name and subtitle copy.
- Column ownership: main.

## ModeToggle

- Purpose: switch viewing mode without competing with stage workflow.
- Priority: `support`
- Where used: right side of `StageHeader`.
- Typical content: `Guided`, `Overview`, `More Off`.
- Layout behavior: segmented control.
- Style rules: compact control with soft active tint.
- Reuse guidance: keep secondary to stage title.
- Must stay consistent: segment style and active affordance.
- May vary by stage: selected mode.
- Column ownership: main header.

## StageTabs

- Purpose: represent cross-stage workflow progression.
- Priority: `secondary`
- Where used: below stage header.
- Typical content: 5 tabs (`Context` → `Next Tests`).
- Layout behavior: equal-width grid tabs.
- Style rules: quiet inactive tabs; clear active state with subtle progression cue.
- Reuse guidance: use as workflow, not decorative nav.
- Must stay consistent: tab order, labels, equal rhythm.
- May vary by stage: active tab only.
- Column ownership: main.

## MetaChipRow

- Purpose: compact metadata context for current run.
- Priority: `support`
- Where used: summary strip top-right.
- Typical content: protocol, stress, confidence, likely break.
- Layout behavior: wrapped row with compact pills.
- Style rules: low-contrast metadata chips.
- Reuse guidance: max 4-6 chips; avoid badge walls.
- Must stay consistent: chip sizing and tone.
- May vary by stage: chip labels/values.
- Column ownership: main.

## SummaryStatCard

- Purpose: provide fast run-state snapshot.
- Priority: `secondary`
- Where used: summary strip cards.
- Typical content: label, value, one-line explanation.
- Layout behavior: equal-height 4-card row.
- Style rules: clean rhythm, restrained semantic color on value only.
- Reuse guidance: do not convert into narrative cards.
- Must stay consistent: card size, type rhythm, padding.
- May vary by stage: metrics and semantic state.
- Column ownership: main.

## RunBriefingCard

- Purpose: primary interpretive anchor of the stage.
- Priority: `primary`
- Where used: below summary stats.
- Typical content: briefing label, headline, interpretation paragraph, protocol meta stack.
- Layout behavior: split content (`main text` + `meta stack`) in desktop.
- Style rules: strongest surface and type emphasis after page title.
- Reuse guidance: headline concise and analytical, not promotional.
- Must stay consistent: two-zone structure and dominant role.
- May vary by stage: briefing text and stage interpretation focus.
- Column ownership: main.

## ProtocolMetaStack

- Purpose: compact factual context supporting briefing.
- Priority: `support`
- Where used: right side inside `RunBriefingCard`.
- Typical content: 3 compact items (`Protocol`, `Stress`, `Likely Pressure`).
- Layout behavior: vertical stack.
- Style rules: subordinate to briefing copy (smaller, lower contrast).
- Reuse guidance: keep compact; avoid turning into equal-weight cards.
- Must stay consistent: item rhythm and compact tone.
- May vary by stage: field labels/values.
- Column ownership: main (inside briefing).

## ChartCard

- Purpose: primary evidence object.
- Priority: `primary`
- Where used: top of main evidence column.
- Typical content: title, subtitle, legend, plotted data, threshold annotation.
- Layout behavior: full-width in main column.
- Style rules: clear chart header, restrained plot frame, limited annotation.
- Reuse guidance: one primary chart per stage unless proven otherwise.
- Must stay consistent: chart language and annotation discipline.
- May vary by stage: chart type and axis semantics.
- Column ownership: main.

## EvidenceScoringCard

- Purpose: explicit scored/held-out evidence structure.
- Priority: `secondary`
- Where used: below chart.
- Typical content: card title, subtitle, two evidence blocks, tags.
- Layout behavior: split support blocks.
- Style rules: clearer than note panels, quieter than primary cards.
- Reuse guidance: keep evidence factual and compact.
- Must stay consistent: scored vs held-out split.
- May vary by stage: evidence modules and tags.
- Column ownership: main.

## InterpretationBoundariesPanel

- Purpose: clarify analytical boundaries and prevent overclaim.
- Priority: `note`
- Where used: below `EvidenceScoringCard`.
- Typical content: short list of boundaries with concise statements.
- Layout behavior: compact panel with divider-list items.
- Style rules: quietest support treatment among main-column modules.
- Reuse guidance: use only for scope/boundary caveats.
- Must stay consistent: note-like visual rank and brevity.
- May vary by stage: boundary statements.
- Column ownership: main.

## RiskSummaryCard

- Purpose: capture primary risk narrative for rapid scan.
- Priority: `secondary`
- Where used: top of right rail.
- Typical content: title, controlled-emphasis risk sentence, supporting mini stats.
- Layout behavior: compact rail card with mini stat row.
- Style rules: risk emphasis via structure and hierarchy, not alarm color blocks.
- Reuse guidance: keep sentence concise and interpretable.
- Must stay consistent: placement at top of rail.
- May vary by stage: risk message/stat labels.
- Column ownership: right rail.

## ConfidenceCompositionCard

- Purpose: summarize confidence composition of evidence quality.
- Priority: `support`
- Where used: right rail.
- Typical content: title, subtitle, composition bar, percent rows.
- Layout behavior: vertical stack.
- Style rules: restrained semantics, minimal chrome.
- Reuse guidance: avoid decorative charts when composition bar is clearer.
- Must stay consistent: composition layout and row labeling.
- May vary by stage: split percentages.
- Column ownership: right rail.

## MetricSignalStrengthCard

- Purpose: compare reliability/strength across key metrics.
- Priority: `support`
- Where used: right rail.
- Typical content: title, subtitle, aligned metric rows + progress bars + percentages.
- Layout behavior: compact row stack.
- Style rules: system-like bar treatment (not gamified).
- Reuse guidance: max 3-6 rows.
- Must stay consistent: row alignment and bar scale style.
- May vary by stage: metric names and values.
- Column ownership: right rail.

## NextInspectionCard

- Purpose: provide disciplined follow-up reading/actions.
- Priority: `support`
- Where used: lower right rail.
- Typical content: title, subtitle, ordered list of concise next checks.
- Layout behavior: list with subtle separators.
- Style rules: compact and procedural.
- Reuse guidance: do not turn into large narrative cards.
- Must stay consistent: ordered list structure.
- May vary by stage: action sequence.
- Column ownership: right rail.

## FooterNote

- Purpose: low-priority metadata/disclaimer.
- Priority: `note`
- Where used: bottom of stage page.
- Typical content: one muted line.
- Layout behavior: full-width, minimal height.
- Style rules: muted text only.
- Reuse guidance: no meaningful analysis here.
- Must stay consistent: quiet tone.
- May vary by stage: note copy.
- Column ownership: full-width bottom.

---

## New Component Policy

A new DTSE component is allowed only when all conditions are met:

1. Existing inventory components cannot serve the use case without distortion.
2. New component declares priority role (`primary`, `secondary`, `support`, `note`, `shell`).
3. New component uses existing DTSE tokens for color, spacing, radius, typography.
4. New component follows chart/rail hierarchy rules from `dtse-design-system.md`.
5. New component is documented in this file before multi-stage reuse.
6. New component must not introduce a new visual language.
7. New component must include:
   - placement rule (main vs rail)
   - allowed content density
   - anti-patterns

Rejection rule:

- If a proposed component is a one-off styling wrapper or decorative motif, do not add it.
