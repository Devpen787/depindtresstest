# Onocoy Dashboard Essential Gaps Map (2026-02-11)

Purpose:
- Translate unresolved evidence into concrete dashboard requirements for the thesis objective:
  stress-test DePIN tokenomics under downside conditions before real-world failure.

## Must-Have Panels And Required Evidence

| Panel / Module | Why essential for thesis | Required evidence to enable defensible output | Current status |
| --- | --- | --- | --- |
| Supply Shock Radar | Detect unlock-driven sell-pressure risk before churn/capacity collapse. | Investor/team vesting integers + vesting start anchor + canonical TGE timestamp. | Blocked |
| Burn vs Issuance Solvency Curve | Core solvency diagnostic (`burn-to-mint`, net inflation pressure). | Reproducible ONO burn query package + issuance schedule + time-aligned series. | Partially blocked |
| Revenue Quality Regime Panel | Distinguish durable usage growth from single-period spikes. | Raw Q2/Q3 2025 monthly or weekly KPI export, not interpolations. | Blocked |
| Provider Retention and Capacity Risk Panel | Measure miner attrition and capacity degradation lag under stress. | Active-miner program ID and runnable query package; proxy-only method is insufficient for final thesis claims. | Blocked |
| Address Integrity and Treasury Segregation Panel | Verify allocation discipline and anti-commingling over time. | Full non-truncated canonical address map for halving, ecosystem, burner, vesting entities. | Blocked |
| Evidence Confidence Layer | Prevent overclaiming in dashboard narration. | Per-metric source-grade tags (`Primary`, `Secondary`, `Proxy`, `Interpolated`). | Can ship now |

## Minimum Data Contract (What Each Metric Must Carry)

- `metric_id`
- `definition`
- `source_url_or_query_id`
- `source_grade` (`primary|secondary|proxy|interpolated`)
- `time_window` and timezone
- `extraction_timestamp_utc`
- `reproducibility_status` (`runnable|not_runnable`)

## Immediate Build Guidance

1. Ship the confidence layer immediately and tag any currently unresolved metric as `proxy` or `interpolated`.
2. Keep solvency and churn charts visible, but gate definitive narrative text until query/address blockers close.
3. Add explicit warning callouts where model outputs depend on missing vesting integers.

## Acceptance Criteria For Thesis-Grade Dashboard

1. Every high-impact KPI links to a runnable query or on-chain artifact.
2. No `Verified` label appears on truncated addresses or placeholder SQL.
3. Unlock-risk timeline is computed from confirmed vesting integers and anchored to a canonical TGE timestamp.
4. Revenue/burn growth claims are calculated from raw exported series, not reconstructed interpolation.
