# Math Audit Bundle

This bundle adds three recurring checks:

1. Historical backtest calibration scorecard (baseline vs bounded-search calibrated fit).
2. Seed robustness sweep (200 seeds across core scenarios).
3. Property/invariant tests for simulation math safety.

The backtest scorecard now runs a deterministic bounded parameter search for `helium_bme_v1` and records:
- baseline objective,
- calibrated objective,
- objective improvement, and
- explicit limitation flags when provider-path alignment remains structurally weak.

Calibration search now includes structural provider dynamics:
- `preorderBacklogFraction`
- `preorderReleaseWeeks`
- `sunkCostChurnDamping`

## Commands

```bash
cd /Users/devinsonpena/Desktop/Files/DePin-Stress-Test
npm run test:math-invariants
npm run test:backtest-calibration
npm run generate:math-audit
```

## Outputs

Under `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/output/math_audit/`:

- `backtest_calibration.md`
- `backtest_calibration.csv`
- `backtest_calibration.json`
- `seed_robustness.md`
- `seed_robustness.csv`
- `seed_robustness.json`
