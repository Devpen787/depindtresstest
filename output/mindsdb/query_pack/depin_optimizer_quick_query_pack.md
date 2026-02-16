# MindsDB Query Pack

Mode: quick
Target table: `depin_optimizer_quick_dataset`

## Top 3 Failing Protocols

| Protocol | Chain | Baseline Min Solvency | Break-even | Defense | Flags |
| --- | --- | --- | --- | --- | --- |
| none | - | - | - | - | - |

## Sensitivity Hotspots

| Factor | Mentions | Failing Mentions | Avg Delta | Max Delta |
| --- | --- | --- | --- | --- |
| Demand Strength | 1 | 0 | 0.01 | 0.01 |
| Dilution Sensitivity | 1 | 0 | 0.01 | 0.01 |
| Hardware CapEx | 1 | 0 | 0 | 0 |

## Chain-Level Comparison

| Chain | Protocols | Gate Pass Rate | Break-even Pass Rate | Defense Improved Rate | Avg Baseline Min Solvency | Median Scale Max Providers |
| --- | --- | --- | --- | --- | --- | --- |
| cosmos | 1 | 1 | 1 | 1 | 0.0044 | 600 |

Use the `.sql` file in this folder for direct MindsDB SQL execution.
