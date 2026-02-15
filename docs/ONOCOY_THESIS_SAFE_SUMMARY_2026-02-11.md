# Onocoy Thesis-Safe Summary (2026-02-11)

This summary integrates recent research while preserving only defensible claim strength under the current evidence state.

## 1) Solvency and Growth Signals (Current Evidence Strength)

- Utility growth signal is strong:
  - Year-in-review reports DC burn growth from `25,266` to `411,161` and `7,500+` stations by Dec 2025.
- Deflationary mechanism exists:
  - ONO buyback/burn behavior is documented, and burn addresses are referenced in project materials.
- Emissions architecture is documented:
  - ONO cap (`810M`) and annual emission decay (`16%`) are supported by whitepaper/docs.

Claim posture:
- `+1,527% DC burn` should be treated as `Partially Verified` unless raw monthly/weekly export is supplied.
- `1.7M+ ONO buybacks/burns` is currently directional from project-published reporting; direct accounting linkage to B2B revenue remains incomplete in public artifacts.

## 2) Critical Evidence Gaps ("Integer Gap")

| Asset Class | Mechanism | Missing Integer/Data | Risk Level |
| --- | --- | --- | --- |
| Investors | Linear monthly vesting | Exact duration and vesting start anchor | High |
| Team | Lock + linear vesting | Exact cliff and vest length | High |
| Miners | Reward/heartbeat observability | Canonical heartbeat/reward program mapping | Medium |

Audit implication:
- Without vesting integers, unlock-pressure timing and overhang cannot be modeled defensibly for mid/late 2026 stress windows.

## 3) Monitoring Package (Use As Draft Until Reproducibility Closes)

- ONO burn SQL and active-miner proxy SQL are useful starting logic.
- These must be labeled `proxy/draft` until:
  - Full canonical addresses are provided (no truncation),
  - Query IDs or fully runnable SQL is published,
  - Program IDs and instruction mappings are confirmed.

## 4) TGE and Risk Window Language (Use This Wording)

- Use: `TGE likely in Q3 2025 based on converging public signals`.
- Avoid: `exact TGE date confirmed` unless tied to canonical on-chain transaction timestamp.
- Use: `Q3 2026 is a potential unlock-risk window conditional on currently unpublished vesting integers`.

## 5) Source Hierarchy and Citation Hygiene

- Primary for hard claims:
  - Onocoy whitepaper Rev 3.0.1
  - docs.onocoy.com
  - on-chain records and runnable query outputs
- Secondary/contextual only:
  - Onocoy blog posts
  - User-provided synthesis reports
  - Video explainers (not primary evidence)

## 6) Practical Bottom Line

- The network shows credible utility traction and documented token-mechanism design.
- Final thesis defensibility still depends on closing the five unresolved blockers:
  - Vesting integers,
  - Raw Q2/Q3 KPI exports,
  - Full address map,
  - Runnable burn query package,
  - Runnable active-miner query package.
