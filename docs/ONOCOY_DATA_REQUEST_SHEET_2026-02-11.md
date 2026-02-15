# Onocoy Evidence Data Request Sheet (2026-02-11)

Purpose:
- Close all remaining `Unverified` items in `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/ONOCOY_CLAIM_VERIFICATION_MATRIX_2026-02-08.md`.
- Replace interpolations/placeholders with auditable primary evidence suitable for thesis citation.

## Request List (Send to Onocoy)

| Request ID | Linked claim(s) | Evidence needed | Why needed | Accepted format | Priority |
| --- | --- | --- | --- | --- | --- |
| R1 | C07 | Official vesting schedule evidence for `Investors` and `Team` allocations, including exact cliff + vesting durations and vesting start anchor (e.g., TGE date). | Current public docs confirm linear vesting but do not confirm exact cliff durations cited in the report. | One of: (a) signed token distribution memo, (b) audited vesting contract docs, (c) on-chain vesting contract addresses + verifiable schedule decode. | High |
| R2 | C08, C09 | Raw weekly/monthly 2025 KPI export used to build Table 3, including columns: period, stations/miners, ONO burned, Data Credits burned, demand/revenue proxy, notes. | Q2/Q3 rows are currently marked as interpolated; `+1,527% Data Credits burned` must be reproducible from raw data. | CSV or XLSX plus a short data dictionary and extraction timestamp. | High |
| R3 | C12 | Full canonical (non-truncated) address map for: community halving wallet, ecosystem wallet, burner/buyback wallet, and any other addresses used in report section 5.1. | Truncated placeholders (`9wy6t9...`, `CjYsUp...`, `E4rqqq...`) cannot be independently validated. | Markdown/CSV table with label, chain, full address, purpose, and owner/controller entity. | High |
| R4 | C13 | Reproducible burn reconstruction query package: exact Dune query ID or SQL, all referenced addresses, chain/schema, and expected output columns/time window. | Current query text cannot run due to placeholders; burn reconstruction is not independently reproducible. | One of: Dune query URL + export, or SQL + CSV output + screenshot of run settings. | High |
| R5 | C14 | Reproducible active-miner reconstruction query package: exact program ID(s), instruction/event names, schema/table paths, filters, and expected output. | Current text includes blank `program_id` and hypothetical instruction naming, so active-miner series is not reproducible. | One of: Dune query URL + export, or SQL + CSV output + screenshot of run settings. | High |

## Minimum Metadata Required For Every Deliverable

- Source system and environment (e.g., Dune query link, dashboard export origin, internal ledger extract).
- Time range covered and timezone.
- Extraction timestamp (UTC).
- Version tag or revision number.
- Contact person for clarification.

## Citation Rules Once Received

- Treat whitepaper Rev 3.0.1 and official docs as base narrative sources.
- Treat R1-R5 outputs as primary empirical evidence for quantitative and forensic claims.
- Do not cite interpolated values as observed facts unless raw source is provided.

## Verification Closeout Checklist

- C07 closed when exact investor/team cliff durations are confirmed by primary vesting evidence.
- C08/C09 closed when KPI table and `+1,527%` calculation are reproducible from raw exports.
- C12 closed when all referenced addresses are complete and match on-chain records.
- C13 closed when burn query is runnable and outputs match reported figures.
- C14 closed when active-miner query is runnable and outputs match reported methodology.
