# HCI Acceptance Rubric (State of the Art Baseline)

Date: 2026-02-16
Scope: First external user review readiness for the DePIN dashboard (Onocoy stakeholder review)

## 1) Why this rubric exists

This rubric prevents a common failure mode: high analytical depth but low human usability.
It is designed to ensure users can:
1. Learn quickly
2. Analyze confidently
3. Leave with clear decisions/actions

## 2) Source baseline (current, authoritative)

Primary standards and guidance:
1. ISO 9241-11:2018 (usability as effectiveness, efficiency, satisfaction)
2. ISO 9241-110:2020 (interaction principles), confirmed current in 2025
3. ISO 9241-220:2019 (human-centered design process capability in organizations)
4. WCAG 2.2 (W3C Recommendation, 2023-10-05)
5. W3C "What's New in WCAG 2.2" (nine new success criteria)
6. WAI-ARIA Authoring Practices 1.2 (W3C Note status in 2021)
7. Nielsen Norman Group 10 usability heuristics (updated article, 2024)
8. Human-AI Interaction Guidelines (Amershi et al., CHI 2019) for AI-assisted explanation surfaces

## 3) Scoring model

Scale per criterion:
- `0` = absent
- `1` = weak / inconsistent
- `2` = partial / usable with friction
- `3` = strong / reliable
- `4` = exemplary / repeatable

Overall score:
- Weighted score out of 100
- `PASS` threshold: >= 80
- `STRONG PASS` threshold: >= 88

Hard gates (must pass even if weighted score >= 80):
1. No critical accessibility blocker in default journey (`WCAG 2.2 AA` level checks + manual keyboard path)
2. No conflicting protocol/scenario state across tabs
3. Every default tab ends with an explicit next action
4. Decision outputs include confidence and evidence metadata

## 4) Weighted rubric

### A. Information Architecture and Orientation (12%)
Checks:
1. User can identify "where am I?" and "what is this tab for?" in <= 10 seconds.
2. Navigation follows one canonical learning-to-decision flow.
3. Cross-tab handoff is explicit (`Next: ...`) not implied.
Evidence:
- Timed first-use observation
- Click-path trace

### B. Cognitive Load and Progressive Disclosure (14%)
Checks:
1. Default view limits to decision-critical panels only.
2. Advanced details are available but not forced.
3. No duplicate controls competing in default flow.
Evidence:
- Component inventory (`Core` vs `Advanced`)
- First-user confusion log

### C. Interaction Consistency and Control (10%)
Checks:
1. Global protocol/scenario controls are persistent and singular.
2. Baseline/compare behavior is consistent across tabs.
3. Status language uses one shared vocabulary and thresholds.
Evidence:
- State-flow tests
- Copy/label audit

### D. Decision Quality and Actionability (16%)
Checks:
1. Each default tab answers one decision question.
2. Recommendations include owner role, trigger, action, expected effect.
3. User can state one concrete next step after a run.
Evidence:
- Decision Brief artifact
- User comprehension interview

### E. Trust, Evidence, and Provenance (12%)
Checks:
1. High-impact KPIs show evidence grade.
2. Data freshness and reproducibility status are visible.
3. Assumptions are visible where outputs are model-derived.
Evidence:
- KPI metadata inspection
- Export review

### F. Accessibility and Inclusive Interaction (16%)
Checks:
1. Keyboard-only completion of default flow
2. Focus visibility and non-obscured focus behavior
3. Target size and pointer alternatives for drag interactions
4. ARIA role/label semantics for custom interactive controls
Evidence:
- Automated a11y scan
- Manual keyboard and screen-reader smoke pass

### G. Feedback, Error Prevention, and Recovery (8%)
Checks:
1. User sees what changed after reruns (`Current vs Baseline` delta clarity).
2. Safe reset path exists and is obvious.
3. Invalid/empty states are explicit and recoverable.
Evidence:
- Rerun diff behavior test
- Error-state walkthrough

### H. Performance and Responsiveness for Sensemaking (6%)
Checks:
1. Default interactions remain responsive under normal workload.
2. No blocking UI freeze during standard analysis flow.
3. Long-running actions show progress and completion feedback.
Evidence:
- Lighthouse/perf profile
- Interaction timing logs

### I. Outcome Telemetry and Iteration Readiness (6%)
Checks:
1. Time-to-first-insight is measured.
2. Flow drop-off by tab is measured.
3. Recommendation acceptance/rejection is captured.
Evidence:
- Analytics event schema
- Dashboard instrumentation check

## 5) Starter package stack (current as of 2026-02-16)

Accessibility and UI quality:
1. `axe-core` `4.11.1`
2. `@axe-core/playwright` `4.11.1`
3. `eslint-plugin-jsx-a11y` `6.10.2`
4. `@storybook/addon-a11y` `10.2.8`
5. `react-aria-components` `1.15.1`
6. `@react-aria/button` `3.14.4`

Automated and E2E testing:
1. `@playwright/test` `1.58.2`
2. `jest-axe` `10.0.0`
3. `pa11y` `9.1.0`
4. `lighthouse` `13.0.3`
5. `@lhci/cli` `0.15.1`
6. `cypress-axe` `1.7.0`
7. `web-vitals` `5.1.0`

Product analytics and iteration loop:
1. `posthog-js` `1.347.2`
2. `@amplitude/analytics-browser` `2.34.1`
3. `@sentry/browser` `10.39.0`
4. `@sentry/react` `10.39.0`
5. `mixpanel-browser` `2.74.0`

## 6) Skills map for execution in this repo

Use current local skills for rubric execution:
1. `depin-planning-with-files`: plan + evidence artifact discipline
2. `depin-verification-before-completion`: verification gate before signoff
3. `playwright`: scripted flow and interaction checks
4. `screenshot`: visual evidence capture for review packet
5. `depin-simulation-optimizer`: deterministic model/optimizer diagnostics
6. `depin-systematic-debugging`: isolate root causes from failed criteria
7. `spreadsheet` / `doc` / `pdf`: stakeholder-ready rubric and findings output

## 7) First-user acceptance protocol (minimum)

Participant profile:
1. First external reviewer (Onocoy-facing)

Required tasks:
1. Select protocol and scenario from global controls
2. Complete canonical journey end-to-end
3. Produce one recommendation and justify it with evidence tags
4. Export decision brief

Pass metrics:
1. Journey completion without facilitator intervention
2. Time to first meaningful insight <= 3 minutes
3. Time to one actionable recommendation <= 7 minutes
4. User-reported clarity >= 4/5
5. Weighted rubric >= 80 and all hard gates pass

## 8) Explicit non-regression guard

Any simplification change fails review if it:
1. Removes a unique analytical signal without an advanced destination
2. Breaks run reproducibility context (scenario, protocol, seed, model version)
3. Creates conflicting states across tabs

## 9) Source links

Standards and principles:
1. https://www.iso.org/standard/63500.html
2. https://www.iso.org/standard/75258.html
3. https://www.iso.org/standard/63462.html
4. https://www.w3.org/TR/WCAG22/
5. https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
6. https://www.w3.org/standards/history/wai-aria-practices-1.2/
7. https://www.nngroup.com/articles/ten-usability-heuristics/
8. https://dl.acm.org/doi/10.1145/3290605.3300233

Tooling docs:
1. https://playwright.dev/docs/accessibility-testing
2. https://storybook.js.org/docs/writing-tests/accessibility-testing
3. https://www.npmjs.com/package/axe-core
4. https://www.npmjs.com/package/@axe-core/playwright
5. https://www.npmjs.com/package/eslint-plugin-jsx-a11y
6. https://www.npmjs.com/package/@storybook/addon-a11y
7. https://www.npmjs.com/package/react-aria-components
8. https://www.npmjs.com/package/@playwright/test
9. https://www.npmjs.com/package/pa11y
10. https://www.npmjs.com/package/lighthouse
11. https://www.npmjs.com/package/@lhci/cli
12. https://www.npmjs.com/package/jest-axe
13. https://www.npmjs.com/package/cypress-axe
14. https://www.npmjs.com/package/posthog-js
15. https://www.npmjs.com/package/@amplitude/analytics-browser
16. https://www.npmjs.com/package/@sentry/browser
