# Evidence Status Memo: Onocoy Primary Inputs (M1-M3)
Date: 2026-02-16
Prepared for: Dashboard stakeholders (governance, builders, token-risk readers)

## Scope
This memo assesses whether current research closes the remaining dashboard evidence gaps:
- M1: Weekly spoofing detections
- M2: Weekly slashing events
- M3: Canonical unlock events

Inputs reviewed:
- /Users/devinsonpena/Downloads/A) Executive Summary.docx
- /Users/devinsonpena/Downloads/Onocoy Data Feed Research Steps.docx
- Live endpoint checks run on 2026-02-16

## Executive Status
| Gap | Status | Decision |
|---|---|---|
| M1 (Spoofing weekly counts) | Red | Not closed |
| M2 (Slashing weekly counts) | Red | Not closed |
| M3 (Canonical unlock events) | Yellow | Partially closed; still insufficient for full dashboard evidence |

## Evidence and Findings

### M1 - Weekly spoofing detections
Required for closure:
- `week_start_utc`
- `spoofing_events_total`
- `stations_flagged_total`

What was found:
- Public docs describe spoofing detection concepts and integrity monitoring.
- No public weekly aggregated spoofing dataset was found.
- No publicly reproducible feed was found for those required fields.

Conclusion:
- Gap remains open. Dashboard cannot produce direct evidence-backed spoofing trend answers.

### M2 - Weekly slashing events
Required for closure:
- `week_start_utc`
- `slashing_events_total`
- `slashed_stations_total`
- Optional: `slashed_ono_total`, reason buckets

What was found:
- Public docs describe slashing/penalty mechanics.
- No public weekly slashing event series was found.
- No public dataset with counts by week was found.

Conclusion:
- Gap remains open. Dashboard still relies on proxy assumptions for slashing pressure.

### M3 - Canonical unlock events
Required for closure:
- `unlock_date_utc`
- `bucket`
- `amount_ono`
- `event_type` (`cliff`/`linear`/`manual`)
- `schedule_version`
- Optional: `tx_hash`/source reference

What was found:
- Public tokenomics and blog sources provide high-level allocation and vesting structure.
- Some presale/vesting mechanics are described.
- Full event-level canonical schedule (all buckets, exact dated amounts) is not publicly complete.

Conclusion:
- Partial coverage only. Not enough for a full canonical unlock event pipeline in the dashboard.

## Live Access Verification (2026-02-16)
- `https://api.testing.onocoy.com/` -> `404`
- `https://api.testing.onocoy.com/api/v1/moken/getStatus` -> `401 Missing API token`
- `https://api.testing.onocoy.com/api/v1/moken/getRewards` -> `401 Missing API token`
- `https://docs.onocoy.com/documentation/tokenomics.md` -> `200`
- `https://docs.onocoy.com/documentation/8.-faq-troubleshooting/frequently-asked-questions.md` -> `200`

Interpretation:
- Candidate API routes exist but are access-controlled; currently not publicly reproducible without authorized token/owner support.

## What This Means for the Dashboard
- M1/M2 should remain marked `N` (`insufficient_data`) until primary weekly telemetry is provided.
- M3 remains `N` for canonical mode in current acceptance logic until full event-level unlock schedule is provided and wired.
- Current scores are stable because these are capability/data-source gaps, not evaluator noise.

## Closure Requirements (Minimum Acceptable Deliverable)
1. M1 export (weekly, UTC):
   - `week_start_utc, spoofing_events_total, stations_flagged_total`
2. M2 export (weekly, UTC):
   - `week_start_utc, slashing_events_total, slashed_stations_total`
3. M3 export (event-level):
   - `unlock_date_utc, bucket, amount_ono, event_type, schedule_version`
4. Provenance metadata:
   - source owner, extraction timestamp, refresh cadence, and schema definition

## Recommended Next Step
Send formal request to Onocoy data owner/co-founder for the three exports above, with weekly refresh commitment. Once received, run ingestion + acceptance rerun and move `M1-M3` from unresolved to evidence-backed.
