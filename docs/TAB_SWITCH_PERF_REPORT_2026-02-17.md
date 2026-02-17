# Tab Switch Perf Report (2026-02-17)

## Scope
- Measure primary tab-switch latency using in-app perf events (`window.__depinPerfEvents`).
- Validate repeatability across multiple runs.

## Method
1. Ran `npm run test:e2e:perf-tabs`.
2. Perf spec `cypress/e2e/analysis/tab-switch-perf.cy.ts` executed 5 repeated primary-tab journeys:
   - `benchmark -> diagnostic -> thesis -> case_study -> decision_tree -> benchmark`
3. Exported raw events to:
   - `output/perf/tab-switch-events.json`
   - `output/perf/tab-switch-events-run1.json`
   - `output/perf/tab-switch-events-run2.json`

## Results

### Run 1
- count: `25`
- avg: `42.0ms`
- p90: `116.5ms`
- p95: `209.2ms`
- max: `282.7ms`

### Run 2
- count: `25`
- avg: `39.5ms`
- p90: `88.3ms`
- p95: `160.6ms`
- max: `300.3ms`

### Combined (Run 1 + Run 2)
- count: `50`
- avg: `40.7ms`
- p50: `16.5ms`
- p90: `88.3ms`
- p95: `209.2ms`
- max: `300.3ms`

## Hotspot Breakdown (combined)
- `diagnostic`: avg `116.4ms`, p95 `300.3ms`, max `300.3ms`
- `thesis`: avg `32.3ms`, p95 `88.3ms`, max `88.3ms`
- `case_study`: avg `22.0ms`, p95 `49.8ms`, max `49.8ms`
- `decision_tree`: avg `13.3ms`, p95 `38.1ms`, max `38.1ms`
- `benchmark`: avg `19.6ms`, p95 `50.4ms`, max `50.4ms`

## Interpretation
- Most tab switches are fast (sub-100ms at p90).
- The user-visible slowdown is concentrated when entering `Root Causes` (`diagnostic`), not global navigation generally.
- This aligns with heavier chart/module work in diagnostics and should be the next optimization target.

## Action
1. Keep this perf spec as a regression gate (`npm run test:e2e:perf-tabs`).
2. Profile and optimize diagnostics mount path first.

## Optimization Pass (2026-02-17, later run)

### Code changes applied
1. Keep `Root Causes` mounted after first visit so heavy diagnostic charts do not remount on every tab return.
2. Memoize diagnostic dashboard component to reduce hidden rerender churn.
3. Defer benchmark-view-mode restore until entering `Simulator` (instead of restoring on every non-benchmark tab switch).
4. Memoize `SolvencyScorecard` formatted series generation.

### Before vs After (2-run aggregate)
- Baseline files: `output/perf/tab-switch-events-run1.json`, `output/perf/tab-switch-events-run2.json`
- Optimized files: `output/perf/tab-switch-events-after-benchmark-restore-run1.json`, `output/perf/tab-switch-events-after-benchmark-restore-run2.json`

#### Overall
- Before: avg `40.7ms`, p90 `88.3ms`, p95 `209.2ms`, max `300.3ms`
- After: avg `26.7ms`, p90 `38.1ms`, p95 `67.7ms`, max `100.2ms`

#### Root Causes (`diagnostic`)
- Before: avg `116.4ms`, p95 `300.3ms`, max `300.3ms`
- After: avg `22.0ms`, p95 `72.9ms`, max `72.9ms`

### Conclusion
- The navigation slowdown is materially reduced.
- Remaining outliers are now much smaller and no longer dominated by diagnostics remount cost.

## Optimization Pass 2 (Strategy keep-mounted)

### Code changes applied
1. Keep `Strategy` (`thesis`) mounted after first visit, hidden when inactive.
2. Stabilized strategy scenario-select callback path.

### Before vs After (2-run aggregate)
- Baseline files: `output/perf/tab-switch-events-after-benchmark-restore-run1.json`, `output/perf/tab-switch-events-after-benchmark-restore-run2.json`
- Optimized files: `output/perf/tab-switch-events-after-thesis-keepalive-run1.json`, `output/perf/tab-switch-events-after-thesis-keepalive-run2.json`

#### Overall
- Before: avg `26.7ms`, p90 `38.1ms`, p95 `67.7ms`, max `100.2ms`
- After: avg `27.5ms`, p90 `38.9ms`, p95 `51.6ms`, max `73.0ms`

#### Strategy (`thesis`) tab-switch events
- Before: avg `40.0ms`, p95 `100.2ms`, max `100.2ms`
- After: avg `22.9ms`, p95 `30.6ms`, max `30.6ms`

### Conclusion
- Strategy remount spikes are removed.
- Overall long-tail latency improved again (p95 and max both lower).
