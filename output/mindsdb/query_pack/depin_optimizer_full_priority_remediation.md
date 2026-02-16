# Priority Remediation List

Mode: full

| Rank | Protocol | Chain | Min Solvency | Priority | Primary Focus | Validation Command |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Nosana (nosana_v1) | solana | 0 | P0 critical | Fix break-even failure first; raise solvency floor at suggested price before other optimizations. | `npm run skill:optimizer:quick -- --profile nosana_v1` |
| 2 | Filecoin (filecoin_v1) | filecoin | 0.0036 | P0 critical | Fix break-even failure first; raise solvency floor at suggested price before other optimizations. | `npm run skill:optimizer:quick -- --profile filecoin_v1` |
| 3 | Akash (akash_v1) | cosmos | 0.005 | P0 critical | Fix break-even failure first; raise solvency floor at suggested price before other optimizations. | `npm run skill:optimizer:quick -- --profile akash_v1` |
| 4 | Aleph.im (aleph_v1) | solana | 0.0098 | P0 critical | Fix break-even failure first; raise solvency floor at suggested price before other optimizations. | `npm run skill:optimizer:quick -- --profile aleph_v1` |
| 5 | XNET (xnet_v1) | solana | 0.1681 | P2 elevated | Fix break-even failure first; raise solvency floor at suggested price before other optimizations. | `npm run skill:optimizer:quick -- --profile xnet_v1` |

## Secondary Focus
1. Nosana (nosana_v1): Tune hardware assumptions (`hardwareCost`, `proTierPct`, `proTierEfficiency`) before scale tests.
2. Filecoin (filecoin_v1): Reduce dilution pressure (`kMintPrice`, `maxMintWeekly`, burn alignment) and validate minimum solvency.
3. Akash (akash_v1): Reduce dilution pressure (`kMintPrice`, `maxMintWeekly`, burn alignment) and validate minimum solvency.
4. Aleph.im (aleph_v1): Recalibrate demand side (`kBuyPressure`, `baseDemand`, demand regime) and rerun break-even check.
5. XNET (xnet_v1): Reduce dilution pressure (`kMintPrice`, `maxMintWeekly`, burn alignment) and validate minimum solvency.
