# DTSE Dashboard UI/UX Rules — V1

Version: 1.0  
Status: Draft  
Last updated: 2026-02-26

---

## 1. DTSE as Primary Tab / Default Landing

- DTSE **must** be the first tab in the primary tab bar.
- On initial load, the DTSE tab is `aria-selected="true"` and the DTSE dashboard root is immediately visible.
- The tab label is **"DTSE"** — never "Thesis", "Stress Test", or other legacy names.
- `data-cy="tab-dtse"` is the test selector for the DTSE tab button.

---

## 2. Stage Progression UX

### Navigation Controls

- **Next**: `data-cy="dtse-next-stage"` — advances to the next stage.
- **Previous**: `data-cy="dtse-prev-stage"` — returns to the prior stage.
- Both buttons must be keyboard-accessible (`Enter` and `Space` activate).
- The previous button is hidden (not rendered) on Stage 1.
- The next button is replaced by a "Finalize" or "Export" action on the final stage.

### Stage Containers

- Each stage has a root container: `data-cy="dtse-stage-{n}"` where `n` is 1–5 (or up to 6 if all stages are rendered).
- Only the active stage is visible; inactive stages are not rendered or are `display: none`.
- Stage transitions should be instantaneous (no animated transitions in V1).

### Progress Indicator

- A lightweight stage progress indicator (e.g., step dots or a numbered bar) is shown above the stage content.
- The current stage is visually distinct from completed and upcoming stages.

---

## 3. Run Context Strip

- A persistent strip is displayed below the tab bar and above stage content.
- The strip shows: `protocol_id`, `run_id` (truncated), `evidence_status` badge, `horizon_weeks`, `n_sims`, `generated_at_utc`.
- The evidence status uses color-coded badges:
  - `complete` → green
  - `partial` → amber/yellow
  - `missing` → red
- The strip does **not** scroll with stage content; it remains fixed.

---

## 4. Chart Density Rules

- DTSE stages 4 and 5 may contain charts (outcome distributions, failure heatmaps).
- Maximum of **3 charts per stage viewport** to avoid cognitive overload.
- Charts should use consistent color scales from the existing Recharts/Chart.js configuration.
- All charts must have a descriptive title and axis labels.

---

## 5. Keyboard Navigation Requirements

- All interactive elements within DTSE must be reachable via `Tab` key.
- Tab bar navigation follows WAI-ARIA Tabs pattern: `ArrowLeft` / `ArrowRight` to move between tabs, `Enter` / `Space` to activate.
- Stage navigation buttons respond to `Enter` and `Space`.
- Focus must be managed on stage transitions: after advancing to a new stage, focus should move to the first interactive element or the stage heading.
- Skip-link or landmark-based navigation should be available for screen reader users.

---

## 6. Legacy Tabs Under "Advanced"

- Existing tabs (Benchmark, Root Causes, Strategy, Decide, Evidence) move to a secondary "Advanced" tab group.
- The Advanced group is collapsed by default and opened via an "Advanced" toggle or dropdown.
- Advanced tabs retain their existing `data-cy` selectors and ARIA attributes.
- The Stress Lab / Simulator is still accessible via **Actions > Open Stress Lab** from any tab, including DTSE.

---

## 7. Naming Conventions

| Term | Use | Avoid |
|------|-----|-------|
| DTSE | Primary name for the workflow | "Thesis", "Stress Test Evaluation" |
| Stage | Each step in the DTSE workflow | "Step", "Phase", "Tab" (within DTSE) |
| Bundle | Pre-computed evaluation artifact | "Snapshot", "Cache" |
| Run Context | Metadata for a specific DTSE execution | "Config", "Settings" |
| Applicability | R/NR classification | "Eligibility", "Readiness" |
| Peer Analogs | Cross-protocol comparison set | "Competitors", "Comps" |

---

## 8. Responsive Considerations (V1)

- DTSE targets desktop-first (minimum 1280px viewport width).
- The stage navigation buttons should remain visible without scrolling.
- On viewports below 1024px, a single-column layout is acceptable for stage content.
- Mobile support is out of scope for V1.

---

_End of DTSE Dashboard UI/UX Rules V1._
