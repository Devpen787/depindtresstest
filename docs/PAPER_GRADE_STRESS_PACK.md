# Paper-Grade Stress Pack

This adds a repeatable stress-testing layer modeled after paper-style matrix sweeps:

- 2D matrix sweep over demand volatility and debt ratio.
- 30 simulation runs per cell.
- Explicit run failure criteria with a 1% threshold.
- Heatmap outputs and fixture checks written under `output/paper_stress/`.

## Run

```bash
cd /Users/devinsonpena/Desktop/Files/DePin-Stress-Test
npm run generate:paper-stress-report
```

## Generated Artifacts

- `output/paper_stress/stress_matrix_report.json`
- `output/paper_stress/stress_matrix_cells.csv`
- `output/paper_stress/liquidatable_failure_heatmap.csv`
- `output/paper_stress/insolvency_failure_heatmap.csv`
- `output/paper_stress/paper_stress_report.md`
- `output/paper_stress/decision_tree_fixture_report.json`

## Test Coverage

- `src/audit/paper_stress_pack.test.ts`:
  Validates failure-threshold logic, heatmap banding, and deterministic mini matrix sweeps.
- `src/audit/depin_decision_tree_fixtures.test.ts`:
  Validates Akash/Helium/Bitcoin fixture classifications.
