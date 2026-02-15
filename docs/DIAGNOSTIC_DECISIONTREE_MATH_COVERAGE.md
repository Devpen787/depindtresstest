# Diagnostics + Decision Tree + Benchmark Math Coverage

This document records what is currently under math-rigor parity coverage.

## Covered By Centralized Math Helpers

### Diagnostics
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Diagnostic/AuditDashboard.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/diagnosticViewMath.ts` (`calculateDiagnosticState`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Diagnostic/SignalsOfDeathPanel.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/diagnosticViewMath.ts` (`calculateDiagnosticSignals`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Diagnostic/SubsidyTrapChart.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/diagnosticViewMath.ts` (`calculateSubsidyTrapSeries`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Diagnostic/DensityTrapChart.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/diagnosticViewMath.ts` (`calculateDensityTrapSeries`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Diagnostic/HexDegradationMap.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/diagnosticViewMath.ts` (`calculateHexStateProbabilities`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Diagnostic/InflationCapacityScatter.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/diagnosticViewMath.ts` (`calculateInflationCapacityRegression`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Diagnostic/MasterProofMatrix.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/diagnosticViewMath.ts` (`calculateStrategicProof`, `calculateArchitecturalProof`, `calculateMethodologicalProof`, `calculateSolutionProof`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Diagnostic/SensitivityHeatmap.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/diagnosticViewMath.ts` (`calculateBurnPctStep`, `calculateMintStep`, `calculateDisplayMintForRow`, `buildSensitivitySweepGrid`, `classifySensitivityHeatmapBand`).

### Decision Tree
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/DecisionTree/DecisionTreeDashboard.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/decisionTreeViewMath.ts` (`calculateWizardMetrics`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/DecisionTree/Branches/Risk/RiskStabilityView.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/decisionTreeViewMath.ts` (`calculateRiskMetrics`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/DecisionTree/Branches/Miner/MinerProfitabilityView.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/decisionTreeViewMath.ts` (`buildMinerChartData`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/DecisionTree/Branches/Utility/RealUtilityView.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/decisionTreeViewMath.ts` (`buildUtilityChartData`, `summarizeUtility`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/DecisionTree/Branches/Financial/FinancialStabilityView.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/decisionTreeViewMath.ts` (`buildTreasuryChartData`, `summarizeFinancial`).

### Benchmark
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/viewmodels/BenchmarkViewModel.ts`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/benchmarkViewMath.ts` (`calculateAnnualGrowthYoY`, `calculateAnnualizedRevenue`, `calculateSustainabilityRatioPct`, `safePercentDelta`, `safeAbsoluteDelta`).
- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/components/Benchmark/BenchmarkView.tsx`
  Uses `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/benchmarkViewMath.ts` (`calculatePaybackMonths`, `calculateWeeklyRetentionEstimate`, `calculateEfficiencyScore`, `calculateSmoothedSolvencyIndex`, `toPaybackScore`).

## Parity Harness Coverage

- Python generator:
  `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/python/generate_golden_vectors.py`
- Golden vectors:
  `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/fixtures/math_golden_vectors.json`
- TS parity test:
  `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/src/audit/math_parity_golden.test.ts`

Current vector counts:
- Scalar cases: 77
- Sequence cases: 11
