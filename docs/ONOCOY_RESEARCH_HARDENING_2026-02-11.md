# Onocoy Research Hardening Notes (2026-02-11)

Purpose:
- Integrate `/Users/devinsonpena/Downloads/Onocoy Tokenomics Evidence Gaps.docx` into the thesis evidence stack.
- Keep only claims that are defensible under primary-source citation standards.

## Inputs Reviewed

- Research artifact:
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/references/Onocoy_2026_TokenomicsAudit_DownsideResilience_EvidentiaryGapAssessment.docx`
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/tmp/onocoy_research/Onocoy_2026_TokenomicsAudit_DownsideResilience_EvidentiaryGapAssessment.txt`
- Existing verification baseline:
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/ONOCOY_CLAIM_VERIFICATION_MATRIX_2026-02-08.md`
  - `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/ONOCOY_DATA_REQUEST_SHEET_2026-02-11.md`

## What To Keep (Thesis-Safe Now)

- ONO cap and allocation split (`810M`, `40/32/14/10/4`) from whitepaper/docs.
- ONO emission decay (`16%` annual) from whitepaper/docs.
- ONO and BONO canonical mint addresses from official docs.
- Streak mechanics (`+50%` cap at `125` days; qualification rules) from official docs.
- Availability and Quality reward-scale mechanics from official docs.

## What To Downgrade (Directional, Not Settled)

- `+1,527%` Data Credits burn growth:
  - Keep as `Partially Verified` until raw monthly/weekly export is provided.
- TGE timing:
  - Keep as `Likely Q3 2025`, not exact-date fact, until canonical on-chain event timestamp is attached.
- Burn scale interpretation:
  - Keep as directional unless burn query package is fully reproducible.

## What To Remove From "Verified" Language

- Any claim marked verified using truncated addresses only (`...`).
- Any claim marked verified using placeholder SQL/query fields.
- Any claim where source URL is missing and replaced by numeric placeholders.

## Source-Quality Rules (Use Going Forward)

- Primary: whitepaper Rev 3.0.1, docs.onocoy.com pages, on-chain records, reproducible Dune queries.
- Secondary: Onocoy blog, CoinGecko/CryptoRank/LBank, user-provided synthesis reports.
- Requirement: every thesis-critical claim must include URL, access date, and either on-chain artifact or reproducible query.

## Remaining Blockers (High Priority)

1. Exact investor/team vesting integers and start anchor (`C07`).
2. Raw 2025 KPI time series for Q2/Q3 and DC burn reproducibility (`C08`, `C09`).
3. Full non-truncated wallet map for report section 5.1 entities (`C12`).
4. Runnable burn reconstruction package with exact query IDs/SQL and full addresses (`C13`).
5. Runnable active-miner reconstruction package with program IDs/instruction mapping (`C14`).

## Additional Gaps Worth Closing

1. Canonical TGE on-chain transaction signature and timestamp.
2. Effective-date history for pricing model changes (tiered vs subscription-plus-usage pages).
3. Explicit mapping of Data Credits burn ledger source (on-chain vs internal accounting export).

## Operational Decision

- Treat the new research document as a strong working draft and synthesis layer.
- Do not use it as sole authority for hard quantitative claims until blockers are closed.
