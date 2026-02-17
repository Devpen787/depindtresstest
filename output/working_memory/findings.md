# Findings Log

1. Global scenario/protocol context is not centralized across tabs:
- index.tsx default tab and nav order differ from intended narrative.
- Scenario controls are local in Benchmark/Thesis/Simulator instead of one global owner.

2. KPI definitions are duplicated with different formulas:
- Payback computed differently in index.tsx brief, benchmark math, sandbox, thesis.

3. Decision brief policy gates are incomplete:
- Contract mentions evidence gating and hold policy in docs, but implementation does not encode evidence_status or enforce downgrade.

4. Labeling/confidence behavior is inconsistent:
- Evidence badges removed in key default views and confidence labels rely on source scores, not uncertainty intervals.

5. Feasibility risk from simulation orchestration:
- tab-enter to benchmark can force simulation reruns; auto-run effects and peer calibration create compute pressure.
