import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { GENERATED_PROTOCOL_PROFILES } from '../src/data/generated/protocolProfiles.generated.ts';

type Mode = 'quick' | 'full';

interface CliOptions {
  mode: Mode;
  outputDir: string;
  reportDir: string;
  profileIds: string[];
  maxProfiles?: number;
  rerun: boolean;
}

interface OptimizerReport {
  generatedAt: string;
  profile: {
    id: string;
    name: string;
  };
  mode: Mode;
  baseline: {
    minSolvency: number;
    finalSolvency: number;
    finalProviders: number;
    finalPrice: number;
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
    };
    defense: {
      threatYield: number;
      suggestedEmission: number;
      baselineChurnRate: number;
      optimizedChurnRate: number;
      improvedVsBaseline: boolean;
    };
    sensitivityTop: Array<{
      parameter: string;
      low: number;
      high: number;
      delta: number;
    }>;
  };
  flags: string[];
}

interface DatasetRow {
  generated_at: string;
  protocol_id: string;
  protocol_name: string;
  chain: string;
  mode: Mode;
  gate_pass: boolean;
  baseline_min_solvency: number;
  baseline_final_solvency: number;
  baseline_final_providers: number;
  baseline_final_price: number;
  break_even_price: number;
  break_even_min_solvency: number;
  break_even_pass: boolean;
  scale_max_providers: number;
  scale_min_solvency_at_max: number;
  scale_min_solvency_at_stress: number;
  defense_threat_yield: number;
  defense_suggested_emission: number;
  defense_baseline_churn_rate: number;
  defense_optimized_churn_rate: number;
  defense_improved: boolean;
  sensitivity_1_parameter: string;
  sensitivity_1_delta: number;
  sensitivity_2_parameter: string;
  sensitivity_2_delta: number;
  sensitivity_3_parameter: string;
  sensitivity_3_delta: number;
  flag_count: number;
  flags_text: string;
}

interface ProtocolProfile {
  metadata: {
    id: string;
    name: string;
    chain: string;
  };
}

const PROTOCOL_PROFILES = GENERATED_PROTOCOL_PROFILES as ProtocolProfile[];

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    mode: 'quick',
    outputDir: path.join(process.cwd(), 'output', 'mindsdb'),
    reportDir: path.join(process.cwd(), 'output', 'skill_reports'),
    profileIds: [],
    rerun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--mode') {
      const value = argv[i + 1];
      if (value !== 'quick' && value !== 'full') {
        throw new Error(`Invalid --mode value: ${value}`);
      }
      options.mode = value;
      i += 1;
      continue;
    }

    if (arg === '--profile') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--profile requires a value');
      }
      options.profileIds.push(value);
      i += 1;
      continue;
    }

    if (arg === '--profiles') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--profiles requires a comma-separated value');
      }
      options.profileIds.push(...value.split(',').map((entry) => entry.trim()).filter(Boolean));
      i += 1;
      continue;
    }

    if (arg === '--max-profiles') {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid --max-profiles value: ${argv[i + 1]}`);
      }
      options.maxProfiles = Math.floor(value);
      i += 1;
      continue;
    }

    if (arg === '--output-dir') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--output-dir requires a value');
      }
      options.outputDir = value;
      i += 1;
      continue;
    }

    if (arg === '--report-dir') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--report-dir requires a value');
      }
      options.reportDir = value;
      i += 1;
      continue;
    }

    if (arg === '--rerun') {
      options.rerun = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  options.profileIds = [...new Set(options.profileIds)];
  return options;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function resolveProfiles(options: CliOptions): ProtocolProfile[] {
  const allProfiles = [...PROTOCOL_PROFILES].sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));

  let selected = allProfiles;
  if (options.profileIds.length > 0) {
    const selectedSet = new Set(options.profileIds);
    selected = allProfiles.filter((profile) => selectedSet.has(profile.metadata.id));

    const missing = options.profileIds.filter(
      (id) => !selected.some((profile) => profile.metadata.id === id)
    );
    if (missing.length > 0) {
      const validIds = allProfiles.map((profile) => profile.metadata.id).join(', ');
      throw new Error(`Unknown profile IDs: ${missing.join(', ')}. Valid IDs: ${validIds}`);
    }
  }

  if (options.maxProfiles) {
    selected = selected.slice(0, options.maxProfiles);
  }

  if (selected.length === 0) {
    throw new Error('No protocol profiles selected for export.');
  }

  return selected;
}

function diagnosticsReportPath(reportDir: string, profileId: string, mode: Mode): string {
  return path.join(reportDir, `${profileId}_${mode}_report.json`);
}

function runDiagnostics(profileId: string, mode: Mode, reportDir: string): { ok: boolean; error?: string } {
  const diagnosticsScript = path.join(
    process.cwd(),
    'skills',
    'depin-simulation-optimizer',
    'scripts',
    'run_optimizer_diagnostics.ts'
  );

  const localTsxCandidates = [
    path.join(process.cwd(), 'node_modules', '.bin', 'tsx'),
    path.join(process.cwd(), 'packages', 'simulator-mcp', 'node_modules', '.bin', 'tsx'),
  ];
  const localTsx = localTsxCandidates.find((candidate) => fs.existsSync(candidate));
  const baseArgs = [
    diagnosticsScript,
    '--mode',
    mode,
    '--profile',
    profileId,
    '--output-dir',
    reportDir,
  ];
  const command = localTsx ?? 'npx';
  const commandArgs = localTsx ? baseArgs : ['tsx', ...baseArgs];

  const result = spawnSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || 'Unknown diagnostics failure').trim();
    return { ok: false, error: details };
  }

  return { ok: true };
}

function readReport(reportPath: string): OptimizerReport {
  const raw = fs.readFileSync(reportPath, 'utf-8');
  return JSON.parse(raw) as OptimizerReport;
}

function round(value: number, precision = 6): number {
  const base = 10 ** precision;
  return Math.round(value * base) / base;
}

function sensitivity(report: OptimizerReport, index: number): { parameter: string; delta: number } {
  const entry = report.optimizer.sensitivityTop[index];
  if (!entry) {
    return { parameter: '', delta: 0 };
  }
  return {
    parameter: entry.parameter,
    delta: round(entry.delta),
  };
}

function flattenReport(report: OptimizerReport, chain: string): DatasetRow {
  const s1 = sensitivity(report, 0);
  const s2 = sensitivity(report, 1);
  const s3 = sensitivity(report, 2);

  const breakEvenPass = report.optimizer.breakEven.isThresholdMetAtSuggestedPrice;
  const defensePass = report.optimizer.defense.improvedVsBaseline;

  return {
    generated_at: report.generatedAt,
    protocol_id: report.profile.id,
    protocol_name: report.profile.name,
    chain,
    mode: report.mode,
    gate_pass: breakEvenPass && defensePass,
    baseline_min_solvency: round(report.baseline.minSolvency),
    baseline_final_solvency: round(report.baseline.finalSolvency),
    baseline_final_providers: round(report.baseline.finalProviders),
    baseline_final_price: round(report.baseline.finalPrice),
    break_even_price: round(report.optimizer.breakEven.suggestedPrice, 2),
    break_even_min_solvency: round(report.optimizer.breakEven.minSolvencyAtSuggestedPrice),
    break_even_pass: breakEvenPass,
    scale_max_providers: Math.floor(report.optimizer.scale.maxProviders),
    scale_min_solvency_at_max: round(report.optimizer.scale.minSolvencyAtMaxScale),
    scale_min_solvency_at_stress: round(report.optimizer.scale.minSolvencyAtStressScale),
    defense_threat_yield: round(report.optimizer.defense.threatYield),
    defense_suggested_emission: Math.floor(report.optimizer.defense.suggestedEmission),
    defense_baseline_churn_rate: round(report.optimizer.defense.baselineChurnRate),
    defense_optimized_churn_rate: round(report.optimizer.defense.optimizedChurnRate),
    defense_improved: defensePass,
    sensitivity_1_parameter: s1.parameter,
    sensitivity_1_delta: s1.delta,
    sensitivity_2_parameter: s2.parameter,
    sensitivity_2_delta: s2.delta,
    sensitivity_3_parameter: s3.parameter,
    sensitivity_3_delta: s3.delta,
    flag_count: report.flags.length,
    flags_text: report.flags.join(' | '),
  };
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows: DatasetRow[]): string {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]) as Array<keyof DatasetRow>;
  const lines = [headers.join(',')];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }

  return `${lines.join('\n')}\n`;
}

function toJsonl(rows: DatasetRow[]): string {
  return `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;
}

function toMarkdown(rows: DatasetRow[], failures: Array<{ protocolId: string; error: string }>, mode: Mode): string {
  const lines: string[] = [];
  lines.push('# MindsDB Optimizer Dataset Export');
  lines.push('');
  lines.push(`Mode: ${mode}`);
  lines.push('');
  lines.push('| Protocol ID | Name | Chain | Gate | Break-even | Defense | Top Sensitivity |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');

  for (const row of rows) {
    lines.push(
      `| ${row.protocol_id} | ${row.protocol_name} | ${row.chain} | ${row.gate_pass ? 'PASS' : 'FAIL'} | ${row.break_even_pass ? 'PASS' : 'FAIL'} | ${row.defense_improved ? 'PASS' : 'FAIL'} | ${row.sensitivity_1_parameter || 'n/a'} |`
    );
  }

  lines.push('');
  lines.push('## Diagnostics Failures');
  if (failures.length === 0) {
    lines.push('- None');
  } else {
    for (const failure of failures) {
      lines.push(`- ${failure.protocolId}: ${failure.error}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const profiles = resolveProfiles(options);

  ensureDir(options.outputDir);
  ensureDir(options.reportDir);

  const rows: DatasetRow[] = [];
  const failures: Array<{ protocolId: string; error: string }> = [];

  for (const profile of profiles) {
    const reportPath = diagnosticsReportPath(options.reportDir, profile.metadata.id, options.mode);
    const shouldRun = options.rerun || !fs.existsSync(reportPath);

    if (shouldRun) {
      const run = runDiagnostics(profile.metadata.id, options.mode, options.reportDir);
      if (!run.ok) {
        failures.push({
          protocolId: profile.metadata.id,
          error: run.error || 'unknown diagnostics error',
        });
        continue;
      }
    }

    if (!fs.existsSync(reportPath)) {
      failures.push({
        protocolId: profile.metadata.id,
        error: `expected diagnostics report not found at ${reportPath}`,
      });
      continue;
    }

    const report = readReport(reportPath);
    rows.push(flattenReport(report, profile.metadata.chain));
  }

  rows.sort((a, b) => a.protocol_name.localeCompare(b.protocol_name));

  const timestamp = new Date().toISOString();
  const csvPath = path.join(options.outputDir, `depin_optimizer_${options.mode}_dataset.csv`);
  const jsonlPath = path.join(options.outputDir, `depin_optimizer_${options.mode}_dataset.jsonl`);
  const mdPath = path.join(options.outputDir, `depin_optimizer_${options.mode}_dataset.md`);
  const summaryPath = path.join(options.outputDir, `depin_optimizer_${options.mode}_dataset_summary.json`);

  fs.writeFileSync(csvPath, toCsv(rows), 'utf-8');
  fs.writeFileSync(jsonlPath, toJsonl(rows), 'utf-8');
  fs.writeFileSync(mdPath, toMarkdown(rows, failures, options.mode), 'utf-8');

  const summary = {
    generatedAt: timestamp,
    mode: options.mode,
    selectedProfiles: profiles.map((profile) => profile.metadata.id),
    totals: {
      selected: profiles.length,
      exported: rows.length,
      diagnosticsFailures: failures.length,
      gatePass: rows.filter((row) => row.gate_pass).length,
      gateFail: rows.filter((row) => !row.gate_pass).length,
    },
    files: {
      csv: csvPath,
      jsonl: jsonlPath,
      markdown: mdPath,
    },
    failures,
  };

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf-8');

  console.log(`MindsDB dataset export complete for ${rows.length}/${profiles.length} profiles.`);
  console.log(`CSV: ${csvPath}`);
  console.log(`JSONL: ${jsonlPath}`);
  console.log(`Summary: ${summaryPath}`);

  if (failures.length > 0) {
    console.log(`Diagnostics failures: ${failures.length}`);
  }
}

main();
