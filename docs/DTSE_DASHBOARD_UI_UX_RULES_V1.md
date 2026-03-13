# DTSE Dashboard UI/UX Rules — V1

Version: 1.1  
Status: Draft  
Last updated: 2026-02-26

---

## Thesis Alignment

DTSE supports the thesis *DePIN Tokenomics Under Stress* (CAS Blockchain, HSLU). The dashboard is designed to defend the thesis’s evaluative stance:

- **Stress transmission over binary labels** — Robustness is understood through where stress appears first and how it propagates, not stable/unstable labels. Stage 3 leads with baseline drift and transmission pathway (“what breaks first”).
- **Comparative, not predictive** — DTSE does not forecast price or assign universal ranks. The Interpretation Boundary box states this explicitly.
- **Stress channels** — Demand contraction, liquidity shock, competitive-yield pressure, and provider-cost inflation map to the thesis’s stress constructs.
- **Latent stress** — The “DePIN Illusion” warning reflects that participation metrics can lag underlying economic deterioration.

Design choices (sequence-first Stage 3, Interpretation Boundary, stress channel selector, **More** toggle) exist to support this stance.

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
- **Previous**: `data-cy="dtse-prev-stage"` — returns to the prior stage. On Stage 1, the Previous button is **disabled** (not hidden) to preserve layout and communicate availability.
- Both buttons must be keyboard-accessible (`Enter` and `Space` activate).
- On the final stage, Next is disabled. Export is available in Stage 5 content, not as a replacement for the footer Next button.

### Stage Containers

- Each stage has a root container: `data-cy="dtse-stage-panel-{n}"` where `n` is 1–5.
- In **guided mode**, only the active stage is visible.
- In **overview mode**, all stages are visible in a scrollable list.
- Stage transitions are instantaneous in V1.

### Progress Indicator

- A stage indicator bar shows numbered pills for each stage (Protocol Context, Applicability, Outcomes, Failure Autopsy, Response Paths).
- The current stage is visually distinct from completed and upcoming stages.
- Stage labels are always visible (no `hidden sm:inline`).

---

## 3. Run Context Strip

- A persistent strip is displayed below the tab bar and above stage content.
- The strip shows: **Protocol selector**, **Stress channel selector**, and (when **More** is on) **Evidence status** badge.
- **More toggle** — Evidence status, run details, and supplementary charts are behind More to reduce default cognitive load.
- The strip does **not** scroll with stage content; it remains fixed.
- Evidence status uses color-coded badges: `complete` → green, `partial` → amber, `missing` → red.

---

## 4. Stage Content

- **Stage 1** — Protocol context, Interpretation Boundary, assessment verdict, stress channel.
- **Stage 2** — Applicability (Included/Excluded) with metric intent in expandable details.
- **Stage 3** — Sequence-first: baseline drift chart, transmission pathway, band snapshot, threshold chart, then metrics. Solvency trajectory remains behind **More**.
- **Stage 4** — Failure Autopsy (signatures with severity).
- **Stage 5** — Response Paths (recommendations) and Export.

---

## 5. Keyboard Navigation Requirements

- All interactive elements within DTSE must be reachable via `Tab` key.
- Stage tabs follow WAI-ARIA Tabs pattern: `ArrowLeft` / `ArrowRight` to move between stages, `Enter` / `Space` to activate.
- Stage navigation buttons respond to `Enter` and `Space`.
- Focus must be managed on stage transitions.
- A skip-link or landmark-based navigation should be available for screen reader users.

---

## 6. Naming Conventions

| Term | Use | Avoid |
|------|-----|-------|
| DTSE | Primary name for the workflow | "Thesis", "Stress Test Evaluation" |
| Stage | Each step in the DTSE workflow | "Step", "Phase", "Tab" (within DTSE) |
| Bundle | Pre-computed evaluation artifact | "Snapshot", "Cache" |
| Run Context | Metadata for a specific DTSE execution | "Config", "Settings" |
| Applicability | Included/Excluded classification | "Eligibility", "Readiness" |
| Peer Analogs | Cross-protocol comparison set | "Competitors", "Comps" |
| Failure Autopsy | Stage 4 name | "Failure Signature" |
| Response Paths | Stage 5 name | "Recommendations" |

---

## 7. Responsive Considerations (V1)

- DTSE targets desktop-first (minimum 1280px viewport width).
- The stage navigation buttons should remain visible without scrolling.
- On viewports below 1024px, a single-column layout is acceptable for stage content.
- Mobile support is out of scope for V1.

---

## 8. Protocol Selector

- Only protocols with a DTSE pack are shown in the selector.
- If the active profile has no pack, the dashboard falls back to the first available protocol.

---

## 9. Typography Scale (Phase 7)

| Role | Size | Weight | Use |
|------|------|--------|-----|
| H1 (stage title) | text-2xl | font-black | Verdict title, protocol name |
| H2 (section) | text-sm | font-bold | Section headers (e.g. Baseline drift, Metrics) |
| H3 (card title) | text-base | font-black | Card headings, recommendation actions |
| Body | text-sm | font-medium | Body copy, rationale |
| Caption | text-xs | font-bold / font-semibold | Labels, badges |

---

## 10. Colour Palette (Phase 6–7)

| Role | Token | Use |
|------|-------|-----|
| Background | slate-950 | Page, cards |
| Card border | border-white/10 | Subtle borders |
| Primary text | text-slate-100, text-white | Headings, key values |
| Secondary text | text-slate-300, text-slate-400 | Labels, descriptions |
| Status healthy | emerald-400, emerald-500 | Included, healthy band |
| Status watchlist | amber-300, amber-400 | Watchlist band |
| Status intervention | rose-300, rose-400 | Excluded, intervention band |
| Interactive | indigo-500, indigo-400 | Buttons, links, focus ring |

---

## 11. Design Tokens (Phase 7)

- **Card radius:** `rounded-2xl` for primary cards, `rounded-lg` for nested cards.
- **Spacing:** `space-y-5`, `gap-3` for section spacing; `p-4`, `p-5` for card padding.
- **Focus:** `focus:ring-2 focus:ring-indigo-500` on all interactive elements.
- **Touch targets:** Minimum 44×44px for primary actions (Export, Next, Previous).
- **Responsive breakpoints:** sm 640px, md 768px, lg 1024px, xl 1280px. DTSE targets xl-first; single-column acceptable below lg.

---

_End of DTSE Dashboard UI/UX Rules V1._
