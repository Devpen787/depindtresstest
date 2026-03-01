# Protocol Data Sources

Use this file as the quick map for where reliable protocol information lives in the repo.

## Primary rule

Do not treat all protocol data as coming from one file. The repo has separate source-of-truth layers for:

- baseline protocol/model inputs
- verified qualitative protocol facts
- live market data
- DTSE copy and presentation

## Source map

| Need | Primary file | What it owns | Notes |
|---|---|---|---|
| Baseline protocol parameters for all protocols | `src/data/protocol_master_sheet.tsv` | Mechanism, `coingecko_id`, chain, supply baseline, emissions, burn fraction, initial price, provider count, calibration fields | Edit here first for shared protocol baseline data |
| Generated runtime protocol profiles | `src/data/generated/protocolProfiles.generated.ts` | Generated artifact consumed by the app | Do not edit directly; generated from `src/data/protocol_master_sheet.tsv` |
| App-facing protocol profile import | `src/data/protocols.ts` | Typed wrapper around generated profiles | Read-only entry point for app code |
| Verified protocol facts for Diagnostic/Evidence-style surfaces | `src/data/verifiedProjectData.ts` | Hardware, emissions model descriptions, validation method, verified references | Scope is verified/reference facts, not live market data |
| Live market data | `src/services/coingecko.ts` | Price, market cap, circulating supply, total supply, max supply, volume | Runtime fetch only; not stored as a static checked-in dataset |
| Live market fetch wiring into app state | `index.tsx` | Fetches CoinGecko data and maps it by `profile.metadata.id` | Triggered from `Data > Fetch Live Data` |
| Metric-level evidence provenance | `src/data/metricEvidence.ts` | Evidence references, source grade, reproducibility status | Use this when asking “where did this metric come from?” |
| DTSE protocol copy and stage-specific framing | `src/data/dtseContent.ts` | Protocol brief copy, metric explanations, recommendations, DTSE-specific presentation text | Not the source of truth for live market values |

## Update workflow

### If the protocol baseline is wrong

1. Edit `src/data/protocol_master_sheet.tsv`
2. Run `npm run generate:protocol-artifacts`
3. Verify changes in:
   - `src/data/generated/protocolProfiles.generated.ts`
   - `src/data/generated/protocolVerificationSummary.generated.ts`
   - `src/data/decision_tree_calibration.csv`

### If a verified protocol fact is wrong

Edit:

- `src/data/verifiedProjectData.ts`

Use this for sourced facts such as hardware type, price range, token model description, validation method, and similar verified notes.

### If the live market values are wrong

Check:

1. `src/services/coingecko.ts` for the correct `coingeckoId`
2. `src/data/protocol_master_sheet.tsv` for the profile `coingecko_id`
3. `index.tsx` live fetch wiring

Important:

- DTSE Stage 1 market values come from the runtime CoinGecko fetch.
- DTSE model inputs come from the protocol profile baseline.

## Anti-patterns

Do not use these as protocol source-of-truth files:

- `src/data/dtseContent.ts` for live market values
- `src/components/*` for protocol facts
- generated files as manual edit points

## Recommended mental model

- `protocol_master_sheet.tsv` = baseline protocol assumptions
- `verifiedProjectData.ts` = sourced factual protocol notes
- `coingecko.ts` = live market snapshot
- `dtseContent.ts` = DTSE presentation layer
