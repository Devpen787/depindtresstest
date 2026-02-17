# Owner + Mirror Decision Matrix (2026-02-17)

## Purpose
Freeze the v1 owner model and KPI ownership contracts using accepted, repo-grounded decisions only.

## v1 Owner Model (Frozen)

| Owner (User Label) | Current Surface Mapping | Unique Question | Unique Artifact | Must Not Own |
|---|---|---|---|---|
| `Explore` | `Workspace > Browse` (`explorer`) | What should we review first? | Shortlisted protocol set | Final decision/recommendation |
| `Benchmark` | `Benchmark` (`benchmark`) + `Workspace > Compare` (`comparison`) | How does it perform versus peers? | Peer-relative KPI snapshot | Root-cause decomposition |
| `Diagnose` | `Root Causes` (`diagnostic`) | Why is it weak or strong? | Root-cause + sensitivity findings | Portfolio decision narrative |
| `Scenario Lab` | `Workspace > Experiment` (`sandbox`) | What changes if we move levers? | Scenario delta runs (before/after) | Final recommendation text |
| `Decision Brief` | `Decide` (`DecisionTreeDashboard`) + export action | What is our call now? | Go/Hold/No-Go + confidence + actions | Exploratory chart sprawl |
| `Case Studies` | `Evidence` (`case_study`) | What precedent/context helps interpretation? | Supporting narrative evidence | Real-time KPI gating |

## KPI Ownership Contract (v1)

| KPI Family | Owner | Allowed Mirrors | Mirror Constraint |
|---|---|---|---|
| Payback / ROI | `Benchmark` + `Decision Brief (Miner branch)` | `Compare`, `Scenario Lab`, `Strategy` surfaces | Mirrors cannot redefine thresholds or wording |
| Solvency / Burn-vs-Emission | `Diagnose` + `Decision Brief (Financial branch)` | `Benchmark summary`, `Scenario Lab` | Mirrors must use owner formula + guardrail labels |
| Utility / Capacity / Utilization | `Decision Brief (Utility branch)` | `Benchmark`, `Scenario Lab`, `Strategy` surfaces | Mirrors must label projected vs comparative context |
| Sensitivity | `Diagnose` | `Decision Brief (Risk branch)`, benchmark summaries | Mirrors cannot run divergent ranges/logic by default |
| Tail Risk | `Decision Brief (Risk branch)` | `Diagnose` | Mirrors must preserve scenario context label |

## Mirror Rules (Non-Negotiable)
1. One owner defines each KPI interpretation.
2. Mirrors may restyle presentation only; no formula/threshold redefinition.
3. Protocol/scenario state must stay globally synchronized.
4. If owner confidence/evidence minimum fails, mirrors inherit same warning state.

## Keep / Merge / Park (Execution Decisions)

### Keep
1. `Browse` discovery table and shortlist actions.
2. `Benchmark` peer snapshot.
3. `Diagnose` causal + sensitivity suite.
4. `Decision Brief` branch-guided call surface.

### Merge
1. `Benchmark` + `Compare` into one benchmark owner behavior:
- `Benchmark` keeps executive narrative.
- `Compare` remains dense matrix sub-surface, not separate decision owner.

### Park (Default-off, Advanced-on)
1. Duplicate compact charts in `Scenario Lab` that repeat owner KPI stories.
2. Non-decision educational text blocks in default first-review path.

## Mandatory First-Review Path (v1)
1. `Explore` -> choose protocol.
2. `Benchmark` -> inspect peer-relative posture.
3. `Decision Brief` -> produce call.
4. Conditional jump to `Diagnose` and/or `Scenario Lab` only when guardrails are weak or confidence is low.

## Decision Brief Minimum Output Schema (v1)
```json
{
  "decision": "go | hold | no_go",
  "confidence": "low | medium | high",
  "top_drivers": ["string", "string", "string"],
  "recommended_actions": [
    { "owner_role": "string", "action": "string", "trigger": "string", "expected_effect": "string" }
  ],
  "scenario_id": "string",
  "protocol_id": "string",
  "evidence_status": "complete | partial | missing",
  "generated_at_utc": "ISO-8601"
}
```

## Explicitly Deferred (Not Frozen in v1)
1. New `Network State` owner tab and Sankey-first IA.
2. Mandatory PDF-only export requirement (format can evolve after owner contracts stabilize).
3. New external data feeds not already wired.

