# Paper-Grade Stress Pack Report

Generated: 2026-02-11T16:55:46.185Z
Runs per cell: 30
Failure threshold: 1.00%

## Summary

- Liquidatable failure proxy: max underwater-provider share > threshold in a run.
- Insolvency failure proxy: final provider-collapse share > threshold in a run.

- Max safe volatility at debt ratio 1.00 (insolvency <= 10%): 0.03
- Max safe debt ratio at volatility 0.20 (insolvency <= 10%): none

## Liquidatable Failure-Rate Heatmap

Threshold legend: GREEN <= 10%, YELLOW <= 40%, RED > 40%

| DemandVol \ DebtRatio | 0.25 | 0.50 | 0.75 | 1.00 | 1.25 |
| --- | --- | --- | --- | --- | --- |
| 0.03 | RED 96.7% | GREEN 0.0% | GREEN 0.0% | GREEN 0.0% | GREEN 0.0% |
| 0.10 | RED 100.0% | GREEN 3.3% | GREEN 0.0% | GREEN 0.0% | GREEN 0.0% |
| 0.20 | RED 96.7% | GREEN 3.3% | GREEN 0.0% | GREEN 0.0% | GREEN 0.0% |
| 0.35 | RED 93.3% | GREEN 0.0% | GREEN 0.0% | GREEN 0.0% | GREEN 0.0% |
| 0.50 | RED 100.0% | GREEN 3.3% | GREEN 0.0% | GREEN 0.0% | GREEN 0.0% |

## Insolvency Failure-Rate Heatmap

Threshold legend: GREEN <= 10%, YELLOW <= 40%, RED > 40%

| DemandVol \ DebtRatio | 0.25 | 0.50 | 0.75 | 1.00 | 1.25 |
| --- | --- | --- | --- | --- | --- |
| 0.03 | RED 93.3% | RED 76.7% | YELLOW 36.7% | GREEN 3.3% | YELLOW 13.3% |
| 0.10 | RED 80.0% | YELLOW 36.7% | YELLOW 40.0% | YELLOW 16.7% | YELLOW 16.7% |
| 0.20 | RED 76.7% | RED 60.0% | YELLOW 40.0% | YELLOW 23.3% | YELLOW 13.3% |
| 0.35 | RED 80.0% | RED 53.3% | YELLOW 30.0% | YELLOW 26.7% | YELLOW 13.3% |
| 0.50 | RED 73.3% | RED 56.7% | YELLOW 30.0% | YELLOW 26.7% | YELLOW 13.3% |

## Decision-Tree Fixtures

| Fixture | Expected | Actual | Pass |
| --- | --- | --- | --- |
| akash | DePIN-LI | DePIN-LI | yes |
| helium_iot | DePIN-LD | DePIN-LD | yes |
| bitcoin | Not DePIN | Not DePIN | yes |
