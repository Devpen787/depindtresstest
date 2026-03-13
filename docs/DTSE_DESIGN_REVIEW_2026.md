# DTSE Tab Design Review — Feb 2026

**Goal:** Make the DTSE tab readable, nice to look at, learnable, and not over-complicated.

---

## Stage-by-stage findings

### Stage 1 — Protocol Context
**Strengths:** Interpretation Boundary is clear. Assessment verdict (healthy/watchlist/intervention) is prominent. Protocol card is informative.

**Issues:**
- Dense nested layout: Assessment card contains two columns with multiple sub-cards (Surface, Mechanism, Notes). Feels box-heavy.
- "Run details" (Model, Run Envelope, Generated) hidden behind Advanced — useful context for power users; could be visible but subtle.
- "Additional protocol context" is optional — good.

### Stage 2 — Data Readiness (Applicability)
**Strengths:** Green/red for Included/Excluded is clear. Runnable count is visible.

**Issues:**
- "Data Readiness" vs "Applicability Decisions" — slight label mismatch.
- "Proxy accepted" is jargon; "Data available" or "Included" is friendlier.
- "Metric intent" is a details in every row — adds cognitive load; could be inline or a single glossary.

### Stage 3 — Stress Results (Outcomes)
**Strengths:** Baseline drift and transmission pathway lead. DePIN Illusion warning is good. Metrics cards at bottom are clear.

**Issues:**
- **Band snapshot** (healthy/watchlist/intervention counts) hidden in Advanced — core to understanding.
- **Threshold chart** hidden in Advanced — shows "who's slipping" at a glance.
- **Pathway legend** (Watch/Alert/Critical) hidden in Advanced — users see colours but can't interpret.
- "More diagnostics available" teaser when Advanced is off — feels like a dead end.
- Transmission pathway rows are dense; each has multiple chips.

### Stage 4 — Failure Autopsy
**Strengths:** Autopsy summary + signature cards. Empty state is clear.

**Issues:**
- Typo: "3 active signature s" → "signatures".
- "Classify the breakdown" — slightly academic; "What went wrong" is more approachable.

### Stage 5 — Response Paths
**Strengths:** Lead response + Export. Collapsible "Context and tradeoffs".

**Issues:**
- Lead recommendation text is very long: "Possible response path: test tighter issuance discipline..." — could be shortened for the headline.
- Protocol insights collapsed — good.

---

## Cross-cutting concerns

1. **UPPERCASE LABELS** — Everywhere. Creates institutional, shouty feel. Consider sentence case for secondary labels.
2. **Box nesting** — Many `rounded-2xl border border-white/10 bg-slate-900/xx` — visual noise.
3. **Jargon** — Applicability, Interpretation Boundary, Run envelope, Proxy accepted — some humanisation would help.
4. **Advanced toggle** — Overused. Core content (band snapshot, threshold chart, pathway legend) should be visible by default.

---

## Implementation priorities

1. **Stage 3:** Promote band snapshot, threshold chart, pathway legend to default view.
2. **Stage 4:** Fix "signature s" typo.
3. **Stage 3:** Remove or soften "More diagnostics available" when Advanced is off (or make it contextual).
4. **Stage 2:** "Proxy accepted" → "Data available" (or keep as is with tooltip).
5. **Typography:** Soften a few uppercase labels to sentence case for readability.
