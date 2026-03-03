# DTSE Product Specification — Thesis-Aligned V1

**DTSE** = **DePIN Token Stress Evaluation**

Version: 1.1  
Status: Active working spec  
Last updated: 2026-03-03

---

## 1. Product Position

DTSE is the primary analytical workflow in the DePIN Stress Test dashboard.

Its job is to answer a bounded question:

> Under matched conditions, what breaks first in a DePIN token coordination loop, when does it break, and which failure signature best describes that deterioration path?

DTSE is:

- a **baseline-relative comparative evaluator**
- an **early-warning diagnostic surface**
- a **stress interpretation workflow**

DTSE is **not**:

- a price prediction tool
- a universal protocol ranking or leaderboard
- a claim about live-network truth outside the modeled scenario envelope
- a deterministic governance recommender

---

## 2. The 5-Stage Workflow

DTSE is organized as a guided 5-stage workflow:

| Stage | Name | Purpose |
|-------|------|---------|
| 1 | **Protocol Context** | Separate protocol context from DTSE output. Show market snapshot, model inputs, protocol mechanics, and interpretation boundaries. |
| 2 | **Applicability** | Determine which metrics are runnable under the current evidence envelope so protocols are not rated unfairly. |
| 3 | **Outcomes** | Show threshold status for the current matched run. Focus on guardrail behavior and scenario-relative diagnostics, not a universal resilience score. |
| 4 | **Failure Autopsy** | Classify the breakdown using thesis-aligned failure signatures. |
| 5 | **Response Paths** | Surface interpretive response areas and tradeoffs for discussion; these are not model-issued mandates. |

---

## 3. Canonical Stress Channels

DTSE should present and evaluate the thesis-final stress channels explicitly:

1. **Baseline Neutral**
2. **Demand Contraction**
3. **Liquidity Shock**
4. **Competitive-Yield Pressure**
5. **Provider Cost Inflation**

These channels are the canonical DTSE framing layer. Internal simulation parameter names may differ, but the UI and exported interpretation should use this vocabulary.

---

## 4. Metric Contract

DTSE v1 evaluates the following core metric families:

- `solvency_ratio`
- `payback_period`
- `weekly_retention_rate`
- `network_utilization`
- `tail_risk_score`
- `vampire_churn` when competitive-yield pressure is active

Interpretation rules:

- metrics are shown against guardrails
- metrics are interpreted inside the selected scenario envelope
- metrics are not aggregated into a universal cross-protocol score

The dashboard may use counts of healthy/watchlist/intervention states as a reading aid, but must not position those counts as a single protocol ranking.

---

## 5. Failure Signature Contract

Stage 4 must use the thesis-final failure-signature vocabulary:

- **Reward–Demand Decoupling**
- **Profitability-Induced Churn**
- **Liquidity-Driven Compression**
- **Elastic Provider Exit**
- **Latent Capacity Degradation**

Each signature should expose:

- the signature label
- the structural pattern
- why it matters
- the trigger logic
- the affected metrics

These signatures are the formal classification layer of DTSE.

---

## 6. Applicability and Evidence Boundaries

Every metric entering DTSE is classified as either:

- **R (Runnable)** — sufficient evidence exists to include the metric
- **NR (Not Runnable)** — the metric is excluded to avoid unfair scoring

Reason codes remain:

- `DATA_AVAILABLE`
- `DATA_MISSING`
- `SOURCE_GRADE_INSUFFICIENT`
- `MANUAL_OVERRIDE`
- `PROXY_ACCEPTED`
- `INTERPOLATION_RISK`

The UI should make provenance legible:

- **LIVE MARKET** for market context
- **MODEL INPUT** for simulation assumptions
- **DTSE OUTPUT** for computed run results

---

## 7. Response Path Boundaries

Stage 5 is intentionally bounded.

It may show:

- interpretation of what the signature implies
- likely response areas to examine
- tradeoffs and dependencies
- comparable peer context

It must not imply:

- that the model directly recommends a governance vote
- that the DAO will take a specific action
- that a response path is universally optimal

Stage 5 exists to support discussion and rerun design, not to replace human judgment.

---

## 8. Runtime and Frozen Modes

DTSE supports two operating modes:

### Live Runtime Mode

- Uses current simulation outputs in memory.
- Stage 2, 3, 4, and 5 should prefer live computed outputs when available.
- Market snapshot may use live CoinGecko data when fetched.

### Frozen Bundle Mode

- Uses precomputed DTSE artifacts from `public/dtse/`.
- Must remain reproducible and present explicit caveats when evidence is partial.

In both modes, exported interpretation must preserve:

- protocol
- scenario
- seed policy
- horizon
- model version
- evidence status

---

## 9. Current Known Gaps

The current implementation still needs follow-up work in these areas:

- explicit baseline-vs-stress drift view
- transmission-pathway / deterioration-order visualization
- full scenario vocabulary normalization across legacy scenario registries
- stale static pack copy cleanup outside the live path

Those are implementation gaps, not changes to the DTSE contract.

---

_End of DTSE Product Specification — Thesis-Aligned V1._
