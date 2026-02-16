import fs from 'node:fs';
import path from 'node:path';

type Mode = 'quick' | 'full';
type DoneScope = 'optimizer' | 'dashboard';
type CriterionStatus = 'PASS' | 'FAIL' | 'PENDING';

interface CliOptions {
  profile: string;
  mode: Mode;
  doneScope: DoneScope;
  outputDir: string;
  reportPath?: string;
  summaryPath: string;
  acceptanceSummaryPath?: string;
  requiredConsecutiveGreens: number;
  enforceDoneMarker: boolean;
}

interface OptimizerReport {
  profile: { id: string; name: string };
  mode: string;
  baseline?: {
    finalPrice?: number;
  };
  optimizer: {
    breakEven: {
      suggestedPrice: number;
      minSolvencyAtSuggestedPrice: number;
      isThresholdMetAtSuggestedPrice: boolean;
    };
    scale: {
      maxProviders: number;
      minSolvencyAtMaxScale: number;
      minSolvencyAtStressScale: number;
      retentionRatioAtMaxScale?: number;
      retentionRatioAtStressScale?: number;
    };
    defense: {
      threatYield: number;
      suggestedEmission: number;
      baselineChurnRate: number;
      optimizedChurnRate: number;
      improvedVsBaseline: boolean;
    };
  };
  flags: string[];
}

interface AcceptanceCoverageSummary {
  filePath: string;
  practicalCoveragePct: number;
  totalSections: number;
  passingSections: number;
  failingSections: string[];
}

interface CriterionResult {
  name: string;
  status: CriterionStatus;
  details: string;
  required: boolean;
}

interface DoneMarkerEvaluation {
  criteria: CriterionResult[];
  finalStatus: 'DONE' | 'NOT_DONE' | 'PENDING';
}

const ACCEPTANCE_SUMMARY_FILE_PATTERN = /^dashboard_acceptance_coverage_summary_\d{4}-\d{2}-\d{2}\.tsv$/;
const INFORMATIONAL_FLAG_PATTERN = /no immediate optimizer regressions detected/i;

function parseArgs(argv: string[]): CliOptions {
  const options: Omit<CliOptions, 'summaryPath'> & { summaryPath?: string } = {
    profile: process.env.OPTIMIZER_PROFILE || 'ono_v3_calibrated',
    mode: (process.env.OPTIMIZER_MODE as Mode) || 'quick',
    doneScope: (process.env.OPTIMIZER_DONE_SCOPE as DoneScope) || 'optimizer',
    outputDir: process.env.OPTIMIZER_OUTPUT_DIR || path.join(process.cwd(), 'output/skill_reports'),
    acceptanceSummaryPath: process.env.DASHBOARD_ACCEPTANCE_SUMMARY_PATH,
    requiredConsecutiveGreens: Number(process.env.OPTIMIZER_DONE_REQUIRED_CONSECUTIVE_GREENS || 5),
    enforceDoneMarker: process.env.OPTIMIZER_GATE_ENFORCE_DONE_MARKER === '1',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--profile') {
      options.profile = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--mode') {
      const value = argv[i + 1];
      if (value !== 'quick' && value !== 'full') {
        throw new Error(`Invalid --mode value: ${value}`);
      }
      options.mode = value;
      i += 1;
      continue;
    }
    if (arg === '--done-scope') {
      const value = argv[i + 1] as DoneScope;
      if (value !== 'optimizer' && value !== 'dashboard') {
        throw new Error(`Invalid --done-scope value: ${value}`);
      }
      options.doneScope = value;
      i += 1;
      continue;
    }
    if (arg === '--output-dir') {
      options.outputDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--report-path') {
      options.reportPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--summary-path') {
      options.summaryPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--acceptance-summary-path') {
      options.acceptanceSummaryPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--required-consecutive-greens') {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error(`Invalid --required-consecutive-greens value: ${argv[i + 1]}`);
      }
      options.requiredConsecutiveGreens = Math.floor(value);
      i += 1;
      continue;
    }
    if (arg === '--enforce-done-marker') {
      options.enforceDoneMarker = true;
      continue;
    }
  }

  return {
    ...options,
    summaryPath:
      options.summaryPath ||
      path.join(options.outputDir, `${options.profile}_${options.mode}_${options.doneScope}_done_marker.md`),
  };
}

function resolveReportPath(options: CliOptions): string {
  if (options.reportPath) {
    return path.resolve(options.reportPath);
  }

  const fileName = `${options.profile}_${options.mode}_report.json`;
  return path.join(options.outputDir, fileName);
}

function readReport(reportPath: string): OptimizerReport {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report not found at: ${reportPath}`);
  }

  const raw = fs.readFileSync(reportPath, 'utf-8');
  return JSON.parse(raw) as OptimizerReport;
}

function findLatestAcceptanceSummaryPath(): string | undefined {
  const spreadsheetDir = path.join(process.cwd(), 'output', 'spreadsheet');
  if (!fs.existsSync(spreadsheetDir)) {
    return undefined;
  }

  const candidates = fs
    .readdirSync(spreadsheetDir)
    .filter((fileName) => ACCEPTANCE_SUMMARY_FILE_PATTERN.test(fileName))
    .sort()
    .reverse();

  if (candidates.length === 0) {
    return undefined;
  }

  return path.join(spreadsheetDir, candidates[0]);
}

function readAcceptanceCoverageSummary(
  acceptanceSummaryPath?: string
): AcceptanceCoverageSummary | undefined {
  const resolvedPath = acceptanceSummaryPath
    ? path.resolve(acceptanceSummaryPath)
    : findLatestAcceptanceSummaryPath();

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    return undefined;
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return undefined;
  }

  const header = lines[0].split('\t');
  const idxSection = header.indexOf('section');
  const idxQuestions = header.indexOf('questions');
  const idxY = header.indexOf('Y');
  const idxP = header.indexOf('P');
  const idxPass = header.indexOf('pass_80_practical');

  if (idxSection === -1 || idxQuestions === -1 || idxY === -1 || idxP === -1 || idxPass === -1) {
    return undefined;
  }

  let totalQuestions = 0;
  let totalY = 0;
  let totalP = 0;
  let totalSections = 0;
  let passingSections = 0;
  const failingSections: string[] = [];

  for (const line of lines.slice(1)) {
    const cells = line.split('\t');
    if (cells.length <= Math.max(idxSection, idxQuestions, idxY, idxP, idxPass)) {
      continue;
    }

    const section = cells[idxSection].trim();
    const questions = Number(cells[idxQuestions]);
    const y = Number(cells[idxY]);
    const p = Number(cells[idxP]);
    const pass = cells[idxPass].trim().toUpperCase() === 'PASS';

    if (!Number.isFinite(questions) || !Number.isFinite(y) || !Number.isFinite(p)) {
      continue;
    }

    totalSections += 1;
    totalQuestions += questions;
    totalY += y;
    totalP += p;

    if (pass) {
      passingSections += 1;
    } else {
      failingSections.push(section);
    }
  }

  if (totalSections === 0 || totalQuestions <= 0) {
    return undefined;
  }

  const practicalCoveragePct = ((totalY + 0.5 * totalP) / totalQuestions) * 100;
  return {
    filePath: resolvedPath,
    practicalCoveragePct,
    totalSections,
    passingSections,
    failingSections,
  };
}

function checkReport(report: OptimizerReport): string[] {
  const failures: string[] = [];

  if (!report.optimizer.breakEven.isThresholdMetAtSuggestedPrice) {
    failures.push(
      `Break-even threshold failed: price=${report.optimizer.breakEven.suggestedPrice}, minSolvency=${report.optimizer.breakEven.minSolvencyAtSuggestedPrice}`
    );
  }

  if (!report.optimizer.defense.improvedVsBaseline) {
    failures.push(
      `Defense optimization failed: baselineChurn=${report.optimizer.defense.baselineChurnRate}, optimizedChurn=${report.optimizer.defense.optimizedChurnRate}`
    );
  }

  const minBreakEvenPriceRaw = process.env.OPTIMIZER_GATE_MIN_BREAK_EVEN_PRICE;
  if (minBreakEvenPriceRaw) {
    const minBreakEvenPrice = Number(minBreakEvenPriceRaw);
    if (
      Number.isFinite(minBreakEvenPrice) &&
      minBreakEvenPrice > 0 &&
      report.optimizer.breakEven.suggestedPrice < minBreakEvenPrice
    ) {
      failures.push(
        `Break-even price floor failed: suggestedPrice=${report.optimizer.breakEven.suggestedPrice}, requiredMin=${minBreakEvenPrice}`
      );
    }
  }

  const minBreakEvenRatioRaw = process.env.OPTIMIZER_GATE_MIN_BREAK_EVEN_TO_FINAL_PRICE_RATIO;
  const baselineFinalPrice = report.baseline?.finalPrice;
  if (minBreakEvenRatioRaw && typeof baselineFinalPrice === 'number' && baselineFinalPrice > 0) {
    const minBreakEvenRatio = Number(minBreakEvenRatioRaw);
    if (Number.isFinite(minBreakEvenRatio) && minBreakEvenRatio > 0) {
      const observedRatio = report.optimizer.breakEven.suggestedPrice / baselineFinalPrice;
      if (observedRatio < minBreakEvenRatio) {
        failures.push(
          `Break-even ratio floor failed: suggested/baseFinal=${observedRatio}, requiredMinRatio=${minBreakEvenRatio}`
        );
      }
    }
  }

  const requireScaleDegradation = process.env.OPTIMIZER_GATE_REQUIRE_SCALE_DEGRADATION === '1';
  if (requireScaleDegradation) {
    const hasRetentionRatios =
      typeof report.optimizer.scale.retentionRatioAtMaxScale === 'number' &&
      typeof report.optimizer.scale.retentionRatioAtStressScale === 'number';

    if (hasRetentionRatios) {
      if ((report.optimizer.scale.retentionRatioAtStressScale as number) >= ((report.optimizer.scale.retentionRatioAtMaxScale as number) - 0.01)) {
        failures.push(
          `Scale degradation check failed: stressRetentionRatio=${report.optimizer.scale.retentionRatioAtStressScale}, boundaryRetentionRatio=${report.optimizer.scale.retentionRatioAtMaxScale}`
        );
      }
    } else if (report.optimizer.scale.minSolvencyAtStressScale >= report.optimizer.scale.minSolvencyAtMaxScale) {
      failures.push(
        `Scale degradation check failed: stressMinSolvency=${report.optimizer.scale.minSolvencyAtStressScale}, boundaryMinSolvency=${report.optimizer.scale.minSolvencyAtMaxScale}`
      );
    }
  }

  return failures;
}

function parseNonNegativeInt(value: string | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }
  return Math.floor(parsed);
}

function evaluateDoneMarker(
  report: OptimizerReport,
  failures: string[],
  acceptanceSummary: AcceptanceCoverageSummary | undefined,
  requiredConsecutiveGreens: number,
  doneScope: DoneScope
): DoneMarkerEvaluation {
  const criteria: CriterionResult[] = [];
  const requireDashboardAcceptance = doneScope === 'dashboard';

  criteria.push({
    name: 'Optimizer hard gate checks',
    status: failures.length === 0 ? 'PASS' : 'FAIL',
    details: failures.length === 0 ? 'All optimizer gate checks passed.' : failures.join('; '),
    required: true,
  });

  const actionableFlags = report.flags.filter((flag) => !INFORMATIONAL_FLAG_PATTERN.test(flag));
  criteria.push({
    name: 'No actionable optimizer flags',
    status: actionableFlags.length === 0 ? 'PASS' : 'FAIL',
    details:
      actionableFlags.length === 0
        ? 'Report flags are empty or informational-only.'
        : actionableFlags.join('; '),
    required: true,
  });

  if (!acceptanceSummary) {
    criteria.push({
      name: 'Stakeholder acceptance coverage (all sections >=80 practical)',
      status: 'PENDING',
      details:
        requireDashboardAcceptance
          ? 'No acceptance summary TSV found. Expected output/spreadsheet/dashboard_acceptance_coverage_summary_YYYY-MM-DD.tsv'
          : 'Dashboard-level signal only (not blocking in optimizer scope). Acceptance summary TSV not found.',
      required: requireDashboardAcceptance,
    });
  } else {
    const allSectionsPass =
      acceptanceSummary.totalSections > 0 &&
      acceptanceSummary.passingSections === acceptanceSummary.totalSections;

    criteria.push({
      name: 'Stakeholder acceptance coverage (all sections >=80 practical)',
      status: allSectionsPass ? 'PASS' : 'FAIL',
      details: allSectionsPass
        ? `All sections pass. Overall practical coverage=${acceptanceSummary.practicalCoveragePct.toFixed(1)}%.`
        : `Passing sections=${acceptanceSummary.passingSections}/${acceptanceSummary.totalSections}, overall practical coverage=${acceptanceSummary.practicalCoveragePct.toFixed(1)}%, failing=${acceptanceSummary.failingSections.join(', ')}`,
      required: requireDashboardAcceptance,
    });
  }

  const observedConsecutiveGreens = parseNonNegativeInt(
    process.env.OPTIMIZER_GATE_CONSECUTIVE_GREEN_RUNS
  );
  if (observedConsecutiveGreens === undefined) {
    criteria.push({
      name: `Consecutive green optimizer-gate runs (>=${requiredConsecutiveGreens})`,
      status: 'PENDING',
      details:
        'Set OPTIMIZER_GATE_CONSECUTIVE_GREEN_RUNS to evaluate this criterion automatically.',
      required: true,
    });
  } else {
    criteria.push({
      name: `Consecutive green optimizer-gate runs (>=${requiredConsecutiveGreens})`,
      status: observedConsecutiveGreens >= requiredConsecutiveGreens ? 'PASS' : 'FAIL',
      details: `Observed=${observedConsecutiveGreens}, required=${requiredConsecutiveGreens}.`,
      required: true,
    });
  }

  const openP0P1 = parseNonNegativeInt(process.env.OPTIMIZER_GATE_OPEN_P0P1);
  if (openP0P1 === undefined) {
    criteria.push({
      name: 'Open P0/P1 regressions == 0',
      status: 'PENDING',
      details: 'Set OPTIMIZER_GATE_OPEN_P0P1 to evaluate this criterion automatically.',
      required: true,
    });
  } else {
    criteria.push({
      name: 'Open P0/P1 regressions == 0',
      status: openP0P1 === 0 ? 'PASS' : 'FAIL',
      details: `Open high-severity regressions=${openP0P1}.`,
      required: true,
    });
  }

  const requiredCriteria = criteria.filter((criterion) => criterion.required);
  const hasFailures = requiredCriteria.some((criterion) => criterion.status === 'FAIL');
  const hasPending = requiredCriteria.some((criterion) => criterion.status === 'PENDING');
  const allPass = requiredCriteria.every((criterion) => criterion.status === 'PASS');

  return {
    criteria,
    finalStatus: allPass ? 'DONE' : hasFailures ? 'NOT_DONE' : hasPending ? 'PENDING' : 'NOT_DONE',
  };
}

function renderDoneMarkerSummary(
  report: OptimizerReport,
  reportPath: string,
  acceptanceSummary: AcceptanceCoverageSummary | undefined,
  evaluation: DoneMarkerEvaluation,
  doneScope: DoneScope
): string {
  const escapeCell = (value: string): string => value.replace(/\|/g, '\\|');
  const lines = [
    '# Optimizer Done Marker Summary',
    '',
    `- Generated: ${new Date().toISOString()}`,
    `- Profile: ${report.profile.id} (${report.profile.name})`,
    `- Mode: ${report.mode}`,
    `- Done scope: ${doneScope}`,
    `- Optimizer report: \`${reportPath}\``,
    acceptanceSummary
      ? `- Acceptance summary: \`${acceptanceSummary.filePath}\``
      : '- Acceptance summary: not found',
    '',
    '| Criterion | Required | Status | Details |',
    '| --- | --- | --- | --- |',
    ...evaluation.criteria.map((criterion) => {
      return `| ${escapeCell(criterion.name)} | ${criterion.required ? 'Yes' : 'No'} | ${criterion.status} | ${escapeCell(criterion.details)} |`;
    }),
    '',
    `## Final Status: ${evaluation.finalStatus}`,
    '',
  ];

  if (evaluation.finalStatus === 'DONE') {
    lines.push('All done-marker criteria are satisfied. This workstream can be considered complete.');
  } else if (evaluation.finalStatus === 'PENDING') {
    lines.push(
      'Core checks pass, but one or more non-blocking criteria are pending external evidence.'
    );
  } else {
    lines.push('At least one done-marker criterion failed. Keep iterating before calling this complete.');
  }

  lines.push('');
  return lines.join('\n');
}

function writeDoneMarkerSummary(summaryPath: string, markdown: string): void {
  const resolvedPath = path.resolve(summaryPath);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, markdown, 'utf-8');

  const githubSummaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (githubSummaryPath) {
    fs.appendFileSync(githubSummaryPath, `${markdown}\n`, 'utf-8');
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const reportPath = resolveReportPath(options);
  const report = readReport(reportPath);
  const failures = checkReport(report);
  const acceptanceSummary = readAcceptanceCoverageSummary(options.acceptanceSummaryPath);
  const evaluation = evaluateDoneMarker(
    report,
    failures,
    acceptanceSummary,
    options.requiredConsecutiveGreens,
    options.doneScope
  );
  const markdownSummary = renderDoneMarkerSummary(
    report,
    reportPath,
    acceptanceSummary,
    evaluation,
    options.doneScope
  );

  writeDoneMarkerSummary(options.summaryPath, markdownSummary);

  console.log(`Checked report: ${reportPath}`);
  console.log(`Profile: ${report.profile.id} (${report.profile.name}), mode=${report.mode}`);
  console.log(`Reported flags: ${report.flags.length}`);
  console.log(`Done-marker scope: ${options.doneScope}`);
  console.log(`Done-marker summary: ${path.resolve(options.summaryPath)}`);
  console.log(`Done-marker status: ${evaluation.finalStatus}`);

  if (failures.length > 0) {
    console.error('Optimizer gate failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  if (options.enforceDoneMarker && evaluation.finalStatus !== 'DONE') {
    console.error(`Done marker enforcement failed: status=${evaluation.finalStatus}`);
    process.exit(1);
  }

  console.log('Optimizer gate passed.');
}

main();
