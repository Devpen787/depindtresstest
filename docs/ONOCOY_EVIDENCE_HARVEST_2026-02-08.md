# Onocoy Evidence Harvest (2026-02-08)

Purpose: first-pass extraction of publicly available Onocoy evidence from official docs, the uploaded whitepaper, and public dashboard traces; identify what is still missing for thesis-grade stress-testing support.

## Sources Checked

- Local whitepaper upload:
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/references/onocoy_whitepaper_301.pdf`
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/references/onocoy_whitepaper_301.md`
- Official docs:
  - https://docs.onocoy.com/documentation
  - https://docs.onocoy.com/documentation/tokenomics
  - https://docs.onocoy.com/documentation/mining-rewards-breakdown
  - https://docs.onocoy.com/documentation/mining-rewards-breakdown/location-scale
  - https://docs.onocoy.com/documentation/mining-rewards-breakdown/quality-scale
  - https://docs.onocoy.com/documentation/service-levels
  - https://docs.onocoy.com/documentation/trading-usdono
  - https://docs.onocoy.com/documentation/bonus-programs/streak-appreciation
  - https://docs.onocoy.com/documentation/bonus-programs/high-value-areas-hva
  - https://docs.onocoy.com/documentation/swapping-bono-to-ono
  - https://docs.onocoy.com/documentation/7.-governance-and-community/dao-and-voting
  - https://docs.onocoy.com/documentation/claim-presale-on-pinksale
- Dune dashboard (public page reference):
  - https://dune.com/onocoy/dashboard
- User-provided secondary report:
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/references/Onocoy_2026_ExhaustiveDueDiligenceAndThesisDefensibilityReport.pdf`
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/references/Onocoy_2026_ExhaustiveDueDiligenceAndThesisDefensibilityReport.md`
- Claim-level verification output:
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/ONOCOY_CLAIM_VERIFICATION_MATRIX_2026-02-08.md`

## New Source Assessment (User-Provided Checklist/Report)

The newly provided report is useful as a synthesis and lead generator, but should be treated as **secondary** unless each claim is re-linked to a primary source.

What it adds:
- Consolidated narrative around economic closure (B2B revenue -> buyback/burn).
- A practical "Dune reproducibility pack" structure (address map + SQL-style logic).
- A reference list that points to several useful Onocoy primary pages/blogs.

What is still non-canonical and must be verified before thesis-critical use:
- Several address entries are truncated/placeholders (e.g., `9wy6t9...`, `CjYsUp...`, burner lists).
- Query examples include placeholders/hypothetical fields (e.g., missing/blank `program_id`, inferred instruction names).
- Some KPI rows are explicitly interpolated/reconstructed (Q2/Q3 estimates), not raw exported time series.

Quick verification from linked primary pages:
- 2025 Year in Review text includes "over 7,500+" stations and "buybacks and burns exceeded 1.7 million."
- Streak blog text confirms "up to +50%" and references 125-day streak cap behavior.
- Full claim-by-claim verdicts are captured in the verification matrix.

## What We Can Already Use

### 1) Core token design and supply

- Two-token model: ONO + data credits.
- ONO supply cap: 810 million.
- Emission decay: 16% annual reduction (halving-style schedule).
- Data credits: non-transferable, fiat-pegged utility token used for service access.
- Allocation split captured in both the whitepaper and current docs snapshot:
  - Team 10%, Ecosystem 32%, Community 40%, Investors 14%, Listing/Market Making 4%.

Whitepaper evidence:
- `onocoy_whitepaper_301.md`: lines ~302-377, 433-449.

Docs evidence:
- `tokenomics` page (token structure, supply cap, deflationary model).

### 2) Miner reward mechanics (dashboard-relevant)

- Base reward components include Quality Scale, Availability Scale, and Location Scale.
- Early Mover Boost documented (initially 5x).
- Streak Appreciation (new operational mechanism):
  - Qualification thresholds:
    - Availability Scale >= 0.98
    - Quality Scale >= 0.80
  - Max bonus: +50% over base reward at 125 qualifying days.
  - Miss-day rule: streak is halved (rounded down).
- High Value Areas (HVA): temporary geo-targeted multipliers with growth/earning/dissolving phases and budget caps.
- Usage rewards are described as planned/future-dominant (not fully active yet per docs wording).

Docs evidence:
- `mining-rewards-breakdown`
- `bonus-programs/streak-appreciation`
- `bonus-programs/high-value-areas-hva`

### 3) Scale formulas and thresholds (directly mappable to model inputs)

- Location Scale:
  - Inner/outer radii documented in docs: 15 km / 50 km.
  - Excludes nearest neighbors (redundancy allowance).
  - Penalty gradient between inner/outer bounds.
  - Includes quality+availability shared factor and multiplicative reduction approach.
- Availability Scale:
  - Availability < 80% => scale 0.
  - Above threshold: nonlinear/exponential scaling (docs indicate current exponent value and dynamic system grant concept).
- Quality Scale:
  - Component structure includes constellation availability, frequency bands, and measurement-quality metrics.
  - Explicit weighting and quality-metric mappings are documented in the page.

Docs evidence:
- `mining-rewards-breakdown/location-scale`
- `mining-rewards-breakdown/quality-scale`

Whitepaper evidence:
- `onocoy_whitepaper_301.md`: lines ~543 onward (Section 4.2 plus quality/location tables).

### 4) Service pricing (for demand/revenue assumptions)

Current docs snapshots show two pricing representations that need canonical reconciliation:
- In `getting-data-credits` and `setting-of-the-credentials` pages:
  - Base subscription: 20 data credits every 30 days.
  - Usage fee: 0.15 data credits per hour.
  - Credential activation deducts 20 data credits immediately for the 30-day plan.
- A separate previously captured doc variant described tiered plans (Basic/Plus/Enterprise).

Practical implication for thesis:
- Treat pricing as version-sensitive until one canonical effective-date schedule is confirmed by Onocoy.

Docs evidence:
- `4.-get-gnss-corrections/getting-data-credits`
- `4.-get-gnss-corrections/setting-of-the-credentials`
- `service-levels`

### 5) Trading + identifiers

- ONO token address published:
  - `onoyC1ZjHNtT2tShqvVSg5WEcQDbu5zht6sdU9Nwjrc`
- BONO token address published:
  - `CzYSquESBM4qVQiFas6pSMgeFRG4JLiYyNYHQUcNxudc`

Docs evidence:
- `trading-usdono`

### 6) BONO -> ONO conversion mechanics (supply-shock modeling input)

Published mechanics include:
- Average BONO:ONO swap framing at ~1:8 over time.
- 4M ONO (~19% of swap pool) unlocked at TGE for swap pool.
- Remaining swap pool unlocks daily, with stated ~3-year halving-style schedule (~21%/year).
- Converted BONO burned.
- Conversion rate depends on unlocked ONO / circulating BONO at conversion time.

Docs evidence:
- `swapping-bono-to-ono`

### 7) Presale unlock detail (investor unlock stress axis)

Published claim flow states:
- Presale ONO unlock at TGE: 10%
- Then 1% unlocked daily (claim mechanics through Streamflow workflow page)
- Presale timing statement in docs: presale held in July 2025.
- Streamflow claim endpoint is published (`.../airdrops/solana/mainnet/5MvXqCytQqfexWwiBjhDWoppnY1oJnY5fvjU6Tr67P5o`), useful as a traceable vesting reference.

Docs evidence:
- `claim-presale-on-pinksale`

### 8) Governance structure and voting design

- Legal wrapper: Swiss non-profit association + on-chain governance.
- Delegation model: anonymous holders -> known delegates.
- Voting mechanism described as square-root voting (quadratic variant).

Docs evidence:
- `dao-and-voting`
- Whitepaper governance section (`onocoy_whitepaper_301.md`: ~500 onward).

### 9) Operational risk controls (high value for stress dashboard)

Key controls directly documented and convertible into dashboard indicators:
- Latency threshold:
  - End-to-end latency should be below 1 second.
  - Larger latency can reduce rewards and potentially disconnect miners.
- Fraud / integrity enforcement:
  - Fraudulent synthetic/duplicate stream detection is described.
  - Consequence includes account ban and slashing of all unclaimed rewards.
- Sell-pressure mitigation mechanisms explicitly listed:
  - Token needed for service access.
  - Continuous token burn.
  - Governance lock requirement for voting power.
  - Fixed max ONO supply (810M).
  - Staking function.
- Daily diagnostics for miner reward underperformance:
  - Location, quality, and availability scales are named as first checks.

Docs evidence:
- `8.-faq-troubleshooting/frequently-asked-questions`

## Public Dashboard Snapshot (Partial)

From indexed public traces of the Dune dashboard page, we can read recent headline cards such as:
- ONO Burned: `90,150,502` (`+1,767,318` in last 7 days)
- ONO Bought: `95,113,347` (`+3,028,880` in last 7 days)
- Amount DC Burned: `$26,648,646` (`+$329,416` in last 7 days)
- Number Streams: `5,008,070` (`+109,552` in last 7 days)
- Revenue: `$4,664,784` (`+$57,648` in last 7 days)
- Active users: `645` (`+26` in last 7 days)

All values above appear with an \"updated 1 day ago\" note in the indexed dashboard trace.

However, direct automated capture is currently constrained:
- Browser capture of `https://dune.com/onocoy/dashboard` in this environment is Cloudflare-challenged.
- Dune API query endpoints require API key for results.

So these values are currently treated as indicative snapshot data until we get direct export/API access.

## Critical Inconsistencies / Risks To Resolve

### Pricing/version drift risk

Current captured docs indicate pricing format drift (subscription+PPU vs tiered plans) across pages/versions.

This must be reconciled before thesis-grade claims on demand elasticity and burn/revenue calibration.

### Whitepaper reference drift inside docs

The FAQ currently references an older whitepaper URL (`https://www.onocoy.com/s/20230825_whitepaper_onocoy_final.pdf`) while the docs shell links Revision 3.0.1 (`onocoy_whitepaper_301.pdf`). In current checks, the older FAQ URL returned `Not found`.

This creates citation-version risk if chapter references are taken from FAQ links without validating the canonical latest whitepaper.

## What We Still Need From You (or Onocoy Team)

1. Authoritative token allocation + vesting schedule version
- One canonical table with effective dates and change log.

2. On-chain address map
- Treasury wallets, rewards pool wallets/contracts, burn addresses, vesting contracts, governance addresses.
- Full (non-truncated) addresses for all entries referenced in the checklist report's address map.

3. Time-series exports (weekly)
- Active stations, new stations, churned stations, streams, ONO rewards minted/distributed, ONO burned, DC burned, revenue, active users.
- Raw series underlying any reconstructed/interpolated KPI rows (especially Q2/Q3 2025).

4. Governance proposal history
- Proposal IDs, dates, parameter changes, old/new values, participation/quorum, execution status.

5. Dune direct access for reproducibility
- Either API key access or CSV exports for dashboard queries used in thesis figures.

6. Parameter-change history for reward scales
- Any changes to quality thresholds, availability threshold/exponent, location radius, streak/HVA rules.

7. Risk-control event exports
- Latency/disconnection incident rates, slashing events, and (if available) aggregated fraud-detection actions over time.

8. Canonical documentation/version map
- One authoritative map of "current" docs pages, effective dates, and deprecated links (especially whitepaper references).

## Best Immediate Next Step

- Confirm the canonical token allocation and provide query-level Dune exports.
- Once that is available, we can lock a thesis-safe baseline and start event-study + simulation calibration without citation risk.
