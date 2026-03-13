# DTSE Tab — Improvement Plan

**Purpose:** Make the DTSE tab the best it can be: readable, learnable, trustworthy, and action-oriented.

**Source:** [DTSE_NOISE_VS_SIGNAL_AUDIT.md](./DTSE_NOISE_VS_SIGNAL_AUDIT.md) (exhaustive audit + live pass + extended audit).

## Plan overview

| Section | Content |
|---------|---------|
| [1. Plan](#1-plan) | Phases and approach |
| [2. Scope](#2-scope) | In / out of scope |
| [3. Perspective](#3-perspective) | User personas, stakeholders, edge cases |
| [4. Consideration](#4-consideration) | Risks, dependencies, alternatives, compatibility |
| [5. Decisions](#5-decisions) | Key choices and rationale |
| [6. Goals](#6-goals) | Success criteria |
| [7. Execution steps](#7-execution-steps) | Per-phase workflow, item order, rollback |
| [8. Checklist](#8-checklist) | Actionable items by phase |
| [9. Live checking](#9-live-checking) | Structured browser verification |
| [10. Proof](#10-proof) | Commands and expected results |
| [11. Double checking](#11-double-checking) | Pre-completion validation |
| [12. Governance and verification](#12-governance-and-verification) | How we ensure the plan is followed, proved, executed, and works |
| [13. UI review](#13-ui-review) | Readability, sense, best practices, vibecoding avoidance |
| [14. Design system and feedback](#14-design-system-and-feedback-phase-7--8) | Phase 7 & 8 breakdown, sub-phases, feedback process |
| [15. Tools and resources](#15-tools-and-resources) | Agent skills, MCPs, and other resources to execute the plan |

---

## 1. Plan

**Approach:** Fix trust gaps first, then reduce noise, then clarify language. Each change is small and reversible.

| Phase | Focus | Rationale |
|-------|-------|-----------|
| **Phase 1** | Fix bugs | Nonsensical numbers and missing feedback erode trust. Do first. |
| **Phase 2** | Remove redundancy | Less clutter, faster scan. |
| **Phase 3** | Clarify labels | Jargon → plain language. |
| **Phase 4** | Simplify content | Shorten headlines, collapse verbose sections. |
| **Phase 5** | Polish | Decoration, **More** label, UI review fixes (font weight, uppercase, blurs, glow, gradients, touch targets). |
| **Phase 6** | UI refinement (optional) | Rounded corners, hover effects, colour palette tightening. |
| **Phase 7** | Design system (optional) | Typography scale, design tokens, animation audit, loading/empty states, accessibility audit, responsive optimisation, component abstraction. |
| **Phase 8** | Feedback loop (ongoing) | Deploy → gather user feedback → iterate. |

---

## 2. Scope

### In scope

| Area | Items |
|------|-------|
| DTSE tab only | All 5 stages, run strip, stage bar, Overview mode, footer |
| Bugs | Price compression clamp, export feedback, ONOCOY $0, review-rehearsal E2E |
| Labels | Jargon replacements (see Clarify checklist) |
| Redundancy | Remove/shorten redundant labels |
| Content | Lead recommendation, metric intent, context/tradeoffs |
| Decoration | Blurs, optional visual tweaks |
| UI review | Readability, sense, best practices, vibecoding avoidance (see §13). Baseline run 2025-02-26; findings → Phase 5 & 6 checklist. |
| Design system (Phase 7) | Typography scale, tokens, animation, loading/empty states, a11y, responsive, component abstraction. Optional; higher effort. |
| Feedback loop (Phase 8) | Deploy → gather feedback → iterate. Ongoing. |

### Out of scope

| Area | Reason |
|------|--------|
| Other tabs (Benchmark, Root Causes, etc.) | DTSE-only plan |
| Stress Lab / Simulator | Separate feature; integration already works |
| API features (GEMINI, DUNE) | Optional; dashboard works without |
| Performance profiling | No evidence of user-facing issues |
| New features | Plan is improvement, not expansion |

---

## 3. Perspective

### User personas

| Persona | Goal | What matters |
|---------|------|--------------|
| **First-time reviewer** | Understand protocol stress in one pass | Clear labels, no jargon, obvious next step (export). |
| **Power user** | Deep-dive into triggers, evidence, provenance | More toggle, trigger logic, source trace. |
| **Decision-maker** | Get a verdict and recommendations quickly | Lead recommendation, band snapshot, export. |
| **Protocol team** | Compare protocols under stress | Protocol switch, stress channel switch, consistency. |

### Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| Protocol teams | Accurate, comparable stress readouts. |
| Auditors / reviewers | Reproducible, evidence-backed conclusions. |
| Product | First-review completion rate, export usage. |

### Edge cases to consider

| Edge case | Consideration |
|-----------|---------------|
| **Empty states** | Stage 4 (no signatures), Stage 5 (no recommendations) — UI exists; pack data usually prevents. Verify after changes. |
| **Mobile / narrow viewport** | 375px renders; dense layout. Check that label changes don’t break wrap or overflow. |
| **Slow network** | No DTSE-specific loading; simulation runs async. No change. |
| **Screen reader / keyboard** | E2E passes. Ensure new elements (e.g. toast) are announced and focusable. |
| **Sequence view unavailable** | Pack-only always shows this. No change; optional “Run simulation to unlock” later. |

---

## 4. Consideration

### Risks and trade-offs

| Change | Risk | Mitigation |
|--------|------|-------------|
| Price compression clamp | May hide a real upstream data bug (e.g. bad price series) | Log or flag when clamp is applied; consider dev-only diagnostic. |
| Label changes | May confuse users who memorised old terms | Changes are plain-language improvements; document in changelog. |
| Remove “Overall assessment” | Some users may look for that label | Verdict title remains; sub-label was redundant. |
| Export toast | Toast library adds dependency | Use existing pattern if app has toasts; else inline message. |

### Dependencies

| Change | Dependency | Notes |
|--------|-------------|-------|
| Export feedback | Toast component or inline state | Check if app already has toast (e.g. sonner, react-hot-toast). |
| Label changes | None | String replacements. |
| Price clamp | None | Pure logic change. |
| ONOCOY $0 | Protocol brief data source | `PROTOCOL_BRIEF_OVERRIDES` or `deriveDefaultProtocolBrief` in dtseContent.ts. |

### Alternatives considered

| Decision | Alternatives | Choice |
|----------|--------------|--------|
| Export feedback | Toast / inline “Downloaded” / both | Toast or inline; prefer minimal (one). |
| Price clamp | Clamp / “N/A” / hide trigger | Clamp ±999%; keeps signal, removes noise. |
| “Interpretation Boundary” | Keep / “How to read this” / “Reading guide” | “How to read this” — shortest, clearest. |

### Backward compatibility

| Area | Impact |
|------|--------|
| Export format | No change; JSON/MD structure unchanged. |
| URLs / routing | No DTSE-specific routes. |
| Saved state | No DTSE persistence. |
| E2E selectors | Label changes may affect `contain.text`; update if needed. |

### Cross-protocol check

After fixing ONOCOY $0, verify all 14 protocols for baseline price and other obvious placeholders (e.g. $0, “N/A”).

### Phase 7 & 8 effort

| Phase | Effort | When to do |
|-------|--------|------------|
| Phase 7 (Design system) | High | After Phase 6 if aiming for "as good as we can do". Can be split into sub-phases (e.g. 7a typography+tokens, 7b a11y+responsive, 7c components). |
| Phase 8 (Feedback loop) | Ongoing | After first deploy. Not a one-off; continuous. |

---

## 5. Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Price compression clamp** | ±999% | Extreme values (e.g. -38M%) are nonsensical; ±999% is readable and still informative. |
| **Export feedback** | Toast or inline "Downloaded" | User needs confirmation; browser download bar is not enough. |
| **Run-strip label** | Use "More" | Matches current UI toggle and keeps "default simple, deeper on demand". |
| **Sequence view (pack-only)** | No change | "Sequence view unavailable" is accurate; adding "Run simulation to unlock" is optional polish. |
| **"signature s" pluralisation** | No code change | Code is correct; likely a11y tree quirk. Monitor. |
| **4-question test** | Use for future changes | Would user miss it? Duplicate? Need explanation? Help next step? |

---

## 6. Goals

| Goal | Success criterion |
|------|-------------------|
| **Trust** | No nonsensical numbers; export gives feedback; ONOCOY data consistent. |
| **Clarity** | Jargon replaced; lead recommendation readable at a glance. |
| **Scannability** | Redundant labels removed; core content visible by default. |
| **Actionability** | User can complete first review (DTSE → export) without confusion. |
| **Regression-free** | All E2E pass; no new a11y issues. |

---

## 7. Execution steps

### Per-phase workflow

1. **Before starting a phase**
   - Create branch (e.g. `dtse-improve-phase-N`).
   - Run `npm run test` and `npm run test:e2e` — baseline green.
   - Run [Live check](#9-live-checking) baseline — note current behaviour. Use **cursor-ide-browser** MCP for browser checks.
   - **Before Phase 1:** Run [UI review](#13-ui-review) baseline — document readability, sense, best practices, vibecoding.
   - See [§15 Tools and resources](#15-tools-and-resources) for skills and MCPs to use.

2. **For each checklist item**
   - Implement change (small, focused).
   - Run `npm run test`.
   - Run [4-question test](#11-double-checking) on changed element.
   - Commit with message: `dtse: [phase] [item]` (e.g. `dtse: phase1 price compression clamp`).

3. **After each phase**
   - Run `npm run build` and `npm run test:e2e`.
   - Run full [Live check](#9-live-checking) for that phase.
   - Update [DTSE_NOISE_VS_SIGNAL_AUDIT.md](./DTSE_NOISE_VS_SIGNAL_AUDIT.md) Completed section.
   - **After Phase 5:** Run [UI review](#13-ui-review) — verify improvements; complete Phase 6 if doing UI refinement.
- **After Phase 6:** Consider Phase 7 (design system) if aiming for "as good as we can do". See [§14](#14-design-system-and-feedback-phase-7--8).
- **After deploy:** Start Phase 8 (feedback loop) — gather, prioritise, iterate.
   - If anything breaks: revert last commit, fix, re-run.

4. **Rollback**
   - `git revert <commit>` or `git reset --hard` to last known good.
   - Re-run tests and live check.

### Phase 1 item order

1. Price compression clamp (most visible bug).
2. Export feedback (high-impact UX).
3. ONOCOY $0 (data consistency).
4. review-rehearsal E2E (unblocks CI).

---

## 8. Checklist

### Phase 1: Fix bugs

- [x] **Price compression clamp** — `dtseLiveSignatures.ts` line 56: clamp `priceCompressionPct` to ±999 before `roundTo`.
- [x] **Export feedback** — Add toast or inline "Downloaded" after DTSE export trigger.
- [x] **ONOCOY $0** — Fix `PROTOCOL_BRIEF_OVERRIDES` or `deriveDefaultProtocolBrief` for ONOCOY `token_price_usd` / baseline price.
- [x] **review-rehearsal E2E** — Fix decision-tree-root not found in Evidence → Stress Lab → Return → Decide flow (state/timing).

### Phase 2: Remove

- [x] Remove "Overall assessment" sub-label (Stage 1).
- [x] Remove or shorten "Overview mode: all stages visible" footer text — e.g. "All stages".
- [x] Remove "Active Weeks" chip (Stage 3 pathway rows) — if Peak suffices.
- [x] Reduce or remove decorative blurs (dashboard top/bottom).

### Phase 3: Clarify

- [x] "Interpretation Boundary" → "How to read this" (Stage 1).
- [x] "Runnable" → "Included" (Stage 2).
- [x] "Proxy accepted" → "Data available" or "Using proxy" (Stage 2).
- [x] "Response Posture" → "Summary" (Stage 5).
- [x] "Interpretive Paths" → "Recommendations" (Stage 5).

### Phase 4: Simplify

- [x] Lead recommendation headline (Stage 5) — truncate or shorten.
- [x] "Metric intent" — single glossary vs 6 per-row details (Stage 2). Renamed to "Details".
- [x] "Context and tradeoffs" — surface Who + Risk; rest in details (Stage 5).

### Phase 5: Polish

- [x] Run-strip label uses "More".
- [x] Milestones line (Stage 3 More) — consider removing if redundant with trigger week.
- [x] **UI: Reduce font-black on secondary labels** — Use `font-bold` for labels like "Scenario in this run", "Model", "Run Envelope". Reserve `font-black` for primary headings and numbers.
- [x] **UI: Sentence case for secondary labels** — Replace `uppercase tracking-[0.2em]` with sentence case where appropriate (see §13).
- [x] **UI: Remove or reduce decorative blurs** — Dashboard top/bottom; Applicability orb. Remove or reduce opacity to ~5%.
- [x] **UI: Tone down glow/shadow** — Reduce `drop-shadow` on icons; soften `shadow-[0_0_20px_rgba(...)]` on hover.
- [x] **UI: Simplify gradients** — Protocol name, assessment card top gradient.
- [x] **UI: Touch targets** — Audit buttons/links; ensure min 44×44px for primary actions.

### Phase 6: UI refinement (optional)

- [x] **UI: Rounded corners** — Use `rounded-lg` for nested cards.
- [x] **UI: Hover effects** — Reduce to primary cards only; remove `group-hover:scale-110`.
- [x] **UI: Colour palette** — Document and tighten; added to DTSE_DASHBOARD_UI_UX_RULES_V1 §10.

### Phase 7: Design system (optional)

*Higher effort. Do after Phase 6 if aiming for "as good as we can do".*

- [x] **Typography scale** — Define H1/H2/H3/body/caption. Document in DTSE_DASHBOARD_UI_UX_RULES_V1 §9.
- [x] **Design tokens** — Centralise colours, spacing, radii. Document in DTSE_DASHBOARD_UI_UX_RULES_V1 §11.
- [x] **Animation audit** — Audit `animate-in`, `fade-in`, `slide-in`, `transition-all`. Ensure consistency; add `prefers-reduced-motion` support.
- [x] **Loading / empty states** — Polish "Loading stress charts"; consider skeleton vs spinner. Improve empty-state copy (Stage 4, 5) for tone and clarity.
- [x] **Accessibility audit** — WCAG contrast ratios, focus-visible states, screen reader labels (aria-label, aria-describedby). Run axe or similar.
- [x] **Responsive optimisation** — Define breakpoints; responsive typography; ensure touch targets ≥44px on mobile.
- [x] **Component abstraction** — Extract shared `DTSECard`, `DTSEBadge`, `DTSEStageHeader` to enforce consistency and simplify future polish.

### Phase 8: Feedback loop (ongoing)

- [x] **Deploy** — Ship Phase 1–7 to preview/production. See [DTSE_DEPLOY.md](./DTSE_DEPLOY.md).
- [ ] **Gather feedback** — User interviews, support tickets, analytics (export clicks, stage completion, drop-off).
- [ ] **Iterate** — Prioritise feedback; add items to backlog or new phase.
- [x] **Document** — Log feedback and decisions in [DTSE_FEEDBACK_LOG.md](./DTSE_FEEDBACK_LOG.md).

---

## 9. Live checking

**Done when:** All items pass for the phase; no regressions vs baseline.

### Baseline (before any changes)

- [ ] `npm run dev` — app loads at http://127.0.0.1:3000
- [ ] DTSE tab is default; all 5 stages visible in Guided mode
- [ ] Protocol select: switch ONOCOY → Helium → Render — content updates
- [ ] Stress select: switch Liquidity Shock → Baseline Neutral — content updates
- [ ] More On: Run details, Evidence posture, Matched conditions, protocol_id, Model inputs visible
- [ ] Overview mode: all stages in one scroll; "Back to Guided" works
- [ ] Export: click triggers download; no toast (current behaviour)
- [ ] Stage 4: check for "active signature(s)" text
- [ ] Stage 5: lead recommendation visible; Export button works

### Phase 1 verification

| Check | Protocol | Stress | Action | Expected |
|-------|----------|--------|--------|----------|
| Price compression | ONOCOY or Helium | Liquidity Shock | Go to Stage 4, More On, find trigger logic | Percentage in ±999 range |
| Export feedback | Any | Any | Stage 5, click Export | Download + toast or "Downloaded" |
| ONOCOY $0 | ONOCOY | Any | Stage 1, More On, Model inputs | Baseline price not $0 |
| review-rehearsal | — | — | `npm run test:e2e` | review-rehearsal.cy.ts passes |

### Phase 2–8 verification

| Phase | Live checks |
|-------|-------------|
| 2 | "Overall assessment" gone; footer shortened; Active Weeks gone (if removed); blurs reduced |
| 3 | All 5 label replacements visible in correct stages |
| 4 | Lead recommendation shorter; metric intent simplified; Context/tradeoffs surface Who + Risk |
| 5 | "More" or "Details" (if changed); Milestones gone (if removed); font-bold on secondary labels; sentence case; blurs reduced; glow/shadow toned down; gradients simplified; touch targets ≥44px |
| 6 | Rounded corners on nested cards; hover effects reduced; colour palette tightened |
| 7 | Typography scale applied; tokens in use; animation consistent; loading/empty polished; a11y audit pass; responsive OK; shared components used |
| 8 | Feedback logged; iteration items prioritised |

### Protocol × stress matrix (sample)

| Protocol | Stress channel | Verify |
|----------|----------------|--------|
| ONOCOY | Liquidity Shock | Full flow, export |
| Helium | Baseline Neutral | Content consistency |
| Hivemapper | Demand Contraction | Protocol switch |

### Viewport check

- [ ] Desktop (1600×900): all content visible, no overflow
- [ ] Mobile (375×667): tabs and content render; note any overflow or broken layout

### Sign-off

- [ ] All phase checks pass
- [ ] No console errors
- [ ] E2E green

---

## 10. Proof

| Step | Command / action | Expected |
|------|-------------------|---------|
| **Unit tests** | `npm run test` | All pass. |
| **Build** | `npm run build` | No errors. |
| **E2E** | `npm run test:e2e` | All 22 pass (including review-rehearsal). |
| **Browser** | See [Live checking](#9-live-checking) | Per-phase checklist. |
| **Export** | Click Export | Download + toast or "Downloaded" message. |
| **Price compression** | Run with stress that triggers liquidity-driven-compression | Percentage in ±999 range. |
| **ONOCOY** | Select ONOCOY, check Model Inputs | Baseline price not $0 (or explained). |

---

## 11. Double checking

Before marking any phase complete:

| Check | How |
|-------|-----|
| **4-question test** | For each changed element: Would user miss it? Duplicate? Need explanation? Help next step? |
| **Regression** | Run `npm run test` and `npm run test:e2e` after each phase. |
| **Live check** | Complete [Live checking](#9-live-checking) for that phase. |
| **UI review** | Before Phase 1: baseline. After Phase 5: verify. See [§13](#13-ui-review). |
| **Audit update** | Update [DTSE_NOISE_VS_SIGNAL_AUDIT.md](./DTSE_NOISE_VS_SIGNAL_AUDIT.md) Completed section with implemented items. |
| **No new jargon** | Ensure replacements are not introducing new jargon. |
| **Verification skill** | Use **verification-before-completion** or **depin-verification-before-completion** before claiming any item done. See [§15](#15-tools-and-resources). |

---

## 12. Governance and verification

**How we ensure the plan is followed, proved, executed, and works.**

### Followed — Plan adherence

| Mechanism | How |
|-----------|-----|
| **PR description** | PR must link to this plan and list which checklist items it completes. |
| **Branch naming** | Use `dtse-improve-phase-N` or `dtse/phase-N-[item]` so work is traceable. |
| **Commit messages** | Use `dtse: [phase] [item]` (e.g. `dtse: phase1 price compression clamp`). |
| **Review checklist** | Reviewer verifies: (1) PR addresses plan items, (2) no scope creep, (3) audit doc updated. |

### Proved — Evidence of correctness

| Mechanism | How |
|-----------|-----|
| **CI (unit + E2E)** | `npm run test` and `npm run test:e2e` must pass. CI blocks merge if red. |
| **Build gate** | `npm run build` must succeed. |
| **Per-item proof** | Each checklist item has a Proof row in [§10](#10-proof); implementer runs it before marking done. |
| **Live check** | Implementer completes [§9 Live checking](#9-live-checking) for the phase; results noted in PR or audit doc. |

### Executed — Completion tracking

| Mechanism | How |
|-----------|-----|
| **Checklist in plan** | Check off items in [§8 Checklist](#8-checklist) as done; commit the plan update with the PR. |
| **Audit doc update** | Add completed items to [DTSE_NOISE_VS_SIGNAL_AUDIT.md](./DTSE_NOISE_VS_SIGNAL_AUDIT.md) Completed section. |
| **Phase gate** | Phase is complete when all its checklist items are done, tests pass, and live check passes. |
| **Definition of done** | Item done = implemented + tests pass + proof run + live check (if applicable) + audit updated. |

### Works — End-to-end verification

| Mechanism | How |
|-----------|-----|
| **E2E suite** | All 22 tests (including review-rehearsal) pass. |
| **Manual smoke** | After merge: DTSE tab load → switch protocol/stress → export → no errors. |
| **Regression** | No new failures in existing E2E; no new a11y regressions. |
| **Post-merge check** | Within 24h of merge: run full [Live check](#9-live-checking) baseline on deployed/preview; confirm Phase 1–5 improvements visible. |

### Verification loop

```
Implement → Run tests → Run proof → Run live check → Update audit → PR → CI → Review → Merge → Post-merge smoke
     ↑                                                                                                    |
     └──────────────────────────── If any step fails: fix or revert ─────────────────────────────────────┘
```

### Who checks what

| Role | Responsibility |
|------|----------------|
| **Implementer** | Follow [§7 Execution steps](#7-execution-steps); run proof and live check; update checklist and audit. |
| **Reviewer** | Verify plan adherence, no regressions, audit updated; optionally run live check. |
| **CI** | Enforce `npm run test`, `npm run build`, `npm run test:e2e`. |
| **Post-merge** | Anyone: run baseline live check on preview/production to confirm improvements work. |

### Red lines (block merge)

- Unit tests fail
- E2E tests fail (including review-rehearsal after Phase 1)
- Build fails
- PR does not link to plan or list completed items
- Audit doc not updated for completed items

---

## 13. UI review

**Purpose:** Ensure DTSE makes sense, is readable, follows best practices, and avoids the generic "vibecoding" feel.

**When to run:** (1) Before Phase 1 — baseline. (2) After Phase 5 — verify improvements. Optionally after each phase if UI changes.

### UI review baseline (2025-02-26)

*Run-through of all checks against current DTSE components.*

#### Readability

| Check | Result | Finding |
|-------|--------|---------|
| **Contrast** | Pass | Slate on dark backgrounds is readable. |
| **Hierarchy** | Partial | Verdict and protocol name are dominant; secondary labels compete with `font-black uppercase`. |
| **Line length** | Pass | Body text uses `max-w-2xl` / `max-w-xl` where needed. |
| **Font weight** | Fail | `font-black` used 300+ times across DTSE; secondary labels (e.g. "Scenario in this run", "Model", "Run Envelope") don't need black. Use `font-bold` for secondary. |
| **Uppercase** | Fail | `uppercase tracking-[0.18em]` to `tracking-[0.22em]` on almost every label. Creates institutional shout. Use sentence case for secondary labels. |
| **Spacing** | Pass | `space-y-5`, `space-y-3`, `gap-3` provide adequate whitespace. |

#### Sense (information flow)

| Check | Result | Finding |
|-------|--------|---------|
| **Stage order** | Pass | 1 → 5 tells coherent story: context → readiness → outcomes → autopsy → response. |
| **Primary action** | Pass | Export in Stage 5; visible in Lead response path card. |
| **Context first** | Pass | Stage 1 gives Interpretation Boundary, stress channel, assessment before Stage 2. |
| **Verdict visible** | Pass | Assessment card with band counts and verdict title is prominent. |
| **Next step clear** | Pass | Next/Previous buttons; stage pills for navigation. |

#### Best practices

| Check | Result | Finding |
|-------|--------|---------|
| **Consistency** | Pass | Cards use `rounded-2xl border border-white/10 bg-slate-900/...` consistently. |
| **Alignment** | Pass | Grid layouts (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4`) used. |
| **Touch targets** | Partial | Buttons generally adequate; some `px-2.5 py-1` may be small. Verify min 44×44. |
| **Focus states** | Pass | `focus:ring-2 focus:ring-indigo-500` on selects. |
| **Error states** | Pass | Empty states in Stage 4 and 5; "Sequence view unavailable" in Stage 3. |
| **DTSE rules** | Pass | Follows DTSE_DASHBOARD_UI_UX_RULES_V1. |

#### Vibecoding avoidance

| Check | Result | Finding |
|-------|--------|---------|
| **Gradients** | Fail | `bg-gradient-to-r from-white to-slate-400` (protocol name), `from-slate-200 to-slate-400` (Applicability), `from-white/5 via-transparent` (assessment card). Some decorative. |
| **Blur** | Fail | Dashboard: `blur-[120px]` indigo, `blur-[100px]` emerald. Applicability: `blur-[100px]` indigo. `backdrop-blur-md` / `backdrop-blur-xl` on many cards. Reduce decorative blurs. |
| **Glow / shadow** | Fail | `drop-shadow-[0_0_8px_rgba(...)]` on icons; `shadow-[0_0_20px_rgba(...)]` on hover; `shadow-[0_0_30px_rgba(...)]` on signature cards. Tone down. |
| **Colour palette** | Partial | indigo, emerald, amber, rose, cyan, violet used. Functional (status) but scattered. Consider tightening. |
| **Rounded corners** | Partial | `rounded-2xl` everywhere. Consider `rounded-lg` for nested/secondary cards. |
| **Hover effects** | Partial | `hover:-translate-y-0.5`, `group-hover:scale-110` on many cards. Subtle; reduce if feels busy. |
| **Distinctiveness** | Partial | Dark slate + coloured accents is consistent but could feel generic. Protocol name gradient and blurs add template feel. |

### UI review → implementation checklist

*Actionable items derived from the baseline run-through.*

#### Phase 5 (Polish) — add these UI items

- [ ] **Reduce font-black on secondary labels** — Use `font-bold` for labels like "Scenario in this run", "Model", "Run Envelope", "Metric intent", etc. Reserve `font-black` for primary headings and numbers.
- [ ] **Sentence case for secondary labels** — Replace `uppercase tracking-[0.2em]` with sentence case for labels that are not section headers (e.g. "Stress Channel", "Surface", "Mechanism" can stay; "OVERALL ASSESSMENT" → "Overall assessment" or remove).
- [ ] **Remove or reduce decorative blurs** — Dashboard top/bottom blurs; Applicability `blur-[100px]` orb. Either remove or reduce opacity to ~5%.
- [ ] **Tone down glow/shadow** — Reduce `drop-shadow-[0_0_8px_rgba(...)]` on icons; remove or soften `shadow-[0_0_20px_rgba(...)]` on hover.
- [ ] **Simplify gradients** — Protocol name: consider solid `text-white` or subtle gradient. Assessment card top gradient: remove or reduce.
- [ ] **Touch targets** — Audit buttons/links; ensure min 44×44px for primary actions.

#### Phase 6 (UI refinement) — optional, after Phase 5

- [ ] **Rounded corners** — Use `rounded-lg` for nested cards (e.g. Model inputs, Metric intent details).
- [ ] **Hover effects** — Reduce `hover:-translate-y-0.5` to only primary cards; remove `group-hover:scale-110` on numbered badges.
- [ ] **Colour palette** — Document and tighten: primary (slate), status (emerald/amber/rose), accent (indigo for interactive). Reduce ad-hoc cyan/violet.

### UI review checklist (process)

- [ ] Run readability checks; note failures.
- [ ] Run sense checks; note failures.
- [ ] Run best-practices checks; note failures.
- [ ] Run vibecoding checks; note failures.
- [ ] Document findings in audit or separate UI review doc.
- [ ] Add any UI fixes to Phase 5 (Polish) or Phase 6.

### Reference

- [DTSE_DASHBOARD_UI_UX_RULES_V1.md](./DTSE_DASHBOARD_UI_UX_RULES_V1.md) — UI/UX rules
- [DTSE_NOISE_VS_SIGNAL_AUDIT.md](./DTSE_NOISE_VS_SIGNAL_AUDIT.md) — Cross-cutting: Uppercase, Decorative Elements, Redundancy

---

## 14. Design system and feedback (Phase 7 & 8)

*Detailed guidance for Phase 7 and 8. Optional; higher effort.*

### Phase 7: Design system — breakdown

| Item | What to do | Effort |
|------|------------|--------|
| **Typography scale** | Define: H1 (stage title), H2 (section), H3 (card title), body, caption. Document sizes (text-sm, text-lg, etc.) and weights (font-bold, font-black). Apply consistently. | Medium |
| **Design tokens** | Add CSS variables or extend Tailwind config: `--dtse-radius-card`, `--dtse-radius-nested`, `--dtse-colour-primary`, `--dtse-colour-status-*`, `--dtse-spacing-*`. | Medium |
| **Animation audit** | List all `animate-in`, `transition-all`, `duration-*`. Standardise: e.g. fade-in 200ms, slide 150ms. Add `@media (prefers-reduced-motion: reduce)` overrides. | Low |
| **Loading / empty states** | "Loading stress charts": skeleton vs spinner. Empty states: "No Failure Signature Triggered" → consider tone. Add subtle illustration or icon if helpful. | Low–medium |
| **Accessibility audit** | Run axe-core or Lighthouse a11y. Fix contrast (4.5:1 for body, 3:1 for large). Ensure focus-visible on all interactive. Add aria-labels where missing. | Medium |
| **Responsive optimisation** | Breakpoints: 640, 768, 1024, 1280. Responsive typography (e.g. text-sm md:text-base). Touch targets ≥44px on mobile. Test 375px, 768px. | Medium |
| **Component abstraction** | Extract `DTSECard` (rounded-2xl, border, backdrop-blur), `DTSEBadge` (status badge), `DTSEStageHeader` (h2 + description). Refactor stages to use them. | High |

### Phase 7 sub-phases (optional split)

- **7a:** Typography scale + design tokens
- **7b:** Animation audit + loading/empty states
- **7c:** Accessibility audit + responsive optimisation
- **7d:** Component abstraction

### Phase 8: Feedback loop — process

1. **Deploy** — Ship Phase 1–6 (or 1–7) to preview/production.
2. **Gather** — User interviews, support tickets, analytics (export clicks, stage completion, drop-off by stage).
3. **Prioritise** — Rank feedback by impact and effort.
4. **Iterate** — Add items to backlog; create new phase or sprint if needed.
5. **Document** — Log in `docs/DTSE_FEEDBACK_LOG.md` or audit Completed section.

### Reference

- [DTSE_DASHBOARD_UI_UX_RULES_V1.md](./DTSE_DASHBOARD_UI_UX_RULES_V1.md) — Extend with typography scale and tokens when Phase 7 starts.

---

## 15. Tools and resources

**Agent skills, MCPs, and other resources to help execute this plan.**

### Agent skills

| Skill | When to use | What it does |
|------|-------------|--------------|
| **verification-before-completion** | Before claiming any phase/item is done | Requires running verification commands and confirming output before success claims. Use before commit, PR, or handoff. |
| **depin-verification-before-completion** | Before claiming bugs fixed or tests pass | Same principle; repo-specific commands: `npm test`, `npm run build`, `npm run test:e2e`. Report commands run, exit status, pass/fail counts. |
| **depin-systematic-debugging** | When simulation/optimizer tests fail or output is unexpected | Root-cause-first: reproduce, capture evidence, trace to first wrong value, one hypothesis, one minimal change. Use for Phase 1 bugs (e.g. price compression, review-rehearsal E2E). |
| **depin-model-change-tdd** | When changing simulation math, optimizer logic, risk metrics | Test-first: write failing test, minimal fix, verify. Use if price clamp or ONOCOY data changes touch model logic. |
| **check-compiler-errors** | When compile or type-check fails | Run build, summarise errors, fix highest-confidence first, re-run until clean. |
| **fix-ci** | When branch CI fails | Identify failing job, extract actionable error, apply minimal fix, re-run. Use for review-rehearsal E2E. |
| **scan-and-fix-accessibility** | Phase 7 accessibility audit | Scan DTSE at localhost:3000 for WCAG violations; get fixes. Uses BrowserStack `startAccessibilityScan`. |
| **test-driven-development** | When implementing Phase 1–4 items | Write failing test first, minimal code to pass, refactor. Use for export feedback, price clamp, etc. |

### MCPs (Model Context Protocol)

| MCP | When to use | What it does |
|-----|-------------|--------------|
| **cursor-ide-browser** | Live checking (§9), UI review (§13) | Navigate, snapshot, click, resize. Run baseline and phase verification in browser. Lock before interactions, unlock when done. |
| **plugin-browserstack-browserstack** | Phase 7 accessibility audit | `startAccessibilityScan` — WCAG scan on localhost:3000 or deployed URL. `accessibilityExpert` — WCAG guidance. |
| **plugin-figma-figma** | If DTSE has Figma designs | `get_design_context`, `get_screenshot` for design-to-code. `create_design_system_rules` for Phase 7 tokens. |
| **plugin-compound-engineering-context7** | When needing library docs | `resolve-library-id` + `query-docs` for React, Tailwind, Vitest, Cypress, etc. |

### Repo commands (from AGENTS.md)

| Command | Use |
|---------|-----|
| `npm install` | Install deps |
| `npm run dev` | Dev server (port 3000) |
| `npm run test` | Unit tests (Vitest) |
| `npm run build` | Build + TypeScript check |
| `npm run test:e2e` | E2E (Cypress; starts server on 4173) |

### Verification commands (per depin-verification-before-completion)

| What changed | Commands |
|--------------|----------|
| Broad TypeScript/UI | `npm test`; `npm run build` |
| DTSE-specific | `npm run test:e2e` (all 22 including review-rehearsal) |
| Simulation/optimizer | `npm test -- src/model/`; `npm run skill:optimizer:quick` |

### Suggested workflow

1. **Before starting a phase:** Use **cursor-ide-browser** for baseline live check.
2. **When implementing:** Use **test-driven-development** for bug fixes; **check-compiler-errors** if build fails.
3. **When CI fails:** Use **fix-ci** to iterate to green.
4. **Before claiming done:** Use **verification-before-completion** — run `npm test`, `npm run build`, `npm run test:e2e`; report output.
5. **Phase 7 a11y:** Use **scan-and-fix-accessibility** or BrowserStack `startAccessibilityScan` on localhost:3000.
6. **When stuck on a bug:** Use **depin-systematic-debugging** for root-cause-first approach.

### Cursor best practices alignment

*Source: [Cursor agent best practices](https://cursor.com/blog/agent-best-practices) (2024–2025).*

| Practice | Our plan | Gap / recommendation |
|----------|----------|------------------------|
| **Plan before coding** | Plan in `docs/DTSE_IMPROVEMENT_PLAN.md` | Consider saving to `.cursor/plans/` for team docs and resume context. Plan Mode (Shift+Tab) before each phase. |
| **Verifiable goals** | Proof (§10), Live check (§9), verification skills | Aligned. Tests, build, E2E give clear signals. |
| **Rules** | AGENTS.md at repo root | Cursor recommends `.cursor/rules/` with `.mdc` files. Add DTSE-specific rules: commands, patterns, pointer to `DTSE_DASHBOARD_UI_UX_RULES_V1.md`. |
| **Skills** | §15 documents skills | Aligned. Use verification, TDD, fix-ci, systematic-debugging. |
| **Specific prompts** | Checklist items are specific | When delegating to agent: "Implement Phase 1 item 1: clamp priceCompressionPct in dtseLiveSignatures.ts line 56 to ±999" — not "fix the price bug". |
| **Agent Review** | Not mentioned | After agent finishes: use Review → Find Issues. Source Control → Agent Review before PR. |
| **When to start new conversation** | Not mentioned | Start fresh when finishing a phase, moving to different task, or agent seems confused. Continue when debugging what it just built. |
| **Reference past work** | Not mentioned | Use `@Past Chats` when starting new conversation to pull context from prior sessions. |
| **Debug Mode** | Not mentioned | For tricky bugs (e.g. review-rehearsal E2E): use Debug Mode — reproduce, instrument, analyse. |
| **Commands** | Not mentioned | Consider `.cursor/commands/` for `/dtse-verify` (run tests + E2E + live check) or `/dtse-phase N` (execute phase N checklist). |
| **Worktrees** | Not mentioned | For parallel work: use Cursor worktrees so multiple agents can tackle phases without conflict. |

### Recommended additions (implemented)

1. **`.cursor/rules/dtse-implementation.mdc`** — Commands, DTSE file paths, pointer to plan and UI rules. Applies when editing `src/components/DTSE/**`, `src/utils/dtse*.ts`, `src/data/dtse*.ts`.
2. **`.cursor/plans/dtse-improvement.md`** — Plan entry point for Cursor Plan Mode; links to full plan; includes Phase 1 checklist and proof commands.
3. **`.cursor/commands/dtse-verify.md`** — `/dtse-verify`: run `npm test`, `npm run build`, `npm run test:e2e`; report status.
4. **`.cursor/commands/dtse-phase.md`** — `/dtse-phase`: execute phase N checklist with verification loop.
5. **Agent Review** — Before each PR: Source Control → Agent Review to compare against main. (Manual workflow step.)

---

## References

- [DTSE_NOISE_VS_SIGNAL_AUDIT.md](./DTSE_NOISE_VS_SIGNAL_AUDIT.md) — Full audit and checklists
- [DTSE_DESIGN_REVIEW_2026.md](./DTSE_DESIGN_REVIEW_2026.md) — Stage-by-stage design review
- [DTSE_DASHBOARD_UI_UX_RULES_V1.md](./DTSE_DASHBOARD_UI_UX_RULES_V1.md) — UI/UX rules
