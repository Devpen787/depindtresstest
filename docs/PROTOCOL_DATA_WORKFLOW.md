# Protocol Data Workflow

## Source of truth

Edit this file first:

- `src/data/protocol_master_sheet.tsv`

It contains:

- protocol profile metadata and baseline tokenomics
- decision-tree calibration knobs
- diagnostic verification summary fields

## Generate runtime artifacts

Run:

```bash
npm run generate:protocol-artifacts
```

This regenerates:

- `src/data/generated/protocolProfiles.generated.ts`
- `src/data/generated/protocolVerificationSummary.generated.ts`
- `src/data/decision_tree_calibration.csv`

## Runtime usage

- `src/data/protocols.ts` reads from `src/data/generated/protocolProfiles.generated.ts`
- `src/data/decisionTreeCalibration.ts` reads from `src/data/decision_tree_calibration.csv`
- `src/components/Diagnostic/ArchetypeLogicPanel.tsx` reads risk/verification summary from `src/data/generated/protocolVerificationSummary.generated.ts`

## Notes

- Keep `protocol_id` stable; it is used as the join key across the app.
- Keep one `default` row (`record_type=default`, `protocol_id=default`) for fallback calibration.
