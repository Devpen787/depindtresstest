# MindsDB Query Pack

Mode: full
Target table: `depin_optimizer_full_dataset`

## Top 10 Failing Protocols

| Protocol | Chain | Baseline Min Solvency | Break-even | Defense | Flags |
| --- | --- | --- | --- | --- | --- |
| Nosana (nosana_v1) | solana | 0 | FAIL | PASS | 1 |
| Filecoin (filecoin_v1) | filecoin | 0.0036 | FAIL | PASS | 1 |
| Akash (akash_v1) | cosmos | 0.005 | FAIL | PASS | 1 |
| Aleph.im (aleph_v1) | solana | 0.0098 | FAIL | PASS | 1 |
| XNET (xnet_v1) | solana | 0.1681 | FAIL | PASS | 1 |
| ONOCOY (ono_v3_calibrated) | solana | 0.1923 | FAIL | PASS | 1 |
| Geodnet (geodnet_v1) | solana | 0.3624 | FAIL | PASS | 1 |

## Sensitivity Hotspots

| Factor | Mentions | Failing Mentions | Avg Delta | Max Delta |
| --- | --- | --- | --- | --- |
| Dilution Sensitivity | 10 | 5 | 5.72 | 10.96 |
| Demand Strength | 9 | 4 | 3.4744 | 19.93 |
| Emission Cap | 9 | 6 | 2.8767 | 11.66 |
| Churn Sensitivity | 7 | 3 | 0.4229 | 2.08 |
| Hardware CapEx | 4 | 3 | 1.235 | 3.57 |

## Chain-Level Comparison

| Chain | Protocols | Gate Pass Rate | Break-even Pass Rate | Defense Improved Rate | Avg Baseline Min Solvency | Median Scale Max Providers |
| --- | --- | --- | --- | --- | --- | --- |
| polygon | 1 | 1 | 1 | 1 | 0.7086 | 18750 |
| solana | 10 | 0.5 | 0.5 | 1 | 0.7342 | 225 |
| filecoin | 1 | 0 | 0 | 1 | 0.0036 | 300 |
| cosmos | 1 | 0 | 0 | 1 | 0.005 | 80 |

Use the `.sql` file in this folder for direct MindsDB SQL execution.
