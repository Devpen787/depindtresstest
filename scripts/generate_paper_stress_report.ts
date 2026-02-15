import fs from 'node:fs';
import path from 'node:path';
import {
  PAPER_DEBT_RATIO_LEVELS,
  PAPER_FAILURE_THRESHOLD,
  PAPER_STRESS_RUNS_PER_CELL,
  PAPER_VOLATILITY_LEVELS,
  classifyHeatBand,
  runPaperStressMatrix,
  type PaperStressCell,
} from '../src/audit/paperStressPack.ts';
import { classifyDepinDecision, type DepinDecisionInput } from '../src/audit/depinDecisionTree.ts';

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function toCellLabel(rate: number): string {
  return `${classifyHeatBand(rate)} ${formatPct(rate)}`;
}

function matrixTableMarkdown(
  title: string,
  matrix: number[][],
  demandVolatilityLevels: number[],
  debtRatios: number[],
): string {
  const header = ['DemandVol \\ DebtRatio', ...debtRatios.map((ratio) => ratio.toFixed(2))];
  const divider = header.map(() => '---');
  const rows = matrix.map((row, index) => {
    const volatility = demandVolatilityLevels[index];
    return [volatility.toFixed(2), ...row.map((rate) => toCellLabel(rate))];
  });

  return [
    `## ${title}`,
    '',
    `Threshold legend: GREEN <= 10%, YELLOW <= 40%, RED > 40%`,
    '',
    `| ${header.join(' | ')} |`,
    `| ${divider.join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
    '',
  ].join('\n');
}

function buildCellsCsv(cells: PaperStressCell[]): string {
  const header = [
    'demand_volatility',
    'debt_ratio',
    'run_count',
    'liquidatable_failure_rate',
    'insolvency_failure_rate',
    'avg_max_underwater_share',
    'avg_final_solvency_deficit',
    'avg_final_provider_collapse_share',
    'avg_final_solvency_score',
    'avg_final_price',
    'avg_final_providers',
  ];

  const rows = cells.map((cell) => [
    cell.demandVolatility.toFixed(4),
    cell.debtRatio.toFixed(4),
    String(cell.runCount),
    cell.liquidatableFailureRate.toFixed(6),
    cell.insolvencyFailureRate.toFixed(6),
    cell.avgMaxUnderwaterShare.toFixed(6),
    cell.avgFinalSolvencyDeficit.toFixed(6),
    cell.avgFinalProviderCollapseShare.toFixed(6),
    cell.avgFinalSolvencyScore.toFixed(6),
    cell.avgFinalPrice.toFixed(6),
    cell.avgFinalProviders.toFixed(6),
  ]);

  return [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function buildHeatmapCsv(
  matrix: number[][],
  demandVolatilityLevels: number[],
  debtRatios: number[],
): string {
  const header = ['demand_volatility', ...debtRatios.map((value) => value.toFixed(2))];
  const rows = matrix.map((row, idx) => [
    demandVolatilityLevels[idx].toFixed(2),
    ...row.map((value) => value.toFixed(6)),
  ]);
  return [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function findSafeOperatingPoint(
  matrix: number[][],
  demandVolatilityLevels: number[],
  debtRatios: number[],
): { maxSafeVolatilityAtDebt1: number | null; maxSafeDebtAtVol20: number | null } {
  const debtOneIndex = debtRatios.findIndex((ratio) => Math.abs(ratio - 1.0) < 1e-9);
  const vol20Index = demandVolatilityLevels.findIndex((volatility) => Math.abs(volatility - 0.2) < 1e-9);

  let maxSafeVolatilityAtDebt1: number | null = null;
  if (debtOneIndex >= 0) {
    demandVolatilityLevels.forEach((volatility, index) => {
      const rate = matrix[index]?.[debtOneIndex] ?? 1;
      if (rate <= 0.1) {
        maxSafeVolatilityAtDebt1 = volatility;
      }
    });
  }

  let maxSafeDebtAtVol20: number | null = null;
  if (vol20Index >= 0) {
    debtRatios.forEach((debtRatio, index) => {
      const rate = matrix[vol20Index]?.[index] ?? 1;
      if (rate <= 0.1) {
        maxSafeDebtAtVol20 = debtRatio;
      }
    });
  }

  return {
    maxSafeVolatilityAtDebt1,
    maxSafeDebtAtVol20,
  };
}

function runDecisionFixtures() {
  const fixtures: Array<{ id: string; input: DepinDecisionInput; expected: string }> = [
    {
      id: 'akash',
      input: {
        hasThreeSidedPlatform: true,
        hasTokenIncentivesForSupply: true,
        hasPhysicalInfrastructureSupply: true,
        supplyAssetsFungible: true,
      },
      expected: 'DePIN-LI',
    },
    {
      id: 'helium_iot',
      input: {
        hasThreeSidedPlatform: true,
        hasTokenIncentivesForSupply: true,
        hasPhysicalInfrastructureSupply: true,
        supplyAssetsFungible: false,
      },
      expected: 'DePIN-LD',
    },
    {
      id: 'bitcoin',
      input: {
        hasThreeSidedPlatform: false,
        hasTokenIncentivesForSupply: true,
        hasPhysicalInfrastructureSupply: true,
        supplyAssetsFungible: true,
      },
      expected: 'Not DePIN',
    },
  ];

  return fixtures.map((fixture) => {
    const actual = classifyDepinDecision(fixture.input);
    return {
      id: fixture.id,
      expected: fixture.expected,
      actual: actual.classification,
      pass: actual.classification === fixture.expected,
      satisfiedCriteria: actual.satisfiedCriteria,
      notes: actual.notes,
    };
  });
}

function main() {
  const report = runPaperStressMatrix({
    demandVolatilityLevels: PAPER_VOLATILITY_LEVELS,
    debtRatios: PAPER_DEBT_RATIO_LEVELS,
    runsPerCell: PAPER_STRESS_RUNS_PER_CELL,
    failureThreshold: PAPER_FAILURE_THRESHOLD,
  });

  const decisionFixtures = runDecisionFixtures();
  const safe = findSafeOperatingPoint(
    report.insolvencyHeatmap,
    report.demandVolatilityLevels,
    report.debtRatios,
  );

  const outDir = path.resolve(process.cwd(), 'output/paper_stress');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, 'stress_matrix_report.json'),
    JSON.stringify(
      {
        ...report,
        safeOperatingPoint: safe,
      },
      null,
      2,
    ),
    'utf8',
  );

  fs.writeFileSync(path.join(outDir, 'stress_matrix_cells.csv'), buildCellsCsv(report.cells), 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'liquidatable_failure_heatmap.csv'),
    buildHeatmapCsv(report.liquidatableHeatmap, report.demandVolatilityLevels, report.debtRatios),
    'utf8',
  );
  fs.writeFileSync(
    path.join(outDir, 'insolvency_failure_heatmap.csv'),
    buildHeatmapCsv(report.insolvencyHeatmap, report.demandVolatilityLevels, report.debtRatios),
    'utf8',
  );

  fs.writeFileSync(
    path.join(outDir, 'decision_tree_fixture_report.json'),
    JSON.stringify(
      {
        generatedAtIso: new Date().toISOString(),
        fixtures: decisionFixtures,
      },
      null,
      2,
    ),
    'utf8',
  );

  const markdown = [
    '# Paper-Grade Stress Pack Report',
    '',
    `Generated: ${report.generatedAtIso}`,
    `Runs per cell: ${report.runsPerCell}`,
    `Failure threshold: ${(report.failureThreshold * 100).toFixed(2)}%`,
    '',
    '## Summary',
    '',
    '- Liquidatable failure proxy: max underwater-provider share > threshold in a run.',
    '- Insolvency failure proxy: final provider-collapse share > threshold in a run.',
    '',
    `- Max safe volatility at debt ratio 1.00 (insolvency <= 10%): ${safe.maxSafeVolatilityAtDebt1 ?? 'none'}`,
    `- Max safe debt ratio at volatility 0.20 (insolvency <= 10%): ${safe.maxSafeDebtAtVol20 ?? 'none'}`,
    '',
    matrixTableMarkdown(
      'Liquidatable Failure-Rate Heatmap',
      report.liquidatableHeatmap,
      report.demandVolatilityLevels,
      report.debtRatios,
    ),
    matrixTableMarkdown(
      'Insolvency Failure-Rate Heatmap',
      report.insolvencyHeatmap,
      report.demandVolatilityLevels,
      report.debtRatios,
    ),
    '## Decision-Tree Fixtures',
    '',
    '| Fixture | Expected | Actual | Pass |',
    '| --- | --- | --- | --- |',
    ...decisionFixtures.map(
      (fixture) => `| ${fixture.id} | ${fixture.expected} | ${fixture.actual} | ${fixture.pass ? 'yes' : 'no'} |`,
    ),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'paper_stress_report.md'), markdown, 'utf8');

  console.log(`Wrote report bundle to ${outDir}`);
  console.log(`Cells: ${report.cells.length}`);
  console.log(`Decision fixtures: ${decisionFixtures.length}`);
}

main();
