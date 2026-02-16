# Plain Language and Chart Interpretation Spec

Date: 2026-02-16
Purpose: ensure the dashboard is understandable by non-specialists while preserving analytical rigor.

## 1) Plain Language Policy

### Audience target
Write for mixed audiences:
1. First-time reviewer
2. Non-technical business stakeholder
3. Technical analyst

### Default copy rules
1. Lead with plain answer first, technical detail second.
2. Avoid unexplained acronyms in default view.
3. Replace abstract model phrasing with user-facing intent language.
4. Keep sentence structure direct and action-oriented.
5. Put formulas behind `How calculated` toggles (advanced).

### Required copy pattern per panel
1. `What this means`: one sentence, plain language.
2. `Why it moved`: one sentence tied to drivers.
3. `What to do next`: one concrete action.
4. `How calculated` (optional advanced).

### Lexicon control
Maintain a shared glossary for:
1. Status labels (`Healthy`, `Watchlist`, `Intervention`)
2. Core metrics (`Solvency`, `Payback`, `Retention`, `Utilization`)
3. Failure modes (`Subsidy Trap`, `Density Trap`, `Signals of Death`)

## 2) Chart Interpretation Standard

Every default-flow chart must include all of the following:
1. Plain-language headline (not just metric name).
2. One key takeaway sentence (`So what`).
3. Units and axis meaning.
4. Baseline/threshold/reference markers.
5. Legend with explicit category meaning.
6. Confidence/evidence hint for high-impact metrics.
7. One next-step interpretation cue (`If X, then investigate Y`).

## 3) Required Chart Scaffold (Template)

For each chart:
1. `Question`: what decision question this chart answers.
2. `Signal`: what healthy vs risky looks like.
3. `Reference`: baseline, peer, or threshold used.
4. `Action`: what user should do if signal crosses risk band.

## 4) Hard Fail Conditions

Fail the review if any of these exist in default mode:
1. Chart with no clear units or legend meaning.
2. Chart with no explicit interpretation guidance.
3. Panel copy that is formula-only with no plain-language interpretation.
4. Unexplained acronym in decision-critical panel.
5. Conflicting interpretations of same metric across tabs.

## 5) Non-Loss Rule

1. Technical depth remains accessible via advanced drawers.
2. Plain-language summary does not replace formulas; it fronts them.
3. If simplification removes detail from default view, add a visible `View details` path.

## 6) Acceptance Checks

### Copy comprehension checks
1. User can paraphrase panel meaning without facilitator help.
2. User can explain one concrete next action after reading panel copy.

### Chart interpretation checks
1. User can identify whether current state is healthy/risky.
2. User can identify which reference line/band is being compared.
3. User can name next investigative step from chart cue.
